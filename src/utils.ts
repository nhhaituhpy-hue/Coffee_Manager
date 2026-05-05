
export const formatCurrency = (value: string | number): string => {
  if (!value && value !== 0) return '';
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('vi-VN');
};

export const parseCurrency = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const autoFormatAmountOnBlur = (value: string | number): string => {
  if (!value && value !== 0) return '';
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value;
  if (isNaN(num) || num === 0) return value.toString();
  
  // Shortcut: If user types a number less than 10000 (e.g. 716, 1500, 5000)
  // We assume they mean thousands. So 716 -> 716,000.
  if (num < 10000) {
    return (num * 1000).toString();
  }
  
  return num.toString();
};
