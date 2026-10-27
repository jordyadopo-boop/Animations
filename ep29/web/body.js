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


// ---------- le tardigrade (longueur ≈ 1,3 unite) ; avant vers +z
function tardigrade(o = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const skin = M(o.color ?? 0xe8c4a0, { emissive: new THREE.Color(o.glow ?? 0x2a1408) });
  const segs = [];
  const SZ = [[0.3, 0.27, 0.3, -0.42], [0.34, 0.3, 0.32, -0.14], [0.34, 0.31, 0.32, 0.14], [0.3, 0.28, 0.3, 0.4]];
  SZ.forEach(([rx, ry, rz, z]) => { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), skin); s.scale.set(rx, ry, rz); s.position.set(0, 0.36, z); s.castShadow = true; body.add(s); segs.push(s); });
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), skin); head.scale.set(0.22, 0.2, 0.2); head.position.set(0, 0.38, 0.62); body.add(head);
  const mouth = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.1, 8), M(0xd0a080)); mouth.rotation.x = Math.PI / 2; mouth.position.set(0, 0.36, 0.8); body.add(mouth);
  body.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.035, 8), new THREE.MeshBasicMaterial({ color: 0x1a0a08 })), 0, 0.36, 0.851));
  for (const s of [-1, 1]) { const e = at(box(0.045, 0.05, 0.02, new THREE.MeshBasicMaterial({ color: 0x080404 })), s * 0.1, 0.47, 0.775); e.rotation.y = s * 0.5; body.add(e); }
  // plis entre les segments
  const folds = []; for (let k = 0; k < 3; k++) { const f = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.008, 4, 18), M(0xc8a07c)); f.position.set(0, 0.36, -0.28 + k * 0.28); body.add(f); folds.push(f); }
  // 4 paires de pattes a griffes
  const legs = [];
  [-0.38, -0.12, 0.14, 0.38].forEach((z, i) => {
    for (const s of [-1, 1]) {
      const lg = new THREE.Group(); lg.position.set(s * 0.22, 0.22, z); body.add(lg);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.22, 7), skin); leg.position.y = -0.1; lg.add(leg);
      for (let c = 0; c < 4; c++) { const cl = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.07, 4), M(0x3a2a20)); cl.position.set((c - 1.5) * 0.025, -0.23, 0.03); cl.rotation.x = 1.1; lg.add(cl); }
      if (i === 0) lg.rotation.x = -0.6;
      legs.push([lg, s, i]);
    }
  });
  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  g.userData = {
    legs, body, skin,
    // k : 0 = actif, 1 = tonnelet
    set(t, walk = 1, tun = 0) {
      legs.forEach(([lg, s, i]) => { const ph = t * 6 + i * 1.3 + (s > 0 ? Math.PI : 0); lg.rotation.x = (i === 0 ? -0.6 : 0) + 0.45 * Math.sin(ph) * walk * (1 - tun); lg.rotation.z = -s * (0.25 + 0.1 * Math.cos(ph) * walk); lg.scale.setScalar(Math.max(0.001, 1 - tun)); });
      body.scale.set(1 + 0.08 * tun, 1 - 0.1 * tun, 1 - 0.42 * tun); body.position.y = -0.14 * tun;
      head.scale.set(0.22 * (1 - 0.5 * tun), 0.2 * (1 - 0.5 * tun), 0.2 * (1 - 0.6 * tun)); head.position.z = 0.62 - 0.12 * tun; mouth.visible = tun < 0.5;
      body.rotation.z = 0.03 * Math.sin(t * 3) * walk;
      skin.color.setHex(o.color ?? 0xe8c4a0).lerp(new THREE.Color(0x8a6444), tun);
      folds.forEach(f => f.scale.setScalar(1 + 0.15 * tun));
    }
  };
  g.userData.set(0, 0, 0);
  return g;
}
// monde microscopique : mousse, gouttes, particules flottantes
function microWorld(o = {}) {
  const B = base({ bg: o.bg ?? 0x0d2a1c, fog: [o.bg ?? 0x0d2a1c, 4, 16], hemi: [0xd8ffe0, 0x1a2a14, 1.1], sun: [0xfff4e0, 1.4, [3, 6, 4]], shadowSize: 4, bloom: [0.6, 0.6, 0.8], exposure: 1.05 });
  const { scene } = B; const moss = [];
  const leafM = M(o.leaf ?? 0x4a9a3a), leafM2 = M(o.leaf2 ?? 0x2f7a2a);
  for (let i = 0; i < 40; i++) {
    const h = 1.5 + hash(i) * 2.5, lf = new THREE.Mesh(new THREE.ConeGeometry(0.18 + hash(i * 3) * 0.2, h, 4), i % 2 ? leafM : leafM2);
    const a = hash(i * 7) * Math.PI * 2, r = 2.2 + hash(i * 11) * 5;
    lf.position.set(Math.cos(a) * r, h / 2 - 0.3, Math.sin(a) * r - 1.5); lf.rotation.set((hash(i * 5) - 0.5) * 0.6, 0, (hash(i * 13) - 0.5) * 0.6); scene.add(lf); moss.push(lf);
  }
  const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 32), M(o.floor ?? 0x3a6a2a)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 4.2), leafM); leaf.position.set(0, -0.04, 0); leaf.receiveShadow = true; scene.add(leaf);
  const drops = []; for (let i = 0; i < 6; i++) { const d = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25 + hash(i) * 0.35, 2), new THREE.MeshLambertMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.45, emissive: new THREE.Color(0x103040) })); d.position.set((hash(i * 9) - 0.5) * 6, 0.3, -1 - hash(i * 4) * 3); scene.add(d); drops.push(d); }
  const motes = new THREE.Group(); scene.add(motes);
  for (let i = 0; i < 60; i++) motes.add(at(new THREE.Mesh(new THREE.OctahedronGeometry(0.02 + hash(i) * 0.03), G(0xd0ffd8, 1.1)), (hash(i * 3) - 0.5) * 8, hash(i * 5) * 4, (hash(i * 7) - 0.5) * 8 - 1));
  B.moss = moss; B.leafM = leafM; B.leafM2 = leafM2; B.drops = drops; B.motes = motes; B.floor = floor;
  B.drift = (t) => motes.children.forEach((m, i) => { m.position.y = (hash(i * 5) * 4 + t * 0.08) % 4; });
  return B;
}

// ---------- intro : un tardigrade flotte devant la Terre
SETS.intro = () => {
  const B = base({ bg: 0x02030a, hemi: [0xb0c8ff, 0x0a0a10, 0.6], sun: [0xfff4e0, 2.2, [5, 3, 4]], shadow: false, bloom: [0.7, 0.6, 0.75], exposure: 1.1 }); const { scene, cam } = B;
  scene.add(L.stars(1200, 200, 1.4));
  const earth = new THREE.Mesh(new THREE.IcosahedronGeometry(30, 4), M(0x2a5aa8)); earth.position.set(0, -38, -70); scene.add(earth);
  for (let i = 0; i < 26; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + hash(i) * 4, 1), M(i % 3 ? 0x4a8a3a : 0xf0f0f0)); const a = hash(i * 3) * Math.PI * 2, b = hash(i * 7) * 1.2; c.position.set(Math.cos(a) * Math.sin(b) * 28, Math.cos(b) * 28, Math.sin(a) * Math.sin(b) * 28); c.scale.y = 0.25; c.lookAt(0, 0, 0); earth.add(c); }
  const atmo = new THREE.Mesh(new THREE.IcosahedronGeometry(31.2, 4), holoMat(0x5ab8ff, 0.18)); atmo.position.set(0, -38, -70); scene.add(atmo);
  const td = tardigrade(); scene.add(td);
  const lbl = label('< 1 mm', { w: 1.0, h: 0.3, color: '#ffe0a0', font: 'bold 200px Inter' }); scene.add(lbl);
  const cold = label('−272 °C', { w: 1.0, h: 0.3, color: '#9adfff', font: 'bold 200px Inter' }); scene.add(cold);
  const rig = claudeRig(scene, [1.1, -0.6, 0.6], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); [rig.c.g, rig.pr].forEach(o => o.visible = false);
  return {
    ...B, update(t) {
      td.position.set(0, 0.05 * Math.sin(t * 0.8), 0); td.rotation.set(0.15 * Math.sin(t * 0.4), 0.6 + t * 0.12, 0.1 * Math.sin(t * 0.5)); td.userData.set(t, 0.5, 0);
      earth.rotation.y = t * 0.02;
      fade(cold, win(t, 3.2, 5.6, 0.3, 0.3)); cold.position.set(-0.7, 0.9, 0.2); cold.lookAt(cam.position);
      fade(lbl, win(t, 6.0, C.title, 0.3, 0.3)); lbl.position.set(0.6, 0.95, 0.2); lbl.lookAt(cam.position);
      camKeys(cam, t, [{ t: 0, p: [0.4, 0.7, 2.0], l: [0, 0.35, 0], f: 46 }, { t: C.title, p: [0.9, 0.9, 3.4], l: [0, 0.3, 0], f: 46 }, { t: SC.goeze.start, p: [1.4, 1.4, 5.2], l: [0, 0.0, 0], f: 46 }]);
    }
  };
};

// ---------- 1773 : Johann Goeze au microscope
SETS.goeze = () => {
  const B = base({ bg: 0x1a120c, fog: [0x1a120c, 6, 20], hemi: [0xffe0c0, 0x2a1a10, 0.7], sun: [0xffd8a0, 1.0, [-3, 5, 3]], shadowSize: 4, bloom: [0.5, 0.5, 0.85], exposure: 1.0 }); const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 8, M(0x5a3a22)), 0, -0.05, 0)); scene.add(at(box(8, 4, 0.2, M(0x8a6a4a)), 0, 2, -1.8));
  for (let i = 0; i < 5; i++) scene.add(at(box(0.25 + hash(i) * 0.1, 0.35, 0.25, M([0x6a2a1a, 0x2a3a5a, 0x4a3a1a, 0x5a1a2a, 0x2a4a2a][i])), -1.6 + i * 0.3, 1.9, -1.6));
  scene.add(at(box(1.8, 0.06, 0.12, M(0x4a2a18)), -1.0, 1.7, -1.6));
  const desk = at(box(1.8, 0.08, 0.9, M(0x6a4428)), 0, 0.78, 0.0); scene.add(desk);
  for (const [x, z] of [[-0.8, -0.4], [0.8, -0.4], [-0.8, 0.4], [0.8, 0.4]]) scene.add(at(box(0.07, 0.76, 0.07, M(0x4a2a18)), x, 0.38, z));
  // microscope de laiton
  const mic = new THREE.Group(); mic.position.set(0.35, 0.82, 0.05); scene.add(mic);
  const brass = M(0xc8963a, { emissive: new THREE.Color(0x201000) });
  mic.add(at(box(0.22, 0.03, 0.18, M(0x3a2a1a)), 0, 0.015, 0)); mic.add(at(box(0.03, 0.3, 0.03, brass), 0, 0.17, -0.05));
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.24, 10), brass); tube.position.set(0, 0.3, 0.0); tube.rotation.x = -0.35; mic.add(tube);
  mic.add(at(box(0.12, 0.012, 0.12, brass), 0, 0.16, 0.03));
  const candle = new THREE.Group(); candle.position.set(-0.55, 0.82, 0.15); scene.add(candle);
  candle.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), M(0xf0e8d0)), 0, 0.1, 0));
  const flame = at(new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 6), G(0xffc040, 3)), 0, 0.24, 0); candle.add(flame);
  const cl = new THREE.PointLight(0xffb060, 3, 4, 1.4); cl.position.set(-0.55, 1.15, 0.3); scene.add(cl);
  const goe = new Human({ skin: 0xe8c0a0, hair: 0xe8e4dc, hairStyle: 'short', top: 0x1a1a1e, bottom: 0x1a1a1e, jacket: 0x1a1a1e, seed: 2901 });
  goe.neck.add(at(box(0.1, 0.1, 0.02, M(0xf4f4f4)), 0, -0.02, 0.13)); // rabat blanc de pasteur
  goe.place(0, 0, -0.75, 0); scene.add(goe.root);
  faceLight(scene, [0.1, 1.5, 0.6], 1.8, 0xfff0d8);
  // hologramme : le tardigrade et son nom
  const holoT = tardigrade({ color: 0x7adfff, glow: 0x0a3a4a }); holoT.traverse(m => { if (m.isMesh) { m.material = holoMat(0x7adfff, 0.5); } }); holoT.scale.setScalar(0.3); holoT.position.set(0.55, 1.5, 0.1); holoT.traverse(m => { if (m.isMesh) m.material.opacity = 0.14; }); scene.add(holoT);
  const K = cardsMgr(scene, cam);
  K('Johann August Ephraim Goeze\npasteur et naturaliste allemand', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.goeze.start + 3.2, C.goeze_dit - 0.2, 0.3, 0.2), -0.55);
  imagined(K, 'réplique imaginée', C.goeze_dit - 0.1, C.nom);
  K('Tardigrada = « marcheurs lents »', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.nom + 0.5, SC.portrait.start, 0.3, 0.2), -0.55);
  K('« Kleiner Wasserbär »\nle petit ours d\'eau (1773)', { w: 1.6, h: 0.42, border: '#7dd8ff', small: true }, t => win(t, C.goeze_dit + 0.2, C.nom, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.goeze.start; const look = 1 - win(t, C.goeze_dit - 0.6, C.nom + 2.5, 0.5, 0.5);
      goe.pose(L.sitPose(0.48, { lean: 0.35 * look, hp: 0.35 * look, aL: [1.0, 0.1], aR: [1.0 + 0.4 * (1 - look), 0.25], eL: 1.2, eR: 1.2 - 0.6 * (1 - look) }));
      goe.face(env('goeze', t), 'happy', t);
      flame.scale.y = 1 + 0.2 * Math.sin(t * 13); cl.intensity = 2.8 + 0.4 * Math.sin(t * 11);
      fade(holoT, win(t, C.goeze_dit - 0.3, C.nom + 1.0, 0.4, 0.3)); holoT.userData.set(t, 1, 0); holoT.rotation.y = t * 0.6;
      camKeys(cam, t, [{ t: T0, p: [1.4, 1.5, 2.0], l: [0.1, 1.0, -0.4], f: 44 }, { t: C.goeze_dit - 0.6, p: [0.5, 1.35, 1.5], l: [0.0, 1.2, -0.6], f: 42 }, { t: C.nom + 0.3, p: [0.4, 1.35, 1.6], l: [0.0, 1.2, -0.6], f: 42 }, { t: SC.portrait.start, p: [0.6, 1.6, 2.2], l: [0.1, 1.5, 0], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- portrait du tardigrade sur une feuille de mousse
SETS.portrait = () => {
  const B = microWorld(); const { scene, cam } = B;
  const td = tardigrade(); scene.add(td);
  const tags = [['8 pattes à griffes', '#ffd070', [0.7, 0.25, 0.3]], ['bouche en tube', '#7dd8ff', [-0.3, 0.75, 0.9]], ['≈ 0,05 à 1,3 mm', '#ff9a8a', [0.0, 1.0, -0.3]]].map(([s, c, p]) => { const l = label(s, { w: 0.9, h: 0.14, color: c, font: 'bold 90px Inter' }); l.position.set(...p); scene.add(l); return l; });
  const rig = claudeRig(scene, [-1.3, 0, 1.0], 0.5, [0.45, 0, 0.1], 0x7dd8ff, 0.5, 0.3);
  // globe hologramme : partout
  const globe = holo(new THREE.IcosahedronGeometry(0.32, 1), 0x7dd8ff, 0.12); rig.holoG.add(globe);
  const spots = []; [[0.2, 0.9], [1.3, 0.3], [2.5, -0.4], [4.0, -1.2], [5.2, 0.6]].forEach(([a, b]) => { const s = at(new THREE.Mesh(new THREE.OctahedronGeometry(0.035), G(0xffd070, 2)), Math.cos(a) * Math.cos(b) * 0.33, Math.sin(b) * 0.33, Math.sin(a) * Math.cos(b) * 0.33); globe.add(s); spots.push(s); });
  const places = ['mousse', 'montagnes', 'océans', 'Antarctique'].map((s, i) => { const l = label(s, { w: 0.5, h: 0.1, color: ['#9aff9a', '#ffffff', '#7dd8ff', '#d8f0ff'][i], font: 'bold 80px Inter' }); rig.holoG.add(l); l.position.set(i % 2 ? 0.42 : -0.42, 0.25 - Math.floor(i / 2) * 0.5, 0); return l; });
  const K = cardsMgr(scene, cam);
  K('≈ 1 500 espèces connues', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, SC.portrait.start + 5.0, C.partout, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.portrait.start; B.drift(t);
      td.position.set(0.1, 0.04, -0.4 + 0.08 * (t - T0)); td.rotation.y = 0.2 * Math.sin(t * 0.3); td.userData.set(t, 1, 0);
      tags.forEach((l, i) => { fade(l, win(t, T0 + 0.8 + i * 1.3, C.partout - 0.3, 0.3, 0.3)); l.lookAt(cam.position); });
      rig.c.update(t, env('claude', t), {}); const on = sstep(C.partout - 0.5, C.partout, t); beamOn(rig, on, t); fade(globe, on); globe.rotation.y = t * 0.5;
      places.forEach((l, i) => { fade(l, sstep(C.partout + 1.5 + i * 1.3, C.partout + 1.9 + i * 1.3, t)); l.lookAt(cam.position); });
      camKeys(cam, t, [{ t: T0, p: [0.9, 0.7, 2.0], l: [0.1, 0.35, 0], f: 46 }, { t: C.partout - 0.6, p: [0.5, 0.8, 2.2], l: [0.1, 0.4, 0.4], f: 46 }, { t: C.partout + 0.4, p: [-0.4, 1.3, 3.4], l: [-0.8, 0.9, 0.6], f: 46 }, { t: SC.tonnelet.start, p: [-0.4, 1.3, 3.5], l: [-0.8, 0.9, 0.6], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- le tonnelet ; une chercheuse le reveille avec une goutte d'eau
SETS.tonnelet = () => {
  const B = microWorld(); const { scene, cam } = B;
  const td = tardigrade(); scene.add(td);
  const drop = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 2), new THREE.MeshLambertMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.55, emissive: new THREE.Color(0x103040) })); scene.add(drop);
  // laboratoire (a l'ecart)
  const lab = new THREE.Group(); lab.position.set(40, 0, 0); scene.add(lab);
  lab.add(at(box(6, 0.1, 6, M(0xd8dce0)), 0, 0, 0)); lab.add(at(box(6, 4, 0.2, M(0xe8eef2)), 0, 2, -1.6));
  lab.add(at(box(1.8, 0.08, 0.8, M(0xf4f4f4)), 0, 0.9, 0.3)); lab.add(at(box(1.7, 0.86, 0.7, M(0x9aa8b4)), 0, 0.45, 0.3));
  const mic = new THREE.Group(); mic.position.set(0.45, 0.94, 0.35); lab.add(mic); mic.add(at(box(0.25, 0.04, 0.2, M(0x2a2a30)), 0, 0.02, 0)); mic.add(at(box(0.05, 0.35, 0.05, M(0xe0e0e0)), 0, 0.2, -0.06)); const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 10), M(0x2a2a30)); tb.position.set(0, 0.36, 0); tb.rotation.x = -0.3; mic.add(tb);
  const res = new Human({ skin: 0x5a3420, hair: 0x120c08, hairStyle: 'bun', top: 0x3a6a8a, bottom: 0x2a2a34, jacket: 0xf4f6f8, seed: 2902 });
  res.place(0, 0, -0.3, 0); lab.add(res.root);
  const pip = new THREE.Group(); pip.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.004, 0.22, 6), M(0xd0e8ff)), 0, -0.1, 0)); pip.add(at(box(0.03, 0.06, 0.03, M(0x3a6aa8)), 0, 0.03, 0)); res.hand.R.add(pip); pip.position.set(0, -0.05, 0.03);
  faceLight(scene, [40, 1.6, 1.4], 2.0, 0xfff4e8, 5);
  const K = cardsMgr(scene, cam);
  K('cryptobiose : il sèche en « tonnelet »\nson métabolisme s\'arrête presque', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.tonnelet.start + 3.0, C.goutte - 0.2, 0.3, 0.2), -0.55);
  imagined(K, 'personnage et réplique imaginés', C.goutte - 0.1, C.goutte + 2.6);
  return {
    ...B, update(t) {
      const T0 = SC.tonnelet.start, tw = C.goutte + 2.8; B.drift(t);
      const dry = sstep(T0 + 0.5, T0 + 3.5, t) * (1 - sstep(tw, tw + 1.5, t));
      B.leafM.color.setHex(0x4a9a3a).lerp(new THREE.Color(0x8a7a4a), dry); B.leafM2.color.setHex(0x2f7a2a).lerp(new THREE.Color(0x6a5a3a), dry);
      B.drops.forEach(d => d.scale.setScalar(Math.max(0.01, 1 - dry)));
      const tun = sstep(T0 + 2.0, T0 + 5.0, t) * (1 - sstep(tw + 0.6, tw + 2.6, t));
      td.position.set(0, 0.02, 0); td.rotation.y = 0.5; td.userData.set(t, 1 - tun, tun);
      const fall = sstep(tw - 0.6, tw, t); drop.visible = t > tw - 0.8 && t < tw + 0.6; drop.position.set(0, 2.6 - 2.3 * fall, 0); drop.scale.set(1, 1 + 0.3 * (1 - fall), 1);
      res.pose({ aR: [1.2, 0.2], eR: 0.6, aL: [0.4, 0.15], hp: 0.0 }); res.face(env('cherch', t), 'happy', t);
      camKeys(cam, t, [{ t: T0, p: [1.6, 1.0, 1.6], l: [0, 0.3, 0], f: 46 }, { t: C.goutte - 0.6, p: [1.1, 0.8, 1.4], l: [0, 0.25, 0], f: 46 }, { t: C.goutte - 0.4, p: [40.3, 1.5, 1.6], l: [40, 1.45, -0.3], f: 42 }, { t: tw - 1.0, p: [40.2, 1.5, 1.4], l: [40, 1.45, -0.3], f: 42 }, { t: tw - 0.8, p: [1.2, 1.0, 1.8], l: [0, 0.4, 0], f: 46 }, { t: SC.records.start, p: [0.9, 0.7, 1.6], l: [0, 0.3, 0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- les records en laboratoire (trois chambres hologrammes)
SETS.records = () => {
  const B = base({ bg: 0x07060c, fog: [0x07060c, 8, 30], hemi: [0xb0a8c8, 0x18141c, 1.0], sun: [0xffffff, 1.0, [2, 5, 4]], shadow: false, bloom: [0.6, 0.5, 0.8] }); const { scene, cam } = B;
  scene.add(new THREE.GridHelper(40, 40, new THREE.Color(0xd99a57).multiplyScalar(0.9), new THREE.Color(0xd99a57).multiplyScalar(0.25)));
  const ch = [[0x7dd8ff, 'froid proche\ndu zéro absolu', '−272 °C'], [0xff7a5a, '≈ 150 °C\nquelques minutes', '150 °C'], [0xc08aff, 'pression\n× 6 000', '× 6 000']].map(([c, txt, big], i) => {
    const g = new THREE.Group(); g.position.set((i - 1) * 1.05, 0, 0); scene.add(g);
    g.add(holo(new THREE.CylinderGeometry(0.42, 0.42, 1.3, 16, 1, true), c, 0.08)).children; g.children[0].position.y = 0.65;
    const tun = tardigrade(); tun.scale.setScalar(0.35); tun.position.y = 0.45; tun.userData.set(0, 0, 1); g.add(tun);
    const bl = label(big, { w: 0.9, h: 0.24, color: '#' + new THREE.Color(c).getHexString(), font: 'bold 160px Inter' }); bl.position.set(0, 1.55, 0); g.add(bl);
    const fx = new THREE.Group(); g.add(fx);
    for (let k = 0; k < 14; k++) fx.add(at(new THREE.Mesh(new THREE.OctahedronGeometry(0.025), G(c, 1.6)), (hash(k + i * 20) - 0.5) * 0.6, hash(k * 3 + i) * 1.2 + 0.05, (hash(k * 5 + i) - 0.5) * 0.6));
    if (i === 2) for (const y of [0.15, 1.2]) g.add(at(box(0.8, 0.06, 0.8, holoMat(c, 0.5)), 0, y, 0));
    return { g, tun, bl, fx, i };
  });
  const K = cardsMgr(scene, cam);
  K('en laboratoire, à l\'état de tonnelet', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, SC.records.start + 0.8, SC.espace.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.records.start, D = SC.espace.start - T0;
      ch.forEach(({ g, tun, bl, fx, i }) => { const k = sstep(T0 + 0.4 + i * D * 0.27, T0 + 0.9 + i * D * 0.27, t); fade(g, k); bl.lookAt(cam.position); tun.rotation.y = t * 0.4; fx.children.forEach((m, j) => { m.position.y = (hash(j + i * 20) * 1.2 + t * (i === 1 ? 0.4 : -0.2) + 12) % 1.2 + 0.05; }); });
      camKeys(cam, t, [{ t: T0, p: [0, 1.5, 6.4], l: [0, 0.85, 0], f: 50 }, { t: SC.espace.start, p: [0, 1.4, 6.0], l: [0, 0.85, 0], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- 2007 : dix jours dans le vide de l'espace
SETS.espace = () => {
  const B = base({ bg: 0x02030a, hemi: [0xb0c8ff, 0x0a0a10, 0.7], sun: [0xfff4e0, 2.2, [5, 3, 4]], shadow: false, bloom: [0.6, 0.6, 0.75], exposure: 1.1 }); const { scene, cam } = B;
  scene.add(L.stars(1200, 200, 1.4));
  const earth = new THREE.Mesh(new THREE.IcosahedronGeometry(30, 4), M(0x2a5aa8)); earth.position.set(0, -36, -18); scene.add(earth);
  for (let i = 0; i < 26; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + hash(i) * 4, 1), M(i % 3 ? 0x4a8a3a : 0xf0f0f0)); const a = hash(i * 3) * Math.PI * 2, b = hash(i * 7) * 1.2; c.position.set(Math.cos(a) * Math.sin(b) * 28, Math.cos(b) * 28, Math.sin(a) * Math.sin(b) * 28); c.scale.y = 0.25; c.lookAt(0, 0, 0); earth.add(c); }
  const cap = new THREE.Group(); scene.add(cap);
  cap.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 1), M(0x8a8478)));
  cap.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.8, 10), M(0x8a8a90)), 0, 0, -0.8)).children;
  cap.children[1].rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) cap.add(at(box(1.4, 0.02, 0.5, M(0x2a3a7a, { emissive: new THREE.Color(0x0a1030) })), s * 1.3, 0, -0.8));
  const bio = new THREE.Group(); bio.position.set(0, 0.62, 0.05); cap.add(bio);
  bio.add(box(0.36, 0.06, 0.24, M(0x9a9aa4)));
  const lid = new THREE.Group(); lid.position.set(0, 0.03, -0.12); bio.add(lid); lid.add(at(box(0.36, 0.02, 0.24, M(0xe0e0e8)), 0, 0, 0.12));
  const tuns = []; for (let k = 0; k < 6; k++) { const tn = tardigrade(); tn.scale.setScalar(0.05); tn.position.set(-0.12 + (k % 3) * 0.12, 0.035, -0.05 + Math.floor(k / 3) * 0.1); tn.userData.set(0, 0, 1); bio.add(tn); tuns.push(tn); }
  
  // retour : un tardigrade avec ses oeufs
  const back = microWorld(); const td = tardigrade(); back.scene.add(td);
  const eggs = []; for (let k = 0; k < 7; k++) { const e = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 1), M(0xf0e0c0, { emissive: new THREE.Color(0x201808) })); e.position.set(-0.55 + (hash(k) - 0.5) * 0.3, 0.07, -0.6 + k * 0.08); back.scene.add(e); eggs.push(e); }
  const tSwap = SC.espace.start + 7.8;
  const K = cardsMgr(scene, cam), K2 = cardsMgr(back.scene, back.cam);
  K('FOTON-M3 · expérience TARDIS\n10 jours dans le vide de l\'espace', { w: 1.6, h: 0.42, border: '#9adfff', small: true }, t => win(t, SC.espace.start + 3.2, tSwap, 0.3, 0.2), -0.55);
  K2('de retour sur Terre : beaucoup se réveillent\net pondent des œufs viables', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, tSwap + 0.2, SC.dsup.start, 0.3, 0.2), -0.55);
  const out = {
    ...B, update(t) {
      if (t >= tSwap) { back.drift(t); td.position.set(0.1, 0.02, 0.0); td.rotation.y = -0.6; td.userData.set(t, 0.6, 1 - sstep(tSwap, tSwap + 1.2, t)); eggs.forEach((e, k) => { e.visible = t > tSwap + 0.8 + k * 0.15; });
        camKeys(back.cam, t, [{ t: tSwap, p: [0.9, 0.9, 1.9], l: [-0.1, 0.25, -0.2], f: 46 }, { t: SC.dsup.start, p: [0.7, 0.8, 1.7], l: [-0.1, 0.25, -0.2], f: 46 }]); K2.update(t); out.scene = back.scene; out.cam = back.cam; out.bloom = back.bloom; return; }
      out.scene = scene; out.cam = cam; out.bloom = B.bloom;
      const T0 = SC.espace.start; cap.position.set(0, 0, 0); cap.rotation.set(0.2, 0.4 + (t - T0) * 0.05, 0.05); earth.rotation.y = t * 0.03;
      lid.rotation.x = -1.8 * sstep(T0 + 2.0, T0 + 3.0, t);
      camKeys(cam, t, [{ t: T0, p: [3.8, 2.2, 5.6], l: [0, 0, -0.3], f: 46 }, { t: T0 + 3.0, p: [1.4, 1.8, 2.0], l: [0, 0.5, 0], f: 44 }, { t: tSwap, p: [0.9, 1.5, 1.3], l: [0, 0.62, 0.05], f: 42 }]);
      K.update(t);
    }
  };
  return out;
};

// ---------- 2016 : la proteine Dsup ; trente ans dans la glace
SETS.dsup = () => {
  const B = base({ bg: 0x05070f, fog: [0x05070f, 10, 40], hemi: [0x8a9ac8, 0x14141c, 1.0], sun: [0xffffff, 1.0, [2, 5, 4]], shadow: false, bloom: [0.6, 0.5, 0.78] }); const { scene, cam } = B;
  scene.add(new THREE.GridHelper(40, 40, new THREE.Color(0xd99a57).multiplyScalar(0.8), new THREE.Color(0xd99a57).multiplyScalar(0.22)));
  const dna = new THREE.Group(); dna.position.set(0, 1.0, 0); scene.add(dna);
  for (let k = 0; k < 26; k++) { const a = k * 0.5, y = (k - 13) * 0.07; for (const s of [0, Math.PI]) dna.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), G(s ? 0xff9a6a : 0x7dd8ff, 1.5)), Math.cos(a + s) * 0.22, y, Math.sin(a + s) * 0.22)); dna.add(at(box(0.44, 0.012, 0.012, holoMat(0xffffff, 0.4)), 0, y, 0)).children; dna.children.at(-1).rotation.y = -a; }
  const shield = holo(new THREE.CylinderGeometry(0.42, 0.42, 2.0, 18, 1, true), 0x7dffb0, 0.14); dna.add(shield);
  const rays = []; for (let k = 0; k < 18; k++) { const r = L.beam([0, 0, 0], [0, -0.35, 0], 0.012, G(0xff6a5a, 2)); scene.add(r); rays.push(r); }
  const lD = label('Dsup', { w: 0.8, h: 0.3, color: '#7dffb0', font: 'bold 220px Inter' }); lD.position.set(0.75, 1.9, 0.2); scene.add(lD);
  const rig = claudeRig(scene, [1.3, 0, 1.2], -0.5, [-0.45, 0, 0.1], 0x7dffb0, 0.45, 0.28); rig.pr.visible = false;
  // la glace de l'Antarctique
  const ice = microWorld({ bg: 0x0e2230, leaf: 0x6a8a5a, leaf2: 0x4a6a4a, floor: 0xd8e8f0 }); const td = tardigrade(); ice.scene.add(td);
  const block = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.8), new THREE.MeshLambertMaterial({ color: 0xcfeaff, transparent: true, opacity: 0.55, emissive: new THREE.Color(0x10283a) })); block.position.y = 0.5; ice.scene.add(block);
  const kids = [0, 1].map(k => { const b = tardigrade(); b.scale.setScalar(0.4); ice.scene.add(b); return b; });
  const K = cardsMgr(scene, cam), K2 = cardsMgr(ice.scene, ice.cam);
  K('2016 · Université de Tokyo\nla protéine Dsup protège l\'ADN', { w: 1.6, h: 0.42, border: '#7dffb0', small: true }, t => win(t, SC.dsup.start + 1.0, C.glace, 0.3, 0.2), -0.55);
  K2('mousse de l\'Antarctique, congelée en 1983\nréveillée en 2014 · publié en 2016', { w: 1.6, h: 0.42, border: '#9adfff', small: true }, t => win(t, C.glace + 0.8, SC.nuance.start, 0.3, 0.2), -0.55);
  const out = {
    ...B, update(t) {
      if (t >= C.glace) {
        ice.drift(t); const melt = sstep(C.glace + 2.0, C.glace + 4.5, t); block.scale.set(1, Math.max(0.01, 1 - melt), 1); block.position.y = 0.5 * (1 - melt); block.material.opacity = 0.55 * (1 - melt * 0.8);
        const wake = sstep(C.glace + 4.0, C.glace + 5.5, t); td.position.set(0, 0.02, 0); td.rotation.y = 0.5; td.userData.set(t, wake, 1 - wake);
        kids.forEach((b, k) => { b.visible = t > C.glace + 6.0 + k * 0.5; b.position.set(0.6 + k * 0.3, 0.01, 0.3 - k * 0.5 + 0.05 * (t - C.glace)); b.rotation.y = 0.3; b.userData.set(t + k, 1, 0); });
        camKeys(ice.cam, t, [{ t: C.glace, p: [1.4, 1.2, 2.2], l: [0, 0.4, 0], f: 46 }, { t: SC.nuance.start, p: [1.1, 0.9, 1.9], l: [0.2, 0.3, 0], f: 46 }]); K2.update(t); out.scene = ice.scene; out.cam = ice.cam; out.bloom = ice.bloom; return;
      }
      out.scene = scene; out.cam = cam; out.bloom = B.bloom;
      const T0 = SC.dsup.start; dna.rotation.y = t * 0.5; const sk = sstep(T0 + 3.5, T0 + 4.5, t); fade(shield, sk); fade(lD, sk); lD.lookAt(cam.position);
      rays.forEach((r, k) => { const ph = (t * 0.7 + hash(k)) % 1; const a = hash(k * 3) * Math.PI * 2; const R = 1.6 - ph * 1.6 * (sk > 0.5 ? 0.7 : 1); r.position.set(Math.cos(a) * R, 1.0 + (hash(k * 7) - 0.5) * 1.6, Math.sin(a) * R); r.lookAt(0, r.position.y, 0); r.rotateX(Math.PI / 2); });
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0, 1.2, 3.6], l: [0, 1.0, 0], f: 48 }, { t: C.glace, p: [0.3, 1.1, 3.0], l: [0, 1.0, 0], f: 48 }]);
      K.update(t);
    }
  };
  return out;
};

// ---------- la nuance : actifs, ils sont fragiles
SETS.nuance = () => {
  const B = microWorld(); const { scene, cam } = B;
  const td = tardigrade(); scene.add(td);
  const rig = claudeRig(scene, [-1.2, 0, 0.9], 0.5, [0.45, 0, 0.1], 0xff9a6a, 0.5, 0.3);
  const th = new THREE.Group(); rig.holoG.add(th);
  th.add(holo(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8), 0xff9a6a, 0.15)); const bulb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 1), G(0xff6a3a, 1.6)); bulb.position.y = -0.28; th.add(bulb);
  const lvl = at(box(0.05, 0.4, 0.05, G(0xff6a3a, 1.6)), 0, -0.05, 0); th.add(lvl);
  const l37 = label('37 °C', { w: 0.5, h: 0.16, color: '#ffb08a', font: 'bold 160px Inter' }); l37.position.set(0.32, 0.12, 0); rig.holoG.add(l37);
  const K = cardsMgr(scene, cam);
  K('réveillés, ils sont fragiles\nR. varieornatus : 50 % meurent en 24 h à 37 °C', { w: 1.6, h: 0.42, border: '#ff9a6a', small: true }, t => win(t, SC.nuance.start + 1.5, SC.nuance.start + 6.8, 0.3, 0.2), -0.55);
  K('leur force : savoir s\'arrêter', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, SC.nuance.start + 7.0, SC.fin.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.nuance.start; B.drift(t);
      const slow = sstep(T0 + 4.0, T0 + 6.0, t) * (1 - sstep(T0 + 7.0, T0 + 8.5, t)), tun = sstep(T0 + 7.0, T0 + 8.5, t);
      td.position.set(0.3, 0.02, -0.3); td.rotation.y = -0.4; td.userData.set(t, 1 - 0.8 * slow, tun * 0.9);
      rig.c.update(t, env('claude', t), {}); const on = sstep(T0 + 1.0, T0 + 1.6, t); beamOn(rig, on, t); fade(th, on); fade(l37, on); lvl.scale.y = 0.4 + 0.6 * sstep(T0 + 1.5, T0 + 4.0, t); lvl.position.y = -0.25 + 0.2 * lvl.scale.y; l37.lookAt(cam.position);
      camKeys(cam, t, [{ t: T0, p: [0.2, 1.1, 2.8], l: [-0.4, 0.5, 0], f: 46 }, { t: SC.fin.start, p: [0.1, 1.0, 2.5], l: [-0.4, 0.5, 0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- fin
SETS.fin = () => {
  const B = microWorld(); const { scene, cam } = B;
  const td = tardigrade(); scene.add(td);
  const rig = claudeRig(scene, [-0.5, 0, 0.6], 0.25, [0.45, 0, 0.1], 0xffd070, 0.5, 0.3);
  faceLight(scene, [-0.3, 1.0, 2.0], 1.4, 0xfff0d8);
  const icons = ['LE FROID', 'L\'ESPACE', 'LES RADIATIONS'].map((s, i) => { const l = label(s, { w: 0.7, h: 0.12, color: ['#9adfff', '#ffd070', '#7dffb0'][i], font: 'bold 84px Inter' }); rig.holoG.add(l); l.position.set(0, 0.3 - i * 0.15, 0); return l; });
  return {
    ...B, update(t) {
      const T0 = SC.fin.start; B.drift(t);
      td.position.set(0.9, 0.02, -0.4); td.rotation.y = -0.7; td.userData.set(t, 0.6, 0);
      const qk = sstep(T0 + 1.0, T0 + 1.5, t); beamOn(rig, qk, t);
      icons.forEach((l, i) => { fade(l, sstep(T0 + 1.8 + i * 1.0, T0 + 2.2 + i * 1.0, t)); l.lookAt(cam.position); });
      rig.c.update(t, env('claude', t), { wave: sstep(TL.duration - 2.0, TL.duration - 1.5, t) });
      camKeys(cam, t, [{ t: T0, p: [0.4, 1.0, 3.2], l: [0.1, 0.75, 0], f: 46 }, { t: TL.duration, p: [0.35, 0.95, 2.9], l: [0.1, 0.72, 0], f: 46 }]);
    }
  };
};

// ---------- couverture
SETS.cover = () => {
  const B = microWorld(); const { scene, cam } = B;
  const td = tardigrade(); scene.add(td);
  const rim = new THREE.PointLight(0x7adfff, 4, 4, 1.2); rim.position.set(-0.8, 1.2, -0.8); scene.add(rim);
  return { ...B, update(t) { B.drift(3); td.rotation.y = 0.45; td.userData.set(0.6, 1, 0); cam.position.set(0.85, 0.75, 1.9); cam.fov = 50; cam.updateProjectionMatrix(); cam.lookAt(0.0, 0.12, 0.1); } };
};

const SHOTS = [
  ['intro', 0, SC.goeze.start], ['goeze', SC.goeze.start, SC.portrait.start], ['portrait', SC.portrait.start, SC.tonnelet.start], ['tonnelet', SC.tonnelet.start, SC.records.start],
  ['records', SC.records.start, SC.espace.start], ['espace', SC.espace.start, SC.dsup.start], ['dsup', SC.dsup.start, SC.nuance.start], ['nuance', SC.nuance.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9],
];
