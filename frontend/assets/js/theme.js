const THEMES = ['light', 'dark', 'amoled'];
let themeIndex = 0;

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme === 'light' ? '' : theme);
  if (theme === 'light') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('sgt_theme', theme);
  themeIndex = THEMES.indexOf(theme);
  const label = document.getElementById('theme-label');
  if (label) label.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
};

const initTheme = () => {
  const saved = localStorage.getItem('sgt_theme') || 'light';
  themeIndex = THEMES.indexOf(saved);
  if (themeIndex < 0) themeIndex = 0;
  applyTheme(THEMES[themeIndex]);
};

const cycleTheme = () => {
  themeIndex = (themeIndex + 1) % THEMES.length;
  applyTheme(THEMES[themeIndex]);
  notify.info(`Theme: ${THEMES[themeIndex]}`);
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  document.getElementById('theme-toggle')?.addEventListener('click', cycleTheme);
});
