/**
 * SGT Wallet — centralized API configuration (single source of truth).
 */
(function initSgtConfig(global) {
  const PRODUCTION_API = 'https://dole-embolism-trustless.ngrok-free.dev/api';
  const LOCAL_API = 'http://localhost:5001/api';
  const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

  const normalizeBase = (url) => {
    if (!url || typeof url !== 'string') return '';
    return url.trim().replace(/\/+$/, '');
  };

  const isLocalDev = () => LOCAL_HOSTS.has(global.location.hostname);

  const isProductionDeployment = () => {
    if (isLocalDev()) return false;
    if (global.__SGT_FORCE_PRODUCTION__) return true;
    const host = global.location.hostname;
    return (
      global.location.protocol === 'https:' ||
      host.endsWith('.vercel.app') ||
      host.includes('ngrok-free.app') ||
      host.includes('ngrok-free.dev') ||
      host.includes('ngrok.io')
    );
  };

  const isLocalApiUrl = (url) => /localhost|127\.0\.0\.1/i.test(url || '');

  const readMetaApiBase = () => {
    const meta = global.document?.querySelector('meta[name="sgt-api-base"]');
    return meta?.getAttribute('content') || '';
  };

  const resolveApiBase = () => {
    if (isProductionDeployment()) {
      const preset = normalizeBase(global.SGT_API_URL);
      const meta = normalizeBase(readMetaApiBase());
      const injected = normalizeBase(global.__SGT_API_BASE__);
      if (preset && !isLocalApiUrl(preset)) return preset;
      if (meta && !isLocalApiUrl(meta)) return meta;
      if (injected && !isLocalApiUrl(injected)) return injected;
      return PRODUCTION_API;
    }

    const override = normalizeBase(global.localStorage?.getItem('sgt_api_base'));
    if (override) return override;

    const meta = normalizeBase(readMetaApiBase());
    const injected = normalizeBase(global.__SGT_API_BASE__);
    if (meta && !isLocalApiUrl(meta)) return meta;
    if (injected && !isLocalApiUrl(injected)) return injected;

    return LOCAL_API;
  };

  let apiBase = resolveApiBase();
  if (isProductionDeployment() && isLocalApiUrl(apiBase)) {
    apiBase = PRODUCTION_API;
  }

  global.SGT_CONFIG = Object.freeze({
    apiBase,
    mode: isLocalDev() ? 'development' : 'production',
    isLocal: isLocalDev(),
    isProduction: isProductionDeployment(),
    productionApi: PRODUCTION_API,
    localApi: LOCAL_API,
    setApiOverride(url) {
      const normalized = normalizeBase(url);
      if (!normalized) {
        global.localStorage?.removeItem('sgt_api_base');
        return;
      }
      if (isProductionDeployment() && isLocalApiUrl(normalized)) {
        console.warn('[SGT] Cannot use localhost API on production.');
        return;
      }
      global.localStorage?.setItem('sgt_api_base', normalized);
    },
    clearApiOverride() {
      global.localStorage?.removeItem('sgt_api_base');
    },
  });

  global.SGT_API_URL = apiBase;
  global.API_BASE = apiBase;
  global.getApiBase = () => global.SGT_CONFIG.apiBase;
})(typeof window !== 'undefined' ? window : globalThis);
