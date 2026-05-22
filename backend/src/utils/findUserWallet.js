const { prisma } = require('../config/db');
const { ensureWallet } = require('./ensureWallet');

/**
 * Resolve a user + wallet from public walletId, user UUID, username, or email.
 */
const findUserWithWallet = async (ref) => {
  const raw = (ref || '').trim();
  if (!raw) {
    const err = new Error('Recipient is required');
    err.statusCode = 400;
    throw err;
  }

  const walletIdUpper = raw.toUpperCase();
  const emailLower = raw.includes('@') ? raw.toLowerCase() : null;

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { walletId: { equals: raw, mode: 'insensitive' } },
        { walletId: walletIdUpper },
        { id: raw },
        ...(emailLower ? [{ email: { equals: emailLower, mode: 'insensitive' } }] : []),
        { username: { equals: raw, mode: 'insensitive' } },
      ],
    },
    include: { wallet: true },
  });

  if (!user) {
    const err = new Error(`No user found for: ${raw}`);
    err.statusCode = 404;
    throw err;
  }

  if (!user.wallet) {
    user.wallet = await ensureWallet(user.id);
  }

  return user;
};

module.exports = findUserWithWallet;
