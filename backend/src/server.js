const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { validateEnv, getNodeEnv, getPort } = require('./config/env');
const { verifyMailConnection } = require('./config/mail');

require('dotenv').config();
validateEnv();

const PORT = getPort();
const NODE_ENV = getNodeEnv();
const FRONTEND_URL = process.env.FRONTEND_URL || '(not set)';

const logStartupBanner = (emailReady) => {
  const { allowedOrigins } = require('./app');
  console.log('\n══════════════════════════════════════════');
  console.log('  Sonic\'s Gem Trust — API');
  console.log('══════════════════════════════════════════');
  console.log(`✅ PostgreSQL connected`);
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ CORS enabled (${allowedOrigins.length} allowed origin(s))`);
  console.log(
    emailReady
      ? `✅ Email service ready (Gmail SMTP)`
      : `⚠️  Email service: fallback mode (console / non-blocking)`
  );
  console.log(`✅ Environment: ${NODE_ENV}`);
  console.log(`✅ Frontend URL: ${FRONTEND_URL}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  if (process.env.API_PUBLIC_URL) {
    console.log(`   Public API: ${process.env.API_PUBLIC_URL}`);
  }
  console.log('══════════════════════════════════════════\n');
};

const startEmailVerification = () => {
  const timeoutMs = Number(process.env.MAIL_VERIFY_TIMEOUT_MS) || 8000;

  return Promise.race([
    verifyMailConnection(),
    new Promise((resolve) => {
      setTimeout(() => {
        console.warn(`[Mail] SMTP verify timed out after ${timeoutMs}ms — continuing in fallback mode`);
        resolve(false);
      }, timeoutMs);
    }),
  ]).catch((err) => {
    console.warn('[Mail] Startup verify error (non-blocking):', err.message);
    return false;
  });
};

const startServer = async () => {
  await connectDB();

  const emailReady = await startEmailVerification();

  const server = http.createServer(app);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use.`);
      console.error(`   Stop the other process or set PORT to a free port in backend/.env\n`);
      process.exit(1);
    }
    console.error('❌ Server error:', err.message);
    process.exit(1);
  });

  server.listen(PORT, () => {
    logStartupBanner(emailReady);
  });
};

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
