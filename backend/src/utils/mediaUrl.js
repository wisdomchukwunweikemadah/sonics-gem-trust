const resolvePublicUrl = (pathOrUrl) => {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const base = (process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5001}`).replace(
    /\/$/,
    ''
  );
  return `${base}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
};

module.exports = { resolvePublicUrl };
