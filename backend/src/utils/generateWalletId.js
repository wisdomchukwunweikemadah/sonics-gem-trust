const generateWalletId = () => {
  const prefix = 'SGT';
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${segment()}-${segment()}-${segment()}`;
};

module.exports = generateWalletId;
