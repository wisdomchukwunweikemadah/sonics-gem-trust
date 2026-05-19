const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../config/db');
const generateWalletId = require('../utils/generateWalletId');
const { signToken } = require('../utils/jwt');
const formatAuthUser = require('../utils/formatAuthUser');
const emailNotify = require('./emailNotificationService');

const SIGNUP_BONUS_GEMS = 1000;
const SALT_ROUNDS = 12;
const TOKEN_HOURS = 24;

const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

const registerUser = async ({ username, email, password }) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    const err = new Error(existing.email === email ? 'Email already registered' : 'Username taken');
    err.statusCode = 409;
    throw err;
  }

  let walletId = generateWalletId();
  let exists = await prisma.user.findUnique({ where: { walletId } });
  while (exists) {
    walletId = generateWalletId();
    exists = await prisma.user.findUnique({ where: { walletId } });
  }

  const hashed = await hashPassword(password);
  const verifyToken = uuidv4();

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        username,
        email,
        password: hashed,
        walletId,
        wallet: {
          create: {
            gemBalance: SIGNUP_BONUS_GEMS,
            ussdBalance: 0,
          },
        },
      },
      include: { wallet: true },
    });

    await tx.transaction.create({
      data: {
        type: 'BONUS',
        amount: SIGNUP_BONUS_GEMS,
        receiverId: newUser.id,
        walletId: newUser.wallet.id,
        status: 'COMPLETED',
        description: 'Welcome signup bonus',
        reference: `BONUS-${newUser.id.slice(0, 8)}`,
      },
    });

    await tx.verificationToken.create({
      data: {
        userId: newUser.id,
        token: verifyToken,
        expiresAt: new Date(Date.now() + TOKEN_HOURS * 60 * 60 * 1000),
      },
    });

    return newUser;
  });

  const token = signToken({ id: user.id, role: user.role });
  const authUser = formatAuthUser(user);

  emailNotify.sendVerificationEmail(user, verifyToken).catch((e) =>
    console.error('[Mail] Verification:', e.message)
  );
  emailNotify.sendAboutEmail(user).catch((e) => console.error('[Mail] About:', e.message));

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Auth] Dev verification token for ${email}: ${verifyToken}`);
  }

  return { user: authUser, token };
};

const loginUser = async ({ email, password }, loginMeta = {}) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { wallet: true },
  });

  if (!user || !(await comparePassword(password, user.password))) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ id: user.id, role: user.role });

  emailNotify.sendLoginAlertEmail(user, loginMeta).catch((e) =>
    console.error('[Mail] Login alert:', e.message)
  );

  return { user: formatAuthUser(user), token };
};

const verifyEmail = async (token) => {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record || record.expiresAt < new Date()) {
    const err = new Error('Invalid or expired verification token');
    err.statusCode = 400;
    throw err;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { isEmailVerified: true },
    }),
    prisma.verificationToken.delete({ where: { id: record.id } }),
  ]);

  return { email: record.user.email };
};

const requestPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { message: 'If the email exists, a reset link was sent' };

  const token = uuidv4();
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + TOKEN_HOURS * 60 * 60 * 1000),
    },
  });

  const mailResult = await emailNotify.sendPasswordResetEmail(user, token);

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Auth] Dev password reset token for ${email}: ${token}`);
  }

  return {
    message: 'If the email exists, a reset link was sent',
    emailSent: mailResult.sent,
    token: process.env.NODE_ENV === 'development' ? token : undefined,
  };
};

const resetPassword = async ({ token, password }) => {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record || record.expiresAt < new Date()) {
    const err = new Error('Invalid or expired reset token');
    err.statusCode = 400;
    throw err;
  }

  const hashed = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hashed },
    }),
    prisma.passwordResetToken.delete({ where: { id: record.id } }),
  ]);

  return { message: 'Password updated successfully' };
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
};
