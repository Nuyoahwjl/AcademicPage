(() => {
  const map = document.getElementById('map');
  if (!map) return;

  const container = map.querySelector('.map-widget');
  const holder = container.querySelector('.map-embed');
  const script = holder.querySelector('script');
  const status = map.querySelector('.map-status');
  const retry = status.querySelector('button');
  const vectorPaths = fetch(map.dataset.worldMap).then(async response => {
    if (!response.ok) throw new Error('Vector map unavailable');
    const svgDocument = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
    const paths = [...svgDocument.querySelectorAll('path')];
    if (!paths.length) throw new Error('Vector map is empty');
    return paths;
  });
  let preview;

  // Draw the local base map even if the external statistics service is unavailable.
  vectorPaths.then(paths => {
    if (holder.querySelector('[data-renderer="vector"]')) return;
    preview = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    preview.classList.add('visitor-vector-preview');
    preview.setAttribute('viewBox', '0 0 1080 529.4117647058823');
    preview.setAttribute('aria-hidden', 'true');
    const land = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    land.classList.add('visitor-vector-land');
    land.setAttribute('transform', 'translate(90 44.35272698087467)');
    paths.forEach(path => land.appendChild(document.importNode(path, true)));
    preview.appendChild(land);
    container.prepend(preview);
    container.dataset.preview = 'visible';
  }).catch(() => { /* The provider bitmap remains available as a fallback. */ });

  function failed() {
    if (status.hidden) return;
    container.dataset.state = 'error';
    status.querySelector('p').textContent = 'Live visitor data is temporarily unavailable.';
    retry.hidden = false;
  }

  function fitMap() {
    const widget = holder.querySelector('#mapmyvisitors-widget');
    const width = parseFloat(widget?.style.width);
    if (!(width > 0)) return;
    const scale = holder.clientWidth / width;
    widget.style.transform = `scale(${scale})`;
    holder.style.height = `${widget.offsetHeight * scale}px`;
  }

  async function loadVectorMap(flat) {
    try {
      const paths = await vectorPaths;

      function draw() {
        const world = flat.querySelector('.jvectormap-container svg > g');
        if (!world) return;
        const land = window.document.createElementNS('http://www.w3.org/2000/svg', 'g');
        land.classList.add('visitor-vector-land');
        paths.forEach(path => land.appendChild(window.document.importNode(path, true)));
        // Share the provider's projection and viewport transform with live markers.
        world.prepend(land);
        flat.dataset.renderer = 'vector';
        preview?.remove();
        delete container.dataset.preview;
        vectorObserver.disconnect();
      }

      const vectorObserver = new MutationObserver(draw);
      vectorObserver.observe(flat, { childList: true, subtree: true });
      draw();
    } catch (_) {
      // Retain the provider bitmap if the local vector asset cannot be loaded.
      flat.dataset.renderer = 'bitmap';
    }
  }

  function checkReady() {
    const flat = container.querySelector('.mapmyvisitors-map');
    if (!flat?.style.backgroundImage) return;
    fitMap();
    resizeObserver.observe(holder.querySelector('#mapmyvisitors-widget'));
    flat.style.setProperty('--visitor-map-image', flat.style.backgroundImage);
    loadVectorMap(flat);
    status.hidden = true;
    container.dataset.state = 'ready';
    clearTimeout(timeout);
    observer.disconnect();
  }

  const resizeObserver = new ResizeObserver(fitMap);
  resizeObserver.observe(holder);
  retry.addEventListener('click', () => window.location.reload());
  script.addEventListener('error', failed);

  // Detect the provider's initialized map, including when it starts below the fold.
  const observer = new MutationObserver(checkReady);
  observer.observe(holder, {
    childList: true, subtree: true, attributes: true, attributeFilter: ['style']
  });
  const timeout = setTimeout(failed, 20000);
  checkReady();
})();
