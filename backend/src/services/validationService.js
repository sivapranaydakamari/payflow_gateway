const isValidVPA = (vpa) => {
  const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return vpaRegex.test(vpa);
};

// LUHN ALGORITHM
const isValidCardNumber = (number) => {
  const cleaned = number.replace(/[\s-]/g, "");

  if (!/^\d{13,19}$/.test(cleaned)) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

const detectCardNetwork = (number) => {
  const n = number.replace(/[\s-]/g, "");

  if (n.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^(60|65|8[1-9])/.test(n)) return "rupay";

  return "unknown";
};

const isValidExpiry = (month, year) => {
  const m = parseInt(month);
  let y = parseInt(year);

  if (m < 1 || m > 12) return false;
  if (year.length === 2) y += 2000;

  const now = new Date();
  const expiry = new Date(y, m);

  return expiry >= new Date(now.getFullYear(), now.getMonth());
};

module.exports = {
  isValidVPA,
  isValidCardNumber,
  detectCardNetwork,
  isValidExpiry,
};
