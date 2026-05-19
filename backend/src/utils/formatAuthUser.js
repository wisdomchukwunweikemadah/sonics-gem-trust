const formatAuthUser = (user) => {
  if (!user) return null;

  const { password, verificationTokens, passwordResetTokens, ...safe } = user;

  return {
    id: safe.id,
    username: safe.username,
    email: safe.email,
    profileImage: safe.profileImage,
    walletId: safe.walletId,
    role: safe.role,
    isEmailVerified: safe.isEmailVerified,
    createdAt: safe.createdAt,
    wallet: safe.wallet
      ? {
          gemBalance: Number(safe.wallet.gemBalance),
          ussdBalance: Number(safe.wallet.ussdBalance),
        }
      : null,
  };
};

module.exports = formatAuthUser;
