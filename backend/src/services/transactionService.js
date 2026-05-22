const { prisma } = require('../config/db');
const { ensureWallet } = require('../utils/ensureWallet');

const getUserTransactions = async (userId, { type, limit = 20, page = 1 }) => {
  const wallet = (await prisma.wallet.findUnique({ where: { userId } })) || (await ensureWallet(userId));

  const where = {
    OR: [{ senderId: userId }, { receiverId: userId }, { walletId: wallet.id }],
    ...(type ? { type } : {}),
  };

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        sender: { select: { username: true, walletId: true } },
        receiver: { select: { username: true, walletId: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      status: t.status,
      reference: t.reference,
      description: t.description,
      createdAt: t.createdAt,
      sender: t.sender ? { username: t.sender.username, walletId: t.sender.walletId } : null,
      receiver: t.receiver ? { username: t.receiver.username, walletId: t.receiver.walletId } : null,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getWeeklyActivity = async (userId) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) return { labels: [], send: [], receive: [], convert: [] };

  const start = new Date();
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const transactions = await prisma.transaction.findMany({
    where: {
      walletId: wallet.id,
      createdAt: { gte: start },
      status: 'COMPLETED',
    },
    orderBy: { createdAt: 'asc' },
  });

  const labels = [];
  const send = [];
  const receive = [];
  const convert = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));

    const dayTx = transactions.filter((t) => t.createdAt.toISOString().slice(0, 10) === key);
    send.push(dayTx.filter((t) => t.type === 'SEND').reduce((s, t) => s + Number(t.amount), 0));
    receive.push(dayTx.filter((t) => t.type === 'RECEIVE').reduce((s, t) => s + Number(t.amount), 0));
    convert.push(dayTx.filter((t) => t.type === 'CONVERT').reduce((s, t) => s + Number(t.amount), 0));
  }

  return { labels, send, receive, convert };
};

module.exports = { getUserTransactions, getWeeklyActivity };
