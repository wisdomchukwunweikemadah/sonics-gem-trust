const openModal = (id) => document.getElementById(id)?.classList.add('active');
const closeModal = (id) => document.getElementById(id)?.classList.remove('active');

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;

  loadComponent('#sidebar-container', '../components/sidebar.html').then(() => {
    document.querySelectorAll('.nav-item a').forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === 'market.html');
    });
    if (Storage.getUser()?.role === 'ADMIN') {
      document.getElementById('admin-nav')?.classList.remove('hidden');
    }
  });

  const loadBalances = () =>
    api('/user/profile')
      .then((res) => {
        const gems = res.data.wallet?.gemBalance || 0;
        const ussd = res.data.wallet?.ussdBalance || 0;
        document.getElementById('market-gems')?.replaceChildren(document.createTextNode(formatNumber(gems)));
        document.getElementById('market-ussd-bal')?.replaceChildren(document.createTextNode(formatNumber(ussd)));
      })
      .catch((err) => notify.error(err.message));

  loadBalances();

  document.getElementById('quick-convert-gems')?.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });

  document.getElementById('quick-convert-ussd')?.addEventListener('click', () => {
    openModal('convert-ussd-modal');
  });

  document.querySelectorAll('[data-modal-close]').forEach((btn) => {
    btn.addEventListener('click', () => btn.closest('.modal-overlay')?.classList.remove('active'));
  });

  document.getElementById('ussd-input')?.addEventListener('input', (e) => {
    const ussd = parseFloat(e.target.value) || 0;
    const el = document.getElementById('gems-preview');
    if (el) el.textContent = `≈ ${formatNumber(ussd * 100)} Gems`;
  });

  document.getElementById('convert-ussd-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      await api('/wallet/convert-to-gems', {
        method: 'POST',
        body: { ussdAmount: parseFloat(form.ussdAmount.value) },
      });
      notify.success('USSD converted to Gems! Check your email for the receipt.');
      closeModal('convert-ussd-modal');
      form.reset();
      loadBalances();
    } catch (err) {
      notify.error(err.message);
    }
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    Storage.clear();
    window.location.href = 'login.html';
  });

  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    document.querySelector('.sidebar')?.classList.toggle('open');
  });
});
