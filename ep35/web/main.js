import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import * as L from './lib.js';


const { clamp, sstep, lerp, hash, win, M, G, box, at, holo, holoMat, fade, label, Human, camKeys } = L;

const W = 720, H = 1280;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);
const composer = new EffectComposer(renderer);
const rp = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.6, 0.5, 0.85);
composer.addPass(rp); composer.addPass(bloom); composer.addPass(new OutputPass());

const TL = await (await fetch('/build/timeline.json')).json();
const C = TL.cues, S = TL.subs, SC = Object.fromEntries(TL.scenes.map(s => [s.id, s]));
const env = (spk, t) => { const a = TL.env[spk]; if (!a) return 0; const f = t * 24, i = Math.floor(f); return lerp(a[i] ?? 0, a[i + 1] ?? 0, f - i); };

function base(o) {
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(o.fov ?? 45, W / H, 0.05, 900);
  if (o.sky) scene.add(L.skyDome(...o.sky));
  if (o.bg !== undefined) scene.background = new THREE.Color(o.bg);
  if (o.fog) scene.fog = new THREE.Fog(...o.fog);
  const hemi = new THREE.HemisphereLight(...(o.hemi ?? [0xffffff, 0x444444, 1])); scene.add(hemi);
  let sun = null;
  if (o.sun) {
    sun = new THREE.DirectionalLight(o.sun[0], o.sun[1]); sun.position.set(...o.sun[2]); scene.add(sun);
    if (o.shadow !== false) {
      sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
      const s = o.shadowSize ?? 8; Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 0.5, far: 120 });
      sun.shadow.bias = -0.0008; sun.target.position.set(...(o.target ?? [0, 0, 0])); scene.add(sun.target);
    }
  }
  return { scene, cam, hemi, sun, bloom: o.bloom ?? [0.5, 0.5, 0.85], exposure: o.exposure ?? 1 };
}
function claudeRig(scene, pos, ry = 0, projOff = [0.45, 0, 0.12], color = 0x55e6ff, beamH = 0.6, beamR = 0.32) {
  const c = L.makeClaude(); c.g.position.set(...pos); c.g.rotation.y = ry; scene.add(c.g);
  const pr = L.makeProjector(color, beamH, beamR); pr.position.set(pos[0] + projOff[0], pos[1] + projOff[1], pos[2] + projOff[2]); scene.add(pr);
  const holoG = new THREE.Group(); holoG.position.set(pr.position.x, pr.position.y + pr.userData.top + 0.25, pr.position.z); scene.add(holoG);
  return { c, pr, holoG };
}
const beamOn = (rig, k, t) => fade(rig.pr.userData.cone, k * (0.85 + 0.15 * Math.sin(t * 17)));

const SETS = {};
// ---------- helpers
function card(text, o = {}) {
  const w = o.w ?? 2.2, h = o.h ?? 0.42, c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * h / w);
  const g = c.getContext('2d');
  g.fillStyle = o.bg ?? 'rgba(14,10,8,0.82)'; g.strokeStyle = o.border ?? '#e0b070'; g.lineWidth = 8;
  g.beginPath(); g.roundRect(6, 6, c.width - 12, c.height - 12, 34); g.fill(); g.stroke();
  g.fillStyle = o.color ?? '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const lines = text.split('\n'); let fs = o.font ?? Math.min(110, c.height / (lines.length * 1.3));
  g.font = `bold ${fs}px Inter`;
  const mw = Math.max(...lines.map(l => g.measureText(l).width)); if (mw > c.width * 0.9) { fs = fs * c.width * 0.9 / mw; g.font = `bold ${fs}px Inter`; }
  lines.forEach((l, i) => { if (i > 0 && o.small) { g.font = `600 ${fs * 0.72}px Inter`; g.fillStyle = o.subColor ?? '#e2dccf'; } g.fillText(l, c.width / 2, c.height / 2 + (i - (lines.length - 1) / 2) * fs * 1.18); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false, fog: false, toneMapped: false, color: new THREE.Color(0.85, 0.85, 0.85) })); mesh.renderOrder = 20; return mesh;
}
function camCard(cam, c, frac = 0.86, yf = 0.36) {
  const w = c.geometry.parameters.width, th = Math.tan(cam.fov * Math.PI / 360), d = w / (frac * 2 * th * cam.aspect);
  const dir = new THREE.Vector3(); cam.getWorldDirection(dir); const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
  c.position.copy(cam.position).addScaledVector(dir, d).addScaledVector(up, d * th * yf); c.quaternion.copy(cam.quaternion);
}
function cardsMgr(scene, cam) {
  const cards = [];
  const K = (text, o, show, yf = -0.55, frac = 0.82) => { const c = card(text, o); scene.add(c); cards.push([c, show, yf, frac]); return c; };
  K.update = (t) => cards.forEach(([c, show, yf, frac]) => { fade(c, show(t)); camCard(cam, c, frac, yf); });
  return K;
}
const imagined = (K, text, a, b) => K(text, { w: 0.9, h: 0.2, border: '#ffd070', color: '#ffe0a0' }, t => win(t, a, b, 0.2, 0.2), -0.42, 0.42);
function studioBase(o = {}) {
  const B = base({ bg: 0x07060c, fog: [0x07060c, 8, 30], hemi: [0xb0a8c8, 0x18141c, 1.0], sun: [0xffffff, 1.0, [2, 5, 4]], shadow: false, bloom: [0.5, 0.5, 0.82], ...o });
  const grid = new THREE.GridHelper(40, 40, new THREE.Color(0xd99a57).multiplyScalar(0.9), new THREE.Color(0xd99a57).multiplyScalar(0.25)); B.scene.add(grid);
  return B;
}
// eclairage de face pour les visages
function faceLight(scene, pos, k = 1.6, c = 0xfff0e0) { const l = new THREE.PointLight(c, k, 4, 1.2); l.position.set(...pos); scene.add(l); return l; }
function dust(scene, n, cx, cy, cz, R, color = 0xffe0b0) {
  const pts = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.008, 0), G(color, 1.2)); scene.add(m); pts.push(m); }
  return (t) => pts.forEach((m, i) => { const ph = (t * 0.03 + hash(i)) % 1; m.position.set(cx + (hash(i * 3) - 0.5) * R * 2 + 0.1 * Math.sin(t * 0.4 + i), cy + (ph - 0.5) * R * 1.6, cz + (hash(i * 7) - 0.5) * R); });
}

function canvasTex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
// ---------- le coeur (stylise) ; vu de face : sa droite est a gauche de l'image (x < 0)
const RED = 0xb8323a, BLUE = 0x3a5ad8;
function makeHeart(o = {}) {
  const g = new THREE.Group(); const mR = M(o.red ?? RED, { emissive: new THREE.Color(0x2a0606) }), mB = M(o.blue ?? BLUE, { emissive: new THREE.Color(0x060a2a) });
  const ven = new THREE.Group(); g.add(ven);
  const vb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 2), mR); vb.scale.set(1.0, 1.15, 0.8); ven.add(vb);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.6, 12), mR); tip.position.set(0.12, -0.62, 0); tip.rotation.z = 0.35; tip.rotation.x = Math.PI; ven.add(tip);
  ven.rotation.z = 0.35;
  const atr = new THREE.Group(); g.add(atr);
  const ra = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 2), mR); ra.position.set(-0.36, 0.45, 0.05); atr.add(ra);
  const la = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 2), mR); la.position.set(0.3, 0.5, -0.1); atr.add(la);
  // vaisseaux
  const aorta = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.09, 8, 20, Math.PI * 1.15), mR); aorta.position.set(0.02, 0.78, -0.05); aorta.rotation.z = -0.15; g.add(aorta);
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.4, 10), mR), 0.24, 0.62, -0.05));
  const pa = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.42, 10), mB); pa.position.set(-0.08, 0.72, 0.15); pa.rotation.z = 0.35; g.add(pa);
  const vc = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 10), mB); vc.position.set(-0.55, 0.62, 0.0); g.add(vc);
  // vaisseaux coronaires (petits traits)
  for (let k = 0; k < 5; k++) { const c = box(0.02, 0.35, 0.02, M(0xd8a040)); c.position.set(-0.15 + k * 0.08, -0.05 - (k % 2) * 0.1, 0.4); c.rotation.z = 0.4 - k * 0.12; ven.add(c); }
  g.userData = { ven, atr, mR, mB,
    // k : phase du battement (0..1) ; amp : force
    beat(ph, amp = 1) { const a = Math.exp(-Math.pow((ph - 0.05) / 0.06, 2)), v = Math.exp(-Math.pow((ph - 0.22) / 0.08, 2)); atr.scale.setScalar(1 - 0.12 * a * amp); ven.scale.set(1 - 0.08 * v * amp, 1 - 0.1 * v * amp, 1 - 0.08 * v * amp); },
  };
  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return g;
}
const beatPh = (t, period, t0 = 0) => (((t - t0) / period) % 1 + 1) % 1;
// courbe 3D lumineuse qui se dessine
function stroke3(pts, color = 0xffe070, r = 0.015) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
  const geo = new THREE.TubeGeometry(curve, 80, r, 6);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.8), transparent: true, depthWrite: false, depthTest: false, toneMapped: false }));
  m.renderOrder = 6; m.userData.n = geo.index.count; m.userData.curve = curve;
  m.userData.draw = (k, op = 1) => { geo.setDrawRange(0, Math.floor(m.userData.n * clamp(k, 0, 1) / 3) * 3); m.material.opacity = op; m.visible = k > 0.005 && op > 0.01; };
  return m;
}
// flux de particules le long d'une courbe
function flow(pts, color, n = 40, size = 0.035) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
  const g = new THREE.Group(); const mat = G(color, 1.6);
  for (let i = 0; i < n; i++) g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(size, 0), mat));
  g.userData.update = (t, speed = 0.25) => g.children.forEach((m, i) => { const u = (t * speed + i / n) % 1; m.position.copy(curve.getPoint(u)); });
  return g;
}
// ecran d'electrocardiogramme
function ecgScreen(w = 1.2, h = 0.7) {
  const c = document.createElement('canvas'); c.width = 768; c.height = 448; const tex = canvasTex(c);
  const g = new THREE.Group();
  g.add(at(box(w + 0.08, h + 0.08, 0.06, M(0x2a2e36)), 0, 0, -0.035));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); g.add(scr);
  const ecg = (x) => { // forme d'un battement, x dans [0,1)
    const q = -0.08 * Math.exp(-Math.pow((x - 0.30) / 0.012, 2)), r = 1.0 * Math.exp(-Math.pow((x - 0.33) / 0.012, 2)), s = -0.22 * Math.exp(-Math.pow((x - 0.36) / 0.012, 2));
    const p = 0.12 * Math.exp(-Math.pow((x - 0.18) / 0.03, 2)), tw = 0.22 * Math.exp(-Math.pow((x - 0.58) / 0.05, 2)); return p + q + r + s + tw; };
  // mode : fonction t -> { bpm, kind: 'ok' | 'flat' | 'chaos' | 'block' }
  g.userData.draw = (t, mode, color = '#5aff8a') => {
    const x = c.getContext('2d'); x.fillStyle = '#04100a'; x.fillRect(0, 0, 768, 448);
    x.strokeStyle = 'rgba(90,255,138,0.12)'; x.lineWidth = 1; for (let i = 0; i < 768; i += 48) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 448); x.stroke(); } for (let j = 0; j < 448; j += 48) { x.beginPath(); x.moveTo(0, j); x.lineTo(768, j); x.stroke(); }
    x.strokeStyle = color; x.lineWidth = 5; x.shadowColor = color; x.shadowBlur = 14; x.beginPath();
    const span = 4.0; let bpmShown = 0;
    for (let i = 0; i <= 600; i++) {
      const tt = t - span + span * i / 600, m = mode(tt); let y = 0;
      if (m.kind === 'ok' || m.kind === 'block') { const per = 60 / m.bpm, k = Math.floor(tt / per), ph = (tt / per) - k; y = (m.kind === 'block' && k % 3 === 2) ? 0.12 * Math.exp(-Math.pow((ph - 0.18) / 0.03, 2)) : ecg(ph); }
      if (m.kind === 'chaos') y = 0.35 * Math.sin(tt * 37) * Math.sin(tt * 11.3) + 0.2 * Math.sin(tt * 23.7);
      const X = i / 600 * 600, Y = 260 - y * 170; if (i === 0) x.moveTo(X, Y); else x.lineTo(X, Y);
    }
    x.stroke(); x.shadowBlur = 0;
    const m = mode(t); bpmShown = m.kind === 'flat' ? 0 : m.kind === 'chaos' ? '?' : Math.round(m.bpm);
    x.fillStyle = color; x.font = 'bold 110px Inter'; x.textAlign = 'center'; x.fillText(String(bpmShown), 690, 200); x.font = 'bold 34px Inter'; x.fillText('/ min', 690, 250);
    x.fillStyle = '#ff5a6a'; x.font = 'bold 60px Inter'; x.fillText('♥', 690, 90 + 6 * Math.sin(t * 6));
    tex.needsUpdate = true;
  };
  return g;
}
function studio(o = {}) {
  const B = base({ bg: 0x0a0610, fog: [0x0a0610, 8, 28], hemi: [0xffe0e8, 0x18101a, 0.9], sun: [0xfff0e8, 1.2, [1.5, 5, 5]], shadowSize: 4, bloom: [0.55, 0.5, 0.82], exposure: 1.0, target: [0, 1, 0], ...o });
  B.scene.add(at(box(14, 0.1, 10, M(0x2a2030)), 0, -0.05, 0));
  const grid = new THREE.GridHelper(14, 28, new THREE.Color(0xff5a6a).multiplyScalar(0.7), new THREE.Color(0xff5a6a).multiplyScalar(0.18)); grid.position.y = 0.01; B.scene.add(grid);
  B.scene.add(at(box(14, 6, 0.2, M(0x1e1624)), 0, 3, -3));
  return B;
}
function brainHolo(c = 0xff9ac8) { const g = new THREE.Group(); const b = holo(new THREE.IcosahedronGeometry(0.18, 1), c, 0.2); b.scale.set(1.2, 0.9, 1); g.add(b); g.add(at(holo(new THREE.BoxGeometry(0.01, 0.3, 0.35), c, 0.15), 0, 0.02, 0)); return g; }

// ---------- intro : la main sur la poitrine
SETS.intro = () => {
  const B = studio(); const { scene, cam } = B;
  const p = new Human({ skin: 0xc68a5a, hair: 0x1a1210, hairStyle: 'curly', top: 0xe8e4dc, bottom: 0x2a3a5a, seed: 3501 }); p.place(0, 0, 0, 0); scene.add(p.root);
  faceLight(scene, [0.2, 1.7, 1.2], 1.6);
  const hh = makeHeart(); hh.traverse(m => { if (m.isMesh) m.material = holoMat(0xff5a6a, 0.2); }); hh.scale.setScalar(0.1); hh.position.set(0.06, 1.3, 0.2); scene.add(hh);
  const glow = new THREE.PointLight(0xff4a5a, 0.0, 1.2, 1.5); glow.position.set(0.04, 1.3, 0.35); scene.add(glow);
  const lb = label('≈ 100 000 / jour', { w: 1.2, h: 0.22, color: '#ff8a9a', font: 'bold 130px Inter' }); lb.position.set(0, 2.15, 0); scene.add(lb);
  const K = cardsMgr(scene, cam);
  K('environ 60 à 80 battements par minute au repos', { w: 1.6, h: 0.22, border: '#ff8a9a' }, t => win(t, 3.5, C.title - 0.2, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const hk = sstep(0.6, 1.6, t), ph = beatPh(t, 0.85, 0.3);
      p.pose({ aR: [0.05 + 0.4 * hk, 0.12 * (1 - hk), 1.57 * hk], eR: 0.15 + 1.85 * hk, aL: [0.05, 0.12] }); p.face(0, 'happy', t);
      fade(hh, sstep(1.5, 2.2, t)); hh.userData.beat(ph, 1.5); hh.rotation.y = 0.3 * Math.sin(t * 0.5);
      glow.intensity = 0.5 * sstep(1.5, 2.2, t) * (0.4 + Math.exp(-Math.pow((ph - 0.22) / 0.08, 2)));
      fade(lb, win(t, 4.0, C.title, 0.3, 0.3)); lb.lookAt(cam.position);
      camKeys(cam, t, [{ t: 0, p: [0.0, 1.45, 1.8], l: [0, 1.3, 0], f: 46 }, { t: 3.5, p: [0.1, 1.5, 2.4], l: [0, 1.35, 0], f: 46 }, { t: C.title, p: [0.0, 1.4, 3.3], l: [0, 1.25, 0], f: 48 }, { t: SC.pompe.start, p: [0.0, 1.4, 3.4], l: [0, 1.25, 0], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- deux pompes : poumons et corps
SETS.pompe = () => {
  const B = studio({ hemi: [0xffe0e8, 0x18101a, 1.1] }); const { scene, cam } = B;
  const H = makeHeart(); H.position.set(0, 1.3, 0); scene.add(H);
  const lungs = new THREE.Group(); lungs.position.set(0, 1.55, -0.6); scene.add(lungs);
  for (const s of [-1, 1]) { const l = holo(new THREE.IcosahedronGeometry(0.5, 1), 0xffa0b8, 0.12); l.scale.set(0.8, 1.3, 0.6); l.position.set(s * 0.95, 0, 0); lungs.add(l); }
  const blueF = flow([[-0.55, 0.3, 0.1], [-0.4, 1.1, 0.2], [-0.2, 1.3, 0.3], [-0.12, 1.75, 0.2], [-0.55, 2.0, -0.3], [-0.95, 1.7, -0.6]], 0x5a7aff, 30);
  const redF = flow([[0.95, 1.7, -0.6], [0.6, 1.9, -0.4], [0.3, 1.85, -0.1], [0.24, 1.75, 0.05], [0.1, 2.15, 0.0], [0.4, 2.3, 0.1], [1.4, 2.0, 0.2], [1.9, 1.2, 0.3]], 0xff4a5a, 36);
  scene.add(blueF, redF);
  const lR = new THREE.Group(), lL = new THREE.Group();
  const l5 = label('≈ 5 L / min', { w: 1.2, h: 0.28, color: '#ffd070', font: 'bold 170px Inter' }); l5.position.set(0, 2.7, 0); scene.add(l5);
  const K = cardsMgr(scene, cam);
  K('CÔTÉ DROIT → poumons', { w: 1.6, h: 0.2, border: '#8aa8ff', color: '#8aa8ff' }, t => win(t, SC.pompe.start + 3.0, SC.electrique.start, 0.3, 0.2), 0.42, 0.6);
  K('CÔTÉ GAUCHE → corps', { w: 1.6, h: 0.2, border: '#ff8a9a', color: '#ff8a9a' }, t => win(t, SC.pompe.start + 7.0, SC.electrique.start, 0.3, 0.2), 0.32, 0.6);
  K('vu de face : sa droite est à ta gauche', { w: 1.2, h: 0.18, border: '#888888', color: '#cccccc' }, t => win(t, SC.pompe.start + 3.0, C.litres, 0.3, 0.2), -0.75, 0.5);
  K('≈ 5 litres par minute au repos', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, C.litres + 0.4, SC.electrique.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.pompe.start; H.userData.beat(beatPh(t, 0.85), 1.2); H.rotation.y = 0.15 * Math.sin(t * 0.4);
      fade(lungs, sstep(T0 + 2.5, T0 + 3.5, t)); lungs.scale.setScalar(1 + 0.04 * Math.sin(t * 1.6));
      blueF.visible = t > T0 + 2.5; redF.visible = t > T0 + 6.5; blueF.userData.update(t, 0.22); redF.userData.update(t, 0.22);
      fade(lR, win(t, T0 + 3.0, SC.electrique.start, 0.3, 0.3)); fade(lL, win(t, T0 + 7.0, SC.electrique.start, 0.3, 0.3)); lR.lookAt(cam.position); lL.lookAt(cam.position);
      fade(l5, 0); l5.lookAt(cam.position);
      camKeys(cam, t, [{ t: T0, p: [0, 1.5, 3.4], l: [0, 1.35, 0], f: 46 }, { t: T0 + 3.0, p: [-0.2, 1.5, 4.6], l: [0, 1.4, 0], f: 50 }, { t: C.litres, p: [0.2, 1.6, 5.0], l: [0.1, 1.5, 0], f: 50 }, { t: SC.electrique.start, p: [0.2, 1.6, 5.1], l: [0.1, 1.5, 0], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- le signal electrique ; les valves
SETS.electrique = () => {
  const B = studio({ hemi: [0xffe0e8, 0x18101a, 1.1] }); const { scene, cam } = B;
  const H = makeHeart(); H.position.set(0, 1.3, 0); scene.add(H);
  H.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.transparent = true; m.material.opacity = 0.55; m.material.depthWrite = false; } });
  const node = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 1), G(0xffe070, 3)); node.position.set(-0.42, 1.88, 0.3); scene.add(node);
  const path = stroke3([[-0.42, 1.88, 0.3], [-0.2, 1.62, 0.35], [-0.02, 1.4, 0.38], [0.0, 1.1, 0.42], [0.05, 0.85, 0.42], [-0.15, 0.7, 0.4], [-0.3, 0.9, 0.38]], 0xffe070, 0.014);
  const path2 = stroke3([[0.0, 1.1, 0.42], [0.1, 0.85, 0.42], [0.25, 0.68, 0.4], [0.42, 0.9, 0.36]], 0xffe070, 0.014);
  const pathA = stroke3([[-0.42, 1.88, 0.3], [-0.1, 1.95, 0.25], [0.25, 1.85, 0.2]], 0xffe070, 0.012); scene.add(path, path2, pathA);
  const lN = new THREE.Group();
  const lO = label('oreillettes', { w: 0.9, h: 0.14, color: '#ffffff', font: 'bold 90px Inter' }); lO.position.set(0.4, 1.95, 0.4); scene.add(lO);
  const lV = label('ventricules', { w: 0.9, h: 0.14, color: '#ffffff', font: 'bold 90px Inter' }); lV.position.set(0.45, 0.7, 0.5); scene.add(lV);
  const valves = [[-0.12, 1.62], [0.15, 1.62]].map(([x, y]) => { const v = new THREE.Group(); v.position.set(x, y, 0.42); for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.CircleGeometry(0.08, 12, 0, Math.PI), G(0xffffff, 1.2)); f.position.x = s * 0.0; f.rotation.z = s > 0 ? 0 : Math.PI; v.add(f); } scene.add(v); return v; });
  const boum = label('BOUM', { w: 0.8, h: 0.24, color: '#ffffff', font: 'bold 200px Inter' }); boum.position.set(-0.6, 1.2, 0.5); scene.add(boum);
  const boum2 = label('boum', { w: 0.7, h: 0.2, color: '#ffd0d8', font: 'bold 170px Inter' }); boum2.position.set(0.65, 1.25, 0.5); scene.add(boum2);
  const K = cardsMgr(scene, cam);
  K('NŒUD SINUSAL', { w: 1.6, h: 0.22, border: '#ffe070', color: '#ffe070' }, t => win(t, SC.electrique.start + 2.8, C.boum, 0.3, 0.2), 0.42, 0.55);
  K('le stimulateur naturel du cœur', { w: 1.6, h: 0.26, border: '#ffe070' }, t => win(t, SC.electrique.start + 3.5, C.boum - 0.2, 0.3, 0.2), -0.6);
  K('fermeture des valves', { w: 1.6, h: 0.26, border: '#ffffff' }, t => win(t, C.boum + 0.5, SC.tachy.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.electrique.start, per = 0.85, ph = beatPh(t, per, T0 + 0.1);
      H.userData.beat(ph, 1.6); H.rotation.y = 0;
      const on = sstep(T0 + 2.5, T0 + 3.0, t);
      node.scale.setScalar(1 + on * 0.8 * Math.exp(-Math.pow((ph - 0.0) / 0.05, 2)) + 0.3 * on);
      const k = clamp(ph / 0.3, 0, 1) * on; pathA.userData.draw(clamp(ph / 0.08, 0, 1), on * (1 - sstep(0.3, 0.5, ph))); path.userData.draw(k, on * (1 - sstep(0.45, 0.6, ph))); path2.userData.draw(clamp((ph - 0.12) / 0.18, 0, 1), on * (1 - sstep(0.45, 0.6, ph)));
      fade(lN, win(t, T0 + 2.8, C.boum, 0.3, 0.3)); fade(lO, win(t, T0 + 6.5, C.boum, 0.3, 0.3)); fade(lV, win(t, T0 + 8.0, C.boum, 0.3, 0.3)); [lN, lO, lV].forEach(l => l.lookAt(cam.position));
      const vk = sstep(C.boum - 0.2, C.boum + 0.3, t); valves.forEach(v => { fade(v, 0); v.children.forEach((f, i) => { f.rotation.x = (1 - Math.exp(-Math.pow((ph - 0.3) / 0.08, 2))) * 0.0 + (ph > 0.3 ? 0 : 1.2); }); });
      const b1 = Math.exp(-Math.pow((ph - 0.22) / 0.05, 2)), b2 = Math.exp(-Math.pow((ph - 0.48) / 0.05, 2));
      fade(boum, vk * b1); fade(boum2, vk * b2); boum.scale.setScalar(0.9 + 0.2 * b1); boum.lookAt(cam.position); boum2.lookAt(cam.position);
      camKeys(cam, t, [{ t: T0, p: [0.0, 1.5, 4.2], l: [0, 1.35, 0], f: 46 }, { t: T0 + 2.4, p: [-0.3, 1.7, 3.3], l: [-0.1, 1.5, 0], f: 46 }, { t: T0 + 6.0, p: [0.1, 1.5, 4.0], l: [0, 1.3, 0], f: 46 }, { t: C.boum, p: [0.0, 1.5, 3.8], l: [0, 1.35, 0], f: 46 }, { t: SC.tachy.start, p: [0.0, 1.5, 3.9], l: [0, 1.35, 0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- tachycardie
SETS.tachy = () => {
  const B = studio(); const { scene, cam } = B;
  const run = new Human({ skin: 0xe0b090, hair: 0x5a3a20, hairStyle: 'bun', top: 0xff6a3a, bottom: 0x1a1a24, shortSleeve: true, seed: 3502 }); run.place(-0.5, 0, 0, 0.3); scene.add(run.root);
  faceLight(scene, [-0.3, 1.7, 1.3], 1.4);
  const scr = ecgScreen(); scr.position.set(0.75, 1.55, -0.2); scr.rotation.y = -0.25; scene.add(scr);
  const H = makeHeart(); H.scale.setScalar(0.5); H.position.set(0.75, 0.55, 0.3); scene.add(H);
  const sparks = []; for (let i = 0; i < 10; i++) { const s = stroke3([[0, 0, 0], [(hash(i) - 0.5) * 0.3, (hash(i * 3) - 0.5) * 0.3, 0.05], [(hash(i * 5) - 0.5) * 0.5, (hash(i * 7) - 0.5) * 0.5, 0.1]], 0xffe070, 0.008); s.position.set(0.75, 0.6, 0.55); scene.add(s); sparks.push(s); }
  const causes = ['effort', 'émotion', 'fièvre', 'café'].map((s, i) => { const l = label(s, { w: 0.7, h: 0.14, color: ['#ff8a6a', '#ffb0d0', '#ffd070', '#c8a070'][i], font: 'bold 100px Inter' }); l.position.set(-1.2 + (i % 2) * 0.6, 2.35 - Math.floor(i / 2) * 0.2, 0.2); scene.add(l); return l; });
  const K = cardsMgr(scene, cam);
  K('au repos : plus de 100 / min = tachycardie', { w: 1.6, h: 0.24, border: '#ff8a6a' }, t => win(t, SC.tachy.start + 5.0, SC.tachy.start + 8.5, 0.3, 0.2), -0.6);
  K('sans raison, ou avec malaise :\nen parler à un médecin', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.court + 1.5, SC.brady.start, 0.3, 0.2), 0.15);
  const mode = (tt) => { const T0 = SC.tachy.start; if (tt > C.court + 0.3) return { kind: 'chaos' }; return { kind: 'ok', bpm: lerp(72, 150, sstep(T0 + 2.0, T0 + 6.0, tt)) }; };
  return {
    ...B, update(t) {
      const T0 = SC.tachy.start, runK = sstep(T0 + 1.5, T0 + 2.5, t) * (1 - sstep(C.court - 0.5, C.court + 0.5, t));
      run.pose(L.walkPose(t * 10, 1.1 * runK, { py: 0.88 + 0.04 * Math.abs(Math.sin(t * 10)) * runK, lean: 0.1 * runK })); run.face(0, runK > 0.5 ? 'joy' : 'neutral', t);
      scr.userData.draw(t, mode);
      const m = mode(t); const ch = m.kind === 'chaos'; H.userData.beat(ch ? (t * 7.3) % 1 : beatPh(t, 60 / (m.bpm || 70)), ch ? 0.6 : 1.2); H.rotation.y = -0.4;
      sparks.forEach((s, i) => { s.userData.draw(ch ? (t * 3 + hash(i)) % 1 : 0, ch ? 0.9 : 0); s.rotation.z = i * 0.63 + t * 2; });
      causes.forEach((l, i) => { fade(l, win(t, T0 + 9.0 + i * 0.9, C.court, 0.3, 0.3)); l.lookAt(cam.position); });
      camKeys(cam, t, [{ t: T0, p: [0.1, 1.5, 3.8], l: [0.1, 1.2, 0], f: 50 }, { t: C.court - 0.4, p: [0.0, 1.5, 3.9], l: [0.0, 1.3, 0], f: 50 }, { t: C.court + 0.6, p: [0.6, 1.2, 2.2], l: [0.75, 1.0, 0], f: 46 }, { t: SC.brady.start, p: [0.6, 1.2, 2.1], l: [0.75, 1.0, 0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- bradycardie
SETS.brady = () => {
  const B = studio({ hemi: [0xd8e0ff, 0x10101a, 0.9] }); const { scene, cam } = B;
  const bench = at(box(1.2, 0.45, 0.45, M(0x3a3a48)), -0.5, 0.22, -0.2); scene.add(bench);
  const ath = new Human({ skin: 0x6a4028, hair: 0x120c08, hairStyle: 'short', top: 0x2a8a5a, bottom: 0x1a1a24, shortSleeve: true, seed: 3503 }); ath.place(-0.5, 0, 0.0, 0.2); scene.add(ath.root);
  faceLight(scene, [-0.3, 1.4, 1.3], 1.4);
  const scr = ecgScreen(); scr.position.set(0.75, 1.55, -0.2); scr.rotation.y = -0.25; scene.add(scr);
  const H = makeHeart(); H.scale.setScalar(0.5); H.position.set(0.75, 0.55, 0.3); scene.add(H);
  const sig = stroke3([[-0.21, 0.94, 0.15], [-0.1, 0.81, 0.18], [0.0, 0.7, 0.19], [0.0, 0.55, 0.21]], 0xffe070, 0.01); sig.position.set(0.75, 0.0, 0.3); scene.add(sig);
  const X = label('✕', { w: 0.3, h: 0.3, color: '#ff5a6a', font: 'bold 260px Inter' }); X.position.set(0.75, 0.72, 0.6); scene.add(X);
  const K = cardsMgr(scene, cam);
  K('au repos : moins de 60 / min = bradycardie', { w: 1.6, h: 0.24, border: '#7dd8ff' }, t => win(t, SC.brady.start + 1.5, SC.brady.start + 4.5, 0.3, 0.2), -0.6);
  K('sportif entraîné : souvent normal', { w: 1.6, h: 0.24, border: '#5aff8a' }, t => win(t, SC.brady.start + 4.7, C.bloc, 0.3, 0.2), -0.6);
  K('fatigue, vertiges, malaises :\nen parler à un médecin', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.bloc + 2.5, SC.forme.start, 0.3, 0.2), -0.6);
  const mode = (tt) => tt > C.bloc + 0.3 ? { kind: 'block', bpm: 50 } : { kind: 'ok', bpm: 48 };
  return {
    ...B, update(t) {
      const T0 = SC.brady.start;
      ath.pose(L.sitPose(0.45, { aL: [0.3, 0.2], aR: [0.3, 0.2], eL: 0.4, eR: 0.4 })); ath.face(0, 'happy', t);
      scr.userData.draw(t, mode, '#7dd8ff');
      const per = 60 / 48, ph = beatPh(t, per), k = Math.floor(t / per), blocked = t > C.bloc + 0.3 && k % 3 === 2;
      H.userData.beat(blocked ? 0.9 : ph, 1.3); H.rotation.y = -0.4;
      const bk = sstep(C.bloc, C.bloc + 0.5, t); sig.userData.draw(clamp(ph / 0.25, 0, blocked ? 0.45 : 1), bk); fade(X, bk * (blocked ? 1 : 0.25)); X.lookAt(cam.position);
      camKeys(cam, t, [{ t: T0, p: [0.1, 1.4, 3.6], l: [0.1, 1.1, 0], f: 50 }, { t: C.bloc - 0.4, p: [0.0, 1.4, 3.7], l: [0.0, 1.1, 0], f: 50 }, { t: C.bloc + 0.6, p: [0.7, 1.0, 1.9], l: [0.75, 0.8, 0], f: 46 }, { t: SC.forme.start, p: [0.7, 1.0, 1.8], l: [0.75, 0.8, 0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- garder son coeur en forme
SETS.forme = () => {
  const B = studio(); const { scene, cam } = B;
  const rig = claudeRig(scene, [0, 0, 0.6], 0, [0.45, 0, 0.1], 0x5aff8a, 0.5, 0.3);
  faceLight(scene, [0, 0.6, 2.0], 1.2);
  const H = makeHeart(); H.traverse(m => { if (m.isMesh) m.material = holoMat(0x5aff8a, 0.3); }); H.scale.setScalar(0.25); H.position.set(0, 0.25, 0); rig.holoG.add(H);
  const items = [['bouger · 2 h 30 / semaine', '#5aff8a'], ['ne pas fumer', '#ff8a6a'], ['moins de sel', '#ffffff'], ['bien dormir', '#9ab8ff'], ['surveiller sa tension', '#ffd070']];
  const D = (SC.arret.start - SC.forme.start - 1.0) / 5.4;
  const K = cardsMgr(scene, cam);
  items.forEach(([s, c], i) => K(s, { w: 1.6, h: 0.2, border: c, color: c }, t => win(t, SC.forme.start + 0.4 + i * D, SC.arret.start, 0.3, 0.2), 0.36 - i * 0.14, 0.72));
  return {
    ...B, update(t) {
      const T0 = SC.forme.start; beamOn(rig, sstep(T0, T0 + 0.5, t), t); H.userData.beat(beatPh(t, 0.85), 1.4); H.rotation.y = t * 0.6;
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0.2, 1.5, 3.6], l: [0.2, 1.45, 0.5], f: 46 }, { t: SC.arret.start, p: [0.25, 1.5, 3.4], l: [0.2, 1.45, 0.5], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- quand le coeur s'arrete
SETS.arret = () => {
  const B = studio({ hemi: [0xd8d8e8, 0x10101a, 0.8] }); const { scene, cam } = B;
  const scr = ecgScreen(1.4, 0.8); scr.position.set(0, 1.75, -0.6); scene.add(scr);
  const H = makeHeart(); H.scale.setScalar(0.45); H.position.set(-0.55, 0.8, 0.2); scene.add(H);
  const br = brainHolo(); br.scale.setScalar(1.6); br.position.set(0.55, 0.85, 0.2); scene.add(br);
  // massage cardiaque (hologrammes, stylises)
  const cpr = new THREE.Group(); cpr.position.set(-0.1, 0, 0.6); cpr.scale.setScalar(0.65); scene.add(cpr);
  const torso = holo(new THREE.BoxGeometry(0.9, 0.16, 0.5), 0x7dd8ff, 0.12); torso.position.set(0, 0.1, -0.9); cpr.add(torso);
  const headH = holo(new THREE.IcosahedronGeometry(0.13, 1), 0x7dd8ff, 0.12); headH.position.set(-0.6, 0.12, -0.9); cpr.add(headH);
  const hands = new THREE.Group(); cpr.add(hands); hands.add(box(0.14, 0.05, 0.2, holoMat(0x5aff8a, 0.6))); hands.add(at(box(0.14, 0.05, 0.2, holoMat(0x5aff8a, 0.6)), 0, 0.06, 0));
  hands.add(at(box(0.05, 0.4, 0.05, holoMat(0x5aff8a, 0.4)), -0.05, 0.28, 0.06)); hands.add(at(box(0.05, 0.4, 0.05, holoMat(0x5aff8a, 0.4)), -0.05, 0.28, -0.06));
  const arrowD = label('↓', { w: 0.3, h: 0.3, color: '#5aff8a', font: 'bold 260px Inter' }); arrowD.position.set(0.25, 0.55, -0.9); cpr.add(arrowD);
  const res = { pose() {} };
  const K = cardsMgr(scene, cam);
  K('quelques secondes : perte de connaissance\nquelques minutes : le cerveau s\'abîme', { w: 1.6, h: 0.42, border: '#ff8a9a', small: true }, t => win(t, SC.arret.start + 4.5, C.massage, 0.3, 0.2), -0.6);
  K('appeler le 15 ou le 112 · masser · défibrillateur', { w: 1.6, h: 0.24, border: '#5aff8a' }, t => win(t, C.massage + 0.5, SC.fin.start, 0.3, 0.2), -0.6);
  const tStop = SC.arret.start + 2.5, tBack = C.massage + 2.5;
  const mode = (tt) => tt < tStop ? { kind: 'ok', bpm: 70 } : tt < tStop + 1.2 ? { kind: 'chaos' } : tt < tBack ? { kind: 'flat' } : { kind: 'ok', bpm: 70 };
  return {
    ...B, update(t) {
      const T0 = SC.arret.start; const m = mode(t);
      scr.userData.draw(t, mode, m.kind === 'flat' ? '#ff5a6a' : '#5aff8a');
      const alive = m.kind === 'ok'; H.userData.beat(alive ? beatPh(t, 0.85) : m.kind === 'chaos' ? (t * 9) % 1 : 0.9, alive ? 1.3 : 0.4);
      const dead = sstep(tStop, tStop + 2, t) * (1 - sstep(tBack, tBack + 1, t));
      H.userData.mR.color.setHex(RED).lerp(new THREE.Color(0x5a4a50), dead); H.userData.mB.color.setHex(BLUE).lerp(new THREE.Color(0x4a4a5a), dead);
      fade(br, 1 - 0.75 * sstep(tStop + 1.0, tStop + 4.0, t) * (1 - sstep(tBack, tBack + 1, t)));
      const ck = win(t, C.massage + 0.2, SC.fin.start, 0.4, 0.3); fade(cpr, ck * 0.8);
      const push = Math.max(0, Math.sin(t * 2 * Math.PI * 1.8)); hands.position.set(0.05, 0.22 - 0.06 * push, -0.9); arrowD.lookAt(cam.position);
      camKeys(cam, t, [{ t: T0, p: [0, 1.5, 3.4], l: [0, 1.3, 0], f: 50 }, { t: C.massage, p: [0, 1.6, 3.6], l: [0, 1.2, 0], f: 50 }, { t: C.massage + 0.8, p: [0.4, 1.6, 3.9], l: [0.1, 0.8, 0.2], f: 50 }, { t: SC.fin.start, p: [0.4, 1.6, 3.8], l: [0.1, 0.8, 0.2], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- fin
SETS.fin = () => {
  const B = studio(); const { scene, cam } = B;
  const rig = claudeRig(scene, [0, 0, 0.6], 0.15, [0.45, 0, 0.1], 0xff5a6a, 0.5, 0.3);
  faceLight(scene, [0, 0.6, 2.0], 1.2);
  const H = makeHeart(); H.traverse(m => { if (m.isMesh) m.material = holoMat(0xff5a6a, 0.35); }); H.scale.setScalar(0.25); H.position.set(0, 0.25, 0); rig.holoG.add(H);
  return {
    ...B, update(t) {
      beamOn(rig, 1, t); H.userData.beat(beatPh(t, 0.85), 1.5); H.rotation.y = t * 0.5;
      rig.c.update(t, env('claude', t), { wave: sstep(TL.duration - 2.0, TL.duration - 1.5, t) });
      camKeys(cam, t, [{ t: SC.fin.start, p: [0.25, 1.05, 4.0], l: [0.25, 0.9, 0.5], f: 46 }, { t: TL.duration, p: [0.25, 1.0, 3.6], l: [0.25, 0.85, 0.5], f: 46 }]);
    }
  };
};

// ---------- couverture
SETS.cover = () => {
  const B = studio({ bloom: [0.7, 0.5, 0.75] }); const { scene, cam } = B;
  const H = makeHeart(); H.position.set(0, 1.45, 0); H.rotation.set(0.15, -0.55, 0.1); scene.add(H); H.userData.beat(0.2, 1.5);
  const rim = new THREE.PointLight(0xff5a6a, 5, 4, 1.2); rim.position.set(-1, 2, -1); scene.add(rim);
  const scr = ecgScreen(2.4, 0.9); scr.position.set(0, 0.3, -0.3); scene.add(scr); scr.userData.draw(3.3, () => ({ kind: 'ok', bpm: 72 }));
  return { ...B, update() { cam.position.set(0, 1.3, 4.4); cam.fov = 50; cam.updateProjectionMatrix(); cam.lookAt(0, 0.85, 0); } };
};

const SHOTS = [['intro', 0, SC.pompe.start], ['pompe', SC.pompe.start, SC.electrique.start], ['electrique', SC.electrique.start, SC.tachy.start], ['tachy', SC.tachy.start, SC.brady.start], ['brady', SC.brady.start, SC.forme.start], ['forme', SC.forme.start, SC.arret.start], ['arret', SC.arret.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
const built = {};
function getSet(name) { if (!built[name]) built[name] = SETS[name](); return built[name]; }
function shotAt(t) { for (const s of SHOTS) if (t >= s[1] && t < s[2]) return s; return SHOTS[SHOTS.length - 1]; }
window.renderAt = (t) => {
  const [name] = shotAt(t);
  const set = getSet(name);
  set.update(t);
  rp.scene = set.scene; rp.camera = set.cam;
  [bloom.strength, bloom.radius, bloom.threshold] = set.bloom;
  let k = 1;
  for (const sc of TL.scenes) { if (sc.start > 0.1) k = Math.min(k, 0.35 + 0.65 * Math.min(1, Math.abs(t - sc.start) / 0.18)); }
  if (t < 0.3) k = t / 0.3;
  if (t > TL.duration - 0.6 && t < 999) k = Math.max(0, (TL.duration + 0.3 - t) / 0.9);
  renderer.toneMappingExposure = set.exposure * k;
  composer.render();
  return true;
};
window.ready = true;
