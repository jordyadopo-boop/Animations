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

// ---------- la pieuvre low-poly
function makeOctopus(o = {}) {
  const g = new THREE.Group();
  const hc = o.holo;
  const mat = hc ? null : new THREE.MeshLambertMaterial({ color: o.color ?? 0xc0503a, flatShading: true });
  const mk = (geo) => hc ? holo(geo, hc, o.op ?? 0.1) : new THREE.Mesh(geo, mat);
  const body = new THREE.Group(); g.add(body);
  const head = mk(new THREE.IcosahedronGeometry(0.16, 1)); head.scale.set(1.15, 0.85, 1.0); head.position.set(0, 0.2, 0); body.add(head);
  const mantle = mk(new THREE.IcosahedronGeometry(0.2, 1)); mantle.scale.set(1.0, 1.35, 1.1); mantle.position.set(0, 0.46, -0.1); mantle.rotation.x = -0.4; body.add(mantle);
  const eyes = [];
  for (const s of [-1, 1]) {
    const eg = new THREE.Group(); eg.position.set(s * 0.12, 0.28, 0.07); eg.rotation.y = s * 0.5; body.add(eg);
    eg.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.048, 1), hc ? holoMat(hc, 0.15) : M(0xe8dcb8)));
    const pu = at(box(0.05, 0.012, 0.02, hc ? G(hc, 0.7) : M(0x101010)), 0, 0, 0.043); eg.add(pu); eyes.push(eg);
  }
  // taches de motif (camouflage)
  const spotMat = new THREE.MeshLambertMaterial({ color: o.spot ?? 0x6a2a1a, flatShading: true, transparent: true, opacity: 0 });
  if (!hc) for (let i = 0; i < 30; i++) {
    const a = hash(i) * Math.PI * 2, b = (hash(i * 3) - 0.35) * 1.5;
    const d = new THREE.Vector3(Math.cos(a) * Math.cos(b), Math.sin(b), Math.sin(a) * Math.cos(b));
    const sp = new THREE.Mesh(new THREE.CircleGeometry(0.035 + hash(i * 5) * 0.025, 7), spotMat);
    sp.position.copy(d).multiplyScalar(0.205); sp.lookAt(d.clone().multiplyScalar(2)); mantle.add(sp);
  }
  // 8 bras
  const arms = [], N = o.seg ?? 10, L = o.segL ?? 0.065;
  for (let i = 0; i < 8; i++) {
    const a = (i + 0.5) / 8 * Math.PI * 2;
    const root = new THREE.Group(); root.position.set(Math.sin(a) * 0.09, 0.12, Math.cos(a) * 0.09); root.rotation.order = 'YXZ'; root.rotation.y = a; g.add(root);
    const segs = []; let parent = root;
    for (let k = 0; k < N; k++) {
      const sg = new THREE.Group(); if (k > 0) sg.position.z = L; parent.add(sg);
      const r0 = 0.045 * (1 - k / N) + 0.008, r1 = 0.045 * (1 - (k + 1) / N) + 0.008;
      const geo = new THREE.CylinderGeometry(r1, r0, L * 1.05, 6); geo.rotateX(Math.PI / 2); geo.translate(0, 0, L / 2);
      sg.add(mk(geo));
      if (!hc && k % 1 === 0) { const su = new THREE.Mesh(new THREE.CylinderGeometry(r0 * 0.55, r0 * 0.55, 0.01, 8), M(o.sucker ?? 0xf0c8b0)); su.position.set(0, -r0 * 0.9, L / 2); sg.add(su); }
      if (o.nerves) { const nv = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, L), G(0xffd070, 1.4)); nv.position.z = L / 2; sg.add(nv); (g.userData.nerves ??= []).push([nv, i, k]); }
      segs.push(sg); parent = sg;
    }
    arms.push({ root, segs, a });
  }
  g.userData.ring = null;
  if (o.nerves) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.018, 6, 16), G(0xffd070, 1.8)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.2; g.add(ring); g.userData.ring = ring; }
  if (o.hearts) {
    const hs = [[-0.11, 0.38, -0.06, 0xff6a5a], [0.11, 0.38, -0.06, 0xff6a5a], [0, 0.45, -0.14, 0xff3a3a]].map(([x, y, z, c]) => { const h = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 1), G(c, 1.6)); h.position.set(x, y, z); body.add(h); return h; });
    g.userData.hearts = hs;
    const gills = [-1, 1].map(s => { const gl = holo(new THREE.ConeGeometry(0.04, 0.14, 5), 0x7dd8ff, 0.25); gl.position.set(s * 0.16, 0.42, -0.04); gl.rotation.z = s * 1.2; body.add(gl); return gl; });
    g.userData.gills = gills;
  }
  g.userData = { ...g.userData, body, eyes, arms, mat, spotMat, N };
  // p : tilt (bras vers le bas), curl (enroulement), wave, sway, reach:[i, k], lift
  g.userData.update = (t, p = {}) => {
    const tilt = p.tilt ?? 0.45, droop = p.droop ?? 0.12, tip = p.tip ?? 0.3, wave = p.wave ?? 0.18;
    arms.forEach((A, i) => {
      const ph = t * (p.speed ?? 1.6) + i * 1.3;
      A.root.rotation.x = tilt + (p.walk ? 0.25 * Math.sin(t * 5 + i * Math.PI / 2) : 0);
      A.segs.forEach((s, k) => {
        s.rotation.x = (p.curl !== undefined ? p.curl : (k < N * 0.45 ? droop : -tip * (k / N))) + wave * Math.sin(ph + k * 0.55) * (k / N + 0.2);
        s.rotation.y = (p.sway ?? 0.08) * Math.sin(ph * 0.7 + k * 0.4);
      });
      if (p.reach && p.reach[0] === i) A.segs.forEach((s, k) => { s.rotation.x = lerp(s.rotation.x, -0.12 + 0.02 * k, p.reach[1]); });
    });
    body.position.y = (p.lift ?? 0) + 0.015 * Math.sin(t * 1.4);
    body.rotation.x = p.bodyTilt ?? 0;
    eyes.forEach(e => { const bl = ((t + 1.3) % 4.1) < 0.1 ? 0.2 : 1; e.scale.y = bl; });
    if (g.userData.hearts) g.userData.hearts.forEach((h, i) => h.scale.setScalar(1 + 0.35 * Math.max(0, Math.sin(t * 7 - (i === 2 ? 1.2 : 0))) ** 4));
  };
  g.userData.setColor = (c, spotC, spotK = 0) => { if (mat) mat.color.copy(c); if (spotC) spotMat.color.copy(spotC); spotMat.opacity = spotK; spotMat.visible = spotK > 0.01; };
  g.traverse(m => { if (m.isMesh) m.castShadow = !hc; });
  return g;
}
const C3 = (h) => new THREE.Color(h);
function mixC(a, b, k) { return C3(a).lerp(C3(b), k); }

function oceanBase(o = {}) {
  const B = base({ bg: o.bg ?? 0x0a3a5a, fog: [o.bg ?? 0x0a3a5a, o.fogN ?? 4, o.fogF ?? 16], hemi: o.hemi ?? [0xbfe8ff, 0x1a3040, 1.1], sun: o.sun ?? [0xfff4e0, 1.3, [1, 6, 2]], shadowSize: 4, bloom: o.bloom ?? [0.4, 0.5, 0.88], exposure: o.exposure ?? 1.1, target: [0, 0, 0] });
  const sand = L.groundPlane(30, 40, o.sand ?? 0xc8b48a, 0.06, 3); B.scene.add(sand);
  // rayons de lumiere
  const rays = []; for (let i = 0; i < (o.rays ?? 5); i++) { const r = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 6), new THREE.MeshBasicMaterial({ color: 0xbfefff, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); r.position.set(-2 + i * 1.1, 3, -1.5 - hash(i) * 2); r.rotation.z = 0.35; B.scene.add(r); rays.push(r); }
  const parts = []; for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.008, 0), G(0xdff6ff, 0.9)); B.scene.add(m); parts.push(m); }
  B.oceanUpdate = (t) => {
    rays.forEach((r, i) => r.material.opacity = 0.05 + 0.03 * Math.sin(t * 0.7 + i * 2));
    parts.forEach((m, i) => { const ph = (t * 0.04 + hash(i)) % 1; m.position.set((hash(i * 3) - 0.5) * 5 + 0.1 * Math.sin(t * 0.5 + i), 0.1 + ph * 3, (hash(i * 7) - 0.5) * 4); });
  };
  return B;
}
function rock(seed, s = 1, c = 0x6a6a72) { const geo = new THREE.IcosahedronGeometry(0.5, 1); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const k = 0.8 + 0.35 * hash(seed * 31 + Math.round(p.getX(i) * 7) * 13 + Math.round(p.getY(i) * 7) * 7 + Math.round(p.getZ(i) * 7)); p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.7, p.getZ(i) * k); } geo.computeVertexNormals(); const m = new THREE.Mesh(geo, M(c)); m.scale.setScalar(s); m.castShadow = m.receiveShadow = true; return m; }
function coral(seed, c) { const g = new THREE.Group(); for (let i = 0; i < 5; i++) { const h = 0.2 + hash(seed + i) * 0.35; const b = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, h, 5), M(c)); b.position.set((hash(seed * 3 + i) - 0.5) * 0.25, h / 2, (hash(seed * 7 + i) - 0.5) * 0.25); b.rotation.z = (hash(seed + i * 9) - 0.5) * 0.8; g.add(b); const tip = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), M(c)); tip.position.set(b.position.x - Math.sin(b.rotation.z) * h / 2, h, b.position.z); g.add(tip); } return g; }
function kelp(seed, h = 1.6) { const g = new THREE.Group(); const segs = []; let p = g; for (let k = 0; k < 8; k++) { const s = new THREE.Group(); if (k) s.position.y = h / 8; p.add(s); s.add(at(box(0.05, h / 8, 0.012, M(0x4a8a3a)), 0, h / 16, 0)); s.add(at(box(0.09, 0.05, 0.01, M(0x5a9a4a)), 0.05, h / 16, 0)); segs.push(s); p = s; } g.userData.update = (t) => segs.forEach((s, k) => s.rotation.z = 0.08 * Math.sin(t * 0.9 + seed + k * 0.4)); return g; }
function reef(scene) {
  const ups = [];
  const items = [[-1.0, -0.9, 0x5a5a68, 1.1], [1.1, -1.2, 0x6a6a72, 1.3], [0.2, -2.0, 0x5a6070, 1.6], [-1.8, -2.4, 0x70707a, 1.4]];
  items.forEach(([x, z, c, s], i) => scene.add(at(rock(i + 1, s, c), x, 0.05, z)));
  [[-0.6, -0.6, 0xff7a6a], [0.7, -0.7, 0xffb050], [-1.3, -0.3, 0xd86aa8], [1.4, -0.5, 0xff8a5a], [0.0, -1.3, 0xa86ad8]].forEach(([x, z, c], i) => scene.add(at(coral(i * 5 + 2, c), x, 0, z)));
  [[-2.0, -1.5], [2.0, -1.8], [-0.4, -2.6], [1.0, -2.8]].forEach(([x, z], i) => { const k = kelp(i * 2.3, 1.4 + hash(i) * 0.8); k.position.set(x, 0, z); scene.add(k); ups.push(k.userData.update); });
  return (t) => ups.forEach(u => u(t));
}
function diverHuman(o) {
  const h = new Human({ ...o, top: 0x1a2a3a, bottom: 0x1a2a3a, shoes: 0x1a1a1a });
  // masque (bord fin autour des yeux, verre transparent) et bouteille
  const mm = M(0x2a7a8a);
  for (const [x, y, w, hh] of [[0, 0.245, 0.24, 0.02], [0, 0.14, 0.24, 0.02], [-0.12, 0.19, 0.02, 0.11], [0.12, 0.19, 0.02, 0.11]]) h.neck.add(at(box(w, hh, 0.02, mm), x, y, 0.15));
  h.neck.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.09), new THREE.MeshBasicMaterial({ color: 0xbfefff, transparent: true, opacity: 0.18, depthWrite: false })), 0, 0.19, 0.162));
  h.spine.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.55, 8), M(0xe8c040)), 0, 0.3, -0.2));
  for (const s of [-1, 1]) h.spine.add(at(box(0.05, 0.56, 0.02, M(0x2a7a8a)), s * 0.1, 0.3, 0.125));
  return h;
}
const bubbles = (scene, n = 14) => { const bs = []; for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.02 + hash(i) * 0.02, 1), new THREE.MeshBasicMaterial({ color: 0xdff6ff, transparent: true, opacity: 0.5, depthWrite: false })); scene.add(b); bs.push(b); } return (t, x, y, z, k = 1) => bs.forEach((b, i) => { const ph = (t * 0.5 + i / n) % 1; b.position.set(x + 0.05 * Math.sin(t * 3 + i), y + ph * 1.5, z + 0.04 * Math.cos(t * 2 + i)); b.material.opacity = 0.5 * (1 - ph) * k; b.visible = k > 0.02; }); };

// ---------- intro : le recif, la pieuvre change de couleur
SETS.intro = () => {
  const B = oceanBase(); const { scene, cam } = B;
  const ru = reef(scene);
  const big = at(rock(9, 1.0, 0x7a7068), 0, 0.05, 0); scene.add(big);
  const oc = makeOctopus({ color: 0xc0503a }); oc.position.set(0, 0.32, 0.05); oc.scale.setScalar(1.3); scene.add(oc);
  const rig = claudeRig(scene, [0.65, 0, 1.0], -0.45, [-0.45, 0, 0.1], 0x55e6ff, 0.45, 0.28); rig.pr.visible = false;
  const bu = bubbles(scene);
  // sequence de couleurs : rouge, sable, corail, motif, gris roche (camouflage)
  const seq = [[0.0, 0xc0503a, 0x7a2a1a, 0], [1.2, 0xd8c090, 0x8a7a50, 0.8], [2.0, 0xff7a6a, 0xffd0a0, 0.6], [2.8, 0xe8e0d0, 0x3a2a2a, 1], [3.6, 0x8a2a8a, 0xff9ad0, 0.7], [4.4, 0x7a7068, 0x5a5048, 0.9]];
  return {
    ...B, update(t) {
      B.oceanUpdate(t); ru(t);
      let i = 0; while (i < seq.length - 1 && t >= seq[i + 1][0]) i++;
      const a = seq[i], b = seq[Math.min(i + 1, seq.length - 1)], k = b === a ? 0 : sstep(b[0] - 0.2, b[0], t);
      oc.userData.setColor(mixC(a[1], b[1], k), mixC(a[2], b[2], k), lerp(a[3], b[3], k));
      oc.userData.update(t, { wave: 0.22 });
      rig.c.update(t, env('claude', t), {});
      bu(t, 0.65, 0.6, 1.0, win(t, C.bienvenue - 0.3, SC.coeurs.start, 0.3, 0.3));
      camKeys(cam, t, [{ t: 0, p: [0.0, 0.9, 1.7], l: [0, 0.62, 0.0], f: 42 }, { t: 4.6, p: [0.12, 0.9, 1.9], l: [0, 0.6, 0.0], f: 42 }, { t: C.bienvenue, p: [0.3, 0.95, 2.9], l: [0.3, 0.55, 0.4], f: 44 }, { t: C.title, p: [0.3, 1.1, 3.0], l: [0.2, 0.7, 0.0], f: 46 }, { t: SC.coeurs.start, p: [0.2, 1.15, 3.2], l: [0.1, 0.8, 0.0], f: 46 }]);
    }
  };
};

// ---------- holo : coeurs, sang bleu, neurones
function holoStudio() {
  const B = base({ bg: 0x04101c, fog: [0x04101c, 8, 30], hemi: [0x9ac8ff, 0x10141c, 1.0], sun: [0xffffff, 1.0, [2, 5, 4]], shadow: false, bloom: [0.55, 0.5, 0.8] });
  const grid = new THREE.GridHelper(40, 40, new THREE.Color(0x3a8aff).multiplyScalar(1.2), new THREE.Color(0x3a8aff).multiplyScalar(0.35)); B.scene.add(grid);
  return B;
}
SETS.coeurs = () => {
  const B = holoStudio(); const { scene, cam } = B;
  const oc = makeOctopus({ holo: 0x7dd8ff, hearts: true, op: 0.08 }); oc.scale.setScalar(2.2); oc.position.set(0, 0.55, 0); scene.add(oc);
  const flow = []; for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.025, 0), G(0x3a7aff, 2.0)); scene.add(m); flow.push(m); }
  const rig = claudeRig(scene, [-0.95, 0, 1.3], 0.45, [0.45, 0, 0], 0x55e6ff, 0.4, 0.25); rig.pr.visible = false;
  const K = cardsMgr(scene, cam);
  K('3 CŒURS\n2 pour les branchies · 1 pour le corps', { w: 1.6, h: 0.42, border: '#ff8a7a', small: true }, t => win(t, SC.coeurs.start + 1.2, C.bleu, 0.3, 0.2));
  K('SANG BLEU\ndu cuivre au lieu du fer', { w: 1.6, h: 0.42, border: '#5a9aff', small: true }, t => win(t, C.bleu + 1.0, SC.cerveaux.start, 0.3, 0.2));
  const hearts = oc.userData.hearts;
  return {
    ...B, update(t) {
      oc.userData.update(t, { wave: 0.15, speed: 1.0 });
      oc.rotation.y = 0.35 * Math.sin(t * 0.3);
      const bk = sstep(C.bleu - 0.5, C.bleu + 0.5, t);
      flow.forEach((m, i) => { const h = hearts[i % 3]; h.updateWorldMatrix(true, false); const P = h.getWorldPosition(new THREE.Vector3()); const ph = (t * 0.5 + i / 40) % 1; const a = i * 2.4; m.position.set(P.x + Math.cos(a) * ph * 1.0, P.y - ph * 1.3 + 0.2 * Math.sin(ph * 6), P.z + Math.sin(a) * ph * 0.8); m.visible = bk > 0.02; m.scale.setScalar(bk * (1 - ph * 0.6)); });
      hearts.forEach(h => h.material.color.copy(C3(0xff4a4a).lerp(C3(0x3a6aff), bk * 0)).multiplyScalar(1.6));
      rig.c.update(t, env('claude', t), {});
      const T0 = SC.coeurs.start;
      camKeys(cam, t, [{ t: T0, p: [0.0, 1.6, 4.0], l: [0, 1.15, 0], f: 46 }, { t: C.bleu, p: [0.4, 1.7, 3.2], l: [0, 1.35, -0.1], f: 44 }, { t: SC.cerveaux.start, p: [0.3, 1.7, 3.3], l: [0, 1.3, -0.1], f: 44 }]);
      K.update(t);
    }
  };
};
SETS.cerveaux = () => {
  const B = holoStudio(); B.bloom = [0.4, 0.5, 0.85]; const { scene, cam } = B;
  const oc = makeOctopus({ holo: 0x7dd8ff, nerves: true, op: 0.07 }); oc.scale.setScalar(2.2); oc.position.set(0, 0.5, 0); scene.add(oc);
  const shell = new THREE.Group(); shell.position.set(1.15, 0.12, 1.05); scene.add(shell);
  shell.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.18, 7), M(0xf0d0b0)), 0, 0.09, 0)); shell.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 5, 10), M(0xe8b890)), 0, 0.02, 0).rotateX(Math.PI / 2));
  const sparks = []; for (let i = 0; i < 10; i++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.025), G(0xffe070, 2.2)); scene.add(s); sparks.push(s); }
  const rig = claudeRig(scene, [-1.0, 0, 1.3], 0.45, [0.45, 0, 0], 0x55e6ff, 0.4, 0.25); rig.pr.visible = false;
  const K = cardsMgr(scene, cam);
  K('≈ 500 MILLIONS DE NEURONES\n≈ les deux tiers dans les bras', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.cerveaux.start + 1.5, C.neuf, 0.3, 0.2));
  K('« 9 CERVEAUX » ? une image\n1 cerveau + 1 paquet de neurones par bras', { w: 1.6, h: 0.42, border: '#7dd8ff', small: true }, t => win(t, C.neuf + 1.0, C.gout, 0.3, 0.2));
  K('2020 · Harvard\nles ventouses goûtent en touchant', { w: 1.6, h: 0.42, border: '#7dffb0', small: true }, t => win(t, C.gout + 2.0, SC.couleur.start, 0.3, 0.2));
  const nerves = oc.userData.nerves, ring = oc.userData.ring;
  return {
    ...B, update(t) {
      const T0 = SC.cerveaux.start;
      const armOn = sstep(T0 + 3.5, T0 + 5.5, t), ringOn = sstep(T0 + 0.5, T0 + 1.5, t), each = win(t, C.neuf + 2.0, C.gout, 0.4, 0.4);
      ring.visible = true; ring.material.color.setRGB(1, 0.82, 0.45).multiplyScalar(0.2 + 0.8 * ringOn * (1 + 0.2 * Math.sin(t * 5)));
      nerves.forEach(([nv, i, k]) => { const pulse = 0.5 + 0.5 * Math.sin(t * 4 - k * 0.7 + i); const v = armOn * (0.3 + 0.4 * pulse) + each * (Math.floor((t * 1.5)) % 8 === i ? 0.6 : 0); nv.material.color.setRGB(1, 0.82, 0.45).multiplyScalar(0.12 + v); });
      const reach = sstep(C.gout - 0.3, C.gout + 1.2, t);
      oc.userData.update(t, { wave: 0.18, speed: 1.0, reach: [1, reach] });
      oc.rotation.y = lerp(0.3 * Math.sin(t * 0.3), 0.35, reach);
      oc.updateMatrixWorld(true); const tipP = oc.userData.arms[1].segs[oc.userData.N - 1].getWorldPosition(new THREE.Vector3());
      shell.position.set(tipP.x + 0.05, Math.max(0.0, tipP.y - 0.2), tipP.z + 0.05);
      sparks.forEach((s, i) => { const ph = (t * 0.8 + i / 10) % 1; s.position.set(shell.position.x + Math.cos(i * 2.1) * 0.15 * ph, shell.position.y + 0.15 + ph * 0.5, shell.position.z + Math.sin(i * 2.1) * 0.15 * ph); fade(s, sstep(C.gout + 1.0, C.gout + 1.4, t) * (1 - ph)); });
      fade(shell, win(t, C.gout - 0.5, SC.couleur.start + 1, 0.4, 0.2));
      rig.c.update(t, env('claude', t), {});
      const sp = shell.position;
      camKeys(cam, t, [{ t: T0, p: [0.0, 1.6, 4.0], l: [0, 1.1, 0], f: 46 }, { t: C.neuf, p: [-0.4, 1.9, 3.4], l: [0, 0.9, 0], f: 46 }, { t: C.gout - 0.2, p: [-0.3, 1.8, 3.5], l: [0, 0.9, 0], f: 46 }, { t: C.gout + 1.4, p: [sp.x + 0.2, sp.y + 0.7, sp.z + 1.6], l: [sp.x - 0.1, sp.y + 0.25, sp.z], f: 44 }, { t: SC.couleur.start, p: [sp.x + 0.2, sp.y + 0.7, sp.z + 1.5], l: [sp.x - 0.1, sp.y + 0.25, sp.z], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- la peau : chromatophores, puis l'oeil
SETS.couleur = () => {
  const B = oceanBase({ rays: 2 }); const { scene, cam } = B;
  const skin = new THREE.Group(); skin.position.set(0, 1.5, -1.0); scene.add(skin);
  skin.add(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.2), new THREE.MeshBasicMaterial({ color: 0xd8c0a0 })));
  const chroma = [];
  for (let i = 0; i < 420; i++) {
    const c = [0xe8b020, 0xd04a28, 0x6a3020][i % 3];
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.045 + hash(i) * 0.035, 9), new THREE.MeshBasicMaterial({ color: c }));
    m.position.set((hash(i * 3) - 0.5) * 2.2, (hash(i * 7) - 0.5) * 3.0, 0.005 + i * 0.0001); skin.add(m); chroma.push(m);
  }
  // grosse pieuvre pour l'oeil
  const oc = makeOctopus({ color: 0xb85a40 }); oc.scale.setScalar(2.4); oc.position.set(0.0, 0.2, 0.6); scene.add(oc);
  const rig = claudeRig(scene, [1.1, 0, 1.7], -0.5, [-0.5, 0, 0.1], 0x55e6ff, 0.45, 0.28);
  const hyp = new THREE.Group(); rig.holoG.add(hyp);
  const h1 = label('la peau sent la lumière ?', { w: 0.7, h: 0.1, color: '#7dffb0', font: 'bold 84px Inter' }); h1.position.y = 0.2; hyp.add(h1);
  const h2 = label('la forme de la pupille ?', { w: 0.7, h: 0.1, color: '#ffd070', font: 'bold 84px Inter' }); h2.position.y = 0.05; hyp.add(h2);
  const K = cardsMgr(scene, cam);
  K('≈ 0,2 seconde\npour changer de motif', { w: 1.6, h: 0.42, border: '#ffb050', small: true }, t => win(t, SC.couleur.start + 4.0, C.aveugle, 0.3, 0.2));
  K('1 seul type de récepteur de lumière\npas de couleurs ?', { w: 1.6, h: 0.42, border: '#9ad0ff', small: true }, t => win(t, C.aveugle + 2.5, C.hypo, 0.3, 0.2));
  K('HYPOTHÈSES', { w: 1.2, h: 0.3, border: '#ffd070', color: '#ffe070' }, t => win(t, C.hypo + 0.5, SC.coco.start, 0.3, 0.2), -0.8, 0.45);
  return {
    ...B, update(t) {
      const T0 = SC.couleur.start;
      camKeys(cam, t, [{ t: T0, p: [0.0, 1.5, 0.6], l: [0, 1.5, -1.0], f: 40 }, { t: C.aveugle - 0.6, p: [0.2, 1.45, 0.3], l: [0, 1.5, -1.0], f: 40 },
        { t: C.aveugle - 0.3, p: [0.75, 0.95, 1.85], l: [0.27, 0.86, 0.75], f: 38 }, { t: C.hypo - 0.32, p: [0.65, 0.95, 1.75], l: [0.27, 0.86, 0.75], f: 38 },
        { t: C.hypo - 0.3, p: [0.62, 1.2, 4.1], l: [0.62, 0.8, 1.6], f: 44 }, { t: SC.coco.start, p: [0.62, 1.18, 3.9], l: [0.62, 0.8, 1.6], f: 44 }]);
      B.oceanUpdate(t);
      chroma.forEach((m, i) => { const wave = Math.sin(t * 6 - m.position.x * 3 + m.position.y * 2 + Math.floor(t * 1.5) * 1.7); m.scale.setScalar(0.3 + 1.1 * Math.max(0, wave)); });
      fade(skin, 1 - sstep(C.aveugle - 0.6, C.aveugle - 0.1, t));
      oc.visible = t > C.aveugle - 0.6 && t < C.hypo - 0.3;
      const tone = (Math.floor(t * 1.2) % 3);
      oc.userData.setColor(C3([0xb85a40, 0xd8c090, 0x8a5a9a][tone]), C3(0x3a2018), tone === 1 ? 0.8 : 0.3);
      oc.userData.update(t, { wave: 0.15, speed: 0.9 });
      const hk = win(t, C.hypo + 0.2, SC.coco.start, 0.4, 0.3); beamOn(rig, hk, t); fade(h1, sstep(C.hypo + 0.3, C.hypo + 0.7, t) * hk); fade(h2, sstep(C.hypo + 2.0, C.hypo + 2.4, t) * hk); hyp.lookAt(cam.position);
      rig.c.update(t, env('claude', t), {});
      K.update(t);
    }
  };
};

// ---------- 2009 : la pieuvre aux noix de coco (Indonesie)
SETS.coco = () => {
  const B = oceanBase({ sand: 0x8a7a5a, bg: 0x1a4a5a }); const { scene, cam } = B;
  const coco = () => { const g = new THREE.Group(); const sh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0x6a4428, { side: THREE.DoubleSide })); g.add(sh); const inn = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0xe8dcc0, { side: THREE.BackSide })); g.add(inn); g.traverse(m => { if (m.isMesh) m.castShadow = true; }); return g; };
  const c1 = coco(), c2 = coco(); c1.scale.setScalar(1.25); c2.scale.setScalar(1.15); scene.add(c1, c2);
  const oc = makeOctopus({ color: 0x8a6a50, spot: 0x3a2a1a }); oc.scale.setScalar(1.05); oc.userData.setColor(C3(0x8a6a50), C3(0x3a2a1a), 0.7); scene.add(oc);
  for (let i = 0; i < 6; i++) scene.add(at(rock(20 + i, 0.25 + hash(i) * 0.3, 0x5a5048), -2 + i * 0.8, 0.02, -1.5 - hash(i * 3)));
  const div = diverHuman({ skin: 0xc89a6a, hair: 0x101010, hairStyle: 'bun', seed: 2201 }); div.place(-1.6, 0, -2.4, 0.45); scene.add(div.root);
  faceLight(scene, [-1.3, 1.25, -1.5], 2.2, 0xe8f6ff);
  const bu = bubbles(scene, 12);
  const K = cardsMgr(scene, cam);
  K('2009 · Indonésie\nune pieuvre et ses noix de coco', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.coco.start + 1.0, C.plongeuse - 0.4, 0.3, 0.2));
  imagined(K, 'personnage imaginé', C.plongeuse - 0.2, SC.inky.start);
  return {
    ...B, update(t) {
      B.oceanUpdate(t);
      const T0 = SC.coco.start;
      const carry = sstep(T0 + 4.5, T0 + 5.5, t), walkX = lerp(-0.6, 0.5, sstep(T0 + 5.5, C.plongeuse + 1.5, t));
      // ramasse les coques, puis marche sur la pointe des bras
      oc.position.set(lerp(-0.3, walkX, carry), 0.22 * carry, 0.2);
      oc.userData.update(t, carry > 0.5 ? { tilt: 1.2, curl: 0.02, wave: 0.1, speed: 3, walk: true } : { wave: 0.2 });
      // coques empilees, tenues sous le corps
      c1.position.set(lerp(0.45, oc.position.x, carry), lerp(0.0, oc.position.y + 0.02, carry), lerp(0.45, 0.25, carry));
      c2.position.set(lerp(0.75, oc.position.x, carry), lerp(0.0, oc.position.y + 0.05, carry), lerp(0.3, 0.25, carry));
      div.pose(L.kneelPose({ aL: [0.5, 0.1], aR: [0.9 + 0.5 * win(t, C.plongeuse - 0.2, C.plongeuse + 1.6), 0.15], eL: 0.8, eR: 0.6, hp: 0.1 })); div.face(env('plongeuse', t), t > C.plongeuse - 0.2 ? 'joy' : 'happy', t);
      bu(t, -0.15, 1.75, -1.15, 1);
      camKeys(cam, t, [{ t: T0, p: [0.3, 0.85, 2.3], l: [0.1, 0.3, 0.3], f: 44 }, { t: T0 + 5.5, p: [0.0, 0.8, 2.3], l: [-0.1, 0.35, 0.2], f: 44 }, { t: C.plongeuse - 0.4, p: [0.6, 0.8, 2.3], l: [0.3, 0.35, 0.2], f: 44 },
        { t: C.plongeuse + 0.2, p: [-1.05, 1.15, -0.6], l: [-1.55, 1.05, -2.4], f: 42 }, { t: SC.inky.start, p: [-1.07, 1.13, -0.6], l: [-1.55, 1.03, -2.4], f: 42 }]);
      K.update(t);
    }
  };
};

// ---------- 2016 : Inky s'echappe
SETS.inky = () => {
  const B = base({ bg: 0x0a1020, hemi: [0x6a88c0, 0x18202c, 1.0], sun: [0x9ab8ff, 0.8, [-2, 5, 2]], shadowSize: 5, bloom: [0.45, 0.5, 0.86], exposure: 1.2, target: [0, 0.5, 0] });
  const { scene, cam, hemi } = B;
  scene.add(at(box(10, 0.1, 8, M(0x4a5058)), 0, -0.05, 0)); scene.add(at(box(10, 4, 0.2, M(0x3a4a5a)), 0, 2, -2.2));
  // l'aquarium
  scene.add(at(box(1.3, 0.8, 0.8, M(0x2a2a30)), -0.9, 0.4, -1.3));
  const water = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.75, 0.7), new THREE.MeshLambertMaterial({ color: 0x2a7aaa, transparent: true, opacity: 0.35, depthWrite: false })); water.position.set(-0.9, 1.2, -1.3); scene.add(water);
  const glow = new THREE.PointLight(0x55c8ff, 1.5, 3, 1.5); glow.position.set(-0.9, 1.3, -0.8); scene.add(glow);
  for (const [x, z] of [[-1.5, -1.65], [-0.3, -1.65], [-1.5, -0.95], [-0.3, -0.95]]) scene.add(at(box(0.03, 0.8, 0.03, M(0x8a9098)), x, 1.2, z));
  scene.add(at(box(1.24, 0.03, 0.74, M(0x6a7078, { transparent: true, opacity: 0.6 })), -0.9, 1.6, -1.3));
  scene.add(at(rock(31, 0.35, 0x5a6070), -0.9, 0.85, -1.3));
  // le trou d'evacuation
  const drain = new THREE.Mesh(new THREE.CircleGeometry(0.11, 14), new THREE.MeshBasicMaterial({ color: 0x050505 })); drain.rotation.x = -Math.PI / 2; drain.position.set(0.9, 0.006, 0.4); scene.add(drain);
  scene.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.012, 4, 16), M(0x9aa0a8)), 0.9, 0.008, 0.4).rotateX(Math.PI / 2));
  const oc = makeOctopus({ color: 0xa05a6a }); oc.scale.setScalar(0.75); scene.add(oc);
  const trail = []; for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.CircleGeometry(0.03, 8), new THREE.MeshBasicMaterial({ color: 0x8ab8d8, transparent: true, opacity: 0.35 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.004; scene.add(m); trail.push(m); }
  const keeper = new Human({ skin: 0x8a5a3a, hair: 0x101010, hairStyle: 'short', top: 0x2a6a5a, bottom: 0x2a2a3a, seed: 2202 }); keeper.place(0.4, 0, -0.5, 0.0); scene.add(keeper.root);
  const day = new THREE.PointLight(0xfff4e0, 0, 8, 1.2); day.position.set(0.5, 2.6, 1.2); scene.add(day);
  const fl = faceLight(scene, [0.4, 1.7, 0.5], 0);
  const K = cardsMgr(scene, cam);
  K('un tuyau de ≈ 15 cm', { w: 1.3, h: 0.3, border: '#7dd8ff' }, t => win(t, SC.inky.start + 8.6, C.soigneur - 0.4, 0.3, 0.2));
  imagined(K, 'personnage imaginé', C.soigneur - 0.2, SC.fin.start);
  const T0 = SC.inky.start;
  const path = (u) => { // 0..1 : dans le bac -> rebord -> sol -> drain
    if (u < 0.25) return [-0.9 + 0.3 * u * 4, 1.0 + 0.55 * u * 4, -1.1];
    if (u < 0.45) { const k = (u - 0.25) / 0.2; return [-0.6 + 0.2 * k, lerp(1.55, 0.0, k), lerp(-1.1, -0.85, k)]; }
    const k = (u - 0.45) / 0.55; return [lerp(-0.4, 0.9, k), 0.0, lerp(-0.85, 0.4, k)];
  };
  return {
    ...B, update(t) {
      const u = sstep(T0 + 3.0, T0 + 9.0, t), P = path(u);
      const gone = sstep(T0 + 9.0, T0 + 9.8, t);
      oc.position.set(P[0], P[1] - 0.15 * gone, P[2]); oc.scale.setScalar(0.75 * (1 - 0.7 * gone)); oc.visible = gone < 0.98;
      const dir = Math.atan2(0.9 - P[0], 0.4 - P[2]); oc.rotation.y = u > 0.45 ? dir : 0;
      oc.userData.update(t, u > 0.02 && u < 0.99 ? { tilt: 1.3, curl: 0.0, wave: 0.25, speed: 4, walk: true } : { tilt: 1.0, curl: -0.15, wave: 0.18 });
      trail.forEach((m, i) => { const uu = 0.47 + i * 0.038; const Q = path(uu); m.position.x = Q[0]; m.position.z = Q[2]; m.visible = u > uu && t > T0 + 3; });
      const morning = sstep(C.soigneur - 0.9, C.soigneur - 0.4, t);
      day.intensity = 3.5 * morning; fl.intensity = 2.2 * morning; hemi.intensity = 1.0 + 0.4 * morning;
      keeper.root.visible = morning > 0.01;
      keeper.pose({ aL: [0.3, 0.1], aR: [lerp(0.2, 1.3, win(t, C.soigneur, C.soigneur + 2.5, 0.3, 0.4)), 0.2], eL: 0.3, eR: 0.8, hy: 0.4 * Math.sin(t * 2) * win(t, C.soigneur, SC.fin.start) });
      keeper.face(env('soigneur', t), 'awe', t);
      camKeys(cam, t, [{ t: T0, p: [0.6, 1.6, 2.3], l: [-0.7, 1.1, -1.2], f: 44 }, { t: T0 + 3.0, p: [0.2, 1.5, 1.4], l: [-0.8, 1.15, -1.2], f: 44 }, { t: T0 + 5.6, p: [0.6, 1.2, 1.9], l: [-0.3, 0.3, -0.6], f: 44 },
        { t: T0 + 8.6, p: [1.4, 0.75, 1.6], l: [0.85, 0.05, 0.35], f: 44 }, { t: C.soigneur - 0.6, p: [1.4, 0.8, 1.7], l: [0.85, 0.05, 0.35], f: 44 },
        { t: C.soigneur, p: [0.55, 1.6, 1.0], l: [0.4, 1.5, -0.5], f: 42 }, { t: SC.fin.start, p: [0.55, 1.6, 1.0], l: [0.4, 1.5, -0.5], f: 42 }]);
      K.update(t);
    }
  };
};

// ---------- fin : les grands fonds, la mere et ses oeufs
SETS.fin = () => {
  const B = oceanBase({ bg: 0x030a18, sand: 0x3a3a48, fogN: 3, fogF: 12, hemi: [0x6a8ac8, 0x0a0c14, 0.8], sun: [0x9ab8ff, 0.7, [1, 5, 2]], rays: 0, exposure: 1.2 });
  const { scene, cam } = B;
  const ledge = at(rock(41, 1.6, 0x4a4a58), -0.2, 0.0, -0.4); scene.add(ledge);
  const eggs = new THREE.Group(); eggs.position.set(-0.2, 0.62, 0.5); scene.add(eggs);
  for (let i = 0; i < 40; i++) { const e = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 1), new THREE.MeshLambertMaterial({ color: 0xf0ece0, emissive: 0x202020 })); e.scale.set(1, 1.6, 1); e.position.set((hash(i) - 0.5) * 0.4, -hash(i * 3) * 0.12, (hash(i * 7) - 0.5) * 0.15); eggs.add(e); }
  const oc = makeOctopus({ color: 0xc8a8c8, spot: 0x8a6a9a }); oc.scale.setScalar(1.1); oc.position.set(-0.2, 0.5, 0.1); scene.add(oc);
  oc.userData.setColor(C3(0xc8a8c8), C3(0x8a6a9a), 0.3);
  const lamp = new THREE.SpotLight(0xbfe0ff, 5, 6, 0.5, 0.7, 1.2); lamp.position.set(0.4, 2.4, 2.0); lamp.target = oc; scene.add(lamp);
  const rig = claudeRig(scene, [0.9, 0, 1.3], -0.35, [-0.45, 0, 0.1], 0x55e6ff, 0.45, 0.28);
  faceLight(scene, [0.9, 0.9, 2.3], 2.0);
  const icons = [['changer de couleur', '#ff8a6a'], ['goûter avec les mains', '#7dffb0'], ['passer par un trou de 15 cm', '#7dd8ff']].map(([s, c], i) => { const l = label(s, { w: 0.62, h: 0.08, color: c, font: 'bold 64px Inter' }); rig.holoG.add(l); l.position.set(0, 0.25 - i * 0.1, 0); return l; });
  const K = cardsMgr(scene, cam);
  K('la plupart des pieuvres\nvivent 1 à 2 ans', { w: 1.6, h: 0.42, border: '#9ad0ff', small: true }, t => win(t, SC.fin.start + 1.0, SC.fin.start + 4.2, 0.3, 0.2));
  K('RECORD · 53 mois à veiller sur ses œufs\n≈ 1 400 m de profondeur', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.fin.start + 4.6, C.question, 0.3, 0.2));
  return {
    ...B, update(t) {
      const T0 = SC.fin.start;
      camKeys(cam, t, [{ t: T0, p: [0.3, 1.35, 2.6], l: [-0.2, 0.7, 0.3], f: 44 }, { t: C.question - 0.4, p: [0.1, 1.2, 2.0], l: [-0.2, 0.7, 0.3], f: 42 }, { t: C.question + 1.2, p: [0.45, 1.2, 4.0], l: [0.45, 0.8, 1.3], f: 44 }, { t: TL.duration, p: [0.45, 1.18, 3.8], l: [0.45, 0.8, 1.3], f: 44 }]);
      B.oceanUpdate(t);
      oc.userData.update(t, { tilt: 0.25, droop: 0.05, tip: 0.6, wave: 0.08, speed: 0.6, bodyTilt: 0.35 });
      const qk = sstep(C.question + 2.0, C.question + 2.5, t); beamOn(rig, qk, t);
      icons.forEach((l, i) => { fade(l, sstep(C.question + 2.2 + i * 1.3, C.question + 2.6 + i * 1.3, t)); l.lookAt(cam.position); });
      rig.c.update(t, env('claude', t), { wave: sstep(TL.duration - 2.0, TL.duration - 1.5, t) });
      K.update(t);
    }
  };
};

const SHOTS = [
  ['intro', 0, SC.coeurs.start], ['coeurs', SC.coeurs.start, SC.cerveaux.start], ['cerveaux', SC.cerveaux.start, SC.couleur.start], ['couleur', SC.couleur.start, SC.coco.start],
  ['coco', SC.coco.start, SC.inky.start], ['inky', SC.inky.start, SC.fin.start], ['fin', SC.fin.start, 1000],
];
