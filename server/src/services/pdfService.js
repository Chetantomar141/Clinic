import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import logger from '../utils/logger.js';

const cleanupTempFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.warn(`Failed to remove temporary certificate PDF ${filePath}: ${error.message}`);
    }
  }
};

export class PDFService {
  static async generateCertificatePDF(data) {
    let browser;
    let pdfPath;

    try {
      logger.info('[Certificate Pipeline] Step 5: Generating QR Code');
      const qrDataUrl = await QRCode.toDataURL(data.verifyUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 120,
      });

      pdfPath = path.join(os.tmpdir(), `healthverify-certificate-${uuidv4()}.pdf`);

      const logoPath = data.clinicLogoUrl || '';
      const signaturePath = data.doctorSignatureUrl || '';

      // 3. Compile HTML Template
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Medical Certificate - ${data.certificateNumber}</title>
          <style>
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
            }
            .certificate-container {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
              box-sizing: border-box;
              border: 10px solid #f1f5f9;
              position: relative;
            }
            .border-accent {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 8px;
              background: linear-gradient(90deg, #0F6FFF 0%, #00C896 100%);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .clinic-info {
              max-width: 60%;
            }
            .clinic-name {
              font-size: 22px;
              font-weight: 700;
              color: #0F6FFF;
              margin: 0 0 5px 0;
              text-transform: uppercase;
            }
            .clinic-details {
              font-size: 12px;
              color: #64748b;
              line-height: 1.5;
            }
            .clinic-logo {
              max-height: 60px;
              max-width: 150px;
              object-fit: contain;
            }
            .certificate-title-box {
              text-align: center;
              margin-bottom: 30px;
            }
            .certificate-title {
              font-size: 24px;
              font-weight: 700;
              letter-spacing: 1px;
              color: #1e293b;
              text-transform: uppercase;
              margin: 0;
            }
            .cert-number {
              font-size: 13px;
              color: #64748b;
              font-weight: 600;
              margin-top: 5px;
            }
            .grid-container {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .section-box {
              background-color: #f8fafc;
              border-radius: 8px;
              padding: 15px;
              border: 1px solid #e2e8f0;
            }
            .section-title {
              font-size: 12px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              margin: 0 0 10px 0;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 5px;
            }
            .field-row {
              display: flex;
              margin-bottom: 8px;
              font-size: 13px;
            }
            .field-row:last-child {
              margin-bottom: 0;
            }
            .field-label {
              width: 120px;
              font-weight: 600;
              color: #64748b;
            }
            .field-value {
              flex: 1;
              color: #0f172a;
            }
            .diagnosis-box {
              background-color: #f8fafc;
              border-radius: 8px;
              padding: 20px;
              border: 1px solid #e2e8f0;
              margin-bottom: 30px;
            }
            .diagnosis-title {
              font-size: 13px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              margin-top: 0;
              margin-bottom: 10px;
            }
            .diagnosis-text {
              font-size: 15px;
              line-height: 1.6;
              color: #0f172a;
              font-style: italic;
            }
            .footer-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 40px;
            }
            .doctor-signature-box {
              text-align: center;
              max-width: 200px;
            }
            .signature-img {
              max-height: 60px;
              max-width: 160px;
              margin-bottom: 5px;
              display: block;
            }
            .doctor-name-sign {
              font-size: 14px;
              font-weight: 600;
              border-top: 1px solid #cbd5e1;
              padding-top: 5px;
              margin-top: 5px;
            }
            .doctor-license-sign {
              font-size: 11px;
              color: #64748b;
            }
            .verification-qr-box {
              display: flex;
              align-items: center;
              gap: 15px;
              max-width: 60%;
            }
            .qr-code-img {
              width: 90px;
              height: 90px;
            }
            .verification-text-box {
              font-size: 11px;
              color: #64748b;
              line-height: 1.4;
            }
            .hash-label {
              font-weight: 600;
              color: #475569;
              word-break: break-all;
              font-family: monospace;
              font-size: 10px;
              margin-top: 4px;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 90px;
              color: rgba(15, 111, 255, 0.03);
              font-weight: 800;
              pointer-events: none;
              text-transform: uppercase;
              letter-spacing: 10px;
              white-space: nowrap;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="border-accent"></div>
            <div class="watermark">VERIFIED</div>
            
            <div class="header">
              <div class="clinic-info">
                <h1 class="clinic-name">${data.clinicName}</h1>
                <div class="clinic-details">
                  ${data.clinicAddress}<br>
                  Tel: ${data.clinicPhone} | Email: ${data.clinicEmail}
                </div>
              </div>
              <div>
                ${logoPath ? `<img class="clinic-logo" src="${logoPath}" alt="Logo" />` : ''}
              </div>
            </div>

            <div class="certificate-title-box">
              <h2 class="certificate-title">Medical Certificate</h2>
              <div class="cert-number">Certificate No: ${data.certificateNumber}</div>
            </div>

            <div class="grid-container">
              <div class="section-box">
                <h3 class="section-title">Patient Details</h3>
                <div class="field-row">
                  <div class="field-label">Full Name:</div>
                  <div class="field-value" style="font-weight: 600;">${data.patientName}</div>
                </div>
                <div class="field-row">
                  <div class="field-label">ID / Passport:</div>
                  <div class="field-value">${data.patientIdentifier}</div>
                </div>
                <div class="field-row">
                  <div class="field-label">Date of Birth:</div>
                  <div class="field-value">${new Date(data.patientDob).toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <div class="field-row">
                  <div class="field-label">Gender:</div>
                  <div class="field-value">${data.patientGender}</div>
                </div>
              </div>

              <div class="section-box">
                <h3 class="section-title">Certificate Details</h3>
                <div class="field-row">
                  <div class="field-label">Issue Date:</div>
                  <div class="field-value">${new Date(data.issueDate).toLocaleDateString('en-SG')}</div>
                </div>
                <div class="field-row">
                  <div class="field-label">Start Date:</div>
                  <div class="field-value" style="font-weight: 600;">${new Date(data.startDate).toLocaleDateString('en-SG')}</div>
                </div>
                <div class="field-row">
                  <div class="field-label">End Date:</div>
                  <div class="field-value" style="font-weight: 600;">${new Date(data.endDate).toLocaleDateString('en-SG')}</div>
                </div>
                <div class="field-row">
                  <div class="field-label">Duration:</div>
                  <div class="field-value" style="font-weight: 600; color: #0F6FFF;">${data.durationDays} Day(s)</div>
                </div>
              </div>
            </div>

            <div class="diagnosis-box">
              <h3 class="diagnosis-title">Medical Assessment & Remarks</h3>
              <div class="diagnosis-text">
                This is to certify that the patient has been examined and assessed by <strong>Dr. ${data.doctorName}</strong>, and diagnosed with: <strong>${data.diagnosis}</strong>. 
                The patient is unfit for duty / requires medical leave for the period stated above.
              </div>
              ${data.remarks ? `<div style="margin-top: 10px; font-size: 13px; color: #475569;"><strong>Remarks:</strong> ${data.remarks}</div>` : ''}
            </div>

            <div class="footer-section">
              <div class="verification-qr-box">
                <img class="qr-code-img" src="${qrDataUrl}" alt="QR Verification" />
                <div class="verification-text-box">
                  <strong>Secure Verification:</strong><br>
                  Scan QR code or visit <a href="${config.clientUrl}/verify" style="color: #0F6FFF; text-decoration: none;">healthverify.com/verify</a> to validate this document.<br>
                  <strong>Verification Hash:</strong>
                  <div class="hash-label">${data.verificationHash}</div>
                </div>
              </div>

              <div class="doctor-signature-box">
                ${signaturePath ? `<img class="signature-img" src="${signaturePath}" alt="Signature" />` : `<div style="height: 60px;"></div>`}
                <div class="doctor-name-sign">Dr. ${data.doctorName}</div>
                <div class="doctor-license-sign">MCR No. ${data.doctorLicense}<br>${data.doctorSpecialization}</div>
              </div>
            </div>

          </div>
        </body>
        </html>
      `;

      logger.info('[Certificate Pipeline] Step 6: Generating PDF');
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: config.puppeteerExecutablePath,
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
        printBackground: true,
      });

      await browser.close();
      browser = null;

      logger.info(`[Certificate Pipeline] Step 7: PDF ready for email attachment at ${pdfPath}`);
      const completedPdfPath = pdfPath;
      pdfPath = null;

      return {
        pdfPath: completedPdfPath,
        filename: `Medical_Certificate_${data.certificateNumber}.pdf`,
      };
    } catch (error) {
      logger.error('========== PDF SERVICE ERROR ==========');
      logger.error(`Message: ${error?.message}`);
      logger.error(`HTTP code: ${error?.http_code || error?.response?.status || 'N/A'}`);
      logger.error(error?.stack || error);
      if (error?.response?.data) {
        logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      logger.error('Failed to generate PDF:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
      await cleanupTempFile(pdfPath);
    }
  }

  static async cleanupTempPDF(pdfPath) {
    await cleanupTempFile(pdfPath);
  }
}

export default PDFService;
