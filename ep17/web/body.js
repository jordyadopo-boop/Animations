const SETS = {};
// ---------- helpers
function card(text, o = {}) {
  const w = o.w ?? 2.2, h = o.h ?? 0.42, c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * h / w);
  const g = c.getContext('2d');
  g.fillStyle = o.bg ?? 'rgba(10,14,30,0.8)'; g.strokeStyle = o.border ?? '#55e6ff'; g.lineWidth = 8;
  g.beginPath(); g.roundRect(6, 6, c.width - 12, c.height - 12, 34); g.fill(); g.stroke();
  g.fillStyle = o.color ?? '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const lines = text.split('\n'); let fs = o.font ?? Math.min(110, c.height / (lines.length * 1.3));
  g.font = `bold ${fs}px Inter`;
  const mw = Math.max(...lines.map(l => g.measureText(l).width)); if (mw > c.width * 0.9) { fs = fs * c.width * 0.9 / mw; g.font = `bold ${fs}px Inter`; }
  lines.forEach((l, i) => { if (i > 0 && o.small) { g.font = `600 ${fs * 0.72}px Inter`; g.fillStyle = o.subColor ?? '#d8dce8'; } g.fillText(l, c.width / 2, c.height / 2 + (i - (lines.length - 1) / 2) * fs * 1.18); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false, fog: false, toneMapped: false, color: new THREE.Color(0.85, 0.85, 0.85) })); mesh.renderOrder = 20; return mesh;
}
function camCard(cam, c, frac = 0.86, yf = 0.36) {
  const w = c.geometry.parameters.width, th = Math.tan(cam.fov * Math.PI / 360), d = w / (frac * 2 * th * cam.aspect);
  const dir = new THREE.Vector3(); cam.getWorldDirection(dir); const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
  c.position.copy(cam.position).addScaledVector(dir, d).addScaledVector(up, d * th * yf); c.quaternion.copy(cam.quaternion);
}
function holoFig(c, o = {}) {
  const h = new Human({ holo: c, robe: o.robe ? c : undefined, robeL: 0.82, hairStyle: o.hair ?? 'short', beard: o.beard, seed: o.seed ?? 1 });
  h.root.traverse(m => { if (m.isMesh && m.material && m.material.blending === THREE.AdditiveBlending) m.material.opacity = o.op ?? 0.3; });
  h.root.scale.setScalar(o.s ?? 1); return h;
}
function looks(i) {
  return [
    { skin: 0x8a5a3a, hair: 0x141010, hairStyle: 'curly', top: 0xa04a4a, bottom: 0x2a2a3a, jacket: 0x3a3a48 },
    { skin: 0xf0c8a0, hair: 0xd8b060, hairStyle: 'long', top: 0x4a6a90, bottom: 0x3a3a4a },
    { skin: 0xc68a5a, hair: 0x1a1010, hairStyle: 'wrap', top: 0x5a805a, bottom: 0x4a3a2a, robe: 0x5a805a },
    { skin: 0xe0b890, hair: 0x2a1a10, hairStyle: 'short', top: 0x6a6a7a, bottom: 0x2a2a3a, jacket: 0x2a3a5a },
    { skin: 0x5a3a2a, hair: 0x101010, hairStyle: 'bald', top: 0xb09040, bottom: 0x3a3a4a, jacket: 0x4a4038 },
    { skin: 0xd8a878, hair: 0x101010, hairStyle: 'bun', top: 0x806a98, bottom: 0x2a2a3a },
    { skin: 0xa87050, hair: 0x2a1a10, hairStyle: 'short', top: 0x3a3a3a, bottom: 0x6a5a4a, beard: 'full' },
    { skin: 0xf0d0b0, hair: 0x8a5a3a, hairStyle: 'long', top: 0xc07a5a, bottom: 0x3a4a6a },
  ][i % 8];
}
const subAt = (prefix) => (S.find(s => s.en.startsWith(prefix)) ?? { start: 0 }).start;
const ear = (k) => ({ aL: [lerp(0.05, 1.25, k), lerp(0.12, 0.75, k), lerp(0, -0.5, k)], aR: [lerp(0.05, 1.25, k), lerp(0.12, 0.75, k), lerp(0, 0.5, k)], eL: lerp(0.15, 2.5, k), eR: lerp(0.15, 2.5, k) });
const sitPose = L.sitPose;

// ---------- objets de l'episode
function makeBrain(color, o = {}) {
  const g = new THREE.Group();
  const mk = () => o.holo ? null : M(color, { emissive: new THREE.Color(color).multiplyScalar(0.35) });
  for (const s of [-1, 1]) {
    const geo = new THREE.IcosahedronGeometry(0.5, 3); const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const n = 1 + 0.07 * Math.sin(x * 19 + z * 7) * Math.sin(y * 17 + z * 11) + 0.04 * Math.sin(z * 23 + y * 5);
      const flat = 0.55; // face interne aplatie
      p.setXYZ(i, x * n * 1.1 * (x * s < 0 ? flat : 1), y * n * 1.5 * (y < -0.2 ? 0.8 : 1), z * n * 2.0);
    }
    geo.computeVertexNormals();
    const h = o.holo ? holo(geo, o.side?.[s < 0 ? 0 : 1] ?? color, 0.16) : new THREE.Mesh(geo, mk());
    h.position.x = s * 0.2; h.scale.setScalar(0.5); g.add(h); (g.userData.hem ??= []).push(h);
  }
  const cb = o.holo ? holo(new THREE.IcosahedronGeometry(0.2, 1), color, 0.05) : new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), mk());
  cb.scale.set(1.3, 0.6, 0.9); cb.position.set(0, -0.26, -0.36); g.add(cb);
  const st = o.holo ? holo(new THREE.CylinderGeometry(0.05, 0.04, 0.3, 6), color, 0.16) : new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.3, 6), mk());
  st.position.set(0, -0.38, -0.18); st.rotation.x = 0.3; g.add(st);
  g.traverse(m => { if (m.isMesh) m.castShadow = !o.holo; });
  return g;
}
function makeApple(s = 1, holoC = null) {
  const g = new THREE.Group();
  const bm = holoC ? holoMat(holoC, 0.5) : M(0xd8282a, { emissive: new THREE.Color(0x5a0808) });
  const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), bm); b.scale.set(1.05, 0.92, 1.05); g.add(b);
  g.add(at(box(0.025, 0.1, 0.025, M(0x5a3a1a)), 0, 0.21, 0));
  const lf = at(box(0.1, 0.015, 0.05, M(0x3aa040, { emissive: new THREE.Color(0x0a3010) })), 0.06, 0.24, 0); lf.rotation.z = 0.4; g.add(lf);
  g.scale.setScalar(s); return g;
}
// bulle de pensee : anneau + petites bulles, contenu dans g.userData.inner
function bubble(color = 0xffffff, r = 0.32) {
  const g = new THREE.Group();
  const disk = new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshBasicMaterial({ color: 0x0a0c16, transparent: true, opacity: 0.75, depthWrite: false }));
  const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.025, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.8), transparent: true, depthWrite: false }));
  g.add(disk, ring);
  for (const [x, y, rr] of [[-0.12, -r - 0.1, 0.05], [-0.2, -r - 0.22, 0.03]]) g.add(at(new THREE.Mesh(new THREE.CircleGeometry(rr, 16), ring.material), x, y, 0));
  const inner = new THREE.Group(); inner.position.z = 0.02; g.add(inner); g.userData.inner = inner;
  return g;
}
function bolt(c = 0xffe040) { const g = new THREE.Group(); const m = G(c, 2); const pts = [[0, 0.3], [-0.1, 0.02], [0.04, 0.02], [-0.06, -0.3]]; for (let i = 0; i < 3; i++) g.add(beam([pts[i][0], pts[i][1], 0], [pts[i + 1][0], pts[i + 1][1], 0], 0.05, m)); return g; }
function turtle(c = 0x7dffb0) {
  const g = new THREE.Group(); const m = holoMat(c, 0.5);
  const sh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), m); g.add(sh);
  g.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), m), 0, 0.04, 0.24));
  for (const [x, z] of [[-0.14, 0.12], [0.14, 0.12], [-0.14, -0.12], [0.14, -0.12]]) g.add(at(box(0.06, 0.05, 0.08, m), x, 0, z));
  return g;
}
const beam = L.beam;
const AWA = { skin: 0x9a6440, hairStyle: 'long', hair: 0x141010, top: 0xf0d040, bottom: 0x2a3a6a, seed: 1701 };
const HUGO = { skin: 0xf0c8a8, hair: 0xd8b060, hairStyle: 'short', top: 0xf0f0f0, bottom: 0x3a3a48, jacket: 0x3a8a5a, seed: 1702 };
const MALIK = { skin: 0x5a3824, hair: 0x101010, hairStyle: 'short', top: 0xd03030, bottom: 0x1a1a22, shortSleeve: true, shoes: 0xf0f0f0, seed: 1703 };
const MEI = { skin: 0xf0d0a8, hair: 0x101010, hairStyle: 'bun', top: 0x8a5ad0, bottom: 0x2a2a3a, seed: 1704 };
function studioBase(o = {}) {
  const B = base({ bg: 0x05070f, fog: [0x05070f, 8, 30], hemi: [0x6a7ab0, 0x0a0a14, 0.8], sun: [0xffffff, 1.0, [2, 5, 4]], shadow: false, bloom: [0.45, 0.5, 0.85], ...o });
  const grid = new THREE.GridHelper(40, 40, new THREE.Color(0x3a8aff).multiplyScalar(1.3), new THREE.Color(0x3a8aff).multiplyScalar(0.4)); B.scene.add(grid);
  return B;
}
function cardsMgr(scene, cam) {
  const cards = [];
  const K = (text, o, show, yf = -0.5, frac = 0.82) => { const c = card(text, o); scene.add(c); cards.push([c, show, yf, frac]); return c; };
  K.update = (t) => cards.forEach(([c, show, yf, frac]) => { fade(c, show(t)); camCard(cam, c, frac, yf); });
  return K;
}

// ---------- intro : la pomme
SETS.intro = () => {
  const B = studioBase({ hemi: [0xb0c0e8, 0x2a2a3a, 1.3] }); const { scene, cam } = B;
  const rig = claudeRig(scene, [-0.5, 0, 1.4], 0.3, [0.45, 0, -0.05], 0xff5a5a, 0.55, 0.3);
  const apple = makeApple(1.3); rig.holoG.add(apple);
  const heads = [];
  for (let i = 0; i < 4; i++) {
    const h = holoFig([0x55e6ff, 0xffb070, 0xb08aff, 0x7dffb0][i], { hair: ['curly', 'short', 'long', 'bun'][i], s: 0.9, op: 0.3, seed: 1710 + i });
    h.place(-1.8 + i * 1.2, 0, -1.2, 0); scene.add(h.root);
    const b = bubble([0x55e6ff, 0xffb070, 0xb08aff, 0x7dffb0][i], 0.3); b.position.set(-1.8 + i * 1.2 + 0.25, 2.15, -1.2); scene.add(b);
    const a = makeApple(0.9); b.userData.inner.add(a); a.visible = i % 2 === 0;
    if (i % 2) { const q = label('?', { w: 0.3, h: 0.3, color: '#8090a0', font: 'bold 200px Inter' }); b.userData.inner.add(q); }
    heads.push([h, b, a]);
  }
  return {
    ...B, update(t) {
      rig.c.update(t, env('claude', t), {}); beamOn(rig, 1, t);
      apple.rotation.y = t * 0.8; apple.position.y = 0.05 * Math.sin(t * 2);
      heads.forEach(([h, b, a], i) => { const k = sstep(C.heads + i * 0.4, C.heads + i * 0.4 + 0.5, t); fade(b, k); b.scale.setScalar(0.3 + 0.7 * k); a.rotation.y = t; });
      camKeys(cam, t, [
        { t: 0, p: [0.0, 1.2, 3.4], l: [-0.05, 1.0, 1.3], f: 40 }, { t: 3.0, p: [0.0, 1.35, 4.2], l: [-0.05, 1.0, 1.0], f: 42 },
        { t: C.heads + 0.8, p: [0.0, 2.0, 5.6], l: [-0.1, 1.6, -0.6], f: 46 }, { t: C.title, p: [0.0, 1.9, 6.2], l: [-0.1, 1.5, -0.4], f: 48 },
        { t: SC.cafe.start, p: [-1.2, 1.4, 4.4], l: [-0.3, 1.0, 0.8], f: 44 },
      ]);
      if (typeof K !== 'undefined') K.update(t);
    }
  };
};

// ---------- cafe : aphantasie / hyperphantasie
SETS.cafe = () => {
  const B = base({ bg: 0x2a2018, hemi: [0xffe8c8, 0x3a2a20, 1.0], sun: [0xfff0d8, 1.6, [-3, 5, 3]], shadowSize: 5, bloom: [0.4, 0.5, 0.86], exposure: 1.25 });
  const { scene, cam } = B;
  scene.add(at(box(12, 0.1, 10, M(0x8a6a4a)), 0, -0.05, 0));
  scene.add(at(box(12, 4, 0.2, M(0xe8d8b8)), 0, 2, -2.5));
  scene.add(at(box(2.4, 1.6, 0.05, G(0xd8ecff, 1.2)), -1.2, 2.0, -2.38)); scene.add(at(box(2.4, 0.06, 0.06, M(0x4a3a2a)), -1.2, 2.0, -2.34)); scene.add(at(box(0.06, 1.6, 0.06, M(0x4a3a2a)), -1.2, 2.0, -2.34));
  const table = (x, z) => { scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.05, 16), M(0x6a4a30)), x, 0.75, z)); scene.add(at(box(0.07, 0.75, 0.07, M(0x2a2a2a)), x, 0.37, z)); scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.1, 10), M(0xf4f0e8)), x + 0.15, 0.82, z + 0.1)); };
  const chair = (x, z) => { scene.add(at(box(0.42, 0.05, 0.42, M(0x3a2a20)), x, 0.45, z)); scene.add(at(box(0.42, 0.5, 0.05, M(0x3a2a20)), x, 0.7, z - 0.2)); };
  table(0, 0); chair(0, -0.6); table(2.2, -0.6); chair(2.2, -1.2);
  const awa = new Human(AWA); awa.place(0, 0, -0.6, 0); scene.add(awa.root);
  const leo = new Human({ ...looks(3), seed: 1720 }); leo.place(2.2, 0, -1.2, 0); scene.add(leo.root);
  const c = L.makeClaude(); c.g.scale.setScalar(0.35); c.g.position.set(-0.2, 0.78, 0.15); c.g.rotation.y = -0.3; scene.add(c.g);
  const bA = bubble(0xf0d040, 0.36); bA.position.set(0.3, 2.05, -0.55); scene.add(bA);
  const words = ['mots', 'faits', 'souvenirs'].map((w, i) => { const l = label(w, { w: 0.4, h: 0.12, color: ['#ffe070', '#ffffff', '#9ad0ff'][i], font: 'bold 110px Inter' }); bA.userData.inner.add(l); return l; });
  const bL = bubble(0x9ad0ff, 0.42); bL.position.set(2.55, 2.1, -1.15); scene.add(bL);
  const film = new THREE.Group(); bL.userData.inner.add(film);
  film.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), new THREE.MeshBasicMaterial({ color: 0x6ab8ff })), 0, 0, 0));
  film.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.4, 32, Math.PI, Math.PI), new THREE.MeshBasicMaterial({ color: 0x4ab050 })), 0, -0.02, 0.005));
  film.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd040).multiplyScalar(1.5) })), 0.18, 0.2, 0.01));
  const fa = makeApple(0.6); fa.position.set(-0.1, 0.0, 0.05); film.add(fa);
  const K = cardsMgr(scene, cam);
  K('APHANTASIE\nun mot inventé en 2015 par Adam Zeman', { w: 1.6, h: 0.42, border: '#f0d040', small: true }, t => win(t, C.aphan, subAt('About one'), 0.3, 0.2));
  K('≈ 1 à 2 personnes sur 100', { w: 1.6, h: 0.3, border: '#f0d040' }, t => win(t, subAt('About one'), C.hyper, 0.3, 0.2));
  K('HYPERPHANTASIE\ndes images nettes comme un film', { w: 1.6, h: 0.42, border: '#9ad0ff', small: true }, t => win(t, C.hyper + 0.5, SC.parc.start, 0.3, 0.2));
  return {
    ...B, update(t) {
      const T0 = SC.cafe.start;
      awa.pose(sitPose(0.47, { aL: [0.9, 0.15], aR: [0.9, 0.15], eL: 1.0, eR: 1.0, hp: -0.05 })); awa.face(env('awa', t), 'happy', t);
      const closed = win(t, subAt('When I close'), subAt('When I close') + 2.2, 0.2, 0.2); if (closed > 0.5) awa.eyes.forEach(e => e.scale.y = 0.15);
      leo.pose(sitPose(0.47, { aL: [0.9, 0.15], aR: [0.9, 0.15], eL: 1.0, eR: 1.0, hp: 0.1 })); leo.face(0, t > C.hyper ? 'awe' : 'neutral', t);
      c.update(t, env('claude', t), {});
      const ka = sstep(subAt('When I close') + 0.5, subAt('When I close') + 1.2, t); fade(bA, ka); bA.scale.setScalar(0.4 + 0.6 * ka);
      words.forEach((w, i) => { const a = t * 0.8 + i * 2.1; w.position.set(Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0.02); fade(w, sstep(subAt('But I remember') + i * 0.6, subAt('But I remember') + i * 0.6 + 0.4, t)); });
      const kl = sstep(C.hyper + 0.3, C.hyper + 1.0, t); fade(bL, kl); bL.scale.setScalar(0.4 + 0.6 * kl); fa.rotation.y = t;
      camKeys(cam, t, [
        { t: T0, p: [0.6, 1.5, 2.6], l: [0.1, 1.3, -0.4], f: 46 }, { t: C.aphan - 0.5, p: [0.5, 1.6, 2.0], l: [0.15, 1.5, -0.5], f: 44 },
        { t: C.hyper - 0.2, p: [0.9, 1.7, 2.6], l: [1.1, 1.5, -0.8], f: 46 }, { t: SC.parc.start, p: [2.0, 1.7, 1.8], l: [2.3, 1.6, -1.0], f: 44 },
      ]);
      if (typeof K !== 'undefined') K.update(t);
    }
  };
};

// ---------- parc : la petite voix
SETS.parc = () => {
  const B = base({ sky: [0x5aa0e8, 0xf0f4e0, 0xbcd8f0], fog: [0xd8e8f0, 20, 80], hemi: [0xffffff, 0x4a6a3a, 1.0], sun: [0xfff0d0, 2.0, [5, 9, 4]], shadowSize: 8, bloom: [0.35, 0.5, 0.9] });
  const { scene, cam } = B;
  scene.add(L.groundPlane(60, 30, 0x5a9a4a, 0.15, 2));
  scene.add(at(box(1.6, 0.1, 30, M(0xc8b890)), 1.6, 0.03, 0));
  for (let i = 0; i < 12; i++) { const tr = tree(i + 3); tr.scale.multiplyScalar(2.4); tr.position.set((i % 2 ? 1 : -1) * (4 + hash(i) * 6), 0, -10 + i * 2); scene.add(tr); }
  scene.add(at(box(1.6, 0.08, 0.45, M(0x8a5a3a)), 0, 0.45, 0)); scene.add(at(box(1.6, 0.4, 0.06, M(0x8a5a3a)), 0, 0.72, -0.2));
  const hugo = new Human(HUGO); hugo.place(0.2, 0, 0.05, 0); scene.add(hugo.root);
  const c = L.makeClaude(); c.g.scale.setScalar(0.45); c.g.position.set(-0.55, 0.49, 0.05); scene.add(c.g);
  const shapes = new THREE.Group(); shapes.position.set(0.2, 2.15, 0.05); scene.add(shapes);
  const sh = [[new THREE.OctahedronGeometry(0.1), 0xff7a5a], [new THREE.TorusGeometry(0.08, 0.025, 6, 16), 0x55e6ff], [new THREE.IcosahedronGeometry(0.09), 0xffd040], [new THREE.BoxGeometry(0.13, 0.13, 0.13), 0xb08aff], [new THREE.ConeGeometry(0.08, 0.16, 5), 0x7dffb0]].map(([g, col], i) => { const m = new THREE.Mesh(g, G(col, 1.5)); shapes.add(m); return m; });
  const noVoice = label('« … »', { w: 0.5, h: 0.16, color: '#8090a0', font: 'bold 120px Inter' }); noVoice.position.set(-0.45, 2.0, 0.05); scene.add(noVoice);
  const K = cardsMgr(scene, cam);
  K('ANENDOPHASIE · 2024\npas de petite voix intérieure', { w: 1.6, h: 0.42, border: '#7dffb0', small: true }, t => win(t, C.anendo, subAt('These people'), 0.3, 0.2));
  K('réfléchir… autrement', { w: 1.6, h: 0.3, border: '#55e6ff' }, t => win(t, subAt('These people') + 0.4, SC.stade.start, 0.3, 0.2));
  return {
    ...B, update(t) {
      hugo.pose(sitPose(0.49, { aL: [0.5, 0.15], aR: [0.5, 0.15], eL: 1.0, eR: 1.0, hp: -0.15 })); hugo.face(env('hugo', t), 'happy', t);
      c.update(t, env('claude', t), {});
      const ks = sstep(subAt('A voice talking') + 1.0, subAt('A voice talking') + 2.0, t);
      shapes.children.forEach((m, i) => { const a = t * 0.7 + i * 1.256; m.position.set(Math.cos(a) * 0.4, Math.sin(a * 1.3) * 0.12 + 0.05, Math.sin(a) * 0.3); m.rotation.set(t, t * 1.3, 0); m.scale.setScalar(ks); m.visible = ks > 0.01; });
      fade(noVoice, win(t, subAt('A voice talking') + 0.2, subAt('A voice talking') + 2.0, 0.3, 0.3));
      const T0 = SC.parc.start;
      camKeys(cam, t, [{ t: T0, p: [1.5, 1.7, 4.2], l: [0, 1.3, 0], f: 44 }, { t: C.anendo, p: [0.8, 1.6, 2.8], l: [0.1, 1.5, 0], f: 44 }, { t: SC.stade.start, p: [-0.6, 1.9, 3.2], l: [0.1, 1.6, 0], f: 44 }]);
      if (typeof K !== 'undefined') K.update(t);
    }
  };
};
function tree(seed, c = 0x3f8a45) { const g = new THREE.Group(); g.add(at(box(0.1, 0.5, 0.1, M(0x6a4a30)), 0, 0.25, 0)); for (let i = 0; i < 3; i++) g.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.4 - i * 0.1, 0.45, 6), M(c, { emissive: new THREE.Color(c).multiplyScalar(0.2) })), 0, 0.6 + i * 0.25, 0)); g.scale.setScalar(0.8 + hash(seed) * 0.4); return g; }

// ---------- stade + table d'echecs : vite ou lentement
SETS.stade = () => {
  const B = base({ sky: [0x4a8ae0, 0xf0e8d8, 0xb8d0ee], fog: [0xd0dcea, 25, 120], hemi: [0xffffff, 0x6a5a4a, 1.0], sun: [0xfff0d8, 2.2, [6, 10, 5]], shadowSize: 10, bloom: [0.35, 0.5, 0.9] });
  const { scene, cam } = B;
  scene.add(at(box(80, 0.1, 80, M(0x4a8a3a)), 0, -0.06, 0));
  scene.add(at(box(6, 0.04, 60, M(0xb04a3a)), 0, 0, -15));
  for (let i = 0; i <= 6; i++) scene.add(at(box(0.04, 0.05, 60, M(0xf4f4f4)), -3 + i, 0.01, -15));
  scene.add(at(box(6, 0.05, 0.08, M(0xf4f4f4)), 0, 0.01, 0.5));
  for (let i = 0; i < 30; i++) { const h = 1 + hash(i) * 1.5; scene.add(at(box(2, h, 2, M([0x6a7a9a, 0x8a6a5a, 0x5a6a5a][i % 3])), (i % 2 ? 1 : -1) * 9, h / 2, -40 + i * 3)); }
  const malik = new Human(MALIK); scene.add(malik.root);
  const others = [0, 1].map(i => { const h = new Human({ ...looks(i + 4), shortSleeve: true, seed: 1730 + i }); scene.add(h.root); return h; });
  const rig = claudeRig(scene, [3.6, 0, 0.0], -0.6, [0.4, 0, 0.1], 0xffe040, 0.5, 0.3);
  const bl = bolt(); bl.scale.setScalar(0.9); rig.holoG.add(bl); const tu = turtle(); tu.position.x = 0.0; rig.holoG.add(tu);
  // table d'echecs (Mei)
  const ch = new THREE.Group(); ch.position.set(14, 0, 0); scene.add(ch);
  ch.add(at(box(8, 0.06, 6, M(0xc8b8a0)), 0, 0, 0));
  ch.add(at(box(0.9, 0.05, 0.9, M(0x6a4a30)), 0, 0.75, 0)); ch.add(at(box(0.08, 0.75, 0.08, M(0x2a2a2a)), 0, 0.37, 0));
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) ch.add(at(box(0.08, 0.01, 0.08, M(0x2a2018)), -0.28 + i * 0.08, 0.78, -0.28 + j * 0.08)); else ch.add(at(box(0.08, 0.01, 0.08, M(0xf0e8d8)), -0.28 + i * 0.08, 0.78, -0.28 + j * 0.08));
  for (let k = 0; k < 10; k++) ch.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.026, 0.07 + hash(k) * 0.05, 8), M(k < 5 ? 0xf4f0e8 : 0x1a1a1a)), -0.28 + hash(k + 3) * 0.56, 0.82, -0.28 + hash(k + 9) * 0.56));
  ch.add(at(box(0.42, 0.05, 0.42, M(0x3a2a20)), 0, 0.45, -0.6));
  const mei = new Human(MEI); mei.place(14, 0, -0.6, 0); scene.add(mei.root);
  const tu2 = turtle(); tu2.scale.setScalar(1.3); tu2.position.set(14.55, 2.0, -0.4); scene.add(tu2);
  const K = cardsMgr(scene, cam);
  K('DANIEL KAHNEMAN\nprix Nobel 2002 · « Système 1 / Système 2 »', { w: 1.6, h: 0.42, border: '#ffe040', small: true }, t => win(t, SC.stade.start + 2.5, C.sys, 0.3, 0.2));
  K('RAPIDE\nautomatique', { w: 1.6, h: 0.42, border: '#ffe040', small: true }, t => win(t, C.sys, subAt('And a slow'), 0.3, 0.2));
  K('LENTE\nattentive', { w: 1.6, h: 0.42, border: '#7dffb0', small: true }, t => win(t, subAt('And a slow'), C.malik, 0.3, 0.2));
  K('FAUX DÉPART\nmoins de 0,1 s après le coup de pistolet', { w: 1.6, h: 0.42, border: '#ff6a5a', small: true }, t => win(t, C.gun + 1.5, C.mei, 0.3, 0.2));
  K('CHACUN SON RYTHME', { w: 1.6, h: 0.3, border: '#7dffb0' }, t => win(t, C.rythme + 0.5, SC.studio.start, 0.3, 0.2));
  const flash = new THREE.PointLight(0xffe0a0, 0, 6, 1.5); flash.position.set(-2.5, 1.6, 0.8); scene.add(flash);
  return {
    ...B, update(t) {
      rig.c.update(t, env('claude', t), {}); beamOn(rig, win(t, C.sys - 0.3, C.malik, 0.4, 0.3), t);
      fade(bl, win(t, C.sys, subAt('And a slow'), 0.3, 0.2)); bl.rotation.y = t * 1.5;
      fade(tu, win(t, subAt('And a slow'), C.malik, 0.3, 0.2)); tu.rotation.y = t * 0.6;
      const run = Math.max(0, t - C.gun);
      const crouch = { py: 0.42, lean: 1.15, lL: 1.9, kL: 1.9, lR: 1.1, kR: 1.4, aL: [1.3, 0.1], aR: [1.3, 0.1], eL: 0.05, eR: 0.05, hp: -0.7, hideSkirt: true };
      const pose = (h, x, delay = 0) => {
        const r = Math.max(0, run - delay);
        if (t < C.malik + 1.0) { h.place(x, 0, 0.8, Math.PI); h.pose({ py: 0.88, hp: 0, aL: [0.1, 0.1], aR: [0.1, 0.1] }); }
        else if (r <= 0) { h.place(x, 0, 0.85, Math.PI); h.pose(crouch); }
        else { const z = 0.85 - (r * r * 3 < r * 9 - 0.7 ? r * r * 3 : r * 9 - 0.7); h.place(x, 0, z, Math.PI); h.pose(L.walkPose(r * 14, 1.6, { lean: 0.35 * Math.max(0, 1 - r) + 0.15 })); }
      };
      pose(malik, -0.5); others.forEach((h, i) => pose(h, i ? 0.5 : -1.5, 0.12 + i * 0.05));
      malik.face(env('malik', t), 'joy', t); others.forEach(h => h.face(0, 'neutral', t));
      flash.intensity = Math.max(0, 1 - (t - (C.gun - 0.25)) * 6) * (t > C.gun - 0.25 ? 30 : 0);
      mei.pose(sitPose(0.47, { aL: [0.9, 0.15], aR: [1.6 + 0.2 * Math.sin(t), 0.3], eL: 1.0, eR: 2.2, hp: 0.35 })); mei.face(env('mei', t), env('mei', t) > 0.05 ? 'happy' : 'neutral', t);
      fade(tu2, win(t, C.mei + 1.0, SC.studio.start, 0.4, 0.3)); tu2.rotation.y = t * 0.5;
      const T0 = SC.stade.start, mz = malik.root.position.z;
      camKeys(cam, t, [
        { t: T0, p: [6.0, 1.8, 4.0], l: [3.5, 1.1, -0.2], f: 46 }, { t: C.sys, p: [5.2, 1.5, 2.4], l: [3.9, 1.3, 0.0], f: 44 },
        { t: C.malik - 0.3, p: [0.6, 1.4, -1.8], l: [-0.6, 1.2, 0.8], f: 46 }, { t: C.gun - 0.4, p: [1.4, 0.9, -1.4], l: [-0.6, 0.6, 0.8], f: 46 },
        { t: C.gun + 2.5, p: [3.0, 2.2, -10.0], l: [-0.5, 1.0, -12], f: 50 }, { t: C.mei - 0.05, p: [3.0, 2.4, -14.0], l: [-0.5, 1.0, -16], f: 50 },
        { t: C.mei, p: [15.4, 1.6, 1.6], l: [14.0, 1.3, -0.4], f: 44, lin: false }, { t: SC.studio.start, p: [15.0, 1.7, 1.2], l: [14.1, 1.4, -0.4], f: 42 },
      ]);
      if (t > C.gun - 0.2 && t < C.mei) { const r = sstep(C.gun - 0.2, C.gun + 0.8, t); cam.position.set(lerp(1.4, 3.0, r), lerp(0.9, 1.5, r), mz + lerp(-2.2, 2.6, r)); cam.lookAt(-0.5, 1.0, mz - lerp(-1.5, 0.6, r)); }
      if (typeof K !== 'undefined') K.update(t);
    }
  };
};

// ---------- studio : mythe gauche/droit + intelligences multiples
SETS.studio = () => {
  const B = studioBase(); const { scene, cam } = B;
  const rig = claudeRig(scene, [-0.9, 0, 1.6], 0.35, [0.6, 0, -0.2], 0x55e6ff, 0.5, 0.3); rig.pr.visible = false;
  const br = makeBrain(0x55e6ff, { holo: true, side: [0x4a8aff, 0xff8a4a] }); br.scale.setScalar(1.5); br.position.set(0.15, 1.75, 0); scene.add(br);
  const lab = (t_, c, x) => { const l = label(t_, { w: 0.9, h: 0.2, color: c, font: 'bold 120px Inter' }); l.position.set(x, 2.55, 0.2); scene.add(l); return l; };
  const lg = lab('LOGIQUE', '#7ab0ff', -0.35), lc = lab('CRÉATIF', '#ffa070', 0.65);
  const stamp = card('MYTHE', { w: 1.0, h: 0.36, border: '#ff4a4a', color: '#ff6a5a', bg: 'rgba(30,6,6,0.85)' }); scene.add(stamp);
  const words = ['les mots', 'les nombres', 'la musique', 'le corps', 'l\'espace', 'les autres', 'soi-même', 'la nature'];
  const ring = words.map((w, i) => { const a = Math.PI / 2 - i / 8 * Math.PI * 2; const l = label(w, { w: 0.7, h: 0.16, color: ['#ffe070', '#55e6ff', '#ff9ad0', '#ff8a5a', '#9ad0ff', '#7dffb0', '#b08aff', '#8aff7a'][i], font: 'bold 110px Inter' }); l.position.set(0.15 + Math.cos(a) * 0.62, 1.75 + Math.sin(a) * 1.0, 0.3); scene.add(l); return l; });
  const g0 = C.gardner, g1 = subAt('Later, he added');
  const gtimes = words.map((w, i) => i < 7 ? g0 + 3.8 + i * (g1 - g0 - 4.2) / 7 : g1);
  const K = cardsMgr(scene, cam);
  K('2013 · Université de l\'Utah\nplus de 1 000 cerveaux étudiés', { w: 1.6, h: 0.42, border: '#55e6ff', small: true }, t => win(t, C.myth, C.myth + 4.5, 0.3, 0.2), -0.62);
  K('HOWARD GARDNER · 1983\nles intelligences multiples (une théorie)', { w: 1.6, h: 0.42, border: '#b08aff', small: true }, t => win(t, g0, g0 + 3.6, 0.3, 0.2), -0.62);
  K('une théorie encore débattue', { w: 1.6, h: 0.3, border: '#b08aff' }, t => win(t, C.debate, C.debate + 2.6, 0.3, 0.2), -0.62);
  K('on peut briller de mille façons', { w: 1.6, h: 0.3, border: '#ffe070' }, t => win(t, C.debate + 2.6, SC.final.start, 0.3, 0.2), -0.62);
  const mats = br.userData.hem.map(h => h.userData.mats);
  return {
    ...B, update(t) {
      rig.c.update(t, env('claude', t), {});
      br.rotation.y = 0.4 * Math.sin(t * 0.4);
      const split = sstep(SC.studio.start + 1.0, SC.studio.start + 1.6, t) * (1 - sstep(C.myth + 3.4, C.myth + 4.4, t));
      br.userData.hem.forEach((h, i) => { h.position.x = (i ? 1 : -1) * (0.25 + 0.25 * split); h.traverse(m => { if (m.material?.color) m.material.color.setHex(split > 0.05 ? (i ? 0xff8a4a : 0x4a8aff) : 0xb08aff).multiplyScalar(m.isLineSegments ? 2.2 : 1); }); });
      fade(lg, split); fade(lc, split);
      fade(stamp, win(t, C.myth + 3.6, C.gardner - 0.3, 0.15, 0.3)); camCard(cam, stamp, 0.5, 0.12); stamp.rotation.z = -0.12;
      ring.forEach((l, i) => fade(l, sstep(gtimes[i], gtimes[i] + 0.4, t) * (1 - sstep(SC.final.start - 0.4, SC.final.start, t))));
      const T0 = SC.studio.start;
      camKeys(cam, t, [{ t: T0, p: [0.15, 1.9, 4.6], l: [0.15, 1.75, 0], f: 44 }, { t: C.gardner, p: [0.15, 1.8, 4.2], l: [0.15, 1.7, 0], f: 44 }, { t: C.gardner + 0.01, p: [0.15, 1.75, 5.4], l: [0.15, 1.6, 0], f: 46 }, { t: SC.final.start, p: [-0.3, 1.7, 5.6], l: [0.15, 1.6, 0], f: 46 }]);
      if (typeof K !== 'undefined') K.update(t);
    }
  };
};

// ---------- final : tous differents
SETS.final = () => {
  const B = base({ sky: [0x3a4a9a, 0xffb080, 0xe08a8a], fog: [0xd8a0a0, 20, 90], hemi: [0xffe0d0, 0x4a3a5a, 1.0], sun: [0xffc090, 1.8, [-6, 6, 4]], shadowSize: 8, bloom: [0.45, 0.5, 0.85], exposure: 1.15 });
  const { scene, cam } = B;
  scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 0.1, 32), M(0xb8a898)), 0, -0.05, 0));
  for (let i = 0; i < 8; i++) { const tr = tree(i + 40); tr.scale.multiplyScalar(2.2); const a = i / 8 * Math.PI * 2 + 0.3; tr.position.set(Math.cos(a) * 6, 0, Math.sin(a) * 6 - 2); scene.add(tr); }
  const ppl = [AWA, HUGO, MALIK, MEI].map((lk, i) => { const h = new Human(lk); const a = Math.PI * (0.8 - i * 0.2); h.place(Math.cos(a) * 2.0, 0, -Math.sin(a) * 1.2 + 0.4, -Math.cos(a) * 0.5); scene.add(h.root); return h; });
  const rig = claudeRig(scene, [0, 0, 1.2], 0, [0.42, 0, 0.0], 0x55e6ff, 0.6, 0.3);
  const brains = [0xD97757, 0x55c8ff, 0xb08aff].map((c, i) => { const b = makeBrain(c); b.scale.setScalar(0.45); b.position.set(-0.75 + i * 0.75, 2.55, -0.4); b.rotation.y = -0.6 + i * 0.6; scene.add(b); return b; });
  const bub = ppl.map((h, i) => { const b = bubble([0xf0d040, 0x3a8a5a, 0xd03030, 0x8a5ad0][i], 0.26); b.position.copy(h.root.position).add(new THREE.Vector3(0.25, 2.1, 0)); scene.add(b); return b; });
  const items = [label('mots', { w: 0.36, h: 0.12, color: '#ffe070', font: 'bold 110px Inter' }), (() => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.07), G(0xff7a5a, 1.5))); g.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 6, 16), G(0x55e6ff, 1.5)), 0.1, 0.05, 0)); return g; })(), bolt(), turtle()];
  items[2].scale.setScalar(0.5); items[3].scale.setScalar(0.6); items[3].rotation.x = 0.6;
  items.forEach((it, i) => bub[i].userData.inner.add(it));
  const apple = makeApple(0.7); scene.add(apple);
  const K = cardsMgr(scene, cam);
  K('NEURODIVERSITÉ\ndes difficultés et des forces', { w: 1.6, h: 0.42, border: '#55e6ff', small: true }, t => win(t, SC.final.start + 3.0, C.apple, 0.3, 0.2), -0.62);
  K('PROCHAIN ÉPISODE\nle jour où la Joconde a disparu', { w: 1.6, h: 0.42, border: '#D97757', small: true }, t => win(t, C.next, TL.duration, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      ppl.forEach((h, i) => { h.pose({ hp: -0.05, hy: 0.1 * Math.sin(t * 0.6 + i), py: 0.88 + 0.006 * Math.sin(t * 1.5 + i) }); h.face(0, 'happy', t); });
      rig.c.update(t, env('claude', t), { wave: sstep(C.question, C.question + 0.5, t) }); beamOn(rig, 1, t);
      brains.forEach((b, i) => { b.rotation.y = -Math.PI / 2 + 0.25 * Math.sin(t * 0.7 + i); b.position.y = 2.55 + 0.05 * Math.sin(t * 1.5 + i); fade(b, 1 - sstep(C.apple - 0.5, C.apple, t)); });
      bub.forEach((b, i) => { const k = sstep(C.apple - 0.6 + i * 0.25, C.apple + i * 0.25, t); b.visible = k > 0.01; b.scale.setScalar(k); });
      // la pomme passe d'une bulle a l'autre
      const u = clamp((t - C.apple - 1.0) / (C.question - C.apple - 1.2), 0, 1) * 3, j = Math.min(2, Math.floor(u)), f = sstep(0, 1, u - j);
      const A = bub[j].position, Bp = bub[j + 1].position;
      apple.position.set(lerp(A.x, Bp.x, f), lerp(A.y, Bp.y, f) + 0.5 * Math.sin(f * Math.PI) + 0.35, lerp(A.z, Bp.z, f) + 0.1); apple.rotation.y = t * 2;
      fade(apple, win(t, C.apple + 0.6, C.question + 1.0, 0.3, 0.4));
      items[0].rotation.z = 0.1 * Math.sin(t); items[1].rotation.y = t; items[2].rotation.y = t * 2; items[3].rotation.y = t * 0.7;
      const T0 = SC.final.start;
      camKeys(cam, t, [{ t: T0, p: [0, 2.7, 3.2], l: [0, 2.5, -0.4], f: 44 }, { t: T0 + 3.0, p: [0, 2.3, 6.8], l: [0, 1.7, -0.2], f: 50 }, { t: C.apple, p: [0, 2.2, 7.2], l: [0, 1.7, -0.2], f: 50 }, { t: C.question, p: [0.4, 1.3, 3.6], l: [0.2, 0.9, 1.0], f: 46 }, { t: TL.duration, p: [0.4, 1.15, 3.1], l: [0.2, 0.8, 1.1], f: 46 }]);
      if (typeof K !== 'undefined') K.update(t);
    }
  };
};

// ---------- couverture : trois cerveaux
SETS.cover = () => {
  const B = studioBase({ hemi: [0xc0c8e8, 0x2a2a3a, 1.1], bloom: [0.7, 0.6, 0.7] }); const { scene, cam } = B;
  const brains = [0xD97757, 0x55c8ff, 0xb08aff].map((c, i) => { const b = makeBrain(c); b.position.set([-0.62, 0.62, 0][i], [2.85, 2.85, 2.2][i], [0, 0, 0.3][i]); b.rotation.set(0.1, -Math.PI / 2 + (i - 1) * 0.3, 0); b.scale.setScalar(0.58); scene.add(b); return b; });
  for (let i = 0; i < 40; i++) { const o = new THREE.Mesh(new THREE.OctahedronGeometry(0.02 + hash(i) * 0.03), G([0xD97757, 0x55c8ff, 0xb08aff][i % 3], 2)); o.position.set((hash(i * 3) - 0.5) * 3.2, 0.8 + hash(i * 5) * 2.6, (hash(i * 7) - 0.5) * 1.5); scene.add(o); }
  return { ...B, update(t) { cam.position.set(0, 2.0, 4.2); cam.fov = 46; cam.updateProjectionMatrix(); cam.lookAt(0, 1.75, 0); } };
};

const SHOTS = [
  ['intro', 0, SC.cafe.start], ['cafe', SC.cafe.start, SC.parc.start], ['parc', SC.parc.start, SC.stade.start],
  ['stade', SC.stade.start, SC.studio.start], ['studio', SC.studio.start, SC.final.start], ['final', SC.final.start, 1000], ['cover', 1000, 1e9],
];
