const { Prisma } = require('@prisma/client');
const { prisma } = require('../config/db');

const DAILY_REWARDS = [50, 75, 100, 125, 150, 200, 300];

const computeBadges = (user) => {
  const badges = [];
  const gems = Number(user.wallet?.gemBalance || 0);
  const txCount =
    (user._count?.receivedTransactions || 0) + (user._count?.sentTransactions || 0);

  if (user.isEmailVerified) badges.push({ id: 'verified', label: 'Verified User', icon: '✓' });
  if (gems >= 10000) badges.push({ id: 'whale', label: 'Whale', icon: '🐋' });
  else if (gems >= 5000) badges.push({ id: 'rich', label: 'Gem Tycoon', icon: '💎' });
  if (txCount >= 20) badges.push({ id: 'trader', label: 'Top Trader', icon: '📈' });
  if (user.loginStreak >= 7) badges.push({ id: 'streak', label: '7-Day Streak', icon: '🔥' });
  const daysSinceJoin = (Date.now() - new Date(user.createdAt).getTime()) / 86400000;
  if (daysSinceJoin <= 14) badges.push({ id: 'early', label: 'Early Supporter', icon: '⭐' });
  if (user.role === 'ADMIN') badges.push({ id: 'admin', label: 'Admin', icon: '🛡️' });

  return badges;
};

const getLeaderboard = async () => {
  const topWallets = await prisma.wallet.findMany({
    take: 10,
    orderBy: { gemBalance: 'desc' },
    include: {
      user: {
        select: {
          username: true,
          walletId: true,
          isEmailVerified: true,
          loginStreak: true,
          role: true,
          createdAt: true,
          wallet: { select: { gemBalance: true } },
        },
      },
    },
  });

  const senders = await prisma.transaction.groupBy({
    by: ['senderId'],
    where: { type: 'SEND', senderId: { not: null } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 10,
  });

  return {
    richest: topWallets.map((w, i) => {
      const u = { ...w.user, wallet: w };
      return {
        rank: i + 1,
        username: w.user.username,
        walletId: w.user.walletId,
        gems: Number(w.gemBalance),
        badges: computeBadges(u),
      };
    }),
    topSenders: await Promise.all(
      senders.map(async (s, i) => {
        const u = await prisma.user.findUnique({
          where: { id: s.senderId },
          select: { username: true, walletId: true },
        });
        return {
          rank: i + 1,
          username: u?.username || 'Unknown',
          walletId: u?.walletId,
          totalSent: Number(s._sum.amount || 0),
        };
      })
    ),
  };
};

const claimDailyReward = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });

  if (!user?.wallet) {
    const err = new Error('Wallet not found');
    err.statusCode = 404;
    throw err;
  }

  const now = new Date();
  const last = user.lastDailyReward ? new Date(user.lastDailyReward) : null;
  if (last && now.toDateString() === last.toDateString()) {
    const err = new Error('Daily reward already claimed today');
    err.statusCode = 400;
    throw err;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  let streak = user.loginStreak || 0;
  if (last && last.toDateString() === yesterday.toDateString()) {
    streak += 1;
  } else {
    streak = 1;
  }

  const rewardIndex = Math.min(streak - 1, DAILY_REWARDS.length - 1);
  const reward = new Prisma.Decimal(DAILY_REWARDS[rewardIndex]);

  const result = await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.update({
      where: { id: user.wallet.id },
      data: { gemBalance: { increment: reward } },
    });

    await tx.transaction.create({
      data: {
        type: 'BONUS',
        amount: reward,
        receiverId: user.id,
        walletId: user.wallet.id,
        status: 'COMPLETED',
        description: `Daily login reward (day ${streak})`,
        reference: `DAILY-${user.id.slice(0, 8)}-${now.toISOString().slice(0, 10)}`,
      },
    });

    await tx.user.update({
      where: { id: user.id },
      data: { loginStreak: streak, lastDailyReward: now },
    });

    return { wallet, streak, reward };
  });

  return {
    streak: result.streak,
    reward: Number(result.reward),
    gemBalance: Number(result.wallet.gemBalance),
  };
};

const getActivityFeed = async (limit = 20) => {
  const txs = await prisma.transaction.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { username: true } },
      receiver: { select: { username: true } },
    },
  });

  return txs.map((t) => ({
    id: t.id,
    type: t.type,
    amount: Number(t.amount),
    status: t.status,
    description: t.description,
    createdAt: t.createdAt,
    sender: t.sender?.username,
    receiver: t.receiver?.username,
  }));
};

module.exports = { computeBadges, getLeaderboard, claimDailyReward, getActivityFeed, DAILY_REWARDS };
