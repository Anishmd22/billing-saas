// Currency formatting and number-to-words utilities for Indian Rupee

/**
 * Format a number as Indian Rupee currency string.
 * e.g. 14160 → "₹14,160.00"
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a number with Indian number system commas (no currency symbol).
 * e.g. 14160 → "14,160.00"
 */
export function formatAmount(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertHundreds(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
  return (
    ones[Math.floor(n / 100)] +
    ' Hundred' +
    (n % 100 !== 0 ? ' ' + convertHundreds(n % 100) : '')
  );
}

/**
 * Convert a number to Indian English words for invoice amount display.
 * e.g. 14160 → "Fourteen Thousand One Hundred Sixty Rupees Only"
 */
export function numberToWords(amount: number): string {
  if (amount === 0) return 'Zero Rupees Only';

  const intPart = Math.floor(amount);
  const decPart = Math.round((amount - intPart) * 100);

  let result = '';
  let remaining = intPart;

  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;
  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;
  const hundred = remaining;

  if (crore > 0) result += convertHundreds(crore) + ' Crore ';
  if (lakh > 0) result += convertHundreds(lakh) + ' Lakh ';
  if (thousand > 0) result += convertHundreds(thousand) + ' Thousand ';
  if (hundred > 0) result += convertHundreds(hundred);

  result = result.trim() + ' Rupees';
  if (decPart > 0) result += ' and ' + convertHundreds(decPart) + ' Paise';
  result += ' Only';

  return result;
}
