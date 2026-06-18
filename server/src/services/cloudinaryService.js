import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import cloudinary from '../config/cloudinary.js';
import { config } from '../config/index.js';
import logger from '../utils/logger.js';

const folders = {
  clinicLogo: 'healthverify/clinics/logos',
  doctorSignature: 'healthverify/doctors/signatures',
  medicalReport: 'healthverify/patients/reports',
  certificatePdf: 'healthverify/certificates/pdfs',
  qrCode: 'healthverify/certificates/qr',
};

const assertCloudinaryConfig = () => {
  const missing = [
    ['CLOUDINARY_CLOUD_NAME', cloudinary.config().cloud_name],
    ['CLOUDINARY_API_KEY', cloudinary.config().api_key],
    ['CLOUDINARY_API_SECRET', cloudinary.config().api_secret],
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    throw new Error(`Missing Cloudinary configuration: ${missing.map(([key]) => key).join(', ')}`);
  }
};

const logUploadError = (error, context) => {
  logger.error('========== CLOUDINARY UPLOAD ERROR ==========');
  logger.error(`Context: ${context}`);
  logger.error(`Message: ${error?.message}`);
  logger.error(`HTTP code: ${error?.http_code || error?.response?.status || 'N/A'}`);
  logger.error(`Name: ${error?.name || 'N/A'}`);
  logger.error(error?.stack || error);
  if (error?.response?.data) {
    logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
  }
};

export const isCloudinaryRequired = () => config.cloudinary.required;

export const getCloudinaryCredentialStatus = () => ({
  cloudName: Boolean(config.cloudinary.cloudName),
  apiKey: Boolean(config.cloudinary.apiKey),
  apiSecret: Boolean(config.cloudinary.apiSecret),
  required: config.cloudinary.required,
});

const signUploadParams = (params) => {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(`${payload}${config.cloudinary.apiSecret}`).digest('hex');
};

export const testCloudinaryUpload = async (filePath, resourceType = 'image', folder = 'healthverify/diagnostics') => {
  assertCloudinaryConfig();

  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    folder,
    timestamp,
    type: 'upload',
    unique_filename: 'true',
    use_filename: 'false',
  };

  const contentType = resourceType === 'raw' ? 'application/pdf' : 'image/png';
  const filename = resourceType === 'raw' ? 'cloudinary-check.pdf' : 'cloudinary-check.png';
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
    body,
    context: {
      resourceType,
      folder,
      cloudName: config.cloudinary.cloudName,
    },
  };
};

const uploadFile = async (filePath, folder, options = {}) => {
  const resourceType = options.resourceType || 'auto';

  try {
    assertCloudinaryConfig();
    logger.info(`[Cloudinary] Upload start: ${options.label || folder} (${resourceType})`);

    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
      use_filename: false,
      unique_filename: true,
      overwrite: false,
      type: 'upload',
    });

    logger.info(`[Cloudinary] Upload complete: ${options.label || folder} -> ${result.public_id}`);

    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
    };
  } catch (error) {
    logUploadError(error, `${options.label || folder} (${resourceType})`);
    if (error?.http_code === 403) {
      error.message = `Cloudinary upload forbidden for ${options.label || folder}. The configured API key must have Upload API create permission for this product environment. Original error: ${error.message}`;
    }
    throw error;
  }
};

const cleanupTempFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.warn(`Failed to remove temporary upload ${filePath}: ${error.message}`);
    }
  }
};

export const uploadClinicLogo = async (filePath) => uploadFile(filePath, folders.clinicLogo, { resourceType: 'image', label: 'clinic logo' });

export const uploadDoctorSignature = async (filePath) => uploadFile(filePath, folders.doctorSignature, { resourceType: 'image', label: 'doctor signature' });

export const uploadMedicalReport = async (filePath) => uploadFile(filePath, folders.medicalReport, { resourceType: 'raw', label: 'medical report' });

export const uploadCertificatePdf = async (filePath) => uploadFile(filePath, folders.certificatePdf, { resourceType: 'raw', label: 'certificate PDF' });

export const uploadQrCode = async (filePath) => uploadFile(filePath, folders.qrCode, { resourceType: 'image', label: 'certificate QR code' });

export const deleteAsset = async (publicId, resourceType = 'image') => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    logger.warn(`Failed to delete Cloudinary asset ${publicId}: ${error.message}`);
  }
};

export const cleanupUploadedFile = cleanupTempFile;

export default {
  uploadClinicLogo,
  uploadDoctorSignature,
  uploadMedicalReport,
  uploadCertificatePdf,
  uploadQrCode,
  deleteAsset,
  cleanupUploadedFile,
};
