let searchTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  loadComponent('#sidebar-container', '../components/sidebar.html');

  try {
    const profile = await api('/user/profile');
    if (profile.data.role !== 'ADMIN') {
      notify.error('Admin access required');
      window.location.href = 'dashboard.html';
      return;
    }
    document.getElementById('admin-nav')?.classList.remove('hidden');
    await loadAdminData();
  } catch (err) {
    notify.error(err.message);
    window.location.href = 'dashboard.html';
  }

  document.getElementById('user-search')?.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadAdminData(e.target.value.trim()), 300);
  });

  document.getElementById('gift-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('[type="submit"]');
    const amount = parseFloat(form.amount.value);
    const select = document.getElementById('gift-wallet-select');
    const walletId = (form.walletId?.value || select?.value || '').trim();
    const userId = select?.selectedOptions?.[0]?.dataset?.userId;

    if (!walletId && !userId) {
      notify.error('Select a recipient');
      return;
    }
    if (!amount || amount <= 0) {
      notify.error('Enter a valid gem amount');
      return;
    }

    submitBtn.disabled = true;
    try {
      const res = await api('/admin/gift-gems', {
        method: 'POST',
        body: {
          walletId: walletId || undefined,
          userId: userId || undefined,
          amount,
          description: form.description?.value?.trim() || undefined,
        },
      });
      notify.success(res.message || 'Gems gifted successfully');
      form.reset();
      loadAdminData();
    } catch (err) {
      notify.error(err.message);
    } finally {
      submitBtn.disabled = false;
    }
  });

  document.getElementById('balance-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.userId.value) {
      notify.error('Select a user');
      return;
    }
    try {
      await api('/admin/balance', {
        method: 'PATCH',
        body: {
          userId: form.userId.value,
          gemBalance: form.gemBalance.value ? parseFloat(form.gemBalance.value) : undefined,
          ussdBalance: form.ussdBalance.value ? parseFloat(form.ussdBalance.value) : undefined,
        },
      });
      notify.success('Balance updated');
      form.reset();
      loadAdminData();
    } catch (err) {
      notify.error(err.message);
    }
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    Storage.clear();
    window.location.href = 'login.html';
  });
});

function populateUserSelects(users) {
  const giftSelect = document.getElementById('gift-wallet-select');
  const balanceSelect = document.getElementById('balance-user-select');
  const giftOptions = users
    .map(
      (u) =>
        `<option value="${u.walletId}" data-user-id="${u.id}">${u.username} (${u.walletId}) — ${formatNumber(u.wallet?.gemBalance ?? 0)} G</option>`
    )
    .join('');
  if (giftSelect) giftSelect.innerHTML = `<option value="">Select recipient</option>${giftOptions}`;
  if (balanceSelect) {
    balanceSelect.innerHTML = `<option value="">Select user</option>${users
      .map((u) => `<option value="${u.id}">${u.username} — ${u.email}</option>`)
      .join('')}`;
  }
}

function renderAdminActivity(txs) {
  const el = document.getElementById('admin-activity');
  if (!el) return;
  if (!txs?.length) {
    el.innerHTML = '<p class="text-muted">No recent activity</p>';
    return;
  }
  el.innerHTML = txs
    .map(
      (t) => `
    <div class="feed-item">
      <div class="feed-body">
        <strong>${t.type}</strong> · ${formatNumber(t.amount)}
        <p class="text-muted">${t.sender || '—'} → ${t.receiver || '—'} · ${formatDate(t.createdAt)}</p>
      </div>
    </div>`
    )
    .join('');
}

async function loadAdminData(search = '') {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  const [usersRes, statsRes] = await Promise.all([
    api(`/admin/users${q}`),
    api('/admin/stats'),
  ]);

  document.getElementById('stat-users').textContent = statsRes.data.userCount;
  document.getElementById('stat-tx').textContent = statsRes.data.transactionCount;
  document.getElementById('stat-gems').textContent = formatNumber(statsRes.data.totalGems);
  document.getElementById('stat-ussd').textContent = formatNumber(statsRes.data.totalUssd);

  populateUserSelects(usersRes.data.users);
  renderAdminActivity(statsRes.data.recentTransactions);

  document.getElementById('users-table').innerHTML = usersRes.data.users
    .map(
      (u) => `<tr>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td><code class="wallet-id">${u.walletId}</code> <button type="button" class="btn-copy-mini" data-copy="${u.walletId}" title="Copy">⧉</button></td>
      <td>${formatNumber(u.wallet?.gemBalance ?? 0)}</td>
      <td>${formatNumber(u.wallet?.ussdBalance ?? 0)}</td>
      <td><span class="badge badge-primary">${u.role}</span></td>
    </tr>`
    )
    .join('');

  document.querySelectorAll('.btn-copy-mini').forEach((btn) => {
    btn.addEventListener('click', () => copyToClipboard(btn.dataset.copy));
  });
}
