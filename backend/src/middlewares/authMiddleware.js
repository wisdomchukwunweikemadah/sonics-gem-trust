const { prisma } = require('../config/db');
const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return sendError(res, 401, 'Not authorized, no token');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        walletId: true,
        role: true,
        profileImage: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return sendError(res, 401, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, error.name === 'TokenExpiredError' ? 'Token expired' : 'Not authorized');
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return sendError(res, 403, 'Admin access required');
  }
  next();
};

module.exports = { protect, adminOnly };
