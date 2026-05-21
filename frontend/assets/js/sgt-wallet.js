const getApiBase = () => {
  if (typeof window.getApiBase === 'function' && window.SGT_CONFIG) {
    return window.getApiBase();
  }
  if (window.SGT_API_URL) return String(window.SGT_API_URL).replace(/\/+$/, '');
  if (window.SGT_CONFIG?.apiBase) return window.SGT_CONFIG.apiBase;
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:5001/api';
  return 'https://dole-embolism-trustless.ngrok-free.dev/api';
};

const isProductionClient = () => {
  if (window.SGT_CONFIG) return window.SGT_CONFIG.isProduction;
  const h = window.location.hostname;
  return h !== 'localhost' && h !== '127.0.0.1';
};

const resolveMediaUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const base = getApiBase().replace(/\/api$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
};

const Storage = {
  getToken: () => localStorage.getItem('sgt_token'),
  setToken: (token) => localStorage.setItem('sgt_token', token),
  removeToken: () => localStorage.removeItem('sgt_token'),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem('sgt_user') || 'null');
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem('sgt_user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('sgt_user'),
  clear: () => {
    Storage.removeToken();
    Storage.removeUser();
  },
};

let loadingCount = 0;

const showLoading = (show) => {
  if (show) loadingCount += 1;
  else loadingCount = Math.max(0, loadingCount - 1);
  let overlay = document.getElementById('loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
  }
  overlay.classList.toggle('active', loadingCount > 0);
};

const buildApiHeaders = (extra = {}, skipContentType = false) => {
  const headers = { ...extra };
  if (!skipContentType && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const token = Storage.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (/ngrok-free\.(app|dev)/i.test(getApiBase())) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  return headers;
};

const formatNetworkError = () =>
  isProductionClient()
    ? 'Unable to connect to SGT servers. Check your connection or try again shortly.'
    : 'Cannot reach the API. Start backend: cd backend && npm run dev';

const api = async (endpoint, options = {}) => {
  const apiBase = getApiBase();
  const isFormData = options.body instanceof FormData;
  const headers = buildApiHeaders(options.headers, isFormData);
  const config = { ...options, headers };
  if (options.body && typeof options.body === 'object' && !isFormData) {
    config.body = JSON.stringify(options.body);
  }
  showLoading(true);
  try {
    let res;
    try {
      res = await fetch(`${apiBase}${endpoint}`, config);
    } catch {
      throw new Error(formatNetworkError());
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) {
        Storage.clear();
        const path = window.location.pathname;
        if (!path.includes('login') && !path.includes('register') && !path.endsWith('index.html')) {
          window.location.href = path.includes('/pages/') ? 'login.html' : 'pages/login.html';
        }
      }
      throw new Error(data.message || `Request failed (${res.status})`);
    }
    return data;
  } finally {
    showLoading(false);
  }
};

const formatNumber = (num) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num || 0);

const formatDate = (date) =>
  new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const requireAuth = () => {
  if (!Storage.getToken()) {
    window.location.href = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
    return false;
  }
  return true;
};

const redirectIfAuth = () => {
  if (Storage.getToken()) {
    window.location.href = window.location.pathname.includes('/pages/') ? 'dashboard.html' : 'pages/dashboard.html';
  }
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    notify.success('Copied to clipboard');
  } catch {
    notify.error('Failed to copy');
  }
};

const loadComponent = async (selector, path) => {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    const res = await fetch(path);
    if (res.ok) el.innerHTML = await res.text();
  } catch {
    console.warn('Component load failed:', path);
  }
};

const setAvatarImage = (imgEl, profileImage, fallback = '../assets/images/logo.svg') => {
  if (!imgEl) return;
  const resolved = resolveMediaUrl(profileImage);
  imgEl.src = resolved || fallback;
  imgEl.onerror = () => {
    imgEl.onerror = null;
    imgEl.src = fallback;
  };
};

const animateCounter = (el, target, duration = 800) => {
  if (!el) return;
  const start = parseFloat(String(el.textContent).replace(/,/g, '')) || 0;
  const diff = target - start;
  const startTime = performance.now();
  const step = (now) => {
    const p = Math.min((now - startTime) / duration, 1);
    const val = start + diff * (1 - Math.pow(1 - p, 3));
    el.textContent = formatNumber(val);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
