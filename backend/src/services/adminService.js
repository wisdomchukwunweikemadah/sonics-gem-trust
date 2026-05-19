const { Prisma } = require('@prisma/client');
const { prisma } = require('../config/db');

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      walletId: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
      wallet: {
        select: { gemBalance: true, ussdBalance: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users.map((u) => ({
    ...u,
    wallet: u.wallet
      ? {
          gemBalance: Number(u.wallet.gemBalance),
          ussdBalance: Number(u.wallet.ussdBalance),
        }
      : null,
  }));
};

const adjustBalance = async (userId, { gemBalance, ussdBalance }) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    const err = new Error('Wallet not found');
    err.statusCode = 404;
    throw err;
  }

  const data = {};
  if (gemBalance !== undefined) {
    const gems = new Prisma.Decimal(gemBalance);
    if (gems.lt(0)) {
      const err = new Error('Gem balance cannot be negative');
      err.statusCode = 400;
      throw err;
    }
    data.gemBalance = gems;
  }
  if (ussdBalance !== undefined) {
    const ussd = new Prisma.Decimal(ussdBalance);
    if (ussd.lt(0)) {
      const err = new Error('USSD balance cannot be negative');
      err.statusCode = 400;
      throw err;
    }
    data.ussdBalance = ussd;
  }

  const updated = await prisma.wallet.update({
    where: { userId },
    data,
  });

  return {
    gemBalance: Number(updated.gemBalance),
    ussdBalance: Number(updated.ussdBalance),
  };
};

const getStatistics = async () => {
  const [userCount, txCount, wallets] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count(),
    prisma.wallet.aggregate({
      _sum: { gemBalance: true, ussdBalance: true },
    }),
  ]);

  const recentTx = await prisma.transaction.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { username: true } },
      receiver: { select: { username: true } },
    },
  });

  return {
    userCount,
    transactionCount: txCount,
    totalGems: Number(wallets._sum.gemBalance || 0),
    totalUssd: Number(wallets._sum.ussdBalance || 0),
    recentTransactions: recentTx.map((t) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      status: t.status,
      createdAt: t.createdAt,
      sender: t.sender?.username,
      receiver: t.receiver?.username,
    })),
  };
};

module.exports = { getAllUsers, adjustBalance, getStatistics };
