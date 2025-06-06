// Format a number with thousand separators and two decimal places
// Example: 1234.56 => '1,234.56'
export function formatAmountWithComma(num: number | string): string {
  // Convert input to number
  const parsed = parseFloat(String(num));
  // If not a valid number, return as is
  if (isNaN(parsed)) return String(num);
  // Format with comma and two decimals
  return parsed.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format a string number to two decimal places (no comma)
// Example: '1234.5' => '1234.50'
export function onBlurFormatAmount(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toFixed(2); // Always two decimals
}

// Universal number formatter: add comma and always two decimals
// Accepts number or string, returns formatted string
// Example: 1234.5 => '1,234.50'
export function formatNumberUniversal(value: number | string): string {
  const num = parseFloat(String(value));
  if (isNaN(num)) return String(value);
  // Use toLocaleString for comma and decimals
  return num.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
