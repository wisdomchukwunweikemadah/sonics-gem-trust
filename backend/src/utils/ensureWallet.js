const { prisma } = require('../config/db');

/** Ensure every user has a Wallet row (fixes legacy accounts). */
const ensureWallet = async (userId) => {
  const existing = await prisma.wallet.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.wallet.create({
    data: { userId, gemBalance: 0, ussdBalance: 0 },
  });
};

const backfillMissingWallets = async () => {
  const users = await prisma.user.findMany({
    where: { wallet: null },
    select: { id: true },
  });
  if (!users.length) return 0;

  await prisma.$transaction(
    users.map((u) =>
      prisma.wallet.create({
        data: { userId: u.id, gemBalance: 0, ussdBalance: 0 },
      })
    )
  );
  return users.length;
};

module.exports = { ensureWallet, backfillMissingWallets };
