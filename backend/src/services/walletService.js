const { Prisma } = require('@prisma/client');
const { prisma } = require('../config/db');
const emailNotify = require('./emailNotificationService');

const GEMS_PER_USSD = 100;

const toNumber = (val) => Number(val);

const getBalance = async (userId) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      user: {
        select: { walletId: true, username: true },
      },
    },
  });

  if (!wallet) {
    const err = new Error('Wallet not found');
    err.statusCode = 404;
    throw err;
  }

  return {
    walletId: wallet.user.walletId,
    gemBalance: toNumber(wallet.gemBalance),
    ussdBalance: toNumber(wallet.ussdBalance),
  };
};

const sendGems = async (senderId, { recipientWalletId, amount, reference }) => {
  const gems = new Prisma.Decimal(amount);

  if (gems.lte(0)) {
    const err = new Error('Amount must be positive');
    err.statusCode = 400;
    throw err;
  }

  if (reference) {
    const dup = await prisma.transaction.findUnique({ where: { reference } });
    if (dup) {
      const err = new Error('Duplicate transaction reference');
      err.statusCode = 409;
      throw err;
    }
  }

  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    include: { wallet: true },
  });

  const recipient = await prisma.user.findUnique({
    where: { walletId: recipientWalletId },
    include: { wallet: true },
  });

  if (!recipient?.wallet) {
    const err = new Error('Invalid recipient wallet ID');
    err.statusCode = 404;
    throw err;
  }

  if (recipient.id === senderId) {
    const err = new Error('Cannot send gems to yourself');
    err.statusCode = 400;
    throw err;
  }

  if (!sender?.wallet) {
    const err = new Error('Sender wallet not found');
    err.statusCode = 404;
    throw err;
  }

  if (new Prisma.Decimal(sender.wallet.gemBalance).lt(gems)) {
    const err = new Error('Insufficient gem balance');
    err.statusCode = 400;
    throw err;
  }

  const ref = reference || `TXN-${Date.now()}-${senderId.slice(0, 6)}`;

  return prisma.$transaction(async (tx) => {
    const updatedSender = await tx.wallet.update({
      where: { id: sender.wallet.id },
      data: { gemBalance: { decrement: gems } },
    });

    const updatedRecipient = await tx.wallet.update({
      where: { id: recipient.wallet.id },
      data: { gemBalance: { increment: gems } },
    });

    if (new Prisma.Decimal(updatedSender.gemBalance).lt(0)) {
      throw new Error('Insufficient balance');
    }

    const sendTx = await tx.transaction.create({
      data: {
        type: 'SEND',
        amount: gems,
        senderId,
        receiverId: recipient.id,
        walletId: sender.wallet.id,
        status: 'COMPLETED',
        reference: ref,
        description: `Sent to ${recipientWalletId}`,
      },
    });

    await tx.transaction.create({
      data: {
        type: 'RECEIVE',
        amount: gems,
        senderId,
        receiverId: recipient.id,
        walletId: recipient.wallet.id,
        status: 'COMPLETED',
        reference: `${ref}-RCV`,
        description: `Received from ${sender.walletId}`,
      },
    });

    return {
      transaction: sendTx,
      gemBalance: toNumber(updatedSender.gemBalance),
      recipientGemBalance: toNumber(updatedRecipient.gemBalance),
    };
  });
};

const convertGemsToUssd = async (userId, { gemsAmount, reference }) => {
  const gems = new Prisma.Decimal(gemsAmount);

  if (gems.lte(0)) {
    const err = new Error('Amount must be positive');
    err.statusCode = 400;
    throw err;
  }

  if (reference) {
    const dup = await prisma.transaction.findUnique({ where: { reference } });
    if (dup) {
      const err = new Error('Duplicate transaction reference');
      err.statusCode = 409;
      throw err;
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });

  if (!user?.wallet) {
    const err = new Error('Wallet not found');
    err.statusCode = 404;
    throw err;
  }

  if (new Prisma.Decimal(user.wallet.gemBalance).lt(gems)) {
    const err = new Error('Insufficient gem balance');
    err.statusCode = 400;
    throw err;
  }

  const ussdGain = gems.div(GEMS_PER_USSD);
  const ref = reference || `CVT-${Date.now()}-${userId.slice(0, 6)}`;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.wallet.update({
      where: { id: user.wallet.id },
      data: {
        gemBalance: { decrement: gems },
        ussdBalance: { increment: ussdGain },
      },
    });

    if (new Prisma.Decimal(updated.gemBalance).lt(0)) {
      throw new Error('Insufficient balance');
    }

    const transaction = await tx.transaction.create({
      data: {
        type: 'CONVERT',
        amount: gems,
        senderId: userId,
        receiverId: userId,
        walletId: user.wallet.id,
        status: 'COMPLETED',
        reference: ref,
        description: `Converted ${gems} Gems to ${ussdGain} USSD`,
      },
    });

    const result = {
      transaction,
      gemBalance: toNumber(updated.gemBalance),
      ussdBalance: toNumber(updated.ussdBalance),
      ussdGained: toNumber(ussdGain),
    };

    emailNotify
      .sendConvertToUssdEmail(user, {
        gemsAmount: toNumber(gems),
        ussdReceived: toNumber(ussdGain),
        gemBalance: result.gemBalance,
        ussdBalance: result.ussdBalance,
      })
      .catch((e) => console.error('[Mail] Convert to USSD:', e.message));

    return result;
  });
};

const convertUssdToGems = async (userId, { ussdAmount, reference }) => {
  const ussd = new Prisma.Decimal(ussdAmount);

  if (ussd.lte(0)) {
    const err = new Error('Amount must be positive');
    err.statusCode = 400;
    throw err;
  }

  if (reference) {
    const dup = await prisma.transaction.findUnique({ where: { reference } });
    if (dup) {
      const err = new Error('Duplicate transaction reference');
      err.statusCode = 409;
      throw err;
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });

  if (!user?.wallet) {
    const err = new Error('Wallet not found');
    err.statusCode = 404;
    throw err;
  }

  if (new Prisma.Decimal(user.wallet.ussdBalance).lt(ussd)) {
    const err = new Error('Insufficient USSD balance');
    err.statusCode = 400;
    throw err;
  }

  const gemsGain = ussd.mul(GEMS_PER_USSD);
  const ref = reference || `RCV-${Date.now()}-${userId.slice(0, 6)}`;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.wallet.update({
      where: { id: user.wallet.id },
      data: {
        ussdBalance: { decrement: ussd },
        gemBalance: { increment: gemsGain },
      },
    });

    if (new Prisma.Decimal(updated.ussdBalance).lt(0)) {
      throw new Error('Insufficient balance');
    }

    const transaction = await tx.transaction.create({
      data: {
        type: 'CONVERT',
        amount: gemsGain,
        senderId: userId,
        receiverId: userId,
        walletId: user.wallet.id,
        status: 'COMPLETED',
        reference: ref,
        description: `Converted ${ussd} USSD to ${gemsGain} Gems`,
      },
    });

    const result = {
      transaction,
      gemBalance: toNumber(updated.gemBalance),
      ussdBalance: toNumber(updated.ussdBalance),
      gemsReceived: toNumber(gemsGain),
    };

    emailNotify
      .sendConvertToGemsEmail(user, {
        ussdAmount: toNumber(ussd),
        gemsReceived: result.gemsReceived,
        gemBalance: result.gemBalance,
        ussdBalance: result.ussdBalance,
      })
      .catch((e) => console.error('[Mail] Convert to Gems:', e.message));

    return result;
  });
};

module.exports = {
  getBalance,
  sendGems,
  convertGemsToUssd,
  convertUssdToGems,
  GEMS_PER_USSD,
};
