(() => {
  const map = document.getElementById('map');
  if (!map) return;

  const desktopParent = map.parentElement;
  const mobileParent = document.getElementById('mobile-visitor-map');
  const mobileLayout = window.matchMedia('(max-width: 1023px)');
  const container = map.querySelector('.map-widget');
  const holder = container.querySelector('.map-link');
  const status = map.querySelector('.map-status');
  const retry = status.querySelector('button');
  let timeout;

  function failed() {
    if (status.hidden) return;
    container.dataset.state = 'error';
    status.querySelector('p').textContent = 'Visitor map is temporarily unavailable.';
    retry.hidden = false;
  }

  function fitMap() {
    const drawing = holder.querySelector(':scope > span');
    if (!drawing) return;
    const originalWidth = Number(drawing.dataset.originalWidth || parseFloat(drawing.style.width));
    const originalHeight = Number(drawing.dataset.originalHeight || parseFloat(drawing.style.height));
    if (!(originalWidth > 0 && originalHeight > 0)) return;
    drawing.dataset.originalWidth = originalWidth;
    drawing.dataset.originalHeight = originalHeight;
    const width = Math.min(272, container.clientWidth || 272);
    const scale = width / originalWidth;
    drawing.style.width = `${width}px`;
    drawing.style.height = `${originalHeight * scale}px`;
    drawing.querySelectorAll(':scope > span').forEach(pin => {
      const left = Number(pin.dataset.originalLeft || parseFloat(pin.style.marginLeft));
      const top = Number(pin.dataset.originalTop || parseFloat(pin.style.marginTop));
      if (!Number.isFinite(left) || !Number.isFinite(top)) return;
      pin.dataset.originalLeft = left;
      pin.dataset.originalTop = top;
      pin.style.marginLeft = `${(left + 5) * scale - 5}px`;
      pin.style.marginTop = `${(top + 5) * scale - 5}px`;
    });
    const background = drawing.querySelector(':scope > img');
    if (background?.complete && background.naturalWidth > 0) {
      status.hidden = true;
      container.dataset.state = 'ready';
      clearTimeout(timeout);
    }
  }

  function placeMap() {
    (mobileLayout.matches ? mobileParent : desktopParent).appendChild(map);
    fitMap();
  }

  placeMap();
  mobileLayout.addEventListener('change', placeMap);
  new ResizeObserver(fitMap).observe(container);
  new MutationObserver(fitMap).observe(container, { childList: true });
  container.addEventListener('load', fitMap, true);
  container.addEventListener('error', event => {
    if (event.target === holder.querySelector(':scope > span > img')) failed();
  }, true);
  retry.addEventListener('click', () => window.location.reload());

  // Register the widget before loading its SDK. A cached SDK can otherwise
  // inspect an empty queue before DOMContentLoaded and never request the map.
  const width = Math.min(272, container.clientWidth || 272);
  const id = JSON.parse(document.getElementById('_waurx1').textContent).id;
  window._wau = window._wau || [];
  window._wau.push(['map', id, 'rx1', String(width), String(Math.round(width / 2)), 'textbook', 'heart-orange']);
  const script = document.createElement('script');
  script.id = 'visitor-map-sdk';
  script.src = 'https://waust.at/m.js';
  script.async = true;
  script.onerror = failed;
  timeout = setTimeout(failed, 20000);
  document.head.appendChild(script);
})();
