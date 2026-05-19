/** Persist session and go to dashboard (auto-login after register or login). */
const saveAuthSession = (token, user) => {
  Storage.setToken(token);
  Storage.setUser(user);
};

const goToDashboard = () => {
  window.location.replace('dashboard.html');
};

document.addEventListener('DOMContentLoaded', () => {
  redirectIfAuth();

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const verifyForm = document.getElementById('verify-form');
  const resetForm = document.getElementById('reset-form');
  const requestResetForm = document.getElementById('request-reset-form');

  const params = new URLSearchParams(window.location.search);
  if (params.get('verify')) {
    const verifyInput = document.getElementById('verify-token');
    if (verifyInput) verifyInput.value = params.get('verify');
    switchTab('verify');
  }
  if (params.get('reset')) {
    const resetInput = document.getElementById('reset-token');
    if (resetInput) resetInput.value = params.get('reset');
    switchTab('reset');
  }

  document.querySelectorAll('.auth-tab').forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;
    const submitBtn = loginForm.querySelector('[type="submit"]');
    submitBtn.disabled = true;

    try {
      const res = await api('/auth/login', { method: 'POST', body: { email, password } });
      saveAuthSession(res.data.token, res.data.user);
      notify.success('Welcome back to SGT Wallet!');
      goToDashboard();
    } catch (err) {
      notify.error(err.message);
      submitBtn.disabled = false;
    }
  });

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = registerForm.username.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value;
    const confirm = registerForm.confirm.value;
    const submitBtn = registerForm.querySelector('[type="submit"]');

    if (password !== confirm) {
      notify.error('Passwords do not match');
      return;
    }

    submitBtn.disabled = true;

    try {
      const res = await api('/auth/register', {
        method: 'POST',
        body: { username, email, password },
      });

      if (!res.data?.token || !res.data?.user) {
        throw new Error('Invalid registration response from server');
      }

      saveAuthSession(res.data.token, res.data.user);
      notify.success('Account created! 1,000 Gems added. Welcome aboard!');
      goToDashboard();
    } catch (err) {
      notify.error(err.message);
      submitBtn.disabled = false;
    }
  });

  verifyForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/auth/verify-email', {
        method: 'POST',
        body: { token: verifyForm.token.value.trim() },
      });
      notify.success('Email verified!');
      switchTab('login');
    } catch (err) {
      notify.error(err.message);
    }
  });

  requestResetForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const res = await api('/auth/request-reset', {
        method: 'POST',
        body: { email: requestResetForm.email.value.trim() },
      });
      notify.success(res.message);
      if (res.data?.token) {
        notify.info(`Dev reset token: ${res.data.token}`);
      }
    } catch (err) {
      notify.error(err.message);
    }
  });

  resetForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (resetForm.password.value !== resetForm.confirm.value) {
      notify.error('Passwords do not match');
      return;
    }
    try {
      await api('/auth/reset-password', {
        method: 'POST',
        body: {
          token: resetForm.token.value.trim(),
          password: resetForm.password.value,
        },
      });
      notify.success('Password reset! Please sign in.');
      switchTab('login');
    } catch (err) {
      notify.error(err.message);
    }
  });
});

function switchTab(tab) {
  document.querySelectorAll('.auth-panel').forEach((p) => p.classList.add('hidden'));
  document.querySelectorAll('.auth-tab').forEach((t) => t.classList.remove('active'));
  document.getElementById(`panel-${tab}`)?.classList.remove('hidden');
  document.querySelector(`.auth-tab[data-tab="${tab}"]`)?.classList.add('active');
}
