// Point d'entrée : charge l'épisode demandé (?ep=ep01) et expose renderFrame(t) au moteur de rendu.

const params = new URLSearchParams(location.search);
const $ = (id) => document.getElementById(id);
const epName = params.get('ep') || 'ep01';
const ep = await import(`./episodes/${epName}.js`);
// format maître 16:9 (l'épisode peut le changer)
const W = ep.width || 1920, H = ep.height || 1080;
Object.assign($('stage').style, { width: `${W}px`, height: `${H}px` });
Object.assign($('c').style, { width: `${W}px`, height: `${H}px` });
const { createWorld } = await import(`./engine/${ep.world || 'canopy'}.js`);
const world = createWorld($('c'), W, H);
const fxLayer = $('fx'), iris = $('iris');

// Onomatopées et rideau d'iris en surimpression HTML
const fx = {
  set(items) {
    while (fxLayer.children.length < items.length) { const d = document.createElement('div'); d.className = 'ono'; fxLayer.appendChild(d); }
    [...fxLayer.children].forEach((d, i) => {
      const it = items[i];
      if (!it) { d.style.display = 'none'; return; }
      d.style.display = 'block'; d.textContent = it.text;
      d.style.left = `${it.x * W}px`; d.style.top = `${it.y * H}px`;
      d.style.fontSize = `${it.size || 150}px`; d.style.color = it.color || '#ffd21f';
      d.style.transform = `translate(-50%,-50%) rotate(${it.rot || 0}deg) scale(${it.scale ?? 1})`;
      d.style.opacity = it.opacity ?? 1;
    });
  },
  // générique de fin : html = contenu, k = progression du défilement (0..1), a = opacité
  credits(html, k = 0, a = 1) {
    const c = $('credits'); if (!html) { c.style.display = 'none'; return; }
    c.style.display = 'block'; c.style.opacity = a;
    if (c.dataset.html !== html) { c.innerHTML = `<div class="roll">${html}</div>`; c.dataset.html = html; }
    const roll = c.firstChild, hgt = roll.offsetHeight; roll.style.top = `${H - k * (hgt + H * 0.5)}px`;
  },
  dim(a) { $('dim').style.opacity = a; },
  flash(a, color = '#fff') { $('flash').style.opacity = a; $('flash').style.background = color; },
  // lignes de vitesse radiales (style manga), rot en degrés pour les faire « vibrer »
  speed(a, rot = 0, cx = 0.5, cy = 0.5) { const s = $('speed'); s.style.opacity = a; s.style.transform = `rotate(${rot}deg)`; s.style.transformOrigin = `${cx * 100}% ${cy * 100}%`; },
  // r : rayon du trou en fraction de la hauteur (>=1.2 = plein écran), cx/cy en fraction
  iris(r, cx = 0.5, cy = 0.5) {
    iris.style.display = r >= 1.2 ? 'none' : 'block';
    iris.style.background = `radial-gradient(circle at ${cx * 100}% ${cy * 100}%, transparent ${r * H}px, #000 ${r * H + 2}px)`;
  },
};

const frame = ep.build({ ...world, fx, W, H });
await document.fonts.load("150px 'Luckiest Guy'");

window.EPISODE = { duration: ep.duration, fps: ep.fps || 30, width: W, height: H };
window.renderFrame = (t) => { world.update(t); fx.iris(2); fx.set([]); fx.credits(null); fx.dim(0); fx.flash(0); fx.speed(0); world.dof?.(1, 0); frame(t); world.render ? world.render() : world.renderer.render(world.scene, world.camera); };
window.renderFrame(Number(params.get('t') || 0));
window.READY = true;
