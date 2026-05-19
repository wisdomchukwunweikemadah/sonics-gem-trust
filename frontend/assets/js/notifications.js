const notify = {
  success: (msg) => Toastify({
    text: msg,
    duration: 3500,
    gravity: 'top',
    position: 'right',
    style: { background: 'linear-gradient(135deg, #00ff99, #00d4ff)' },
  }).showToast(),

  error: (msg) => Toastify({
    text: msg,
    duration: 4000,
    gravity: 'top',
    position: 'right',
    style: { background: 'linear-gradient(135deg, #ff4d4d, #7c3aed)' },
  }).showToast(),

  warning: (msg) => Toastify({
    text: msg,
    duration: 3500,
    gravity: 'top',
    position: 'right',
    style: { background: 'linear-gradient(135deg, #ffb020, #ff4d4d)' },
  }).showToast(),

  info: (msg) => Toastify({
    text: msg,
    duration: 3000,
    gravity: 'top',
    position: 'right',
    style: { background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' },
  }).showToast(),
};
