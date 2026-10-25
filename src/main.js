// Point d'entrée : charge l'épisode demandé (?ep=ep01) et expose renderFrame(t) au moteur de rendu.
import { createOcean } from './engine/ocean.js';

const params = new URLSearchParams(location.search);
const W = 1080, H = 1920;
const world = createOcean(document.getElementById('c'), W, H);
const $ = (id) => document.getElementById(id);
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

const epName = params.get('ep') || 'ep01';
const ep = await import(`./episodes/${epName}.js`);
const frame = ep.build({ ...world, fx, W, H });
await document.fonts.load("150px 'Luckiest Guy'");

window.EPISODE = { duration: ep.duration, fps: ep.fps || 30 };
window.renderFrame = (t) => { world.update(t); fx.iris(2); fx.set([]); fx.dim(0); fx.flash(0); fx.speed(0); frame(t); world.renderer.render(world.scene, world.camera); };
window.renderFrame(Number(params.get('t') || 0));
window.READY = true;
