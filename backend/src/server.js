const app = require('./app');
const { connectDB } = require('./config/db');
const sendEmail = require('./utils/sendEmail');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await sendEmail.verifyOnStartup();

  app.listen(PORT, () => {
    console.log(`SGT Wallet API running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
