let activityChart = null;

const getTxIcon = (type) => {
  const icons = { SEND: '↑', RECEIVE: '↓', CONVERT: '⇄', BONUS: '★' };
  return icons[type] || '•';
};

const renderRecentTransactions = (transactions) => {
  const list = document.getElementById('recent-transactions');
  if (!list) return;

  if (!transactions?.length) {
    list.innerHTML = '<p class="text-muted">No transactions yet</p>';
    return;
  }

  list.innerHTML = transactions
    .map(
      (tx) => `
    <div class="tx-item fade-in">
      <div style="display:flex;align-items:center;">
        <div class="tx-icon ${tx.type.toLowerCase()}">${getTxIcon(tx.type)}</div>
        <div>
          <strong>${tx.type}</strong>
          <p class="text-muted" style="font-size:0.8rem;">${formatDate(tx.createdAt)}</p>
        </div>
      </div>
      <div>
        <strong class="${tx.type === 'SEND' ? 'text-danger' : 'text-success'}">
          ${tx.type === 'SEND' ? '-' : '+'}${formatNumber(tx.amount)}
        </strong>
        <span class="badge badge-${tx.status === 'COMPLETED' ? 'success' : 'warning'}">${tx.status}</span>
      </div>
    </div>`
    )
    .join('');
};

const renderActivityChart = (data) => {
  const canvas = document.getElementById('activity-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (activityChart) activityChart.destroy();

  activityChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        { label: 'Send', data: data.send, borderColor: '#ff4d4d', tension: 0.4 },
        { label: 'Receive', data: data.receive, borderColor: '#00ff99', tension: 0.4 },
        { label: 'Convert', data: data.convert, borderColor: '#7c3aed', tension: 0.4 },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#94a3b8' } },
      },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
      },
    },
  });
};

const refreshDashboard = async () => {
  if (!requireAuth()) return;

  try {
    const [profileRes, activityRes, txRes] = await Promise.all([
      api('/user/profile'),
      api('/transactions/activity'),
      api('/transactions?limit=5'),
    ]);

    const user = profileRes.data;
    Storage.setUser(user);

    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText('user-name', user.username);
    setText('user-email', user.email);
    setText('wallet-id-display', user.walletId);
    setText('gem-balance', formatNumber(user.wallet?.gemBalance));
    setText('ussd-balance', formatNumber(user.wallet?.ussdBalance));
    setText('stat-gems', formatNumber(user.wallet?.gemBalance));
    setText('stat-ussd', formatNumber(user.wallet?.ussdBalance));

    const avatar = document.getElementById('user-avatar');
    if (avatar && user.profileImage) {
      avatar.src = user.profileImage.startsWith('http') ? user.profileImage : user.profileImage;
    }

    if (user.role === 'ADMIN') {
      document.getElementById('admin-nav')?.classList.remove('hidden');
    }

    renderRecentTransactions(txRes.data.transactions);
    renderActivityChart(activityRes.data);
  } catch (err) {
    notify.error(err.message);
  }
};

const highlightNav = () => {
  const page = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item a').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === page);
  });
};

const initSidebar = () => {
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    document.querySelector('.sidebar')?.classList.toggle('open');
  });
};

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;

  loadComponent('#sidebar-container', '../components/sidebar.html').then(() => {
    highlightNav();
    initSidebar();
  });

  document.getElementById('wallet-id-display')?.addEventListener('click', () => {
    const id = document.getElementById('wallet-id-display')?.textContent;
    if (id) copyToClipboard(id);
  });

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch (_) {}
    Storage.clear();
    notify.info('Logged out');
    window.location.href = 'login.html';
  });

  refreshDashboard();
});
