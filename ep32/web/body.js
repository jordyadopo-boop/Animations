const SETS = {};
// ---------- helpers
function card(text, o = {}) {
  const w = o.w ?? 2.2, h = o.h ?? 0.42, c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * h / w);
  const g = c.getContext('2d');
  g.fillStyle = o.bg ?? 'rgba(8,10,20,0.82)'; g.strokeStyle = o.border ?? '#e0b070'; g.lineWidth = 8;
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
function faceLight(scene, pos, k = 1.6, c = 0xfff0e0, d = 4) { const l = new THREE.PointLight(c, k, d, 1.2); l.position.set(...pos); scene.add(l); return l; }

// ---------- l'espace
function spaceBase(o = {}) {
  const B = base({ bg: 0x020308, hemi: [0x8090c0, 0x050508, o.hemiK ?? 0.35], sun: o.sun ?? [0xfff4e0, 2.0, [3, 4, 5]], shadow: false, bloom: o.bloom ?? [0.7, 0.5, 0.75], exposure: o.exposure ?? 1.0 });
  B.scene.add(L.stars(1500, 300, 1.4));
  return B;
}
function asteroid(scene, pos, s = 1) {
  const geo = new THREE.IcosahedronGeometry(0.6, 1); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const k = 0.85 + 0.3 * hash(Math.round(p.getX(i) * 9) * 7 + Math.round(p.getY(i) * 9) * 13 + Math.round(p.getZ(i) * 9)); p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.45, p.getZ(i) * k); }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, M(0x5a5560)); m.position.set(...pos); m.scale.setScalar(s); scene.add(m); return m;
}
function claudeOnRock(scene, pos, ry = 0, color = 0x55e6ff) {
  asteroid(scene, [pos[0], pos[1] - 0.12, pos[2]], 0.55);
  return claudeRig(scene, pos, ry, [0.42, 0, 0.0], color, 0.45, 0.28);
}
// le Soleil : boule eblouissante + halo
function makeSun(R = 1) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(R, 3), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc060).multiplyScalar(1.15) })));
  const glow = (k, op) => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, `rgba(255,220,150,${op})`); gr.addColorStop(0.25, `rgba(255,170,80,${op * 0.6})`); gr.addColorStop(0.6, `rgba(255,120,40,${op * 0.18})`); gr.addColorStop(1, 'rgba(255,100,30,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); sp.scale.setScalar(R * k); return sp; };
  const halo = glow(4.2, 0.9), halo2 = glow(9, 0.35); g.add(halo, halo2);
  const light = new THREE.PointLight(0xfff0d8, 3.0, 0, 0); g.add(light);
  g.userData = { halo, light, update(t) { halo.scale.setScalar(R * 4.2 * (1 + 0.04 * Math.sin(t * 3))); halo2.scale.setScalar(R * 9 * (1 + 0.05 * Math.sin(t * 2 + 1))); } };
  return g;
}
// la Terre : ocean bleu, continents verts, calottes blanches, atmosphere
function makeEarth(R = 1, seed = 0) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(R, 3), M(0x2a62b8)));
  for (let i = 0; i < 22; i++) {
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(R * (0.12 + hash(i + seed) * 0.16), 1), M(i % 4 === 3 ? 0xc8a868 : 0x4a9a44));
    const a = hash(i * 3 + seed) * Math.PI * 2, b = (hash(i * 7 + seed) - 0.5) * 2.2;
    c.position.set(Math.cos(a) * Math.cos(b) * R * 0.94, Math.sin(b) * R * 0.94, Math.sin(a) * Math.cos(b) * R * 0.94); c.scale.set(1, 1, 0.3); c.lookAt(0, 0, 0); g.add(c);
  }
  for (const s of [-1, 1]) { const ic = new THREE.Mesh(new THREE.IcosahedronGeometry(R * 0.32, 1), M(0xf4f8ff)); ic.position.y = s * R * 0.86; ic.scale.y = 0.35; g.add(ic); }
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(R * 1.05, 3), holoMat(0x6ac0ff, 0.12)));
  return g;
}
// la Lune : grise, cratere marque d'orange sur la face visible (+x)
function makeMoon(R = 0.3, mark = true) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(R, 2), M(0xb8b4ac)));
  for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.CircleGeometry(R * (0.12 + hash(i) * 0.14), 8), M(0x8a867e, { side: THREE.DoubleSide })); const a = hash(i * 5) * Math.PI * 2, b = (hash(i * 9) - 0.5) * 2.4; const p = new THREE.Vector3(Math.cos(a) * Math.cos(b), Math.sin(b), Math.sin(a) * Math.cos(b)).multiplyScalar(R * 1.005); c.position.copy(p); c.lookAt(p.clone().multiplyScalar(2)); g.add(c); }
  if (mark) { const m = new THREE.Mesh(new THREE.CircleGeometry(R * 0.28, 12), G(0xff9a50, 1.6)); m.position.set(R * 1.01, 0, 0); m.rotation.y = Math.PI / 2; g.add(m); g.userData.mark = m; }
  return g;
}
// trainee de points (n points ; on donne une fonction u -> position)
function makeTrail(n, color, size = 0.05, op = 0.9) {
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ size, color: new THREE.Color(color).multiplyScalar(1.4), transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending }));
  p.frustumCulled = false;
  p.userData.set = (fn, count = n) => { const a = geo.attributes.position.array; for (let i = 0; i < count; i++) { const v = fn(i / Math.max(1, n - 1)); a[i * 3] = v[0]; a[i * 3 + 1] = v[1]; a[i * 3 + 2] = v[2]; } geo.setDrawRange(0, count); geo.attributes.position.needsUpdate = true; };
  return p;
}
// cercle d'orbite
function ring(r, color, op = 0.35, th = 0.012) { const m = new THREE.Mesh(new THREE.TorusGeometry(r, th, 4, 128), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.4), transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); m.rotation.x = Math.PI / 2; return m; }
// fleche (origine, direction unitaire, longueur)
function arrow(color, th = 0.04) {
  const g = new THREE.Group(), mat = G(color, 1.6);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(th, th, 1, 6), mat); sh.position.y = 0.5; g.add(sh);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(th * 2.6, th * 6, 8), mat); g.add(tip);
  g.userData.set = (o, dir, len) => { g.position.copy(o); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()); sh.scale.y = len - th * 5; sh.position.y = (len - th * 5) / 2; tip.position.y = len - th * 3; };
  return g;
}
// cylindre unitaire tendu entre a et b (marges ma, mb)
function orient(m, a, b, ma = 1.05, mb = 0.32) { const d = b.clone().sub(a), L = d.length(); d.normalize(); m.scale.y = L - ma - mb; m.position.copy(a).addScaledVector(d, ma + (L - ma - mb) / 2); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); }
const lbl = (s, color, w = 1.2, h = 0.22, px = 150) => label(s, { w, h, color, font: `bold ${px}px Inter` });
// petit dinosaure (hologramme)
function makeDino(color) {
  const g = new THREE.Group(), m = holoMat(color, 0.22);
  g.add(at(box(0.5, 0.3, 0.9, m), 0, 0.5, 0));
  const neck = box(0.14, 0.7, 0.16, m); neck.position.set(0, 0.85, 0.5); neck.rotation.x = 0.6; g.add(neck);
  g.add(at(box(0.18, 0.14, 0.28, m), 0, 1.15, 0.78));
  const tail = box(0.12, 0.12, 0.9, m); tail.position.set(0, 0.55, -0.8); tail.rotation.x = -0.2; g.add(tail);
  for (const [x, z] of [[-0.18, 0.3], [0.18, 0.3], [-0.18, -0.3], [0.18, -0.3]]) g.add(at(box(0.1, 0.38, 0.1, m), x, 0.19, z));
  return g;
}

// ---------- intro : le Soleil fonce et emporte ses planetes
SETS.intro = () => {
  const B = spaceBase({ hemiK: 0.25, sun: [0xfff4e0, 0.2, [3, 4, 5]], bloom: [0.45, 0.4, 0.85] }); const { scene, cam } = B;
  const sys = new THREE.Group(); scene.add(sys);
  const sun = makeSun(0.7); sys.add(sun);
  const tilt = new THREE.Group(); tilt.rotation.x = 1.0; sys.add(tilt);
  const earth = makeEarth(0.18); tilt.add(earth); const moon = makeMoon(0.05, false); tilt.add(moon);
  tilt.add(ring(2.2, 0x7dd8ff, 0.25));
  const trailE = makeTrail(400, 0x7dd8ff, 0.05); scene.add(trailE);
  const trailS = makeTrail(200, 0xffb060, 0.09); scene.add(trailS);
  // poussieres proches : donnent l'impression de vitesse
  const dust = new THREE.Group(); scene.add(dust);
  for (let i = 0; i < 260; i++) dust.add(at(new THREE.Mesh(new THREE.OctahedronGeometry(0.015 + hash(i) * 0.02), G(0xc8d8ff, 0.9)), (hash(i * 3) - 0.5) * 16, (hash(i * 5) - 0.5) * 10, -30 + hash(i * 7) * 70));
  const K = cardsMgr(scene, cam);
  K('≈ 830 000 km/h', { w: 1.6, h: 0.32, border: '#ffd070', color: '#ffd070' }, t => win(t, 3.0, C.title - 0.2, 0.4, 0.3), 0.2, 0.7);
  const V = 1.6; // vitesse du Soleil (unites / s), le long de +z
  const posE = (tt) => { const a = tt * 1.1; const v = new THREE.Vector3(Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2).applyEuler(tilt.rotation); return [v.x, v.y, v.z + V * tt]; };
  return {
    ...B, update(t) {
      sys.position.set(0, 0, V * t); sun.userData.update(t);
      const a = t * 1.1; earth.position.set(Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2); earth.rotation.y = t;
      const b = t * 5; moon.position.set(earth.position.x + Math.cos(b) * 0.4, 0, earth.position.z + Math.sin(b) * 0.4);
      trailE.userData.set(u => posE(t - 7 * (1 - u)));
      trailS.userData.set(u => [0, 0, V * (t - 7 * (1 - u))]);
      const z = V * t;
      camKeys(cam, t, [{ t: 0, p: [4.5, 2.2, z + 5.5], l: [0, 0, z], f: 50 }, { t: C.title, p: [5.5, 3.0, z + 3.5], l: [0, 0, z], f: 50 }, { t: SC.canon.start, p: [6.0, 3.4, z + 2.5], l: [0, 0, z], f: 50 }]);
      cam.position.set(lerp(7, 8, sstep(0, SC.canon.start, t)), lerp(3.5, 4.5, sstep(0, SC.canon.start, t)), z + lerp(9, 5, sstep(0, SC.canon.start, t))); cam.lookAt(0, 0.3, z);
      K.update(t);
    }
  };
};

// ---------- le canon de Newton
SETS.canon = () => {
  const B = spaceBase({ hemiK: 0.7, sun: [0xfff4e0, 1.8, [1, 3, 6]], bloom: [0.6, 0.5, 0.8] }); const { scene, cam } = B;
  const R = 3; const planet = makeEarth(R, 7); planet.rotation.y = -0.6; scene.add(planet);
  const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.9, 1.0, 7), M(0x7a6a5a)); mount.position.y = R + 0.4; scene.add(mount);
  const snow = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.42, 0.25, 7), M(0xb8bcc4)); snow.position.y = R + 0.78; scene.add(snow);
  const TOP = R + 0.9;
  const nw = new Human({ skin: 0xf0c8a8, hair: 0xe8e2d8, hairStyle: 'long', top: 0xe8e0d0, bottom: 0x3a2a20, jacket: 0x5a2a1e, h: 0.25, seed: 3201 });
  nw.place(-0.2, TOP, 0.05, 0.25); scene.add(nw.root);
  // canon
  const cn = new THREE.Group(); cn.position.set(0.06, TOP, 0); scene.add(cn);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.26, 10), M(0x2a2a2e)); barrel.rotation.z = -Math.PI / 2; barrel.position.set(0.1, 0.08, 0); cn.add(barrel);
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 10), M(0x6a4428)); w.rotation.x = Math.PI / 2; w.position.set(0.04, 0.05, s * 0.05); cn.add(w); }
  cn.add(at(box(0.16, 0.04, 0.08, M(0x6a4428)), 0.04, 0.05, 0));
  const muzzle = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 1), G(0xffb050, 2.5)); muzzle.position.set(0.48, TOP + 0.08, 0); scene.add(muzzle);
  faceLight(scene, [-0.2, TOP + 0.5, 0.7], 0.5, 0xfff0d8, 1.2);
  // trajectoires (calcul physique simple)
  const r0 = TOP + 0.08, vc = 2 * Math.PI * r0 / 6, GM = vc * vc * r0, dt = 0.004;
  function shoot(v) { const P = []; let x = 0.25, y = r0, vx = v, vy = 0; for (let k = 0; k < 4000; k++) { const r = Math.hypot(x, y); if (r < R + 0.02 && k > 5) break; const a = -GM / (r * r * r); vx += a * x * dt; vy += a * y * dt; x += vx * dt; y += vy * dt; P.push([x, y, 0]); } return P; }
  const paths = [shoot(0.42 * vc), shoot(0.8 * vc), shoot(vc * 1.0)];
  const shots = [[C.tir1, 0.55], [C.tir2, 0.55], [C.tir3, 1.0]];
  const balls = paths.map(() => { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 1), G(0xff6a4a, 2)); scene.add(b); return b; });
  const trails = paths.map((p, i) => { const tr = makeTrail(300, [0xffd070, 0xffa060, 0xff5a4a][i], 0.06); scene.add(tr); return tr; });
  const ga = arrow(0xff6a5a, 0.07), va = arrow(0x7dd8ff, 0.07); scene.add(ga, va);
  const lg = lbl('gravité', '#ff8a7a', 2.0, 0.45, 150), lv = lbl('vitesse', '#9adfff', 2.0, 0.45, 150); scene.add(lg, lv);
  const K = cardsMgr(scene, cam);
  K('Principia (1687) : un boulet tiré\ndu haut d\'une montagne', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.canon.start + 2.8, C.tir1 - 0.1, 0.3, 0.2), -0.55);
  imagined(K, 'répliques imaginées', C.tir1, C.tir3);
  K('≈ 7,9 km/s au ras du sol\n(sans l\'air pour freiner)', { w: 1.6, h: 0.42, border: '#ff9a6a', small: true }, t => win(t, C.tir3 + 1.2, C.orbite - 0.1, 0.3, 0.2), -0.55);
  K('une orbite = une chute sans fin', { w: 1.6, h: 0.28, border: '#7dd8ff' }, t => win(t, C.orbite + 0.3, SC.lune.start, 0.3, 0.2), -0.55);
  const at3 = (i, t) => { const [t0, k] = shots[i]; const n = Math.floor(Math.max(0, t - t0 - 0.15) * k / dt); const P = paths[i]; return i === 2 ? P[n % P.length] : P[Math.min(n, P.length - 1)]; };
  return {
    ...B, update(t) {
      const T0 = SC.canon.start;
      const talk = env('newton', t);
      nw.pose({ aL: [0.4 + 0.6 * talk, 0.3], eL: 0.5, aR: [0.3, 0.15], hy: 0.15 }); nw.face(talk, 'happy', t);
      planet.rotation.y = -0.6;
      let fl = 0;
      shots.forEach(([t0], i) => {
        fl = Math.max(fl, win(t, t0 - 0.15, t0 + 0.25, 0.05, 0.2));
        const shown = t > t0 - 0.15 && (i === 2 || t < (shots[i + 1]?.[0] ?? 1e9) + 0.6);
        balls[i].visible = shown; trails[i].visible = shown;
        if (!shown) return;
        const [t0_, k] = shots[i]; const n = Math.floor(Math.max(0, t - t0_ - 0.15) * k / dt); const P = paths[i];
        const p = at3(i, t); balls[i].position.set(...p);
        const cnt = i === 2 ? Math.min(P.length, n) : Math.min(P.length, n);
        const step = Math.max(1, Math.ceil(Math.min(cnt, P.length) / 300)), m = Math.max(1, Math.min(300, Math.floor(cnt / step)));
        trails[i].userData.set(u => P[Math.min(P.length - 1, Math.floor(u * (m - 1)) * step)] ?? P[0], m);
      });
      muzzle.visible = fl > 0.02; muzzle.scale.setScalar(0.3 + 1.2 * fl);
      // fleches pendant l'orbite
      const ak = sstep(C.orbite, C.orbite + 0.5, t);
      const p = new THREE.Vector3(...at3(2, t)), toC = p.clone().multiplyScalar(-1).normalize(), tan = new THREE.Vector3(toC.y, -toC.x, 0);
      ga.userData.set(p, toC, 1.7); va.userData.set(p, tan, 1.7); fade(ga, ak); fade(va, ak);
      fade(lg, ak); fade(lv, ak); lg.position.copy(p).addScaledVector(toC, 2.1).add(new THREE.Vector3(0.9, 0, 0)); lv.position.copy(p).addScaledVector(tan, 2.4); lg.lookAt(cam.position); lv.lookAt(cam.position);
      camKeys(cam, t, [{ t: T0, p: [0.0, TOP + 0.32, 1.8], l: [-0.02, TOP + 0.17, 0], f: 40 }, { t: C.tir1 - 0.3, p: [0.02, TOP + 0.3, 1.6], l: [0.0, TOP + 0.16, 0], f: 40 }, { t: C.tir2 - 0.2, p: [1.5, TOP - 0.2, 6.5], l: [1.2, TOP - 1.2, 0], f: 46 }, { t: C.tir3, p: [0.5, 1.0, 16], l: [0, 0.6, 0], f: 50 }, { t: SC.lune.start, p: [0, 0.8, 17], l: [0, 0.4, 0], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- la Lune tombe autour de la Terre
SETS.lune = () => {
  const B = spaceBase({ hemiK: 0.3, sun: [0xfff4e0, 2.2, [6, 2, 3]] }); const { scene, cam } = B;
  const earth = makeEarth(1.0, 3); scene.add(earth);
  const RM = 4.0, moon = makeMoon(0.42); scene.add(moon);
  const orb = ring(RM, 0xd0d0d0, 0.25); scene.add(orb);
  const line = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1, 6), holoMat(0xff9a50, 0.6)); scene.add(line);
  const ld = lbl('384 000 km', '#ffd070', 1.4, 0.24, 150); scene.add(ld);
  const lsp = lbl('≈ 1 km/s', '#9adfff', 1.0, 0.22, 150); scene.add(lsp);
  const lday = label('', { w: 2.4, h: 0.45 }); scene.add(lday);
  const dayC = document.createElement('canvas'); dayC.width = 512; dayC.height = 96; const dayT = new THREE.CanvasTexture(dayC); dayT.colorSpace = THREE.SRGBColorSpace; lday.material.map = dayT;
  let lastDay = -1;
  const rig = claudeOnRock(scene, [-1.0, -2.4, 3.4], 0.4, 0xffd070); rig.pr.visible = false;
  faceLight(scene, [-0.7, -1.7, 4.8], 1.4, 0xfff0d8);
  const K = cardsMgr(scene, cam);
  K('distances et tailles pas à l\'échelle', { w: 1.2, h: 0.18, border: '#888888', color: '#cccccc' }, t => win(t, SC.lune.start + 0.5, C.face - 0.2, 0.3, 0.2), -0.68, 0.5);
  K('rotation synchrone : un tour sur elle-même\n= un tour autour de la Terre', { w: 1.6, h: 0.42, border: '#ff9a50', small: true }, t => win(t, C.face + 0.8, SC.terre.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.lune.start, P = 9.0; const a = (t - T0) / P * Math.PI * 2 + 0.4;
      moon.position.set(Math.cos(a) * RM, 0, -Math.sin(a) * RM); moon.rotation.y = a + Math.PI; // la face marquee regarde la Terre
      earth.rotation.y = t * 0.3;
      const fk = sstep(C.face - 0.3, C.face + 0.3, t);
      orient(line, new THREE.Vector3(), moon.position);
      fade(line, fk);
      fade(ld, win(t, T0 + 2.5, C.face - 0.2, 0.3, 0.3)); ld.position.set(0.2, 1.5, 0); ld.lookAt(cam.position);
      fade(lsp, win(t, T0 + 5.0, C.face - 0.2, 0.3, 0.3)); lsp.position.copy(moon.position).add(new THREE.Vector3(0, 0.65, 0)); lsp.lookAt(cam.position);
      const dk = win(t, T0 + 7.5, C.face - 0.2, 0.3, 0.3); fade(lday, dk);
      const day = Math.min(27.3, ((t - (T0 + 7.5)) / P) * 27.3 * 1.6); const dv = Math.max(0, day).toFixed(1).replace('.', ',');
      if (dv !== lastDay) { lastDay = dv; const g = dayC.getContext('2d'); g.clearRect(0, 0, 512, 96); g.font = 'bold 72px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.shadowColor = '#ffffff'; g.shadowBlur = 12; g.fillText(dv + ' jours', 256, 48); dayT.needsUpdate = true; }
      lday.position.set(0, -1.6, 0); lday.lookAt(cam.position);
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0, 5.5, 11], l: [0, -0.3, 0], f: 50 }, { t: C.face, p: [0.5, 4.2, 10], l: [0, -0.5, 0], f: 50 }, { t: SC.terre.start, p: [0.5, 8.0, 7], l: [0, -0.5, 0], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- la Terre tombe autour du Soleil
SETS.terre = () => {
  const B = spaceBase({ hemiK: 0.25, sun: [0xffffff, 0.0, [0, 1, 0]] }); const { scene, cam } = B;
  const sun = makeSun(1.1); scene.add(sun);
  const RE = 5.5; scene.add(ring(RE, 0x7dd8ff, 0.3));
  const earth = makeEarth(0.35, 5); scene.add(earth); const moon = makeMoon(0.1, false); scene.add(moon);
  const trail = makeTrail(220, 0x7dd8ff, 0.07); scene.add(trail);
  const ld = lbl('150 millions de km', '#ffd070', 3.4, 0.42, 96); scene.add(ld);
  const rad = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1, 6), holoMat(0xffd070, 0.6)); scene.add(rad);
  const dayC = document.createElement('canvas'); dayC.width = 512; dayC.height = 96; const dayT = new THREE.CanvasTexture(dayC); dayT.colorSpace = THREE.SRGBColorSpace;
  const lday = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.45), new THREE.MeshBasicMaterial({ map: dayT, transparent: true, depthWrite: false, toneMapped: false })); scene.add(lday); let last = '';
  const K = cardsMgr(scene, cam);
  K('≈ 30 km/s\n≈ 107 000 km/h', { w: 1.4, h: 0.42, border: '#7dd8ff', small: true }, t => win(t, SC.terre.start + 7.5, SC.eclipse.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.terre.start, D = SC.eclipse.start - T0; sun.userData.update(t);
      const u = clamp((t - T0 - 1.0) / (D - 1.5), 0, 1), a = u * Math.PI * 2 + 0.3;
      const ep = (aa) => [Math.cos(aa) * RE, 0, -Math.sin(aa) * RE];
      earth.position.set(...ep(a)); earth.rotation.y = t * 2;
      const b = t * 4; moon.position.set(earth.position.x + Math.cos(b) * 0.7, 0, earth.position.z + Math.sin(b) * 0.7);
      trail.userData.set(v => ep(0.3 + (a - 0.3) * v));
      const lk = win(t, T0 + 2.0, T0 + 7.5, 0.3, 0.3); fade(ld, lk); fade(rad, lk);
      orient(rad, new THREE.Vector3(), earth.position, 1.3, 0.45);
      ld.position.set(0, 2.2, 0); ld.lookAt(cam.position);
      const days = String(Math.round(u * 365)); if (days !== last) { last = days; const g = dayC.getContext('2d'); g.clearRect(0, 0, 512, 96); g.font = 'bold 72px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.shadowColor = '#7dd8ff'; g.shadowBlur = 14; g.fillText('jour ' + days, 256, 48); dayT.needsUpdate = true; }
      lday.position.copy(earth.position).add(new THREE.Vector3(0, 0.75, 0)); lday.lookAt(cam.position); fade(lday, sstep(T0 + 0.8, T0 + 1.2, t));
      camKeys(cam, t, [{ t: T0, p: [0, 9, 12], l: [0, 0, 0], f: 52 }, { t: SC.eclipse.start, p: [-2, 11, 10], l: [0, 0, 0], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- pourquoi pas une eclipse chaque mois
SETS.eclipse = () => {
  const B = spaceBase({ hemiK: 0.25, sun: [0xffffff, 0.0, [0, 1, 0]] }); const { scene, cam } = B;
  const sun = makeSun(1.1); sun.position.set(-4.8, 0, 0); scene.add(sun);
  const earth = makeEarth(0.45, 2); earth.position.set(1.6, 0, 0); scene.add(earth);
  const tilt = new THREE.Group(); tilt.position.copy(earth.position); tilt.rotation.z = 0.26; scene.add(tilt); // inclinaison exageree
  const orb = ring(1.5, 0xd0d0d0, 0.5, 0.02); tilt.add(orb);
  const moon = makeMoon(0.16, false); tilt.add(moon);
  const flat = ring(1.5, 0xffd070, 0.3, 0.015); flat.position.copy(earth.position); scene.add(flat);
  const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 9, 6), holoMat(0xffd070, 0.6)); axis.rotation.z = Math.PI / 2; axis.position.set(-1.0, 0, 0); scene.add(axis);
  const l5 = lbl('≈ 5°', '#ffffff', 2.2, 0.7, 180); scene.add(l5);
  const la = lbl('ligne Soleil-Terre', '#ffd070', 3.4, 0.42, 110); la.position.set(-1.6, -0.6, 0); scene.add(la);
  const K = cardsMgr(scene, cam);
  K('inclinaison exagérée sur l\'image', { w: 1.2, h: 0.18, border: '#888888', color: '#cccccc' }, t => win(t, SC.eclipse.start + 3.0, SC.galaxie.start, 0.3, 0.2), -0.68, 0.5);
  return {
    ...B, update(t) {
      const T0 = SC.eclipse.start; sun.userData.update(t);
      const a = (t - T0) * 0.9 + 2.6; moon.position.set(Math.cos(a) * 1.5, 0, -Math.sin(a) * 1.5);
      earth.rotation.y = t;
      fade(l5, win(t, T0 + 3.5, SC.galaxie.start, 0.3, 0.2)); l5.position.set(1.6, 1.25, 0.3); l5.lookAt(cam.position);
      fade(la, sstep(T0 + 5.5, T0 + 6.0, t)); la.lookAt(cam.position);
      camKeys(cam, t, [{ t: T0, p: [-1.4, 2.0, 16], l: [-1.4, 0, 0], f: 50 }, { t: SC.galaxie.start, p: [-1.0, 1.0, 15], l: [-1.2, 0, 0], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- le Soleil tombe autour du centre de la Voie lactee
SETS.galaxie = () => {
  const B = spaceBase({ hemiK: 0.3, bloom: [0.9, 0.6, 0.6] }); const { scene, cam } = B;
  const gal = new THREE.Group(); scene.add(gal);
  const N = 9000, geo = new THREE.BufferGeometry(), pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const arm = i % 2, r = 0.3 + 9.5 * Math.pow(hash(i * 1.37), 0.9), sp = (hash(i * 2.9) - 0.5) * (0.5 + 0.25 * r) * 0.5;
    const a = arm * Math.PI + Math.log(r) * 2.3 + sp / Math.max(0.6, r) * 3 + (hash(i * 4.1) - 0.5) * 0.35;
    const h = (hash(i * 6.3) - 0.5) * 0.35 * Math.exp(-r / 4);
    pos.set([Math.cos(a) * r, h, Math.sin(a) * r], i * 3);
    const c = new THREE.Color().setHSL(r < 2 ? 0.1 : 0.6 - 0.05 * hash(i), 0.6, 0.55 + 0.25 * hash(i * 9));
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  gal.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending })));
  const bulge = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffd8a0, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })); bulge.scale.y = 0.45; gal.add(bulge);
  const RS = 6.2; const orb = ring(RS, 0xff6a4a, 0.5, 0.025); scene.add(orb);
  const sunDot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 1), G(0xffd070, 3)); scene.add(sunDot);
  const lS = lbl('Soleil', '#ffd070', 1.6, 0.4, 160); scene.add(lS);
  const lC = lbl('centre de la Voie lactée', '#ffffff', 3.6, 0.4, 110); lC.position.set(0, 2.0, 0); scene.add(lC);
  const dino = makeDino(0x7dffb0); dino.scale.setScalar(0.8); scene.add(dino);
  const K = cardsMgr(scene, cam);
  K('≈ 230 km/s\n1 tour ≈ 230 millions d\'années', { w: 1.6, h: 0.42, border: '#ff9a6a', small: true }, t => win(t, SC.galaxie.start + 3.5, C.dinos - 0.1, 0.3, 0.2), -0.55);
  K('il y a ≈ 230 millions d\'années\nles premiers dinosaures', { w: 1.6, h: 0.42, border: '#7dffb0', small: true }, t => win(t, C.dinos + 0.3, SC.fin.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.galaxie.start; gal.rotation.y = -t * 0.04;
      const a = 1.5 - 0.5 * (t - T0) / 13; const sp = new THREE.Vector3(Math.cos(a) * RS, 0, Math.sin(a) * RS);
      sunDot.position.copy(sp); sunDot.scale.setScalar(1 + 0.15 * Math.sin(t * 6));
      fade(lS, sstep(T0 + 1.0, T0 + 1.5, t)); lS.position.copy(sp).add(new THREE.Vector3(0, 0.55, 0)); lS.lookAt(cam.position);
      fade(lC, win(t, T0 + 2.0, C.dinos, 0.4, 0.3)); lC.lookAt(cam.position);
      const dk = sstep(C.dinos, C.dinos + 0.6, t); fade(dino, dk); dino.position.copy(sp).add(new THREE.Vector3(0, 0.9, 0)); dino.rotation.y = t * 0.6;
      camKeys(cam, t, [{ t: T0, p: [0, 14, 17], l: [0, 0, 1], f: 52 }, { t: C.dinos - 0.5, p: [2, 7, 16], l: [1.0, 0, 3], f: 52 }, { t: SC.fin.start, p: [5, 3.5, 12], l: [2.8, 0.6, 5], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- fin : Claude sur son rocher
SETS.fin = () => {
  const B = spaceBase({ hemiK: 0.5, sun: [0xfff4e0, 1.6, [2, 3, 6]] }); const { scene, cam } = B;
  const sun = makeSun(0.5); sun.position.set(0.2, 2.2, -5); scene.add(sun);
  const earth = makeEarth(0.18, 9); scene.add(earth); const moon = makeMoon(0.05, false); scene.add(moon);
  const or = ring(1.6, 0x7dd8ff, 0.25); or.position.copy(sun.position); scene.add(or);
  const rig = claudeOnRock(scene, [0, -0.2, 1.0], 0.0, 0xffd070);
  faceLight(scene, [0, 0.3, 2.2], 1.3, 0xfff0d8);
  const qm = label('?', { w: 0.3, h: 0.3, color: '#ffd070', font: 'bold 300px Inter' }); rig.holoG.add(qm);
  return {
    ...B, update(t) {
      sun.userData.update(t); const a = t * 0.6; earth.position.set(sun.position.x + Math.cos(a) * 1.6, sun.position.y, sun.position.z + Math.sin(a) * 1.6);
      moon.position.set(earth.position.x + Math.cos(t * 3) * 0.3, earth.position.y, earth.position.z + Math.sin(t * 3) * 0.3);
      const qk = sstep(SC.fin.start + 4.5, SC.fin.start + 5.0, t); beamOn(rig, qk, t); fade(qm, qk); qm.lookAt(cam.position);
      rig.c.update(t, env('claude', t), { wave: sstep(TL.duration - 2.0, TL.duration - 1.5, t) });
      camKeys(cam, t, [{ t: SC.fin.start, p: [0.2, 0.7, 4.8], l: [0, 0.6, 0], f: 46 }, { t: TL.duration, p: [0.2, 0.6, 4.0], l: [0, 0.5, 0.5], f: 46 }]);
    }
  };
};

// ---------- couverture : le Soleil en grand, la trainee des planetes
SETS.cover = () => {
  const B = spaceBase({ hemiK: 0.25, sun: [0xfff4e0, 0.2, [3, 4, 5]], bloom: [0.8, 0.5, 0.7] }); const { scene, cam } = B;
  const sun = makeSun(1.0); scene.add(sun);
  const tilt = new THREE.Group(); tilt.rotation.x = 1.0; scene.add(tilt);
  const earth = makeEarth(0.22); tilt.add(earth);
  const V = 1.6, trail = makeTrail(500, 0x7dd8ff, 0.07); scene.add(trail); const trS = makeTrail(200, 0xffb060, 0.12); scene.add(trS);
  return { ...B, update() { const T = 6; sun.userData.update(1); const a = T * 1.1; earth.position.set(Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2);
    trail.userData.set(u => { const tt = T - 8 * (1 - u), b = tt * 1.1; const v = new THREE.Vector3(Math.cos(b) * 2.2, 0, Math.sin(b) * 2.2).applyEuler(tilt.rotation); return [v.x, v.y, v.z + V * (tt - T)]; });
    trS.userData.set(u => [0, 0, V * (-8 * (1 - u))]);
    cam.position.set(5.5, 2.8, 6.5); cam.fov = 50; cam.updateProjectionMatrix(); cam.lookAt(0, -0.9, -1.5); } };
};

const SHOTS = [
  ['intro', 0, SC.canon.start], ['canon', SC.canon.start, SC.lune.start], ['lune', SC.lune.start, SC.terre.start], ['terre', SC.terre.start, SC.eclipse.start],
  ['eclipse', SC.eclipse.start, SC.galaxie.start], ['galaxie', SC.galaxie.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9],
];
