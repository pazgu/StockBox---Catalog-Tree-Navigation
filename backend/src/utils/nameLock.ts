export const normalizeName = (value: unknown): string => {
  console.log('Normalizing name:', value);
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
};
