import { Router } from 'express';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import QRCode from 'qrcode';
import {
  deleteAsset,
  getCloudinaryCredentialStatus,
  testCloudinaryUpload,
} from '../../services/cloudinaryService.js';
import cloudinary from '../../config/cloudinary.js';
import { runCloudinaryDiagnostics } from '../../scripts/cloudinaryDiagnostics.js';
import logger from '../../utils/logger.js';

const router = Router();

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

router.get('/cloudinary-test', async (req, res) => {
  const qrPath = path.join(os.tmpdir(), `healthverify-cloudinary-qr-${Date.now()}.png`);
  const pdfPath = path.join(os.tmpdir(), `healthverify-cloudinary-pdf-${Date.now()}.pdf`);
  const uploaded = [];

  try {
    const credentialStatus = getCloudinaryCredentialStatus();

    const ping = await cloudinary.api.ping();

    const qrDataUrl = await QRCode.toDataURL('healthverify-cloudinary-health-check');
    await fs.writeFile(qrPath, qrDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
    await createTinyPdf(pdfPath);

    const qrUpload = await testCloudinaryUpload(qrPath, 'image', 'healthverify/diagnostics');
    if (qrUpload.ok && qrUpload.body?.public_id) {
      uploaded.push({ publicId: qrUpload.body.public_id, resourceType: 'image' });
    }

    const pdfUpload = await testCloudinaryUpload(pdfPath, 'raw', 'healthverify/diagnostics');
    if (pdfUpload.ok && pdfUpload.body?.public_id) {
      uploaded.push({ publicId: pdfUpload.body.public_id, resourceType: 'raw' });
    }

    const success = qrUpload.ok && pdfUpload.ok;
    return res.status(success ? 200 : 503).json({
      success,
      cloudinaryConnected: ping?.status === 'ok',
      credentials: credentialStatus,
      qrUpload,
      pdfUpload,
      fallbackMode: !credentialStatus.required,
    });
  } catch (error) {
    logger.error('Cloudinary health check error:', error);
    return res.status(503).json({
      success: false,
      cloudinaryConnected: false,
      credentials: getCloudinaryCredentialStatus(),
      message: error?.message,
      status: error?.http_code || error?.response?.status,
      data: error?.response?.data || null,
      fallbackMode: !getCloudinaryCredentialStatus().required,
    });
  } finally {
    await fs.unlink(qrPath).catch(() => {});
    await fs.unlink(pdfPath).catch(() => {});
    for (const asset of uploaded) {
      await deleteAsset(asset.publicId, asset.resourceType);
    }
  }
});

router.get('/cloudinary-diagnostics', async (req, res) => {
  try {
    const diagnostics = await runCloudinaryDiagnostics();
    return res.status(diagnostics.summary.imageUpload && diagnostics.summary.rawUpload ? 200 : 503).json(diagnostics);
  } catch (error) {
    logger.error('Deep Cloudinary diagnostics error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message,
      stack: error?.stack,
    });
  }
});

export default router;
