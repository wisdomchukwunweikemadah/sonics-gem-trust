const openModal = (id) => document.getElementById(id)?.classList.add('active');
const closeModal = (id) => document.getElementById(id)?.classList.remove('active');

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-modal-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay')?.classList.remove('active');
    });
  });

  document.getElementById('btn-send')?.addEventListener('click', () => openModal('send-modal'));
  document.getElementById('btn-convert')?.addEventListener('click', () => openModal('convert-modal'));

  document.getElementById('send-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      const res = await api('/wallet/send', {
        method: 'POST',
        body: {
          recipientWalletId: form.recipientWalletId.value.trim().toUpperCase(),
          amount: parseFloat(form.amount.value),
        },
      });
      notify.success('Gems sent successfully!');
      closeModal('send-modal');
      form.reset();
      if (typeof refreshDashboard === 'function') refreshDashboard();
      if (typeof loadTransactions === 'function') loadTransactions();
    } catch (err) {
      notify.error(err.message);
    }
  });

  document.getElementById('convert-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const gems = parseFloat(form.gemsAmount.value);
    const preview = document.getElementById('convert-preview');
    if (preview) preview.textContent = `You will receive ${(gems / 100).toFixed(2)} USSD`;

    try {
      await api('/wallet/convert', {
        method: 'POST',
        body: { gemsAmount: gems },
      });
      notify.success('Conversion successful!');
      closeModal('convert-modal');
      form.reset();
      if (typeof refreshDashboard === 'function') refreshDashboard();
    } catch (err) {
      notify.error(err.message);
    }
  });

  document.getElementById('convert-gems-input')?.addEventListener('input', (e) => {
    const gems = parseFloat(e.target.value) || 0;
    const el = document.getElementById('convert-preview');
    if (el) el.textContent = `≈ ${(gems / 100).toFixed(2)} USSD`;
  });
});
