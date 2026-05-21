const fs = require('fs');
const path = require('path');
const { prisma } = require('../config/db');
const { cloudinary, isConfigured } = require('../config/cloudinary');
const { resolvePublicUrl } = require('../utils/mediaUrl');
const { computeBadges } = require('./featuresService');
const emailNotify = require('./emailNotificationService');

const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      profileImage: true,
      walletId: true,
      role: true,
      isEmailVerified: true,
      bio: true,
      loginStreak: true,
      lastDailyReward: true,
      createdAt: true,
      wallet: {
        select: {
          gemBalance: true,
          ussdBalance: true,
        },
      },
    },
  });

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const enriched = { ...user, wallet: user.wallet };
  return {
    ...user,
    profileImage: resolvePublicUrl(user.profileImage),
    badges: computeBadges(enriched),
    canClaimDaily: !user.lastDailyReward || new Date(user.lastDailyReward).toDateString() !== new Date().toDateString(),
    wallet: user.wallet
      ? {
          gemBalance: Number(user.wallet.gemBalance),
          ussdBalance: Number(user.wallet.ussdBalance),
        }
      : null,
  };
};

const updateProfile = async (userId, { username, profileImage, bio }) => {
  const data = {};
  if (username) {
    const taken = await prisma.user.findFirst({
      where: { username, NOT: { id: userId } },
    });
    if (taken) {
      const err = new Error('Username already taken');
      err.statusCode = 409;
      throw err;
    }
    data.username = username;
  }
  if (profileImage !== undefined) data.profileImage = profileImage;
  if (bio !== undefined) data.bio = bio;

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      username: true,
      email: true,
      profileImage: true,
      walletId: true,
      role: true,
      bio: true,
      loginStreak: true,
      lastDailyReward: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });

  const enriched = { ...updated, wallet: await prisma.wallet.findUnique({ where: { userId } }) };
  return {
    ...updated,
    profileImage: resolvePublicUrl(updated.profileImage),
    badges: computeBadges(enriched),
  };
};

const uploadProfileImage = async (userId, filePath) => {
  let profileImageUrl;

  if (!isConfigured) {
    profileImageUrl = `/uploads/${path.basename(filePath)}`;
  } else {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'sgt-wallet/profiles',
      transformation: [{ width: 400, height: 400, crop: 'fill' }],
    });
    profileImageUrl = result.secure_url;
  }

  const user = await updateProfile(userId, { profileImage: profileImageUrl });

  if (isConfigured && filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (_) {}
  }

  const fullUser = await prisma.user.findUnique({ where: { id: userId } });
  if (fullUser) {
    const imageUrl = resolvePublicUrl(profileImageUrl);
    emailNotify.sendProfilePictureEmail(fullUser, imageUrl).catch((e) =>
      console.error('[Mail] Profile picture:', e.message)
    );
  }

  return user;
};

module.exports = { getProfile, updateProfile, uploadProfileImage };
