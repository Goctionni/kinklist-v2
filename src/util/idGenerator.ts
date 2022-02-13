export const generateId = (): string => {
  return new Array(5)
    .fill(0)
    .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36))
    .join('-');
};