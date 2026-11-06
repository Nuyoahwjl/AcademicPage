const links = [...document.querySelectorAll('.section-nav a')];
function updateNavigation() {
  const current = links.find(link => link.hash === window.location.hash) || links[0];
  for (const link of links) {
    if (link === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
window.addEventListener('hashchange', updateNavigation);
updateNavigation();
