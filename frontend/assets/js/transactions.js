let txChart = null;

const loadTransactions = async () => {
  if (!requireAuth()) return;

  const type = document.getElementById('filter-type')?.value || '';
  const page = parseInt(document.getElementById('page-num')?.value || '1', 10);

  try {
    const query = new URLSearchParams({ limit: 20, page });
    if (type) query.set('type', type);

    const res = await api(`/transactions?${query}`);
    const { transactions, pagination } = res.data;

    const tbody = document.getElementById('tx-table-body');
    if (!tbody) return;

    if (!transactions.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-muted">No transactions found</td></tr>';
      return;
    }

    tbody.innerHTML = transactions
      .map(
        (tx) => `
      <tr class="fade-in">
        <td><span class="badge badge-primary">${tx.type}</span></td>
        <td>${formatNumber(tx.amount)}</td>
        <td>${tx.sender?.walletId || '—'}</td>
        <td>${tx.receiver?.walletId || '—'}</td>
        <td><span class="badge badge-${tx.status === 'COMPLETED' ? 'success' : 'warning'}">${tx.status}</span></td>
        <td>${formatDate(tx.createdAt)}</td>
      </tr>`
      )
      .join('');

    document.getElementById('page-info')?.replaceChildren(
      document.createTextNode(`Page ${pagination.page} of ${pagination.pages || 1}`)
    );
    document.getElementById('page-num').value = pagination.page;

    renderTxChart(transactions);
  } catch (err) {
    notify.error(err.message);
  }
};

const renderTxChart = (transactions) => {
  const canvas = document.getElementById('tx-trend-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  const types = ['SEND', 'RECEIVE', 'CONVERT', 'BONUS'];
  const counts = types.map((t) => transactions.filter((x) => x.type === t).length);

  if (txChart) txChart.destroy();
  txChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: types,
      datasets: [{
        data: counts,
        backgroundColor: ['#ff4d4d', '#00ff99', '#7c3aed', '#00d4ff'],
      }],
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
  });
};

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;

  loadComponent('#sidebar-container', '../components/sidebar.html').then(() => {
    document.querySelectorAll('.nav-item a').forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === 'transactions.html');
    });
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
      document.querySelector('.sidebar')?.classList.toggle('open');
    });
  });

  document.getElementById('filter-type')?.addEventListener('change', loadTransactions);
  document.getElementById('btn-prev')?.addEventListener('click', () => {
    const p = document.getElementById('page-num');
    if (p && parseInt(p.value, 10) > 1) {
      p.value = parseInt(p.value, 10) - 1;
      loadTransactions();
    }
  });
  document.getElementById('btn-next')?.addEventListener('click', () => {
    const p = document.getElementById('page-num');
    if (p) {
      p.value = parseInt(p.value, 10) + 1;
      loadTransactions();
    }
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    Storage.clear();
    window.location.href = 'login.html';
  });

  loadTransactions();
});
