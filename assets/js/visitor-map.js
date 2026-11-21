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
  let snapshot;
  let timeout;

  // Keep tooltips outside the scrollable sidebar so its overflow cannot clip them.
  const tooltip = document.createElement('div');
  tooltip.id = 'visitor-map-tooltip';
  tooltip.className = 'visitor-map-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.hidden = true;
  document.body.appendChild(tooltip);
  let activePin;

  function hideTooltip() {
    tooltip.hidden = true;
    activePin?.removeAttribute('aria-describedby');
    activePin = null;
  }

  function showTooltip(event) {
    const pin = event.target.closest('[data-balloon]');
    if (!pin || !holder.contains(pin) || pin === activePin) return;
    hideTooltip();
    activePin = pin;
    pin.setAttribute('aria-describedby', tooltip.id);
    tooltip.textContent = pin.dataset.balloon;
    tooltip.hidden = false;
    positionTooltip(pin);
  }

  function positionTooltip(pin) {
    tooltip.style.left = '0px';
    tooltip.style.top = '0px';
    const rect = pin.getBoundingClientRect();
    const { width, height } = tooltip.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const left = Math.max(12, Math.min(center - width / 2, window.innerWidth - width - 12));
    const above = rect.top - height - 11 >= 12;
    const top = above ? rect.top - height - 11 : rect.bottom + 11;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${Math.max(12, Math.min(top, window.innerHeight - height - 12))}px`;
    tooltip.style.setProperty('--tooltip-arrow-left', `${Math.max(9, Math.min(center - left, width - 9))}px`);
    tooltip.dataset.placement = above ? 'above' : 'below';
  }
  container.addEventListener('pointerover', showTooltip);
  container.addEventListener('focusin', showTooltip);
  container.addEventListener('pointerout', event => {
    if (activePin && !activePin.contains(event.relatedTarget)) hideTooltip();
  });
  container.addEventListener('focusout', hideTooltip);
  window.addEventListener('scroll', () => {
    if (activePin && activePin === document.activeElement) {
      const rect = activePin.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) positionTooltip(activePin);
      else hideTooltip();
    } else hideTooltip();
  }, true);
  window.addEventListener('resize', hideTooltip);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') hideTooltip();
  });

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
      if (pin.classList.contains('visitor-map-pin')) return;
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
    renderDashboardPins(drawing);
  }

  function renderDashboardPins(drawing) {
    const width = drawing.clientWidth;
    const height = drawing.clientHeight;
    if (!snapshot || (drawing.dataset.dashboardSnapshot === snapshot.fetchedAt && Number(drawing.dataset.dashboardWidth) === width)) return;
    hideTooltip();
    // Keep the official visible base map, click-through, and visit collection.
    // Match the widget's integer-pixel placement and merge coincident markers.
    const points = new Map();
    for (const location of snapshot.locations) {
      const x = Math.round((location.lon + 180) / 360 * width);
      const y = Math.round((90 - location.lat) / 180 * height);
      const key = `${x},${y}`;
      const point = points.get(key) || { x, y, places: new Set() };
      location.places.forEach(name => point.places.add(name));
      points.set(key, point);
    }
    drawing.querySelectorAll(':scope > span').forEach(pin => pin.remove());
    for (const point of points.values()) {
      const pin = document.createElement('span');
      pin.className = 'visitor-map-pin';
      pin.style.left = `${point.x}px`;
      pin.style.top = `${point.y}px`;
      pin.dataset.balloon = [...point.places].sort().join('\n');
      pin.setAttribute('tabindex', '0');
      pin.setAttribute('role', 'img');
      pin.setAttribute('aria-label', pin.dataset.balloon);
      // Use the original widget asset, dimensions, and white outline.
      const image = document.createElement('img');
      image.src = 'https://widgets.amung.us/mappoints/heart-orange.png';
      image.alt = '';
      image.width = image.height = 10;
      pin.appendChild(image);
      drawing.appendChild(pin);
    }
    drawing.dataset.dashboardSnapshot = snapshot.fetchedAt;
    drawing.dataset.dashboardWidth = width;
    container.dataset.source = 'dashboard-snapshot';
  }

  fetch(map.dataset.snapshot, { cache: 'no-cache' }).then(response => {
    if (!response.ok) throw new Error('Dashboard snapshot unavailable');
    return response.json();
  }).then(data => {
    const siteId = JSON.parse(document.getElementById('_waurx1').textContent).id;
    const valid = data.siteId === siteId && typeof data.fetchedAt === 'string' && Number.isFinite(Date.parse(data.fetchedAt)) &&
      Array.isArray(data.locations) && data.locations.length > 0 && data.locationCount === data.locations.length &&
      data.locations.every(location => Number.isFinite(location.lat) && Math.abs(location.lat) <= 90 &&
        Number.isFinite(location.lon) && Math.abs(location.lon) <= 180 &&
        Array.isArray(location.places) && location.places.length > 0 && location.places.every(place => typeof place === 'string' && place.length > 0) &&
        new Set(location.places).size === location.places.length) &&
      new Set(data.locations.map(location => `${location.lat},${location.lon}`)).size === data.locations.length;
    if (!valid) throw new Error('Invalid dashboard snapshot');
    snapshot = data;
    fitMap();
  }).catch(() => {
    // Retain the official widget when the snapshot cannot be read.
    container.dataset.source = 'widget';
  });

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
