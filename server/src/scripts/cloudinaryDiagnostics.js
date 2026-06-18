import crypto from 'crypto';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinary.js';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '../../..');

const redactConfig = () => {
  const activeConfig = cloudinary.config();
  return {
    cloud_name: activeConfig.cloud_name || null,
    api_key_present: Boolean(activeConfig.api_key),
    api_secret_present: Boolean(activeConfig.api_secret),
    secure: activeConfig.secure,
  };
};

const redactSensitive = (value) => {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redactSensitive);

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      if (['auth', 'api_secret', 'signature'].includes(key.toLowerCase())) {
        return [key, '[REDACTED]'];
      }
      return [key, redactSensitive(item)];
    })
  );
};

const formatError = (error) => {
  const raw = error && typeof error === 'object' ? redactSensitive(error) : null;

  return {
    ok: false,
    name: error?.name || null,
    message: error?.message || (raw ? JSON.stringify(raw) : String(error)),
    http_code: error?.http_code || error?.response?.status || error?.error?.http_code || null,
    response: error?.response?.data || error?.error || null,
    raw,
    stack: error?.stack || null,
  };
};

const safeCall = async (label, fn) => {
  try {
    const response = await fn();
    return {
      ok: true,
      label,
      response,
    };
  } catch (error) {
    return {
      label,
      ...formatError(error),
    };
  }
};

const createTinyPdf = async (filePath) => {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >>
endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer
<< /Root 1 0 R /Size 4 >>
startxref
186
%%EOF`;
  await fs.writeFile(filePath, content);
};

const findImageFixture = async () => {
  const requestedPath = path.join(workspaceRoot, 'uploads/signatures/test.png');
  try {
    await fs.access(requestedPath);
    return requestedPath;
  } catch {
    // Continue with any existing signature image before creating a generated PNG.
  }

  const signaturesDir = path.join(workspaceRoot, 'uploads/signatures');
  try {
    const files = await fs.readdir(signaturesDir);
    const image = files.find((file) => /\.(png|jpe?g|webp)$/i.test(file));
    if (image) {
      return path.join(signaturesDir, image);
    }
  } catch {
    // Directory may not exist in fresh deployments.
  }

  const generatedPath = path.join(os.tmpdir(), `cloudinary-diagnostics-${Date.now()}.png`);
  const png1x1 = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
    'base64'
  );
  await fs.writeFile(generatedPath, png1x1);
  return generatedPath;
};

const signUploadParams = (params) => {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(`${payload}${config.cloudinary.apiSecret}`).digest('hex');
};

const directUpload = async ({ filePath, resourceType, folder }) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    timestamp,
    type: 'upload',
    unique_filename: 'true',
    use_filename: 'false',
    ...(folder ? { folder } : {}),
  };

  const contentType = resourceType === 'raw' ? 'application/pdf' : 'image/png';
  const filename = resourceType === 'raw' ? 'diagnostics.pdf' : 'diagnostics.png';
  const form = new FormData();
  form.set('file', new Blob([await fs.readFile(filePath)], { type: contentType }), filename);
  for (const [key, value] of Object.entries(params)) {
    form.set(key, String(value));
  }
  form.set('api_key', config.cloudinary.apiKey);
  form.set('signature', signUploadParams(params));

  const url = `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/${resourceType}/upload`;
  const response = await fetch(url, { method: 'POST', body: form });
  const body = await response.json().catch(async () => ({ raw: await response.text() }));

  return {
    ok: response.ok,
    status: response.status,
    url,
    request: {
      cloudName: config.cloudinary.cloudName,
      resourceType,
      folder: folder || null,
      signedParams: Object.keys(params),
    },
    body,
  };
};

const runSdkUpload = async ({ label, filePath, options = {}, resourceTypeForDelete = 'image' }) => {
  let publicId = null;
  const result = await safeCall(label, async () => {
    const response = await cloudinary.uploader.upload(filePath, options);
    publicId = response.public_id;
    return {
      public_id: response.public_id,
      resource_type: response.resource_type,
      secure_url: response.secure_url,
      folder: response.folder,
    };
  });

  if (publicId) {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceTypeForDelete }).catch(() => {});
  }

  return result;
};

const summarizeUsage = (usage) => {
  if (!usage?.ok) return usage;

  return {
    ...usage,
    summary: {
      plan: usage.response?.plan || null,
      storage: usage.response?.storage || null,
      bandwidth: usage.response?.bandwidth || null,
      resources: usage.response?.resources || null,
      credits: usage.response?.credits || null,
      requests: usage.response?.requests || null,
    },
  };
};

const detectRootCause = (results) => {
  const directFailures = [
    results.directSimpleImageUpload,
    results.directFolderImageUpload,
    results.directRawUpload,
  ].filter(Boolean);

  const createPermissionFailure = directFailures.some((result) =>
    result?.body?.error?.message?.includes('actions=["create"]')
  );

  if (results.ping?.ok && createPermissionFailure) {
    return {
      category: 'Missing Upload API Permission',
      detail: 'Cloudinary Admin API ping succeeds, but signed Upload API create requests are forbidden with actions=["create"].',
      recommendedFix: 'Enable Upload API create permission for this Cloudinary product environment/API key, or replace it with an unrestricted API key from the same product environment.',
    };
  }

  if (!results.ping?.ok) {
    return {
      category: 'Credentials Or Environment Invalid',
      detail: 'Cloudinary Admin API ping failed.',
      recommendedFix: 'Verify cloud name, API key, API secret, and product environment.',
    };
  }

  if (!results.usage?.ok) {
    return {
      category: 'Admin API Permission Restricted',
      detail: 'Ping succeeded but usage API failed.',
      recommendedFix: 'Check whether the API key is restricted and missing Admin API permissions.',
    };
  }

  return {
    category: 'Undetermined',
    detail: 'Diagnostics did not match a known failure pattern.',
    recommendedFix: 'Review detailed test results and Cloudinary account status.',
  };
};

export const runCloudinaryDiagnostics = async () => {
  const imagePath = await findImageFixture();
  const generatedImage = imagePath.startsWith(os.tmpdir());
  const rawPath = path.join(os.tmpdir(), `cloudinary-diagnostics-${Date.now()}.pdf`);
  await createTinyPdf(rawPath);

  const results = {
    environmentVariables: {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || null,
      api_key_present: Boolean(process.env.CLOUDINARY_API_KEY),
      api_secret_present: Boolean(process.env.CLOUDINARY_API_SECRET),
      cloudinary_required: process.env.CLOUDINARY_REQUIRED || null,
    },
    cloudinaryConfig: redactConfig(),
    fixture: {
      imagePath,
      generatedImage,
      rawPath,
    },
    sdkVersion: null,
    dependencyAudit: {
      multerStorageCloudinaryUsed: false,
      note: 'multer-storage-cloudinary is installed but the app uses direct Cloudinary SDK uploads.',
    },
  };

  try {
    const packageJson = JSON.parse(await fs.readFile(path.join(workspaceRoot, 'server/package.json'), 'utf8'));
    results.sdkVersion = packageJson.dependencies?.cloudinary || null;
  } catch {
    results.sdkVersion = null;
  }

  try {
    results.ping = await safeCall('Admin API ping', () => cloudinary.api.ping());
    results.usage = summarizeUsage(await safeCall('Admin API usage', () => cloudinary.api.usage()));
    results.uploadPresets = await safeCall('Upload presets', () => cloudinary.api.upload_presets());

    results.simpleImageUpload = await runSdkUpload({
      label: 'SDK simple image upload',
      filePath: imagePath,
      options: {},
      resourceTypeForDelete: 'image',
    });

    results.folderImageUpload = await runSdkUpload({
      label: 'SDK folder image upload',
      filePath: imagePath,
      options: { folder: 'healthverify/test' },
      resourceTypeForDelete: 'image',
    });

    results.rawUpload = await runSdkUpload({
      label: 'SDK raw upload',
      filePath: rawPath,
      options: { resource_type: 'raw' },
      resourceTypeForDelete: 'raw',
    });

    results.directSimpleImageUpload = await directUpload({ filePath: imagePath, resourceType: 'image' });
    results.directFolderImageUpload = await directUpload({
      filePath: imagePath,
      resourceType: 'image',
      folder: 'healthverify/test',
    });
    results.directRawUpload = await directUpload({ filePath: rawPath, resourceType: 'raw' });
  } finally {
    await fs.unlink(rawPath).catch(() => {});
    if (generatedImage) {
      await fs.unlink(imagePath).catch(() => {});
    }
  }

  results.summary = {
    configLoaded: Boolean(results.cloudinaryConfig.cloud_name && results.cloudinaryConfig.api_key_present && results.cloudinaryConfig.api_secret_present),
    ping: Boolean(results.ping?.ok),
    usage: Boolean(results.usage?.ok),
    imageUpload: Boolean(results.simpleImageUpload?.ok || results.directSimpleImageUpload?.ok),
    folderUpload: Boolean(results.folderImageUpload?.ok || results.directFolderImageUpload?.ok),
    rawUpload: Boolean(results.rawUpload?.ok || results.directRawUpload?.ok),
    presets: Boolean(results.uploadPresets?.ok),
  };
  results.rootCause = detectRootCause(results);

  return results;
};

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runCloudinaryDiagnostics()
    .then((results) => {
      console.log(JSON.stringify(results, null, 2));
      process.exitCode = results.summary.imageUpload && results.summary.rawUpload ? 0 : 1;
    })
    .catch((error) => {
      console.error(JSON.stringify(formatError(error), null, 2));
      process.exitCode = 1;
    });
}
