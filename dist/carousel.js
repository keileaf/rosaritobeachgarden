(() => {
  const root = document.querySelector('.hero-photo');
  const cover = root.querySelector('img');
  const photos = [
    ['assets/garden.jpg', 'El jardín y la pérgola', 'The garden and pergola'],
    ['assets/833276517_122118091827469192_3742007781647322213_n.jpg', 'La brisa del Pacífico', 'The Pacific breeze'],
    ['assets/834723291_122118091935469192_6429898277367971862_n.jpg', 'Una mesa junto al mar', 'A table by the sea'],
    ['assets/832965046_122118091875469192_4663245563056024798_n.jpg', 'Momentos para celebrar', 'Moments to celebrate'],
    ['assets/832634803_122118092031469192_7765567669302365411_n.jpg', 'Pequeños detalles', 'The little details'],
    ['assets/831455647_122118091833469192_8500729452788754008_n.jpg', 'Una cálida bienvenida', 'A warm welcome']
  ];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, playing = !reduced.matches, timer, touching = null, hovered = false, focused = false;
  root.setAttribute('role', 'region');
  root.setAttribute('aria-roledescription', 'carousel');
  root.tabIndex = 0;
  const controls = document.createElement('div');
  controls.className = 'carousel-controls';
  controls.innerHTML = '<button type="button" class="carousel-prev"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button><span class="carousel-count"></span><button type="button" class="carousel-next"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button><button type="button" class="carousel-play"></button>';
  root.append(controls);
  const strip = document.createElement('div');
  strip.className = 'carousel-thumbs';
  root.after(strip);
  const caption = root.querySelector('.photo-caption>span');
  caption.setAttribute('aria-live', 'off');
  photos.forEach((photo, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    const image = document.createElement('img');
    image.src = photo[0]; image.alt = ''; image.width = 120; image.height = 80; image.loading = 'lazy';
    button.append(image);
    button.addEventListener('click', () => show(i, true));
    strip.append(button);
  });
  const english = () => document.documentElement.lang === 'en';
  function labels() {
    const en = english();
    root.setAttribute('aria-label', en ? 'Photographs of the garden' : 'Fotografías del jardín');
    strip.setAttribute('aria-label', en ? 'Choose a photograph' : 'Elegir fotografía');
    controls.querySelector('.carousel-prev').setAttribute('aria-label', en ? 'Previous photograph' : 'Fotografía anterior');
    controls.querySelector('.carousel-next').setAttribute('aria-label', en ? 'Next photograph' : 'Fotografía siguiente');
    controls.querySelector('.carousel-play').textContent = playing ? (en ? 'Pause' : 'Pausar') : (en ? 'Play' : 'Reproducir');
    controls.querySelector('.carousel-play').setAttribute('aria-pressed', String(playing));
    caption.textContent = photos[index][en ? 2 : 1];
    cover.alt = photos[index][en ? 2 : 1];
    [...strip.children].forEach((b, i) => {
      b.setAttribute('aria-label', `${en ? 'Show' : 'Ver'} ${i + 1}: ${photos[i][en ? 2 : 1]}`);
      b.setAttribute('aria-pressed', String(i === index));
    });
  }
  function schedule() {
    clearInterval(timer);
    if (playing && !hovered && !focused && !document.hidden) timer = setInterval(() => show(index + 1), 6500);
  }
  function show(next, manual = false) {
    index = (next + photos.length) % photos.length;
    cover.src = photos[index][0];
    cover.classList.toggle('portrait-slide', [1, 2, 4, 5].includes(index));
    root.style.setProperty('--slide-image', `url("${photos[index][0]}")`);
    if (manual) playing = false;
    caption.setAttribute('aria-live', manual ? 'polite' : 'off');
    controls.querySelector('.carousel-count').textContent = `${String(index + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
    labels(); schedule();
  }
  controls.querySelector('.carousel-prev').addEventListener('click', () => show(index - 1, true));
  controls.querySelector('.carousel-next').addEventListener('click', () => show(index + 1, true));
  controls.querySelector('.carousel-play').addEventListener('click', () => { playing = !playing; labels(); schedule(); });
  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); show(index + (e.key === 'ArrowRight' ? 1 : -1), true); }
  });
  root.addEventListener('pointerenter', () => { hovered = true; schedule(); });
  root.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  root.addEventListener('focusin', () => { focused = true; schedule(); });
  root.addEventListener('focusout', e => { if (!root.contains(e.relatedTarget)) { focused = false; schedule(); } });
  root.addEventListener('touchstart', e => { touching = [e.changedTouches[0].clientX, e.changedTouches[0].clientY]; }, { passive: true });
  root.addEventListener('touchend', e => {
    if (!touching) return;
    const dx = e.changedTouches[0].clientX - touching[0], dy = e.changedTouches[0].clientY - touching[1];
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1), true);
    touching = null;
  }, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => { if (reduced.matches) { playing = false; labels(); schedule(); } });
  document.addEventListener('rbg:language', labels);
  show(0);
})();
