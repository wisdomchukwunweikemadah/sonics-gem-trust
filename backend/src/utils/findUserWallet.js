const { prisma } = require('../config/db');

/**
 * Resolve a user + wallet from walletId, user UUID, or email (case-insensitive walletId).
 */
const findUserWithWallet = async (ref) => {
  const raw = (ref || '').trim();
  if (!raw) {
    const err = new Error('Recipient is required');
    err.statusCode = 400;
    throw err;
  }

  const walletIdUpper = raw.toUpperCase();

  let user = await prisma.user.findUnique({
    where: { walletId: raw },
    include: { wallet: true },
  });

  if (!user) {
    user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletId: { equals: raw, mode: 'insensitive' } },
          { walletId: walletIdUpper },
          { id: raw },
          { email: raw.toLowerCase() },
        ],
      },
      include: { wallet: true },
    });
  }

  if (!user) {
    const err = new Error(`No user found for wallet or ID: ${raw}`);
    err.statusCode = 404;
    throw err;
  }

  if (!user.wallet) {
    user.wallet = await prisma.wallet.create({
      data: { userId: user.id, gemBalance: 0, ussdBalance: 0 },
    });
  }

  return user;
};

module.exports = findUserWithWallet;
