import { v2 as cloudinary } from 'cloudinary';
import { config } from './index.js';
import logger from '../utils/logger.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const validateCloudinaryConfig = () => {
  const credentials = {
    cloudName: Boolean(config.cloudinary.cloudName),
    apiKey: Boolean(config.cloudinary.apiKey),
    apiSecret: Boolean(config.cloudinary.apiSecret),
    required: config.cloudinary.required,
  };

  logger.info(
    `[Cloudinary] credentials loaded: cloudName=${credentials.cloudName}, apiKey=${credentials.apiKey}, apiSecret=${credentials.apiSecret}, required=${credentials.required}`
  );

  return credentials;
};

export default cloudinary;
