const getToastPosition = () => {
  const mobile = window.matchMedia('(max-width: 768px)').matches;
  return {
    gravity: mobile ? 'bottom' : 'top',
    position: mobile ? 'center' : 'right',
  };
};

const notify = {
  success: (msg) =>
    Toastify({
      text: msg,
      duration: 3500,
      ...getToastPosition(),
      style: {
        background: 'linear-gradient(135deg, #00ff99, #00d4ff)',
        borderRadius: '10px',
        fontWeight: '600',
        maxWidth: 'min(360px, calc(100vw - 2rem))',
      },
    }).showToast(),

  error: (msg) =>
    Toastify({
      text: msg,
      duration: 4500,
      ...getToastPosition(),
      style: {
        background: 'linear-gradient(135deg, #ff4d4d, #7c3aed)',
        borderRadius: '10px',
        fontWeight: '600',
        maxWidth: 'min(360px, calc(100vw - 2rem))',
      },
    }).showToast(),

  warning: (msg) =>
    Toastify({
      text: msg,
      duration: 3500,
      ...getToastPosition(),
      style: {
        background: 'linear-gradient(135deg, #ffb020, #ff4d4d)',
        borderRadius: '10px',
        fontWeight: '600',
      },
    }).showToast(),

  info: (msg) =>
    Toastify({
      text: msg,
      duration: 3000,
      ...getToastPosition(),
      style: {
        background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
        borderRadius: '10px',
        fontWeight: '600',
      },
    }).showToast(),
};
