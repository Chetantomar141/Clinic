import crypto from 'crypto';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import QRCode from 'qrcode';
import cloudinary from '../src/config/cloudinary.js';
import { config } from '../src/config/index.js';
import { deleteAsset } from '../src/services/cloudinaryService.js';

const required = [
  ['CLOUDINARY_CLOUD_NAME', config.cloudinary.cloudName],
  ['CLOUDINARY_API_KEY', config.cloudinary.apiKey],
  ['CLOUDINARY_API_SECRET', config.cloudinary.apiSecret],
];

const missing = required.filter(([, value]) => !value).map(([key]) => key);
if (missing.length > 0) {
  throw new Error(`Missing Cloudinary variables: ${missing.join(', ')}`);
}

const signParams = (params) => {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(`${payload}${config.cloudinary.apiSecret}`).digest('hex');
};

const main = async () => {
  console.log('Step 1: Cloudinary Admin API ping');
  const ping = await cloudinary.api.ping();
  console.log(`Admin API: ${ping.status}`);

  console.log('Step 2: Cloudinary Upload API create permission');
  const qrPath = path.join(os.tmpdir(), `healthverify-cloudinary-check-${Date.now()}.png`);
  let uploadedPublicId = null;

  try {
    const dataUrl = await QRCode.toDataURL('healthverify-cloudinary-permission-check');
    await fs.writeFile(qrPath, dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');

    const timestamp = Math.floor(Date.now() / 1000);
    const params = {
      folder: 'healthverify/diagnostics',
      timestamp,
      type: 'upload',
      unique_filename: 'true',
      use_filename: 'false',
    };

    const form = new FormData();
    form.set('file', new Blob([await fs.readFile(qrPath)], { type: 'image/png' }), 'cloudinary-check.png');
    for (const [key, value] of Object.entries(params)) {
      form.set(key, String(value));
    }
    form.set('api_key', config.cloudinary.apiKey);
    form.set('signature', signParams(params));

    const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/image/upload`, {
      method: 'POST',
      body: form,
    });
    const body = await response.json().catch(async () => ({ raw: await response.text() }));

    if (!response.ok) {
      throw new Error(`Upload API failed with ${response.status}: ${JSON.stringify(body)}`);
    }

    uploadedPublicId = body.public_id;
    console.log(`Upload API: ok (${uploadedPublicId})`);
  } finally {
    await fs.unlink(qrPath).catch(() => {});
    if (uploadedPublicId) {
      await deleteAsset(uploadedPublicId, 'image');
      console.log('Diagnostic asset deleted');
    }
  }
};

main().catch((error) => {
  console.error('Cloudinary access check failed');
  console.error(error.message);
  process.exitCode = 1;
});
