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

  document.getElementById('balance-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
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

async function loadAdminData() {
  const [usersRes, statsRes] = await Promise.all([
    api('/admin/users'),
    api('/admin/stats'),
  ]);

  document.getElementById('stat-users').textContent = statsRes.data.userCount;
  document.getElementById('stat-tx').textContent = statsRes.data.transactionCount;
  document.getElementById('stat-gems').textContent = formatNumber(statsRes.data.totalGems);
  document.getElementById('stat-ussd').textContent = formatNumber(statsRes.data.totalUssd);

  const tbody = document.getElementById('users-table');
  tbody.innerHTML = usersRes.data.users
    .map(
      (u) => `<tr>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td><code>${u.walletId}</code></td>
      <td>${formatNumber(u.wallet?.gemBalance)}</td>
      <td>${formatNumber(u.wallet?.ussdBalance)}</td>
      <td><span class="badge badge-primary">${u.role}</span></td>
    </tr>`
    )
    .join('');
}
