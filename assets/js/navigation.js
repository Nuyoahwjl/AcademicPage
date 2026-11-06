const links = [...document.querySelectorAll('.section-nav a')];
function updateNavigation() {
  const current = links.find(link => link.hash === window.location.hash);
  for (const link of links) {
    if (link === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
window.addEventListener('hashchange', updateNavigation);
updateNavigation();

const themeButton = document.querySelector('.theme-toggle');
function updateThemeButton() {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  themeButton.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
}
themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('theme', theme); } catch (_) { /* Preference can remain session-only. */ }
  updateThemeButton();
});
updateThemeButton();
