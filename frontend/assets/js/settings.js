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

  const avatarPreview = document.getElementById('avatar-preview');
  const avatarInput = document.getElementById('avatar-input');

  api('/user/profile')
    .then((res) => {
      const u = res.data;
      document.getElementById('settings-username').value = u.username;
      document.getElementById('settings-email').value = u.email;
      document.getElementById('settings-bio').value = u.bio || '';
      document.getElementById('settings-wallet').textContent = u.walletId;
      if (u.role === 'ADMIN') document.getElementById('admin-nav')?.classList.remove('hidden');
      setAvatarImage(avatarPreview, u.profileImage);
    })
    .catch((err) => notify.error(err.message));

  avatarInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      notify.error('Image must be under 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const btn = document.getElementById('avatar-upload-btn');
    if (btn) btn.disabled = true;

    try {
      const res = await api('/user/avatar', { method: 'POST', body: formData });
      const user = res.data;
      Storage.setUser({ ...Storage.getUser(), ...user });
      setAvatarImage(avatarPreview, user.profileImage);
      notify.success('Profile photo updated');
    } catch (err) {
      notify.error(err.message);
    } finally {
      if (btn) btn.disabled = false;
      avatarInput.value = '';
    }
  });

  document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      const res = await api('/user/update', {
        method: 'PUT',
        body: {
          username: form.username.value.trim(),
          bio: document.getElementById('settings-bio')?.value?.trim() || '',
        },
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
