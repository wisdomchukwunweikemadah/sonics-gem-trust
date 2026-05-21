/**
 * Validates required environment variables at startup.
 * Warns on missing optional services; exits only on critical misconfiguration.
 */

const REQUIRED = ['DATABASE_URL', 'JWT_SECRET'];

const WARN_OPTIONAL = ['FRONTEND_URL', 'EMAIL_USER', 'EMAIL_PASS'];

const validateEnv = () => {
  const missing = REQUIRED.filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    console.error(`❌ Missing required env: ${missing.join(', ')}`);
    console.error('   Copy backend/.env.example to backend/.env and configure values.');
    process.exit(1);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
    console.warn('⚠️  JWT_SECRET is short — use at least 32 random characters in production.');
  }

  WARN_OPTIONAL.forEach((key) => {
    if (!process.env[key]?.trim()) {
      console.warn(`⚠️  Optional env not set: ${key}`);
    }
  });
};

const getNodeEnv = () => process.env.NODE_ENV || 'development';

const getPort = () => {
  const raw = process.env.PORT;
  if (raw && /https?:\/\//i.test(raw)) {
    console.error(`❌ PORT must be numeric only (e.g. 5001), not a URL: ${raw}`);
    process.exit(1);
  }
  const port = Number(raw) || 5001;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(`❌ Invalid PORT: ${raw}`);
    process.exit(1);
  }
  return port;
};

module.exports = { validateEnv, getNodeEnv, getPort };
