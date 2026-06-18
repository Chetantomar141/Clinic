import crypto from 'crypto';
import { config } from '../config/index.js';

export function calculateCertificateHash(
  certificateNumber,
  patientId,
  doctorId,
  issueDate
) {
  const formattedDate = typeof issueDate === 'string' ? issueDate : issueDate.toISOString();
  const rawString = `${certificateNumber}${patientId}${doctorId}${formattedDate}${config.verificationSecret}`;
  
  return crypto.createHash('sha256').update(rawString).digest('hex');
}
