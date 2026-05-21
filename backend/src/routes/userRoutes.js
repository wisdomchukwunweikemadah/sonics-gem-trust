const express = require('express');
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
    cb(ok ? null : new Error('Only image files allowed'), ok);
  },
});

router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/update', userController.updateProfile);
router.post('/avatar', (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      err.statusCode = 400;
      return next(err);
    }
    next();
  });
}, userController.uploadAvatar);

module.exports = router;
