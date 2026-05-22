const { Prisma } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../config/db');
const findUserWithWallet = require('../utils/findUserWallet');

const getAllUsers = async (search = '') => {
  const where = search
    ? {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { walletId: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      username: true,
      email: true,
      walletId: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
      wallet: { select: { gemBalance: true, ussdBalance: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users.map((u) => ({
    ...u,
    wallet: u.wallet
      ? { gemBalance: Number(u.wallet.gemBalance), ussdBalance: Number(u.wallet.ussdBalance) }
      : null,
  }));
};

const adjustBalance = async (userId, { gemBalance, ussdBalance }) => {
  const user = await findUserWithWallet(userId);
  const wallet = user.wallet;

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

  if (!Object.keys(data).length) {
    const err = new Error('Provide gemBalance and/or ussdBalance');
    err.statusCode = 400;
    throw err;
  }

  const updated = await prisma.wallet.update({ where: { id: wallet.id }, data });

  return {
    gemBalance: Number(updated.gemBalance),
    ussdBalance: Number(updated.ussdBalance),
  };
};

const giftGems = async (adminId, { walletId, userId, amount, description }) => {
  const giftAmount = new Prisma.Decimal(amount);
  if (giftAmount.lte(0)) {
    const err = new Error('Gift amount must be greater than zero');
    err.statusCode = 400;
    throw err;
  }

  const recipientRef = (walletId || userId || '').trim();
  const user = await findUserWithWallet(recipientRef);

  if (!user.wallet?.id) {
    const err = new Error('Could not resolve recipient wallet');
    err.statusCode = 500;
    throw err;
  }

  const reference = `GIFT-${uuidv4().slice(0, 8).toUpperCase()}`;

  const result = await prisma.$transaction(async (tx) => {
    const updatedWallet = await tx.wallet.update({
      where: { id: user.wallet.id },
      data: { gemBalance: { increment: giftAmount } },
    });

    await tx.transaction.create({
      data: {
        type: 'BONUS',
        amount: giftAmount,
        receiverId: user.id,
        senderId: adminId,
        walletId: user.wallet.id,
        status: 'COMPLETED',
        description: description || 'Admin gem gift',
        reference,
      },
    });

    return updatedWallet;
  });

  return {
    walletId: user.walletId,
    username: user.username,
    gemBalance: Number(result.gemBalance),
    ussdBalance: Number(result.ussdBalance),
    gifted: Number(giftAmount),
    reference,
  };
};

const getStatistics = async () => {
  const [userCount, txCount, wallets, recentTx] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count(),
    prisma.wallet.aggregate({ _sum: { gemBalance: true, ussdBalance: true } }),
    prisma.transaction.findMany({
      take: 15,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { username: true } },
        receiver: { select: { username: true } },
      },
    }),
  ]);

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
      description: t.description,
      createdAt: t.createdAt,
      sender: t.sender?.username,
      receiver: t.receiver?.username,
    })),
  };
};

module.exports = { getAllUsers, adjustBalance, giftGems, getStatistics };
