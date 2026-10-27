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
function faceLight(scene, pos, k = 1.6, c = 0xfff0e0, d = 4) { const l = new THREE.PointLight(c, k, d, 1.2); l.position.set(...pos); scene.add(l); return l; }
// Claude geant a cote de la maquette (s = echelle)
function bigClaude(scene, pos, ry, s, color = 0xffd070) {
  const c = L.makeClaude(); c.g.position.set(...pos); c.g.rotation.y = ry; c.g.scale.setScalar(s); scene.add(c.g);
  const pr = L.makeProjector(color, 0.45, 0.28); pr.scale.setScalar(s);
  const off = new THREE.Vector3(0.45 * s, 0, 0.1 * s).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
  pr.position.set(pos[0] + off.x, pos[1], pos[2] + off.z); scene.add(pr);
  const holoG = new THREE.Group(); holoG.position.set(pr.position.x, pr.position.y + (pr.userData.top + 0.25) * s, pr.position.z); holoG.scale.setScalar(s); scene.add(holoG);
  return { c, pr, holoG };
}

// ---------- le Colisee (1 unite = 10 m ; centre de l'arene a l'origine, grand axe selon x)
const AR = [4.0, 2.4], OUT = [9.45, 7.8], HT = 4.8, NST = 22;
const stepAx = (i) => { const u = i / NST; return [lerp(AR[0] + 0.25, OUT[0] - 0.55, u), lerp(AR[1] + 0.25, OUT[1] - 0.55, u), 0.4 + u * 3.9]; };
function ringGeo(a0, b0, y0, a1, b1, y1, seg = 96, th0 = 0, th1 = Math.PI * 2) {
  const pos = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const th = lerp(th0, th1, i / seg), c = Math.cos(th), s = Math.sin(th);
    pos.push(a0 * c, y0, b0 * s, a1 * c, y1, b1 * s);
    if (i < seg) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function ellipseDisc(a, b, rings = 10, seg = 64) { const g = new THREE.RingGeometry(0.001, 1, seg, rings); g.rotateX(-Math.PI / 2); g.scale(a, 1, b); return g; }
function colosseum(o = {}) {
  const g = new THREE.Group();
  const stone = M(0xd8c8a4, { side: THREE.DoubleSide }), stone2 = M(0xc4b28c, { side: THREE.DoubleSide }), dark = M(0x3a3228, { side: THREE.DoubleSide }), marble = M(0xf0ebe0, { side: THREE.DoubleSide });
  // gradins
  for (let i = 0; i < NST; i++) {
    const [a0, b0, y0] = stepAx(i), [a1, b1, y1] = stepAx(i + 1);
    g.add(new THREE.Mesh(ringGeo(a0, b0, y0, a0, b0, y1), i % 7 === 6 ? dark : stone2));
    const tr = new THREE.Mesh(ringGeo(a0, b0, y1, a1, b1, y1), i < 6 ? marble : stone); tr.receiveShadow = true; g.add(tr);
  }
  const [aT, bT, yT] = stepAx(NST);
  g.add(new THREE.Mesh(ringGeo(aT, bT, yT, OUT[0] - 0.3, OUT[1] - 0.3, yT), stone));
  g.add(new THREE.Mesh(ringGeo(OUT[0] - 0.3, OUT[1] - 0.3, yT, OUT[0] - 0.3, OUT[1] - 0.3, HT), stone2));
  g.add(new THREE.Mesh(ringGeo(OUT[0] - 0.3, OUT[1] - 0.3, HT, OUT[0] + 0.05, OUT[1] + 0.05, HT), stone));
  // podium (mur de l'arene)
  g.add(new THREE.Mesh(ringGeo(AR[0], AR[1], 0, AR[0], AR[1], 0.4), marble));
  g.add(new THREE.Mesh(ringGeo(AR[0], AR[1], 0.4, AR[0] + 0.25, AR[1] + 0.25, 0.4), marble));
  // mur interieur sombre derriere les arcades
  g.add(new THREE.Mesh(ringGeo(OUT[0] - 0.5, OUT[1] - 0.5, 0, OUT[0] - 0.5, OUT[1] - 0.5, HT - 0.1), dark));
  // facade : 80 arcades sur 3 niveaux + attique (instancie)
  const NA = 80, piers = [], lint = [], attic = [], wins = [];
  const P = (th) => [OUT[0] * Math.cos(th), OUT[1] * Math.sin(th)], Tg = (th) => Math.atan2(OUT[1] * Math.cos(th), -OUT[0] * Math.sin(th));
  for (let i = 0; i < NA; i++) {
    const th = i / NA * Math.PI * 2, thm = (i + 0.5) / NA * Math.PI * 2;
    const [x, z] = P(th), [xm, zm] = P(thm), r = -Tg(th), rm = -Tg(thm);
    for (let k = 0; k < 3; k++) { piers.push([x, k * 1.1 + 0.5, z, r]); lint.push([xm, k * 1.1 + 0.97, zm, rm]); }
    attic.push([xm, 3.3 + 0.75, zm, rm]); if (i % 2) wins.push([xm, 3.3 + 0.75, zm, rm]);
  }
  const inst = (geo, mat, list) => {
    const m = new THREE.InstancedMesh(geo, mat, list.length); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    list.forEach(([x, y, z, r], i) => { q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r); m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, 1, 1)); m.setMatrixAt(i, m4); });
    m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
  };
  const seg = 2 * Math.PI * Math.sqrt((OUT[0] ** 2 + OUT[1] ** 2) / 2) / NA;
  inst(new THREE.BoxGeometry(seg * 0.34, 1.0, 0.4), stone, piers);
  inst(new THREE.BoxGeometry(seg * 1.02, 0.26, 0.42), stone, lint);
  inst(new THREE.BoxGeometry(seg * 1.03, 1.5, 0.4), stone, attic);
  inst(new THREE.BoxGeometry(seg * 0.25, 0.3, 0.44), dark, wins);
  // sol de l'arene (sable)
  const sand = new THREE.Mesh(ellipseDisc(AR[0], AR[1]), M(0xe2c890)); sand.position.y = 0.01; sand.receiveShadow = true; g.add(sand);
  // foule (instanciee), assise face au centre
  const crowd = [];
  for (let i = 0; i < NST; i += 1) {
    if (i % 7 === 6) continue;
    const [a, b, y0] = stepAx(i), [a1, b1, y1] = stepAx(i + 1), am = (a + a1) / 2 + 0.03, bm = (b + b1) / 2 + 0.03;
    const per = 2 * Math.PI * Math.sqrt((am * am + bm * bm) / 2), n = Math.floor(per / (o.crowdGap ?? 0.075));
    for (let j = 0; j < n; j++) {
      const th = (j + hash(i * 13 + j) * 0.5) / n * Math.PI * 2; const x = am * Math.cos(th), z = bm * Math.sin(th);
      if (o.skip && o.skip(x, y1, z)) continue; if (hash(i * 7.3 + j * 1.1) < 0.12) continue;
      crowd.push([x, y1, z, Math.atan2(-x, -z), hash(i * 3.1 + j * 0.7)]);
    }
  }
  const tunics = [0xf0ece0, 0xe8dcc0, 0xb04a3a, 0x4a6a9a, 0xd8b060, 0x8a9a6a, 0xf4f4f0, 0x7a5a8a].map(c => new THREE.Color(c));
  const skins = [0x8a5a3a, 0xc68a5a, 0xe0b090, 0x6a4028, 0xa86c44].map(c => new THREE.Color(c));
  const bodyI = new THREE.InstancedMesh(new THREE.BoxGeometry(0.045, 0.07, 0.04), M(0xffffff), crowd.length);
  const headI = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.016, 0), M(0xffffff), crowd.length);
  { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    crowd.forEach(([x, y, z, r, h], i) => { q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r);
      m4.compose(new THREE.Vector3(x, y + 0.035, z), q, new THREE.Vector3(1, 1, 1)); bodyI.setMatrixAt(i, m4); bodyI.setColorAt(i, tunics[Math.floor(h * 8)]);
      m4.compose(new THREE.Vector3(x, y + 0.088, z), q, new THREE.Vector3(1, 1.1, 1)); headI.setMatrixAt(i, m4); headI.setColorAt(i, skins[Math.floor(hash(h * 91) * 5)]); }); }
  g.add(bodyI, headI); g.userData.crowd = [bodyI, headI];
  g.userData.sand = sand;
  return g;
}
// eau de l'arene ; level 0..1
function arenaWater(a = AR[0] - 0.01, b = AR[1] - 0.01) {
  const geo = ellipseDisc(a, b, 14, 72); const p = geo.attributes.position; const base = p.array.slice();
  const mesh = new THREE.Mesh(geo, M(0x2f7a96, { transparent: true, opacity: 0.9, emissive: new THREE.Color(0x0a2a3a) })); mesh.receiveShadow = true;
  return { mesh, update(t, level, A = 0.012) {
    mesh.visible = level > 0.005; mesh.position.y = 0.01 + level * 0.32;
    for (let i = 0; i < p.count; i++) p.setY(i, L.waveH(base[i * 3] * 3, base[i * 3 + 2] * 3, t, A));
    p.needsUpdate = true; geo.computeVertexNormals(); } };
}
// galere (1 unite = 10 m) ; avant vers +x
function galley(team = 0, o = {}) {
  const g = new THREE.Group(); const L0 = o.len ?? 1.6, W0 = 0.26;
  const hullC = team ? 0x5a3a24 : 0x6a4428, sailC = team ? 0x3a6ab0 : 0xb03a2a;
  const sh = new THREE.Shape(); sh.moveTo(-L0 / 2, -W0 * 0.35); sh.lineTo(L0 * 0.3, -W0 / 2); sh.lineTo(L0 / 2, 0); sh.lineTo(L0 * 0.3, W0 / 2); sh.lineTo(-L0 / 2, W0 * 0.35); sh.lineTo(-L0 / 2, -W0 * 0.35);
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 0.11, bevelEnabled: false }); hg.rotateX(-Math.PI / 2);
  const hull = new THREE.Mesh(hg, M(hullC)); hull.position.y = -0.04; g.add(hull);
  g.add(at(box(L0 * 0.75, 0.012, W0 * 0.7, M(0x9a7a50)), -0.02, 0.072, 0));
  g.add(at(box(0.14, 0.03, 0.05, M(0xb08a40)), L0 / 2 + 0.03, -0.02, 0)); // eperon
  const st = box(0.05, 0.22, 0.05, M(hullC)); st.position.set(-L0 / 2 + 0.02, 0.12, 0); st.rotation.z = 0.5; g.add(st);
  for (const s of [-1, 1]) { const e = at(box(0.04, 0.03, 0.005, G(0xffffff, 1)), L0 * 0.36, 0.04, s * W0 * 0.38); e.rotation.y = s * 0.35; g.add(e); }
  const mast = box(0.025, 0.6, 0.025, M(0x5a3a22)); mast.position.set(0.05, 0.36, 0); g.add(mast);
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.34), new THREE.MeshLambertMaterial({ color: sailC, side: THREE.DoubleSide })); sail.position.set(0.07, 0.44, 0); sail.rotation.y = Math.PI / 2; g.add(sail);
  for (let k = 0; k < 7; k++) for (const s of [-1, 1]) g.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.03, 8), M(team ? 0x3a6ab0 : 0xc8a040, { side: THREE.DoubleSide })), -L0 * 0.3 + k * 0.13, 0.1, s * (W0 * 0.42 + 0.002))).rotation.y = 0;
  g.children.slice(-14).forEach((c, i) => c.rotation.y = (i % 2 ? 1 : -1) * Math.PI / 2 + Math.PI / 2);
  // rameurs et soldats (petites silhouettes)
  const fig = (x, z, c, hgt = 1) => { const f = new THREE.Group(); f.add(at(box(0.04, 0.07 * hgt, 0.04, M(c)), 0, 0.035 * hgt, 0)); f.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.016, 0), M(0xb07a50)), 0, 0.08 * hgt, 0)); f.position.set(x, 0.078, z); g.add(f); return f; };
  for (let k = 0; k < 6; k++) for (const s of [-1, 1]) fig(-L0 * 0.28 + k * 0.13, s * 0.06, 0xe8dcc0);
  const soldiers = [0, 1, 2].map(k => { const f = fig(L0 * 0.28 - k * 0.07, (k - 1) * 0.05, team ? 0x3a5a9a : 0xa83a2a, 1.25); f.add(at(box(0.008, 0.008, 0.16, M(0x8a7a6a)), 0.03, 0.09, 0)); return f; });
  const oars = [];
  for (let k = 0; k < 8; k++) for (const s of [-1, 1]) { const og = new THREE.Group(); og.position.set(-L0 * 0.3 + k * 0.11, 0.06, s * W0 * 0.45); og.add(at(box(0.012, 0.012, 0.36, M(0xc8a878)), 0, 0, s * 0.17)); g.add(og); oars.push([og, s, k]); }
  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  g.userData.row = (t, k = 1) => oars.forEach(([og, s, i]) => { const ph = t * 3.2; og.rotation.y = s * 0.35 * Math.sin(ph) * k; og.rotation.x = s * (0.25 + 0.12 * Math.cos(ph) * k); });
  g.userData.soldiers = soldiers;
  return g;
}
// cheval ou taureau qui nage (seules la tete et l'echine depassent) ; 1 unite = 10 m
function swimmer(kind = 'horse', c) {
  const g = new THREE.Group(); const m = M(c ?? (kind === 'horse' ? 0x6a4628 : 0x2a2420));
  g.add(at(box(0.07, 0.04, 0.2, m), 0, 0, 0));
  const nk = box(0.05, 0.12, 0.05, m); nk.position.set(0, 0.05, 0.1); nk.rotation.x = 0.5; g.add(nk);
  g.add(at(box(0.05, 0.05, 0.1, m), 0, 0.1, 0.15));
  for (const s of [-1, 1]) g.add(at(box(0.008, 0.008, 0.008, new THREE.MeshBasicMaterial({ color: 0x050505 })), s * 0.026, 0.115, 0.17));
  if (kind === 'bull') for (const s of [-1, 1]) { const h = box(0.06, 0.012, 0.012, M(0xe8e0c8)); h.position.set(s * 0.05, 0.135, 0.13); h.rotation.z = s * 0.5; g.add(h); }
  else g.add(at(box(0.012, 0.05, 0.08, M(0x2a1a10)), 0, 0.1, 0.08));
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
function roman(i, o = {}) {
  const skins = [0xc68a5a, 0x8a5a3a, 0xe0b090, 0xa86c44, 0x6a4028, 0xd09a70];
  return new Human({ skin: skins[i % 6], hair: [0x2a1a10, 0x141010, 0x5a3a20][i % 3], hairStyle: ['short', 'curly', 'short', 'bald', 'long', 'bun'][i % 6], top: [0xf0ece0, 0xe8dcc0, 0xb04a3a, 0x4a6a9a, 0xd8b060, 0x8a9a6a][i % 6], bottom: 0xe8e0d0, robe: [0xf0ece0, 0xe8dcc0, 0xc8b898][i % 3], robeL: 0.6, shortSleeve: true, seed: 2800 + i, ...o });
}
// decor a l'echelle humaine dans les gradins (le Colisee a l'echelle 10)
function standsSet(focus, o = {}) {
  const B = base({ sky: o.sky ?? [0x4a8ad8, 0xf0dcb0], hemi: [0xfff4e0, 0x8a7050, 1.0], sun: [0xfff0d0, 1.7, [focus[0] * 10 + 8, 30, focus[2] * 10 + 14]], target: [focus[0] * 10, focus[1] * 10, focus[2] * 10], shadowSize: 5, bloom: [0.3, 0.5, 0.92], exposure: 1.05, fog: [0xf0dcb0, 30, 260] });
  const col = colosseum({ skip: (x, y, z) => Math.hypot(x - focus[0], z - focus[2]) < 0.75 && Math.abs(y - focus[1]) < 0.5 });
  col.scale.setScalar(10); B.scene.add(col); B.col = col;
  B.scene.add(L.groundPlane(400, 40, 0x9a8a60, 0.5, 3));
  return B;
}
const seatPos = (i, th, d = 0.5) => { const [a, b, y0] = stepAx(i), [a1, b1, y1] = stepAx(i + 1); const am = lerp(a, a1, d), bm = lerp(b, b1, d); return [am * Math.cos(th), y1, bm * Math.sin(th)]; };

// ---------- intro : le Colisee inonde, deux flottes s'affrontent
SETS.intro = () => {
  const B = base({ sky: [0x3a6ab8, 0xf8d0a0], hemi: [0xfff0d8, 0x7a6a50, 1.0], sun: [0xfff0d0, 1.8, [10, 14, 8]], shadowSize: 11, bloom: [0.3, 0.5, 0.92], exposure: 1.05, fog: [0xf0d8b0, 30, 160] }); const { scene, cam } = B;
  const col = colosseum(); scene.add(col); scene.add(L.groundPlane(300, 60, 0x9a8a60, 0.4, 3));
  const W = arenaWater(); scene.add(W.mesh);
  const fleet = [0, 1, 0, 1].map((tm, i) => { const gl = galley(tm); scene.add(gl); return gl; });
  const anim = [swimmer('horse'), swimmer('bull'), swimmer('horse', 0xe8e0d0)]; anim.forEach(a => scene.add(a));
  const rig = bigClaude(scene, [2.2, 0, 10.6], -0.2, 3.0); anim.forEach(a => a.scale.setScalar(1.6));
  return {
    ...B, update(t) {
      W.update(t, 1);
      const wy = W.mesh.position.y;
      fleet.forEach((gl, i) => { const s = i % 2 ? -1 : 1, z = (i < 2 ? -0.7 : 0.7); const x = s * (2.4 - 0.12 * t) + (i > 1 ? 0.6 * s : 0); gl.position.set(x, wy + 0.02 * Math.sin(t * 1.5 + i), z + (i > 1 ? -0.2 : 0)); gl.rotation.y = s > 0 ? Math.PI : 0; gl.rotation.z = 0.02 * Math.sin(t * 1.3 + i); gl.userData.row(t + i, 1); });
      anim.forEach((a, i) => { a.position.set(-1.0 + i * 0.5 + 0.05 * t, wy - 0.01 + 0.008 * Math.sin(t * 3 + i), 1.6 - i * 0.15); a.rotation.y = Math.PI / 2; });
      camKeys(cam, t, [{ t: 0, p: [0.6, 1.3, 1.0], l: [-1.2, 0.5, -0.2], f: 50 }, { t: 4.5, p: [-1.4, 1.6, 1.9], l: [1.0, 0.3, -0.6], f: 50 }, { t: 6.3, p: [0.2, 6.8, 2.8], l: [0, 0.3, -0.5], f: 48 }, { t: C.title - 0.5, p: [3.2, 11.5, 20.5], l: [0.2, 0.6, 2.5], f: 46 }, { t: SC.inaug.start, p: [3.4, 11.8, 21.5], l: [0.4, 0.8, 3.0], f: 46 }]);
      rig.c.update(t, env('claude', t), {}); const on = t > C.title - 0.8; rig.c.g.visible = on; rig.pr.visible = on;
    }
  };
};

// ---------- l'inauguration par Titus (80 apr. J.-C.) puis l'arene vue d'en haut
SETS.inaug = () => {
  const F = seatPos(0, Math.PI / 2, 0.45); F[1] = 0.4; F[2] = AR[1] + 0.12;
  const B = standsSet(F); const { scene, cam, col } = B;
  const fx = F[0] * 10, fy = F[1] * 10, fz = F[2] * 10;
  // loge imperiale
  const box1 = at(box(4.6, 0.12, 2.0, M(0xf0ebe0)), fx, fy + 0.06, fz + 0.4); scene.add(box1);
  const canopy = at(box(4.8, 0.08, 2.4, M(0x7a2a5a)), fx, fy + 3.0, fz + 0.6); scene.add(canopy);
  for (const s of [-1, 1]) scene.add(at(box(0.18, 3.0, 0.18, M(0xf0ebe0)), fx + s * 2.2, fy + 1.5, fz - 0.4));
  const titus = new Human({ skin: 0xd09a70, hair: 0x3a2a1a, hairStyle: 'short', top: 0xf4f0e8, bottom: 0xf4f0e8, robe: 0xf4f0e8, robeL: 0.72, sash: 0x7a2a6a, seed: 2801 });
  titus.neck.add(at(box(0.34, 0.035, 0.34, M(0x3a7a2a)), 0, 0.3, 0)); // couronne de laurier
  titus.place(fx, fy + 0.12, fz - 0.15, Math.PI); scene.add(titus.root);
  const court = [0, 1, 2, 3].map(i => { const h = roman(i + 2); h.place(fx + (i < 2 ? -1 : 1) * (1.1 + (i % 2) * 0.7), fy + 0.12, fz + 0.5 + (i % 2) * 0.3, Math.PI); scene.add(h.root); return h; });
  faceLight(scene, [fx, fy + 2.0, fz - 2.2], 2.0, 0xfff0e0, 6);
  // cotes de l'arene (hologramme)
  const dims = new THREE.Group(); col.add(dims);
  dims.add(L.beam([-AR[0], 0.06, 0], [AR[0], 0.06, 0], 0.07, G(0xffd070, 1.6))); dims.add(L.beam([0, 0.06, -AR[1]], [0, 0.06, AR[1]], 0.07, G(0x7dd8ff, 1.6)));
  const l80 = label('≈ 80 m', { w: 3.2, h: 0.8, color: '#ffe0a0', font: 'bold 200px Inter' }); l80.position.set(-0.4, 0.6, 0.5); dims.add(l80);
  const l48 = label('48 m', { w: 2.4, h: 0.8, color: '#9adfff', font: 'bold 200px Inter' }); l48.position.set(0.5, 0.6, -1.4); dims.add(l48);
  const K = cardsMgr(scene, cam);
  K('Titus inaugure l\'amphithéâtre\nsur l\'ancien lac de Néron', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.inaug.start + 3.4, SC.inaug.start + 7.0, 0.3, 0.2), -0.55);
  K('100 jours de spectacles', { w: 1.6, h: 0.28, border: '#c070a0' }, t => win(t, SC.inaug.start + 7.2, C.arene, 0.3, 0.2), -0.55);
  K('arène ≈ 80 × 48 m\n≈ 50 000 spectateurs', { w: 1.6, h: 0.42, border: '#7dd8ff', small: true }, t => win(t, C.arene + 0.8, SC.dion.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.inaug.start;
      const raise = win(t, T0 + 5.0, C.arene - 0.5, 0.6, 0.6);
      titus.pose({ aR: [0.3 + 2.4 * raise, 0.25], eR: 0.2, aL: [0.15, 0.12] }); titus.face(0, 'serious', t);
      court.forEach((h, i) => { h.pose({ aL: [0.1 + 0.3 * raise, 0.12], aR: [0.1 + 0.3 * raise, 0.12] }); h.face(0, 'happy', t); });
      fade(dims, sstep(C.arene + 0.5, C.arene + 1.2, t)); l80.lookAt(cam.position); l48.lookAt(cam.position);
      camKeys(cam, t, [{ t: T0, p: [fx + 0.6, fy + 1.7, fz - 4.2], l: [fx, fy + 1.5, fz], f: 42 }, { t: C.arene - 0.8, p: [fx + 0.3, fy + 1.65, fz - 3.2], l: [fx, fy + 1.55, fz], f: 42 }, { t: C.arene + 0.6, p: [8, 62, 46], l: [0, 0, 2], f: 46 }, { t: SC.dion.start, p: [5, 64, 42], l: [0, 0, 1], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- Cassius Dion ecrit ; l'arene se remplit ; bataille navale
SETS.dion = () => {
  const B = base({ sky: [0x3a6ab8, 0xf8d0a0], hemi: [0xfff0d8, 0x7a6a50, 1.0], sun: [0xfff0d0, 1.8, [10, 14, 8]], shadowSize: 6, bloom: [0.3, 0.5, 0.92], exposure: 1.05, fog: [0xf0d8b0, 30, 160] }); const { scene, cam } = B;
  const col = colosseum(); scene.add(col); scene.add(L.groundPlane(300, 60, 0x9a8a60, 0.4, 3));
  const W = arenaWater(); scene.add(W.mesh);
  // le cabinet de Dion (a l'ecart, a l'echelle humaine)
  const room = new THREE.Group(); room.position.set(60, 0, 60); scene.add(room);
  room.add(at(box(6, 0.1, 6, M(0x8a6a4a)), 0, 0, 0)); room.add(at(box(6, 4, 0.2, M(0xc8a878)), 0, 2, -1.6));
  room.add(at(box(1.6, 0.08, 0.8, M(0x6a4428)), 0, 0.78, 0.2)); for (const s of [-1, 1]) room.add(at(box(0.08, 0.76, 0.7, M(0x5a3a22)), s * 0.7, 0.38, 0.2));
  const scroll = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.4), M(0xf0e4c0, { side: THREE.DoubleSide })); scroll.rotation.x = -Math.PI / 2; scroll.position.set(0, 0.83, 0.25); room.add(scroll);
  for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.44, 8), M(0xc8a060)); r.rotation.x = Math.PI / 2; r.position.set(s * 0.36, 0.86, 0.25); room.add(r); }
  const lamp = new THREE.PointLight(0xffb060, 3, 5, 1.5); lamp.position.set(0.6, 1.2, 0.6); room.add(lamp); room.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 0), G(0xffc060, 3)), 0.6, 0.9, 0.5));
  const dio = new Human({ skin: 0xc68a5a, hair: 0x5a5048, hairStyle: 'short', beard: 'full', beardColor: 0x6a6058, top: 0xe8dcc0, bottom: 0xe8dcc0, robe: 0xe8dcc0, robeL: 0.6, seed: 2810 });
  dio.place(0, 0, -0.45, 0); room.add(dio.root);
  faceLight(scene, [60, 1.9, 61.6], 2.0, 0xfff0e0, 5);
  const fleet = [0, 1, 0, 1].map(tm => { const gl = galley(tm); scene.add(gl); return gl; });
  const anim = [swimmer('horse'), swimmer('bull'), swimmer('horse', 0xe8e0d0), swimmer('bull', 0x6a3a22)]; anim.forEach(a => { a.scale.setScalar(1.6); scene.add(a); });
  const T0 = SC.dion.start, tf = T0 + 3.6, tfill = T0 + 6.5;
  const K = cardsMgr(scene, cam);
  K('Cassius Dion · Histoire romaine\nécrite vers 200 – 230 apr. J.-C.', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, T0 + 0.6, tf, 0.3, 0.2), -0.55);
  K('« Titus remplit soudain d\'eau\nce même théâtre »', { w: 1.6, h: 0.42, border: '#7dd8ff', small: true }, t => win(t, tf + 0.4, C.bataille - 0.2, 0.3, 0.2), -0.55);
  K('Corinthiens contre Corcyréens\nbataille navale grecque (Ve s. av. J.-C.)', { w: 1.6, h: 0.42, border: '#ff8a6a', small: true }, t => win(t, C.bataille + 0.8, SC.martial.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const lev = sstep(tf, tfill, t); W.update(t, lev); const wy = W.mesh.position.y;
      col.userData.sand.visible = lev < 0.99;
      dio.pose(L.sitPose(0.5, { aL: [1.0, 0.1], aR: [1.1 + 0.05 * Math.sin(t * 6), 0.15], eL: 0.9, eR: 1.0 + 0.1 * Math.sin(t * 7), hp: 0.25 })); dio.face(0, 'neutral', t);
      if (t > tf + 3.0 && t < tf + 5.2) dio.pose(L.sitPose(0.5, { aL: [1.0, 0.1], aR: [1.1, 0.15], eL: 0.9, eR: 1.0, hp: -0.05 }));
      const showB = t > C.bataille - 0.3;
      anim.forEach((a, i) => { a.visible = lev > 0.6 && !showB; a.position.set(-2.4 + i * 0.4 + 0.08 * (t - tf), wy - 0.01 + 0.008 * Math.sin(t * 3 + i), 0.5 - (i % 2) * 0.5); a.rotation.y = Math.PI / 2 + 0.2 * Math.sin(i); });
      fleet.forEach((gl, i) => { gl.visible = showB; const s = i % 2 ? -1 : 1; const x = s * (2.6 - 0.15 * (t - C.bataille)); gl.position.set(x, wy + 0.02 * Math.sin(t * 1.5 + i), (i < 2 ? -0.7 : 0.7)); gl.rotation.y = s > 0 ? Math.PI : 0; gl.userData.row(t + i, 1); });
      camKeys(cam, t, [{ t: T0, p: [60.4, 1.55, 61.5], l: [60, 1.3, 59.6], f: 42 }, { t: tf - 0.4, p: [60.3, 1.5, 61.2], l: [60, 1.3, 59.6], f: 42 }, { t: tf, p: [2.6, 1.3, 1.6], l: [-1.0, 0.1, -0.5], f: 50 }, { t: C.bataille - 0.4, p: [1.6, 0.9, 1.8], l: [-1.2, 0.2, 0], f: 50 }, { t: C.bataille, p: [2.6, 0.7, 1.7], l: [0, 0.4, 0], f: 46 }, { t: SC.martial.start, p: [1.6, 0.6, 1.5], l: [0, 0.45, 0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- le poete Martial dans les gradins
SETS.martial = () => {
  const th = Math.PI / 2 - 0.5; const F = seatPos(4, th, 0.5);
  const B = standsSet(F, { sky: [0x4a7ac8, 0xf8d8a8] }); const { scene, cam, col } = B;
  const W = arenaWater(); W.mesh.scale.setScalar(10); scene.add(W.mesh); col.userData.sand.visible = false;
  const fx = F[0] * 10, fy = F[1] * 10, fz = F[2] * 10, ry = Math.atan2(-F[0] / (AR[0] * AR[0]), -F[2] / (AR[1] * AR[1]));
  const mart = new Human({ skin: 0xc68a5a, hair: 0x2a1a10, hairStyle: 'curly', beard: 'full', top: 0xe8dcc0, bottom: 0xe8dcc0, robe: 0xe8dcc0, robeL: 0.6, seed: 2820 });
  mart.place(fx, fy, fz, ry); scene.add(mart.root);
  const tab = box(0.28, 0.2, 0.02, M(0x8a6a3a)); mart.hand.L.add(tab); tab.position.set(-0.05, -0.05, 0.12); tab.rotation.x = -0.8;
  const nb = []; for (let i = 0; i < 5; i++) { const h = roman(i + 7); const d = [-1.2, 1.1, -0.6, 0.7, 1.7][i]; const rr = Math.atan2(-Math.cos(ry), Math.sin(ry)); h.place(fx + Math.cos(-ry) * d + (i > 1 ? Math.sin(ry) * -0.0 : 0), fy + (i > 1 ? 0.18 : 0), fz + Math.sin(-ry) * d, ry); scene.add(h.root); nb.push(h); }
  nb.slice(2).forEach(h => { const dx = Math.sin(ry), dz = Math.cos(ry); h.root.position.x -= dx * 1.0; h.root.position.z -= dz * 1.0; h.root.position.y += 0.18; });
  const lp = new THREE.Vector3(fx, fy, fz), fwd = new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry));
  faceLight(scene, [fx + fwd.x * 1.8, fy + 1.6, fz + fwd.z * 1.8], 2.0, 0xfff0e0, 5);
  const fleet = [0, 1].map(tm => { const gl = galley(tm); gl.scale.setScalar(10); scene.add(gl); return gl; });
  const K = cardsMgr(scene, cam);
  K('Martial · poète, témoin des jeux\nLivre des spectacles', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.martial.start + 1.0, C.martial_dit - 0.2, 0.3, 0.2), -0.55);
  K('texte de Martial · traduction libre\nvoix et visage imaginés', { w: 1.6, h: 0.42, border: '#ffd070', color: '#ffe0a0', small: true }, t => win(t, C.martial_dit + 0.2, SC.doute.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      W.update(t, 1, 0.01);
      const sp = L.sitPose(0.46, { aL: [0.9, 0.1], aR: [0.5 + 0.6 * win(t, C.martial_dit, SC.doute.start, 0.3, 0.3), 0.3], eL: 1.1, eR: 0.9 });
      mart.pose(sp); mart.face(env('martial', t), 'neutral', t);
      nb.forEach((h, i) => { h.pose(L.sitPose(0.46, { aL: [0.2, 0.15], aR: [0.2 + 0.4 * (i % 2) * win(t, C.martial_dit + 3, C.martial_dit + 6, 0.5, 0.5), 0.15], hy: 0.2 * Math.sin(t * 0.5 + i) })); h.face(0, i % 2 ? 'happy' : 'awe', t); });
      fleet.forEach((gl, i) => { const s = i ? -1 : 1; gl.position.set(s * (14 - 1.2 * (t - SC.martial.start)), 3.3 + 0.2 * Math.sin(t * 1.4 + i), -6 + i * 4); gl.rotation.y = s > 0 ? Math.PI : 0; gl.userData.row(t + i, 1); });
      const cp = lp.clone().addScaledVector(fwd, 3.0).add(new THREE.Vector3(0, 1.1, 0)), cl = lp.clone().add(new THREE.Vector3(0, 1.0, 0));
      const cp2 = lp.clone().addScaledVector(fwd, 2.6).add(new THREE.Vector3(0.2, 1.05, 0));
      const back = lp.clone().add(new THREE.Vector3(-fwd.x * 1.2, 2.2, -fwd.z * 1.2)), view = new THREE.Vector3(0, 3.5, 0);
      camKeys(cam, t, [{ t: SC.martial.start, p: cp.toArray(), l: cl.toArray(), f: 44 }, { t: C.martial_dit - 0.3, p: cp2.toArray(), l: cl.toArray(), f: 42 }, { t: C.martial_dit + 5.0, p: cp2.toArray(), l: cl.toArray(), f: 42 }, { t: C.martial_dit + 6.0, p: [fx * 0.55, 9, fz * 0.55 + 6], l: view.toArray(), f: 46 }, { t: SC.doute.start, p: [fx * 0.5, 8, fz * 0.5 + 6], l: view.toArray(), f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- le doute ; l'hypothese de l'eau peu profonde (maquette + Claude geant)
function diorama(o = {}) {
  const B = base({ sky: o.sky ?? [0x3a6ab8, 0xf8d8b0], hemi: [0xfff0d8, 0x7a6a50, 1.0], sun: [0xfff0d0, o.sunK ?? 1.7, o.sunPos ?? [10, 14, 8]], shadowSize: 12, bloom: [0.35, 0.5, 0.9], exposure: o.exposure ?? 1.05, fog: [o.fogC ?? 0xf0d8b0, 40, 200] });
  B.col = colosseum(); B.scene.add(B.col); { const gr = new THREE.Mesh(ringGeo(OUT[0] - 0.2, OUT[1] - 0.2, 0, 160, 160, 0, 64), M(0x9a8a60, { side: THREE.DoubleSide })); gr.receiveShadow = true; B.scene.add(gr); }
  return B;
}
SETS.doute = () => {
  const B = diorama(); const { scene, cam, col } = B;
  const rig = bigClaude(scene, [3.2, 0, 10.6], -0.3, 3.0, 0x7dd8ff);
  const tri = new THREE.Group(); scene.add(tri);
  { const gl = galley(0, { len: 3.7 }); gl.traverse(m => { if (m.isMesh) m.material = holoMat(0xff6a5a, 0.7); }); tri.add(gl); tri.position.set(0, 1.4, 0); tri.scale.setScalar(2.0); }
  const lTri = label('trière de guerre ≈ 37 m', { w: 2.6, h: 0.4, color: '#ff9a8a', font: 'bold 110px Inter' }); lTri.position.set(0, 2.0, 0); scene.add(lTri);
  const qm = label('?', { w: 1.2, h: 1.2, color: '#ffe0a0', font: 'bold 700px Inter' }); qm.position.set(0, 2.6, 0); scene.add(qm);
  // aqueduc voisin
  const aq = new THREE.Group(); scene.add(aq);
  for (let i = 0; i < 14; i++) { const x = -9.0 - i * 1.4; aq.add(at(box(0.35, 2.4, 0.5, M(0xc8b090)), x, 1.2, 0.5)); aq.add(at(box(1.45, 0.4, 0.55, M(0xc8b090)), x - 0.7, 2.5, 0.5)); }
  const flow = L.beam([-28, 2.75, 0.5], [-8.2, 2.75, 0.5], 0.18, G(0x6ad0ff, 1.4)); scene.add(flow); flow.material.transparent = true;
  const flow2 = L.beam([-8.2, 2.75, 0.5], [-3.5, 0.5, 0.2], 0.14, G(0x6ad0ff, 1.4)); scene.add(flow2); flow2.material.transparent = true;
  const W = arenaWater(); scene.add(W.mesh);
  const flats = [0, 1].map(i => { const gl = galley(i, { len: 1.1 }); scene.add(gl); return gl; });
  const K = cardsMgr(scene, cam);
  K('aucun texte n\'explique comment\non remplissait ou vidait l\'arène', { w: 1.6, h: 0.42, border: '#ff8a7a', small: true }, t => win(t, SC.doute.start + 4.5, C.hypo, 0.3, 0.2), -0.55);
  K('HYPOTHÈSE\neau peu profonde · aqueduc voisin', { w: 1.6, h: 0.42, border: '#7dd8ff', small: true }, t => win(t, C.hypo + 0.6, SC.hypogee.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.doute.start;
      const tk = win(t, T0 + 1.5, C.hypo - 0.3, 0.6, 0.4); fade(tri, tk); fade(lTri, tk); fade(qm, win(t, T0 + 3.5, C.hypo - 0.3, 0.4, 0.4)); lTri.lookAt(cam.position); qm.lookAt(cam.position); tri.rotation.y = 0.15 * Math.sin(t * 0.5);
      const fk = sstep(C.hypo + 0.5, C.hypo + 1.5, t) * (0.7 + 0.3 * Math.sin(t * 8)); fade(flow, fk); fade(flow2, fk);
      const lev = 0.45 * sstep(C.hypo + 1.5, C.hypo + 6, t); W.update(t, lev, 0.006); col.userData.sand.visible = lev < 0.44;
      flats.forEach((gl, i) => { gl.visible = lev > 0.3; const s = i ? -1 : 1; gl.position.set(s * (1.6 - 0.1 * (t - C.hypo)), W.mesh.position.y + 0.01, i ? 0.6 : -0.5); gl.rotation.y = s > 0 ? Math.PI : 0; gl.userData.row(t + i, 0.6); });
      rig.c.update(t, env('claude', t), {}); beamOn(rig, 0.6, t);
      camKeys(cam, t, [{ t: T0, p: [5.0, 11.0, 21.0], l: [0.5, 1.2, 3.0], f: 46 }, { t: C.hypo - 0.5, p: [4.0, 12.0, 19.0], l: [0, 1.0, 1.0], f: 46 }, { t: C.hypo + 0.8, p: [-13.0, 12.0, 17.0], l: [-7, 1.0, 0], f: 50 }, { t: C.hypo + 6.0, p: [-4.0, 10.0, 12.0], l: [-1, 0.3, 0], f: 48 }, { t: SC.hypogee.start, p: [-3.0, 10.0, 11.0], l: [0, 0.2, 0], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- l'hypogee de Domitien
SETS.hypogee = () => {
  const B = diorama({ sunPos: [6, 16, 10] }); const { scene, cam, col } = B;
  const rig = bigClaude(scene, [-3.6, 0, 10.4], 0.3, 3.0, 0xffd070);
  // sous-sol : murs paralleles au grand axe, deux niveaux, monte-charges
  const hyp = new THREE.Group(); scene.add(hyp);
  const wallM = M(0xc8a878), floorM = M(0x4a3a2a); const hl = new THREE.PointLight(0xffe0b0, 1.2, 6, 1.5); hl.position.set(0, 0.8, 0.5); scene.add(hl);
  const pit = new THREE.Mesh(ellipseDisc(AR[0] - 0.02, AR[1] - 0.02), floorM); pit.position.y = -0.62; hyp.add(pit);
  hyp.add(new THREE.Mesh(ringGeo(AR[0] - 0.02, AR[1] - 0.02, -0.62, AR[0] - 0.02, AR[1] - 0.02, 0.0), M(0x9a8460, { side: THREE.DoubleSide })));
  const zs = [-1.6, -1.1, -0.6, -0.2, 0.2, 0.6, 1.1, 1.6];
  zs.forEach(z => { const hw = AR[0] * Math.sqrt(Math.max(0, 1 - (z / AR[1]) ** 2)) - 0.1; hyp.add(at(box(hw * 2, 0.6, 0.06, wallM), 0, -0.31, z)); for (let x = -hw + 0.3; x < hw; x += 0.55) hyp.add(at(box(0.04, 0.3, 0.06, M(0x2a2018)), x, -0.4, z)); });
  zs.forEach(z => { const hw = AR[0] * Math.sqrt(Math.max(0, 1 - (z / AR[1]) ** 2)) - 0.1; hyp.add(at(box(hw * 2, 0.02, 0.18, M(0x8a7454)), 0, -0.31, z + 0.12)); }); // 2 niveaux
  const lifts = []; for (let i = 0; i < 6; i++) { const lf = new THREE.Group(); const x = -2.2 + i * 0.9, z = (i % 2 ? 0.4 : -0.4); lf.position.set(x, 0, z); hyp.add(lf);
    lf.add(at(box(0.22, 0.02, 0.22, M(0x6a4a2a)), 0, 0, 0)); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) lf.add(at(box(0.015, 0.2, 0.015, M(0x3a2a1a)), sx * 0.1, 0.1, sz * 0.1));
    const shaft = at(box(0.26, 0.62, 0.26, holoMat(0xffd070, 0.12)), x, -0.31, z); hyp.add(shaft); lifts.push(lf); }
  const W = arenaWater(); scene.add(W.mesh);
  const nope = label('✕', { w: 0.9, h: 0.9, color: '#ff6a5a', font: 'bold 800px Inter' }); nope.position.set(0, 0.6, -0.8); scene.add(nope);
  const K = cardsMgr(scene, cam);
  const lCor = K('2 étages de couloirs · cages · monte-charges', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffe0a0' }, t => win(t, SC.hypogee.start + 4.0, C.fini - 0.2, 0.4, 0.3), 0.05);
  K('Domitien (81 – 96 apr. J.-C.)\nfait creuser l\'hypogée', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.hypogee.start + 2.0, C.fini, 0.3, 0.2), -0.55);
  K('avec ces souterrains,\nplus de bataille navale possible', { w: 1.6, h: 0.42, border: '#ff8a7a', small: true }, t => win(t, C.fini + 0.8, SC.auguste.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.hypogee.start;
      const open = sstep(T0 + 1.0, T0 + 3.0, t); col.userData.sand.visible = open < 0.5; fade(col.userData.sand, 1 - open);
      lifts.forEach((lf, i) => { const ph = (t * 0.25 + i * 0.17) % 1; lf.position.y = -0.6 + 0.6 * sstep(0.1, 0.5, ph) * (1 - sstep(0.7, 0.95, ph)); });
      const wk = win(t, C.fini + 0.3, C.fini + 4.5, 0.6, 0.6); W.update(t, 0.3 * wk, 0.006); fade(W.mesh, 0.55 * wk); W.mesh.visible = wk > 0.02;
      fade(nope, win(t, C.fini + 2.0, SC.auguste.start, 0.3, 0.3)); nope.lookAt(cam.position);
      rig.c.update(t, env('claude', t), {}); beamOn(rig, 0.5, t);
      camKeys(cam, t, [{ t: T0, p: [0, 11.0, 10.0], l: [0, 0, 0.5], f: 46 }, { t: T0 + 4.0, p: [1.6, 2.3, 2.1], l: [-0.3, -0.45, -0.6], f: 50 }, { t: C.fini, p: [-1.6, 2.1, 2.0], l: [0.2, -0.4, -0.6], f: 50 }, { t: C.fini + 1.5, p: [-1.5, 3.0, 2.2], l: [0, 0, -0.5], f: 50 }, { t: SC.auguste.start, p: [-1.5, 3.2, 2.2], l: [0, 0, -0.5], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- la naumachie d'Auguste (2 av. J.-C.) : un bassin geant pres du Tibre
SETS.auguste = () => {
  const B = base({ sky: [0x3a6ab8, 0xf8d8b0], hemi: [0xfff0d8, 0x6a7a50, 1.0], sun: [0xfff0d0, 1.7, [20, 30, 15]], shadowSize: 30, bloom: [0.3, 0.5, 0.92], exposure: 1.05, fog: [0xe8dcc0, 80, 320] }); const { scene, cam } = B;
  { const gp = L.groundPlane(500, 60, 0x7a8a50, 0.25, 7); gp.position.y = -0.6; scene.add(gp); }
  const river = L.makeWater(400, 40, 0x3a7aa0, { opacity: 0.95 }); river.mesh.scale.set(1, 1, 0.05); river.mesh.position.set(0, 0.05, -30); scene.add(river.mesh);
  // bassin ≈ 533 x 355 m (1 unite = 10 m)
  const bw = 53.3, bd = 35.5;
  const basin = L.makeWater(60, 30, 0x2f7a96, { opacity: 0.95 }); basin.mesh.scale.set(bw / 60, 1, bd / 60); basin.mesh.position.set(0, 0.08, 6); scene.add(basin.mesh);
  for (const [w, d, x, z] of [[bw + 1, 0.8, 0, 6 - bd / 2], [bw + 1, 0.8, 0, 6 + bd / 2], [0.8, bd, -bw / 2, 6], [0.8, bd, bw / 2, 6]]) scene.add(at(box(w, 1.4, d, M(0xd8c8a4)), x, -0.1, z));
  scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 0.6, 10), M(0x8a9a5a)), 4, 0.3, 8)); // ilot
  const ships = []; for (let i = 0; i < 30; i++) { const gl = galley(i % 2); scene.add(gl); ships.push(gl); }
  const col = colosseum({ crowdGap: 0.2 }); col.position.set(-34, 0, 4); scene.add(col);
  const lCol = label('le Colisée, à la même échelle', { w: 10, h: 1.4, color: '#ffe0a0', font: 'bold 110px Inter' }); lCol.position.set(-27, 7.5, 6); scene.add(lCol);
  const rig = bigClaude(scene, [-26, 0, 26], 0.4, 3.2, 0xffd070);
  const K = cardsMgr(scene, cam);
  K('2 av. J.-C. · naumachie d\'Auguste\nbassin ≈ 533 × 355 m', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.auguste.start + 3.5, SC.auguste.start + 8.5, 0.3, 0.2), -0.55);
  K('30 navires à éperon\n3 000 combattants (sans les rameurs)', { w: 1.6, h: 0.42, border: '#7dd8ff', small: true }, t => win(t, SC.auguste.start + 8.7, C.claude_avis, 0.3, 0.2), -0.55);
  K('selon Cassius Dion et Martial :\nl\'eau est bien entrée au Colisée', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.claude_avis + 2.0, SC.fin.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      river.update(t, 0.15); basin.update(t, 0.08);
      ships.forEach((gl, i) => { const s = i % 2 ? -1 : 1, row = Math.floor(i / 2); const x = s * (20 - 0.6 * (t - SC.auguste.start)) + (hash(i) - 0.5) * 4, z = 6 - bd / 2 + 3 + row * 2.0; gl.position.set(x, 0.12, z); gl.rotation.y = s > 0 ? Math.PI : 0; gl.scale.setScalar(1.3); gl.userData.row(t + i, 1); });
      fade(lCol, sstep(C.claude_avis - 1.0, C.claude_avis, t)); lCol.lookAt(cam.position);
      rig.c.update(t, env('claude', t), {}); beamOn(rig, 0.5, t);
      camKeys(cam, t, [{ t: SC.auguste.start, p: [10, 30, 55], l: [0, 0, 5], f: 50 }, { t: C.claude_avis - 1.5, p: [0, 45, 62], l: [0, 0, 5], f: 50 }, { t: C.claude_avis + 0.5, p: [-24, 30, 52], l: [-24, 0, 6], f: 50 }, { t: SC.fin.start, p: [-25, 29, 50], l: [-25, 0, 6], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- fin : coucher de soleil sur le Colisee inonde
SETS.fin = () => {
  const B = diorama({ sky: [0x2a3a7a, 0xf8a060], sunPos: [-12, 4, -6], sunK: 1.8, fogC: 0xe8a070 }); const { scene, cam, col } = B;
  const W = arenaWater(); scene.add(W.mesh); col.userData.sand.visible = false;
  const fleet = [0, 1].map(tm => { const gl = galley(tm); scene.add(gl); return gl; });
  const rig = bigClaude(scene, [0.4, 0, 10.2], 0.0, 3.0, 0xffd070);
  faceLight(scene, [0.6, 3.0, 14.5], 3.0, 0xfff0d8, 8);
  const icons = ['OUI ?', 'NON ?'].map((s, i) => { const l = label(s, { w: 0.6, h: 0.16, color: ['#7dffb0', '#ff8a7a'][i], font: 'bold 120px Inter' }); rig.holoG.add(l); l.position.set(0, 0.2 - i * 0.18, 0); return l; });
  return {
    ...B, update(t) {
      const T0 = SC.fin.start;
      W.update(t, 1); fleet.forEach((gl, i) => { const s = i ? -1 : 1; gl.position.set(s * (1.6 - 0.1 * (t - T0)), W.mesh.position.y + 0.02, i ? 0.5 : -0.5); gl.rotation.y = s > 0 ? Math.PI : 0; gl.userData.row(t + i, 1); });
      const qk = sstep(T0 + 1.0, T0 + 1.5, t); beamOn(rig, qk, t);
      icons.forEach((l, i) => { fade(l, sstep(T0 + 1.5 + i * 1.0, T0 + 1.9 + i * 1.0, t)); l.lookAt(cam.position); });
      rig.c.update(t, env('claude', t), { wave: sstep(TL.duration - 2.0, TL.duration - 1.5, t) });
      camKeys(cam, t, [{ t: T0, p: [1.5, 9.0, 19.5], l: [0.4, 1.6, 5.5], f: 46 }, { t: TL.duration, p: [1.3, 8.6, 18.6], l: [0.4, 1.6, 5.5], f: 46 }]);
    }
  };
};

// ---------- couverture
SETS.cover = () => {
  const B = diorama({ sky: [0x3a6ab8, 0xf8c890], sunPos: [6, 9, 12], sunK: 2.0 }); const { scene, cam, col } = B;
  const W = arenaWater(); scene.add(W.mesh); col.userData.sand.visible = false;
  const fleet = [0, 1, 0, 1].map(tm => { const gl = galley(tm); scene.add(gl); return gl; });
  return { ...B, update(t) {
    W.update(5, 1); fleet.forEach((gl, i) => { const s = i % 2 ? -1 : 1; gl.position.set(s * (0.9 + (i > 1 ? 1.2 : 0)), W.mesh.position.y + 0.02, i < 2 ? -0.3 : 0.6); gl.rotation.y = (s > 0 ? Math.PI : 0) + (i < 2 ? 0.25 : -0.2); gl.userData.row(i, 1); });
    cam.position.set(2.2, 9.5, 14.5); cam.fov = 48; cam.updateProjectionMatrix(); cam.lookAt(0, 0.2, -0.5); } };
};

const SHOTS = [
  ['intro', 0, SC.inaug.start], ['inaug', SC.inaug.start, SC.dion.start], ['dion', SC.dion.start, SC.martial.start], ['martial', SC.martial.start, SC.doute.start],
  ['doute', SC.doute.start, SC.hypogee.start], ['hypogee', SC.hypogee.start, SC.auguste.start], ['auguste', SC.auguste.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9],
];
