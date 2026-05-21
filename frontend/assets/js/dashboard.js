let activityChart = null;

const getTxIcon = (type) => {
  const icons = { SEND: '↑', RECEIVE: '↓', CONVERT: '⇄', BONUS: '★' };
  return icons[type] || '•';
};

const renderBadges = (badges) => {
  const el = document.getElementById('user-badges');
  if (!el) return;
  if (!badges?.length) {
    el.innerHTML = '<p class="text-muted">Earn badges by trading and verifying your email.</p>';
    return;
  }
  el.innerHTML = badges
    .map((b) => `<span class="user-badge" title="${b.label}">${b.icon} ${b.label}</span>`)
    .join('');
};

const renderActivityFeed = (feed) => {
  const el = document.getElementById('live-activity-feed');
  if (!el) return;
  if (!feed?.length) {
    el.innerHTML = '<div class="empty-state"><div class="icon">📭</div><p>No activity yet</p></div>';
    return;
  }
  el.innerHTML = feed
    .map(
      (tx) => `
    <div class="feed-item fade-in">
      <span class="feed-icon">${getTxIcon(tx.type)}</span>
      <div class="feed-body">
        <strong>${tx.type}</strong>
        <p class="text-muted">${tx.sender || '—'} → ${tx.receiver || '—'}</p>
        <small class="text-muted">${formatDate(tx.createdAt)}</small>
      </div>
      <span class="feed-amount">+${formatNumber(tx.amount)}</span>
    </div>`
    )
    .join('');
};

const renderLeaderboard = (data) => {
  const el = document.getElementById('leaderboard-list');
  if (!el || !data?.richest) return;
  el.innerHTML = data.richest
    .map(
      (u) => `
    <div class="leaderboard-row">
      <span class="rank">#${u.rank}</span>
      <span class="name">${u.username}</span>
      <span class="gems">${formatNumber(u.gems)} G</span>
    </div>`
    )
    .join('');
};

const renderRecentTransactions = (transactions) => {
  const list = document.getElementById('recent-transactions');
  if (!list) return;
  if (!transactions?.length) {
    list.innerHTML = '<div class="empty-state"><div class="icon">💳</div><p>No transactions yet</p></div>';
    return;
  }
  list.innerHTML = transactions
    .map(
      (tx) => `
    <div class="tx-item fade-in">
      <div style="display:flex;align-items:center;gap:0.75rem;">
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
        { label: 'Send', data: data.send, borderColor: '#ff4d4d', tension: 0.4, fill: false },
        { label: 'Receive', data: data.receive, borderColor: '#00ff99', tension: 0.4, fill: false },
        { label: 'Convert', data: data.convert, borderColor: '#7c3aed', tension: 0.4, fill: false },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#94a3b8' } } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } },
      },
    },
  });
};

const refreshDashboard = async () => {
  if (!requireAuth()) return;

  try {
    const [profileRes, activityRes, txRes, feedRes, boardRes] = await Promise.all([
      api('/user/profile'),
      api('/transactions/activity'),
      api('/transactions?limit=5'),
      api('/features/activity?limit=8').catch(() => ({ data: { feed: [] } })),
      api('/features/leaderboard').catch(() => ({ data: { richest: [] } })),
    ]);

    const user = profileRes.data;
    Storage.setUser(user);

    const gemEl = document.getElementById('gem-balance');
    const ussdEl = document.getElementById('ussd-balance');
    const statGems = document.getElementById('stat-gems');
    const statUssd = document.getElementById('stat-ussd');

    document.getElementById('user-name').textContent = user.username;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('wallet-id-display').textContent = user.walletId;

    animateCounter(gemEl, user.wallet?.gemBalance || 0);
    animateCounter(ussdEl, user.wallet?.ussdBalance || 0);
    if (statGems) animateCounter(statGems, user.wallet?.gemBalance || 0);
    if (statUssd) animateCounter(statUssd, user.wallet?.ussdBalance || 0);

    setAvatarImage(document.getElementById('user-avatar'), user.profileImage);
    renderBadges(user.badges);
    document.getElementById('streak-text').textContent = `Login streak: ${user.loginStreak || 0} days`;

    const dailyBtn = document.getElementById('daily-reward-btn');
    if (dailyBtn) {
      dailyBtn.disabled = !user.canClaimDaily;
      dailyBtn.textContent = user.canClaimDaily ? 'Claim Reward' : 'Claimed Today';
    }

    if (user.role === 'ADMIN') document.getElementById('admin-nav')?.classList.remove('hidden');

    renderRecentTransactions(txRes.data.transactions);
    renderActivityChart(activityRes.data);
    renderActivityFeed(feedRes.data.feed);
    renderLeaderboard(boardRes.data);
  } catch (err) {
    notify.error(err.message);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;

  loadComponent('#sidebar-container', '../components/sidebar.html').then(() => {
    document.querySelectorAll('.nav-item a').forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === 'dashboard.html');
    });
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
      document.querySelector('.sidebar')?.classList.toggle('open');
    });
  });

  document.getElementById('wallet-id-display')?.addEventListener('click', () => {
    const id = document.getElementById('wallet-id-display')?.textContent;
    if (id) copyToClipboard(id);
  });

  document.getElementById('daily-reward-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('daily-reward-btn');
    btn.disabled = true;
    try {
      const res = await api('/features/daily-reward', { method: 'POST' });
      notify.success(res.message);
      refreshDashboard();
    } catch (err) {
      notify.error(err.message);
      btn.disabled = false;
    }
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
