const API_BASE = 'http://localhost:5001/api';

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
  if (overlay) overlay.classList.toggle('active', loadingCount > 0);
};

const api = async (endpoint, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = Storage.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const config = { ...options, headers };
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  showLoading(true);
  try {
    let res;
    try {
      res = await fetch(`${API_BASE}${endpoint}`, config);
    } catch (networkErr) {
      throw new Error(
        `Cannot reach the API at ${API_BASE}. Start the backend: cd backend && npm run dev`
      );
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
      throw new Error(data.message || 'Request failed');
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
  } catch (e) {
    console.warn('Component load failed:', path);
  }
};
