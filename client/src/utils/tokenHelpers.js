export const tokenLabel = (tokenNumber) => {
  if (!tokenNumber) return 'Token -';
  return `Token #${tokenNumber}`;
};
