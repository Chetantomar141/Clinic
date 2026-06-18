/**
 * Masks patient names to preserve privacy while allowing validation.
 * Example: "Sukwindir Kaur" -> "SUK**** KAUR"
 */
export function maskName(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    const word = parts[0];
    if (word.length <= 3) {
      return word[0] + '*'.repeat(word.length - 1);
    }
    return word.substring(0, 3) + '*'.repeat(word.length - 4) + word[word.length - 1];
  }
  
  // Multiple words: mask the first word's middle and capitalize/keep the last word
  const firstWord = parts[0];
  const lastWord = parts[parts.length - 1];
  
  let maskedFirst = '';
  if (firstWord.length <= 3) {
    maskedFirst = firstWord[0] + '*'.repeat(Math.max(1, firstWord.length - 1));
  } else {
    maskedFirst = firstWord.substring(0, 3) + '****';
  }
  
  return `${maskedFirst.toUpperCase()} ${lastWord.toUpperCase()}`;
}

/**
 * Masks NRIC or Passport numbers.
 * Example: "M031234517X" -> "M03*****17X"
 */
export function maskIdentifier(id) {
  if (!id) return '';
  const trimmed = id.trim();
  if (trimmed.length <= 6) {
    return trimmed.substring(0, 2) + '*'.repeat(Math.max(1, trimmed.length - 2));
  }
  const prefix = trimmed.substring(0, 3);
  const suffix = trimmed.substring(trimmed.length - 3);
  const maskLength = trimmed.length - 6;
  return `${prefix}${'*'.repeat(maskLength)}${suffix}`;
}

/**
 * Masks contact numbers.
 * Example: "+65 9123 4567" -> "+65 **** 4567"
 */
export function maskPhone(phone) {
  if (!phone) return '';
  const trimmed = phone.trim();
  if (trimmed.length <= 4) return '****';
  const lastFour = trimmed.substring(trimmed.length - 4);
  const prefix = trimmed.substring(0, trimmed.length - 8);
  return `${prefix} **** ${lastFour}`;
}

/**
 * Masks email addresses.
 * Example: "patient.name@gmail.com" -> "pa****@gmail.com"
 */
export function maskEmail(email) {
  if (!email) return '';
  const parts = email.split('@');
  if (parts.length !== 2) return '****';
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) {
    return `${name[0]}*@${domain}`;
  }
  return `${name.substring(0, 2)}****@${domain}`;
}
