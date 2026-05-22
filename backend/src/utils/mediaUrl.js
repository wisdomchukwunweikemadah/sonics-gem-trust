const resolvePublicUrl = (pathOrUrl) => {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const fallback =
    process.env.NODE_ENV === 'production'
      ? 'https://dole-embolism-trustless.ngrok-free.dev'
      : `http://localhost:${process.env.PORT || 5001}`;
  const base = (process.env.API_PUBLIC_URL || fallback).replace(
    /\/$/,
    ''
  );
  return `${base}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
};

module.exports = { resolvePublicUrl };
