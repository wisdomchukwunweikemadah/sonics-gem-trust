document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;

  loadComponent('#sidebar-container', '../components/sidebar.html').then(() => {
    document.querySelectorAll('.nav-item a').forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === 'settings.html');
    });
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
      document.querySelector('.sidebar')?.classList.toggle('open');
    });
  });

  api('/user/profile')
    .then((res) => {
      const u = res.data;
      document.getElementById('settings-username').value = u.username;
      document.getElementById('settings-email').value = u.email;
      document.getElementById('settings-wallet').textContent = u.walletId;
      if (u.role === 'ADMIN') document.getElementById('admin-nav')?.classList.remove('hidden');
    })
    .catch((err) => notify.error(err.message));

  document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      const res = await api('/user/update', {
        method: 'PUT',
        body: { username: form.username.value.trim() },
      });
      Storage.setUser({ ...Storage.getUser(), ...res.data });
      notify.success('Profile updated');
    } catch (err) {
      notify.error(err.message);
    }
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    Storage.clear();
    window.location.href = 'login.html';
  });
});
