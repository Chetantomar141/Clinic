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

      // Resolve logo path as base64 data URI
      let logoDataUrl = '';
      try {
        const logoFilePath = path.resolve(process.cwd(), '../client/public/logo.png');
        const logoBuffer = await fs.readFile(logoFilePath);
        logoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      } catch (err) {
        logger.warn(`Could not read clinic logo.png from disk: ${err.message}`);
        logoDataUrl = data.clinicLogoUrl || '';
      }

      // Resolve signature path
      let signaturePath = '';
      try {
        const signatureFilePath = path.resolve(process.cwd(), '../client/public/signature.png');
        const signatureBuffer = await fs.readFile(signatureFilePath);
        signaturePath = `data:image/png;base64,${signatureBuffer.toString('base64')}`;
      } catch (err) {
        logger.warn(`Could not read signature.png from disk: ${err.message}`);
        signaturePath = data.doctorSignatureUrl || '';
      }

      const formatDate = (dateVal) => {
        if (!dateVal) return '';
        const d = new Date(dateVal);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const formatPatientDob = (dobVal) => {
        if (!dobVal) return '';
        try {
          const d = new Date(dobVal);
          return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {
          return '';
        }
      };

      const formatAddress = (addr) => {
        if (!addr) return '';
        return addr.replace(', ', '<br>');
      };

      // 3. Compile HTML Template
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Medical Certificate - ${data.certificateNumber}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #000000;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
            }
            .certificate-container {
              width: 210mm;
              height: 297mm;
              padding: 25mm 20mm;
              box-sizing: border-box;
              position: relative;
              background-color: #ffffff;
              display: flex;
              flex-direction: column;
            }
            .header-container {
              text-align: center;
              margin-bottom: 10px;
            }
            .clinic-logo {
              width: 200px;
              max-height: 80px;
              object-fit: contain;
              display: block;
              margin: 0 auto 12px auto;
            }
            .clinic-name {
              font-family: 'Times New Roman', Times, serif;
              font-size: 26px;
              font-weight: bold;
              text-transform: uppercase;
              color: #000000;
              margin: 0 0 5px 0;
              letter-spacing: 0.5px;
            }
            .clinic-address {
              font-family: Arial, sans-serif;
              font-size: 13px;
              color: #333333;
              line-height: 1.4;
              margin: 0;
            }
            .divider-line {
              border-bottom: 1px solid #0d9488;
              margin-top: 15px;
              margin-bottom: 25px;
              width: 100%;
            }
            .title-section {
              text-align: center;
              margin-bottom: 30px;
            }
            .cert-title {
              font-family: 'Times New Roman', Times, serif;
              font-size: 38px;
              font-weight: bold;
              color: #000000;
              margin: 0;
              letter-spacing: 1px;
            }
            .cert-meta {
              font-family: Arial, sans-serif;
              font-size: 13px;
              color: #333333;
              margin-top: 10px;
              line-height: 1.5;
            }
            .cert-no-highlight {
              color: #0284c7;
              font-weight: bold;
            }
            .details-container {
              margin-top: 30px;
              font-family: Arial, sans-serif;
              font-size: 13px;
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .detail-row {
              display: flex;
            }
            .detail-label {
              width: 200px;
              color: #333333;
            }
            .detail-value {
              color: #000000;
            }
            .leave-row {
              display: flex;
              gap: 80px;
              margin-top: 30px;
              font-family: Arial, sans-serif;
              font-size: 13px;
              font-weight: bold;
              color: #000000;
            }
            .leave-value {
              font-weight: normal;
              margin-left: 8px;
            }
            .cert-type-row {
              margin-top: 15px;
              font-family: Arial, sans-serif;
              font-size: 13px;
              font-weight: bold;
              color: #000000;
            }
            .cert-type-value {
              font-weight: normal;
              margin-left: 8px;
            }
            .certification-text {
              margin-top: 30px;
              font-family: Arial, sans-serif;
              font-size: 13px;
              line-height: 1.6;
              color: #000000;
              text-align: left;
            }
            .footer-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: auto;
              padding-bottom: 20px;
              font-family: Arial, sans-serif;
            }
            .footer-column {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .stamp-column {
              width: 33%;
            }
            .stamp-box {
              color: #1d4ed8;
              font-family: Arial, sans-serif;
              font-size: 11px;
              line-height: 1.4;
              text-align: center;
              transform: rotate(-10deg);
              opacity: 0.85;
              font-weight: bold;
            }
            .qr-column {
              width: 34%;
              text-align: center;
            }
            .qr-img {
              width: 110px;
              height: 110px;
              display: block;
              margin: 0 auto;
            }
            .qr-caption {
              font-size: 10px;
              color: #555555;
              margin-top: 6px;
              line-height: 1.3;
              text-align: center;
            }
            .sig-column {
              width: 33%;
              text-align: center;
              align-items: center;
            }
            .sig-img-container {
              min-height: 80px;
              display: flex;
              align-items: flex-end;
              justify-content: center;
              margin-bottom: 4px;
            }
            .sig-img {
              width: 140px;
              height: auto;
              max-height: 80px;
              object-fit: contain;
              display: block;
              mix-blend-mode: multiply;
            }
            .sig-line-divider {
              border-top: 1px solid #000000;
              width: 150px;
              margin-top: 2px;
              margin-bottom: 4px;
            }
            .sig-name {
              font-size: 13px;
              font-weight: bold;
              color: #000000;
            }
            .sig-title, .sig-license {
              font-size: 11px;
              color: #555555;
              line-height: 1.3;
            }
            .disclaimer-text {
              font-family: Arial, sans-serif;
              font-size: 10px;
              color: #555555;
              text-align: center;
              margin-top: 15px;
              font-style: italic;
              width: 100%;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            
            <!-- Header Section -->
            <div class="header-container">
              ${logoDataUrl ? `<img class="clinic-logo" src="${logoDataUrl}" alt="Clinic Logo" />` : ''}
              <h1 class="clinic-name">${data.clinicName}</h1>
              <p class="clinic-address">
                ${formatAddress(data.clinicAddress)}
              </p>
            </div>
            
            <div class="divider-line"></div>

            <!-- Title & Metadata -->
            <div class="title-section">
              <h2 class="cert-title">MEDICAL CERTIFICATE</h2>
              <div class="cert-meta">
                Certificate No: <span class="cert-no-highlight">${data.certificateNumber}</span><br>
                Issued Date: ${formatDate(data.issueDate)}
              </div>
            </div>

            <!-- Patient Details Section -->
            <div class="details-container">
              <div class="detail-row">
                <div class="detail-label">Name:</div>
                <div class="detail-value" style="font-weight: bold;">${data.patientName}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">NRIC / Passport Number:</div>
                <div class="detail-value">${data.patientIdentifier}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Date of Birth:</div>
                <div class="detail-value">${formatPatientDob(data.patientDob)}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Gender:</div>
                <div class="detail-value">${data.patientGender}</div>
              </div>
            </div>

            <!-- Leave Details Row -->
            <div class="leave-row">
              <div>Start Date: <span class="leave-value">${formatDate(data.startDate)}</span></div>
              <div>End Date: <span class="leave-value">${formatDate(data.endDate)}</span></div>
            </div>

            <div class="cert-type-row">
              Type of certificate granted: <span class="cert-type-value">Medical Certificate</span>
            </div>

            <!-- Certification Text -->
            <div class="certification-text">
              This is to certify that the patient has been examined and assessed by Dr ${data.doctorName.replace(/^Dr\.?\s+/i, '')} and is medically unfit for duty for the period stated above.
            </div>

            <!-- Footer Section -->
            <div class="footer-container">
              <!-- Left Column: Clinic Stamp -->
              <div class="footer-column stamp-column">
                <div class="stamp-box">
                  ${data.clinicName.toUpperCase()}<br>
                  ${formatAddress(data.clinicAddress)}<br>
                  Tel: ${data.clinicPhone || '80615849'}
                </div>
              </div>

              <!-- Center Column: QR Code -->
              <div class="footer-column qr-column">
                <img class="qr-img" src="${qrDataUrl}" alt="QR Verification" />
                <div class="qr-caption">
                  Scan QR code to verify this certificate
                </div>
              </div>

              <!-- Right Column: Doctor Signature -->
              <div class="footer-column sig-column">
                <div class="sig-img-container">
                  <img class="sig-img" src="${signaturePath}" alt="Signature" />
                </div>
                <div class="sig-line-divider"></div>
                <div class="sig-name">Dr ${data.doctorName.replace(/^Dr\.?\s+/i, '')}</div>
                <div class="sig-title">${data.doctorSpecialization || 'General Practitioner'}</div>
                <div class="sig-license">License No.: ${data.doctorLicense || 'M66656'}</div>
              </div>
            </div>

            <!-- Disclaimer Section -->
            <div class="disclaimer-text">
              * This certificate is not valid for Court Attendance or Police Reporting
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
