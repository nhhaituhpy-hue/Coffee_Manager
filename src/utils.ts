
export const formatCurrency = (value: string | number): string => {
  if (!value && value !== 0) return '';
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('vi-VN');
};

export const parseCurrency = (value: string): string => {
  return value.replace(/\D/g, '');
};
