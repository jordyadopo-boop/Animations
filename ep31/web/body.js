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


// ---------- personnages et decors de la Renaissance
function machiavel(o = {}) {
  return new Human({ skin: 0xe0b090, hair: 0x1a1210, hairStyle: 'short', top: 0x1a1416, bottom: 0x1a1416, robe: o.robe ?? 0x7a1a1e, robeL: 0.8, jacket: o.robe ?? 0x7a1a1e, seed: 3101, ...o });
}
function florenceCity(scene, o = {}) {
  const g = new THREE.Group(); scene.add(g);
  const roofs = [0xb8572e, 0xa84a26, 0xc0623a], walls = [0xe8d8b8, 0xd8c098, 0xf0e4c8];
  for (let i = 0; i < 140; i++) {
    const x = (hash(i * 3.1) - 0.5) * 40, z = (hash(i * 7.3) - 0.5) * 30 - 6; if (Math.abs(z + 2) < 1.4) continue; // l'Arno
    if (Math.hypot(x, z + 8) < 3.2) continue;
    const w = 1 + hash(i) * 1.4, d = 1 + hash(i * 5) * 1.4, h = 1 + hash(i * 9) * 1.6;
    g.add(at(box(w, h, d, M(walls[i % 3])), x, h / 2, z)); const r = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.72, 0.5, 4), M(roofs[i % 3])); r.rotation.y = Math.PI / 4; r.position.set(x, h + 0.25, z); r.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d)); g.add(r);
  }
  // le Duomo et sa coupole
  const du = new THREE.Group(); du.position.set(0, 0, -8); g.add(du);
  du.add(at(box(3.2, 2.6, 6, M(0xf0e8d8)), 0, 1.3, 1.2)); du.add(at(new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 1.6, 8), M(0xf0e8d8)), 0, 3.4, -1.0));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.0, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0xc0582e)); dome.scale.y = 1.25; dome.position.set(0, 4.2, -1.0); du.add(dome);
  for (let k = 0; k < 8; k++) { const rib = box(0.08, 2.6, 0.08, M(0xf4f0e8)); const a = k / 8 * Math.PI * 2; rib.position.set(Math.cos(a) * 1.25, 5.3, -1.0 + Math.sin(a) * 1.25); rib.lookAt(0, 7.6, -1.0); rib.rotateX(Math.PI / 2); du.add(rib); }
  du.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.7, 8), M(0xf4f0e8)), 0, 6.95, -1.0));
  du.add(at(box(0.9, 5.5, 0.9, M(0xf0e8d8)), 2.4, 2.75, 3.2)); // campanile
  // le Palazzo Vecchio et sa tour
  const pv = new THREE.Group(); pv.position.set(4, 0, 2.5); g.add(pv);
  pv.add(at(box(3, 3, 3, M(0xb8a078)), 0, 1.5, 0)); pv.add(at(box(0.7, 4, 0.7, M(0xb8a078)), 0.6, 5, 0.6)); pv.add(at(box(1.0, 0.5, 1.0, M(0xa89068)), 0.6, 7.2, 0.6));
  g.userData.pv = pv; g.userData.duomo = du;
  // l'Arno
  const river = new THREE.Mesh(new THREE.PlaneGeometry(60, 2.2), M(0x4a7a8a)); river.rotation.x = -Math.PI / 2; river.position.set(0, 0.03, -2); g.add(river);
  g.add(at(box(0.8, 0.3, 2.4, M(0xd8c098)), -3, 0.2, -2));
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), M(0x8a8a5a)); gr.rotation.x = -Math.PI / 2; g.add(gr);
  return g;
}
function study(scene, pos, o = {}) {
  const g = new THREE.Group(); g.position.set(...pos); scene.add(g);
  g.add(at(box(6, 0.1, 6, M(0x5a3a22)), 0, 0, 0)); g.add(at(box(6, 4, 0.2, M(0xc8b090)), 0, 2, -1.6));
  const win_ = at(box(1.0, 1.3, 0.05, new THREE.MeshBasicMaterial({ color: o.night ? 0x1a2a5a : 0x9ac0e8 })), 1.4, 2.0, -1.48); g.add(win_);
  const desk = at(box(1.6, 0.08, 0.8, M(0x5a3a22)), 0, 0.78, 0.2); g.add(desk);
  for (const [x, z] of [[-0.7, -0.15], [0.7, -0.15], [-0.7, 0.55], [0.7, 0.55]]) g.add(at(box(0.07, 0.76, 0.07, M(0x3a2414)), x, 0.38, z));
  const paper = at(box(0.4, 0.01, 0.3, M(0xf0e4c0)), 0.0, 0.83, 0.3); g.add(paper);
  const quill = box(0.01, 0.01, 0.25, M(0xf4f4f4)); quill.position.set(0.2, 0.9, 0.3); quill.rotation.x = 0.6; g.add(quill);
  for (let i = 0; i < 3; i++) g.add(at(box(0.3, 0.08, 0.22, M([0x6a2a1a, 0x2a3a5a, 0x4a3a1a][i])), -0.55, 0.86 + i * 0.08, 0.2));
  const candle = new THREE.Group(); candle.position.set(-0.5, 0.82, 0.45); g.add(candle);
  candle.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), M(0xf0e8d0)), 0, 0.1, 0));
  const flame = at(new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 6), G(0xffc040, 3)), 0, 0.24, 0); candle.add(flame);
  const cl = new THREE.PointLight(0xffb060, o.night ? 3.5 : 1.5, 5, 1.4); cl.position.set(-0.4, 1.2, 0.8); g.add(cl);
  g.userData.tick = (t) => { flame.scale.y = 1 + 0.2 * Math.sin(t * 13); cl.intensity = (o.night ? 3.3 : 1.4) + 0.4 * Math.sin(t * 11); };
  return g;
}
function fox() {
  const g = new THREE.Group(); const m = M(0xd8702a), w = M(0xf4ece0), legs = [];
  g.add(at(box(0.3, 0.3, 0.8, m), 0, 0.5, 0)); g.add(at(box(0.28, 0.26, 0.3, m), 0, 0.68, 0.5)); g.add(at(box(0.14, 0.12, 0.2, w), 0, 0.62, 0.7));
  for (const s of [-1, 1]) { g.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 4), m), s * 0.09, 0.88, 0.48)); g.add(at(box(0.03, 0.04, 0.02, new THREE.MeshBasicMaterial({ color: 0x050505 })), s * 0.08, 0.74, 0.65)); }
  const tail = box(0.16, 0.16, 0.6, m); tail.position.set(0, 0.55, -0.6); tail.rotation.x = 0.5; g.add(tail); g.add(at(box(0.17, 0.17, 0.14, w), 0, 0.4, -0.85));
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const lg = new THREE.Group(); lg.position.set(sx * 0.1, 0.35, sz * 0.3); lg.add(at(box(0.07, 0.35, 0.07, M(0x3a2a20)), 0, -0.17, 0)); g.add(lg); legs.push(lg); }
  g.userData.walk = (ph) => legs.forEach((l, i) => l.rotation.x = 0.4 * Math.sin(ph + [0, Math.PI, Math.PI, 0][i]));
  return g;
}

// ---------- intro : Machiavel ecrit la nuit
SETS.intro = () => {
  const B = base({ bg: 0x0a0806, fog: [0x0a0806, 6, 20], hemi: [0xffe0c0, 0x1a1008, 0.55], sun: [0xc0d0ff, 0.4, [3, 5, 4]], shadowSize: 3, bloom: [0.6, 0.5, 0.82], exposure: 1.0 }); const { scene, cam } = B;
  const st = study(scene, [0, 0, 0], { night: true });
  const mac = machiavel(); mac.place(0, 0, -0.45, 0); scene.add(mac.root);
  faceLight(scene, [0.2, 1.6, 0.7], 1.4, 0xffd8a8);
  const K = cardsMgr(scene, cam);
  K('« Il vaut mieux être craint qu\'aimé »\nLe Prince, chapitre 17', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, 1.0, 5.2, 0.4, 0.4), -0.55);
  const rig = claudeRig(scene, [0.45, 0.82, 0.62], -0.3, [-0.4, 0, 0.12], 0xffd070, 0.4, 0.25); rig.c.g.scale.setScalar(0.6); rig.pr.scale.setScalar(0.6); rig.pr.position.set(0.72, 0.82, 0.66);
  return {
    ...B, update(t) {
      st.userData.tick(t);
      mac.pose(L.sitPose(0.5, { aL: [1.0, 0.1], aR: [1.1 + 0.05 * Math.sin(t * 6), 0.15], eL: 0.9, eR: 1.0 + 0.1 * Math.sin(t * 7), hp: t < 4 ? 0.3 : 0.05 })); mac.face(0, 'serious', t);
      rig.c.update(t, env('claude', t), {}); const on = t > 6.0; rig.c.g.visible = on; rig.pr.visible = on;
      camKeys(cam, t, [{ t: 0, p: [0.5, 1.5, 2.2], l: [0, 1.25, -0.3], f: 44 }, { t: C.title - 1.5, p: [0.7, 1.35, 2.3], l: [0.25, 1.0, 0.2], f: 44 }, { t: SC.florence.start, p: [0.8, 1.4, 2.6], l: [0.25, 1.0, 0.2], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- 1469 : Florence ; l'Italie divisee ; Louis XII
SETS.florence = () => {
  const B = base({ sky: [0x5a8ad0, 0xf0d8b0], hemi: [0xfff0d8, 0x7a6a50, 1.0], sun: [0xfff0d0, 1.6, [10, 14, 10]], shadowSize: 14, bloom: [0.3, 0.5, 0.92], exposure: 1.05, fog: [0xf0dcb8, 30, 120] }); const { scene, cam } = B;
  scene.add(L.skyDome(0x5a8ad0, 0xf0d8b0));
  const city = florenceCity(scene);
  const rig = claudeRig(scene, [1.0, 0, 8.0], -0.3, [-0.5, 0, 0.1], 0xffd070, 0.5, 0.3); rig.c.g.scale.setScalar(1.6); rig.pr.scale.setScalar(1.6); rig.pr.position.set(0.25, 0, 8.2); rig.holoG.position.set(0.25, 2.3, 8.2);
  const map = new THREE.Group(); rig.holoG.add(map); map.scale.setScalar(2.6);
  [['Milan', -0.3, 0.42, 0x7dd8ff], ['Venise', 0.12, 0.4, 0x9a8aff], ['Florence', -0.05, 0.18, 0xffd070], ['États du pape', 0.1, 0.0, 0xffffff], ['Naples', 0.3, -0.25, 0x7dffb0]].forEach(([n, x, y, c]) => { const t_ = holo(new THREE.BoxGeometry(0.22, 0.16, 0.02), c, 0.25); t_.position.set(x, y, 0); map.add(t_); const l = label(n, { w: 0.34, h: 0.06, color: '#' + new THREE.Color(c).getHexString(), font: 'bold 90px Inter' }); l.position.set(x, y, 0.03); map.add(l); });
  const fr = label('France →', { w: 0.34, h: 0.07, color: '#ff8a7a', font: 'bold 90px Inter' }); fr.position.set(-0.55, 0.55, 0); map.add(fr);
  const es = label('← Espagne', { w: 0.36, h: 0.07, color: '#ff8a7a', font: 'bold 90px Inter' }); es.position.set(0.6, -0.38, 0); map.add(es);
  // la cour de Louis XII (decor separe)
  const court = new THREE.Group(); court.position.set(60, 0, 60); scene.add(court);
  court.add(at(box(8, 0.1, 8, M(0x6a5a8a)), 0, 0, 0)); court.add(at(box(8, 5, 0.2, M(0x2a3a7a)), 0, 2.5, -1.8));
  for (let i = 0; i < 6; i++) court.add(at(box(0.18, 0.18, 0.02, G(0xffd070, 1.3)), -2 + i * 0.8, 3.2, -1.68));
  court.add(at(box(1.0, 1.4, 0.8, M(0x8a2a2a)), 0, 0.7, -1.2)); court.add(at(box(1.2, 0.2, 0.9, M(0xc8963a)), 0, 1.5, -1.3));
  const king = new Human({ skin: 0xe0b090, hair: 0x6a4a2a, hairStyle: 'long', top: 0x2a3a8a, bottom: 0x2a3a8a, robe: 0x2a3a8a, robeL: 0.8, hat: 'crown', seed: 3110 }); king.place(60, 0.3, 59.0, 0); scene.add(king.root);
  const mac = machiavel(); mac.place(61.3, 0, 60.1, -1.2); scene.add(mac.root);
  faceLight(scene, [60.3, 1.8, 61.4], 2.0, 0xfff0e0, 5);
  const K = cardsMgr(scene, cam);
  K('Italie : Milan, Venise, Florence,\nÉtats du pape, Naples… et les guerres d\'Italie', { w: 1.6, h: 0.42, border: '#ff8a7a', small: true }, t => win(t, SC.florence.start + 6.0, C.secretaire, 0.3, 0.2), -0.55);
  K('Nicolas Machiavel (1469 – 1527)', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, SC.florence.start + 2.6, SC.florence.start + 5.5, 0.3, 0.2), -0.55);
  K('1498 · secrétaire de la Seconde Chancellerie\nmissions auprès de Louis XII', { w: 1.6, h: 0.42, border: '#7dd8ff', small: true }, t => win(t, C.secretaire + 0.5, SC.borgia.start, 0.3, 0.2), -0.55);
  const tCourt = C.secretaire + 3.2;
  return {
    ...B, update(t) {
      const T0 = SC.florence.start;
      rig.c.update(t, env('claude', t), {}); const on = sstep(T0 + 5.5, T0 + 6.2, t) * (1 - sstep(C.secretaire - 0.3, C.secretaire, t)); beamOn(rig, on, t); map.visible = false;
      king.pose(L.sitPose(0.62, { aR: [0.5 + 0.4 * Math.sin(t * 0.8), 0.3], eR: 0.8 })); king.face(0, 'serious', t);
      mac.pose({ aR: [0.6 + 0.3 * Math.sin(t * 2), 0.2], eR: 0.8, lean: 0.12 }); mac.face(0, 'neutral', t);
      if (t < tCourt) camKeys(cam, t, [{ t: T0, p: [8, 12, 22], l: [0, 2, -6], f: 46 }, { t: T0 + 5.0, p: [3.5, 4.5, 14], l: [0, 2.2, -4], f: 46 }, { t: T0 + 6.5, p: [1.6, 3.0, 12.0], l: [0.3, 2.4, 8.2], f: 46 }, { t: C.secretaire, p: [1.5, 3.0, 12.2], l: [0.3, 2.4, 8.2], f: 46 }, { t: C.secretaire + 0.8, p: [12, 9, 14], l: [4, 4, 2.5], f: 46 }, { t: tCourt, p: [11, 8.5, 13], l: [4, 4.5, 2.5], f: 46 }]);
      else camKeys(cam, t, [{ t: tCourt, p: [60.2, 1.6, 63.2], l: [60.6, 1.3, 59.6], f: 44 }, { t: SC.borgia.start, p: [60.3, 1.6, 62.7], l: [60.6, 1.3, 59.6], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- 1502 : Cesar Borgia
SETS.borgia = () => {
  const B = base({ sky: [0x6a7aa8, 0xe8c8a0], hemi: [0xfff0d8, 0x6a5a40, 0.9], sun: [0xffe0b0, 1.4, [4, 6, 8]], shadowSize: 6, bloom: [0.4, 0.5, 0.88], exposure: 1.0, fog: [0xd8c0a0, 15, 60] }); const { scene, cam } = B;
  scene.add(L.groundPlane(120, 40, 0x8a8a5a, 0.3, 2));
  const tent = new THREE.Mesh(new THREE.ConeGeometry(2.6, 3.0, 8, 1, true), M(0xa8282a, { side: THREE.DoubleSide })); tent.position.set(0, 1.5, -2.5); scene.add(tent);
  for (let i = 0; i < 5; i++) { const tt_ = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.0, 6), M(i % 2 ? 0xd8c8a0 : 0xa8282a)); tt_.position.set(-8 + i * 4, 1.0, -8 - hash(i) * 3); scene.add(tt_); }
  const flag = at(box(0.9, 0.6, 0.02, M(0xd8b030)), 0.45, 3.4, -2.5); scene.add(flag); scene.add(at(box(0.04, 1.2, 0.04, M(0x3a2a1a)), 0, 3.3, -2.5));
  const ces = new Human({ skin: 0xd09a70, hair: 0x1a1210, hairStyle: 'short', beard: 'full', top: 0x141414, bottom: 0x141414, jacket: 0x141414, hat: 'cap', hatColor: 0x141414, seed: 3120 }); ces.place(-0.3, 0, 0.0, 0.3); scene.add(ces.root);
  const mac = machiavel(); mac.place(1.0, 0, 0.5, -0.6); scene.add(mac.root);
  const sold = [0, 1, 2].map(i => { const h = new Human({ skin: [0xc68a5a, 0x8a5a3a, 0xe0b090][i], hair: 0x2a1a10, hairStyle: 'short', top: 0x8a8a90, bottom: 0x5a2a2a, jacket: 0x9a9aa0, hat: 'cap', hatColor: 0x8a8a90, seed: 3121 + i }); h.place(-2.2 + i * 0.7, 0, -1.0 - (i % 2) * 0.4, 0.2); scene.add(h.root); const sp = box(0.03, 2.0, 0.03, M(0x5a4a3a)); h.hand.R.add(sp); sp.position.set(0, 0.6, 0.04); return h; });
  faceLight(scene, [0.4, 1.8, 2.4], 2.0, 0xfff0e0, 5);
  const K = cardsMgr(scene, cam);
  K('César Borgia (1475 – 1507)\nfils du pape Alexandre VI', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.borgia.start + 1.5, SC.borgia.start + 6.0, 0.3, 0.2), -0.55);
  K('ruse · rapidité · peur\nle « modèle » du Prince (chap. 7)', { w: 1.6, h: 0.42, border: '#ff8a7a', small: true }, t => win(t, SC.borgia.start + 6.3, SC.chute.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.borgia.start;
      ces.pose({ aL: [0.3, 0.35], eL: 1.2, aR: [0.4 + 0.5 * win(t, T0 + 2, T0 + 6, 0.5, 0.5), 0.3], eR: 0.6 }); ces.face(0, 'serious', t);
      mac.pose({ aL: [0.2, 0.1], aR: [0.2, 0.1], hy: -0.3 }); mac.face(0, 'awe', t);
      sold.forEach((h, i) => { h.pose({ aR: [0.3, 0.1], eR: 0.6 }); h.face(0, 'serious', t); });
      flag.rotation.y = 0.15 * Math.sin(t * 2);
      camKeys(cam, t, [{ t: T0, p: [0.4, 1.7, 3.6], l: [0, 1.4, -0.2], f: 44 }, { t: T0 + 5.5, p: [0.0, 1.65, 2.2], l: [-0.3, 1.55, 0.0], f: 40 }, { t: T0 + 6.5, p: [1.6, 1.6, 2.6], l: [0.8, 1.45, 0.4], f: 42 }, { t: SC.chute.start, p: [1.7, 1.6, 2.8], l: [0.8, 1.45, 0.4], f: 42 }]);
      K.update(t);
    }
  };
};

// ---------- 1512-1513 : les Medicis ; la prison ; la ferme
SETS.chute = () => {
  const B = base({ sky: [0x4a5a7a, 0xc8a080], hemi: [0xffe8d0, 0x5a4a40, 0.9], sun: [0xffe0c0, 1.3, [10, 12, 12]], shadowSize: 12, bloom: [0.4, 0.5, 0.88], exposure: 1.0, fog: [0xc8a888, 30, 120] }); const { scene, cam } = B;
  scene.add(L.skyDome(0x4a5a7a, 0xc8a080));
  const city = florenceCity(scene);
  const ban = new THREE.Group(); city.userData.pv.add(ban); ban.position.set(1.0, 7.0, 1.0);
  ban.add(at(box(0.04, 1.6, 0.04, M(0x3a2a1a)), 0, 0.8, 0)); const cloth = at(box(1.0, 0.7, 0.02, M(0xe8c040)), 0.52, 1.25, 0); ban.add(cloth);
  for (const [x, y] of [[0.3, 1.45], [0.52, 1.45], [0.74, 1.45], [0.41, 1.25], [0.63, 1.25], [0.52, 1.05]]) ban.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.07, 10), M(x === 0.52 && y === 1.45 ? 0x2a4aa8 : 0xc02020)), x, y, 0.012));
  // la cellule
  const cell = new THREE.Group(); cell.position.set(60, 0, 60); scene.add(cell);
  cell.add(at(box(4, 0.1, 4, M(0x4a4440)), 0, 0, 0)); cell.add(at(box(4, 3, 0.2, M(0x5a544c)), 0, 1.5, -1.2)); for (const s of [-1, 1]) cell.add(at(box(0.2, 3, 4, M(0x544e46)), s * 1.6, 1.5, 0));
  const hl = new THREE.PointLight(0xc8d8ff, 2.0, 6, 1.2); hl.position.set(0.5, 2.6, 0.5); cell.add(hl); cell.add(at(box(0.5, 0.4, 0.05, new THREE.MeshBasicMaterial({ color: 0x9ab0d8 })), 0.5, 2.4, -1.08));
  for (let i = 0; i < 4; i++) cell.add(at(box(0.03, 0.4, 0.03, M(0x1a1a1a)), 0.35 + i * 0.1, 2.4, -1.05));
  const rope = at(box(0.02, 1.4, 0.02, M(0x8a7a5a)), -0.9, 2.3, -0.6); cell.add(rope);
  cell.add(at(box(1.0, 0.4, 0.5, M(0x3a3430)), -0.2, 0.2, -0.7));
  const prisoner = machiavel({ robe: 0x5a4a3e }); prisoner.place(59.8, 0, 59.4, 0); scene.add(prisoner.root);
  // la ferme de Sant'Andrea in Percussina
  const farm = new THREE.Group(); farm.position.set(-60, 0, 60); scene.add(farm);
  farm.add(at(box(30, 0.1, 30, M(0x7a9a4a)), 0, 0, 0)); farm.add(at(box(3, 2.2, 2.4, M(0xe0cfa8)), 0, 1.1, -3)); const fr_ = new THREE.Mesh(new THREE.ConeGeometry(2.4, 0.9, 4), M(0xb8572e)); fr_.rotation.y = Math.PI / 4; fr_.position.set(0, 2.65, -3); fr_.scale.set(1, 1, 0.8); farm.add(fr_);
  for (let i = 0; i < 16; i++) { const cy = new THREE.Mesh(new THREE.ConeGeometry(0.3, 2.2, 6), M(0x2f5a2a)); cy.position.set(-8 + i * 1.1, 1.1, -7 - hash(i) * 2); farm.add(cy); }
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) farm.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), M(0x5a7a3a)), -4 + c * 1.1, 0.3, 1 + r * 1.2));
  const farmer = machiavel({ robe: 0x6a5a3a }); farmer.place(-60.4, 0, 60.6, 0.2); scene.add(farmer.root);
  faceLight(scene, [60, 1.8, 61.4], 1.6, 0xd8e0ff, 5); faceLight(scene, [-60.2, 1.8, 62.4], 1.4, 0xfff0e0, 5);
  const K = cardsMgr(scene, cam);
  K('1512 · retour des Médicis\nla République tombe', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.chute.start + 3.0, SC.chute.start + 7.5, 0.3, 0.2), -0.55);
  K('février 1513 · soupçonné de complot\nemprisonné et torturé (l\'estrapade)', { w: 1.6, h: 0.42, border: '#ff8a7a', small: true }, t => win(t, SC.chute.start + 7.7, C.libere + 1.0, 0.3, 0.2), -0.55);
  K('mars 1513 · amnistie (élection du pape Léon X)\nexil à Sant\'Andrea in Percussina', { w: 1.6, h: 0.42, border: '#7dffb0', small: true }, t => win(t, C.libere + 1.3, SC.lettre.start, 0.3, 0.2), -0.55);
  const tCell = SC.chute.start + 7.4, tFarm = C.libere + 1.6;
  return {
    ...B, update(t) {
      const T0 = SC.chute.start; const up = sstep(T0 + 3.0, T0 + 5.0, t); ban.position.y = 5.6 + 1.4 * up; cloth.rotation.y = 0.2 * Math.sin(t * 2);
      prisoner.pose(L.sitPose(0.42, { aL: [0.3, 0.1], aR: [0.3, 0.1], hp: 0.25 })); prisoner.face(0, 'sad', t);
      farmer.pose(L.walkPose(t * 2, 0.0, { aR: [0.5, 0.2], eR: 0.5 })); farmer.face(0, 'neutral', t);
      if (t < tCell) camKeys(cam, t, [{ t: T0, p: [14, 10, 18], l: [4, 5, 2.5], f: 46 }, { t: tCell, p: [9, 6.5, 9], l: [4.6, 7.0, 3.1], f: 44 }]);
      else if (t < tFarm) camKeys(cam, t, [{ t: tCell, p: [60.6, 1.5, 61.6], l: [59.8, 1.0, 59.4], f: 44 }, { t: tFarm, p: [60.5, 1.4, 61.2], l: [59.8, 1.0, 59.4], f: 44 }]);
      else camKeys(cam, t, [{ t: tFarm, p: [-58.6, 1.8, 64.0], l: [-60.2, 1.2, 60.0], f: 46 }, { t: SC.lettre.start, p: [-58.9, 1.7, 63.4], l: [-60.2, 1.2, 60.0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- la lettre a Vettori ; Le Prince
SETS.lettre = () => {
  const B = base({ bg: 0x0a0806, fog: [0x0a0806, 6, 20], hemi: [0xffe0c0, 0x1a1008, 0.55], sun: [0xc0d0ff, 0.4, [3, 5, 4]], shadowSize: 3, bloom: [0.6, 0.5, 0.82], exposure: 1.0 }); const { scene, cam } = B;
  const st = study(scene, [0, 0, 0], { night: true });
  const mud = machiavel({ robe: 0x6a5a3a }), court = machiavel();
  mud.place(-0.9, 0, 0.9, 0.3); court.place(0, 0, -0.45, 0); scene.add(mud.root, court.root);
  faceLight(scene, [0.2, 1.6, 0.8], 1.5, 0xffd8a8); faceLight(scene, [-0.6, 1.6, 2.0], 1.2, 0xffd8a8);
  const ghosts = [0, 1, 2].map(i => { const h = new Human({ holo: 0x4a8aa8, robe: 0xffffff, robeL: 0.8, hairStyle: i === 1 ? 'curly' : 'short', beard: i === 2 ? 'full' : undefined, seed: 3130 + i }); h.place(-1.1 + i * 1.1 + (i === 1 ? 0 : 0), 0, -1.1 - (i === 1 ? 0.2 : 0), i === 0 ? 0.4 : i === 2 ? -0.4 : 0); scene.add(h.root); return h; });
  const book = new THREE.Group(); book.position.set(0, 0.86, 0.3); scene.add(book);
  book.add(box(0.3, 0.05, 0.4, M(0x7a2a1a))); const tl = label('De Principatibus', { w: 0.28, h: 0.05, color: '#ffd070', font: 'bold 90px Inter' }); tl.rotation.x = -Math.PI / 2; tl.position.y = 0.03; book.add(tl);
  const K = cardsMgr(scene, cam);
  K('lettre à Francesco Vettori\n10 décembre 1513', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.lettre.start + 0.8, C.mach_dit - 0.2, 0.3, 0.2), -0.55);
  K('texte de Machiavel · traduction libre\nvoix et visage imaginés', { w: 1.6, h: 0.42, border: '#ffd070', color: '#ffe0a0', small: true }, t => win(t, C.mach_dit + 0.2, C.prince, 0.3, 0.2), -0.55);
  K('Le Prince · 1513\ndédié à Laurent de Médicis', { w: 1.6, h: 0.42, border: '#ff8a7a', small: true }, t => win(t, C.prince + 0.5, SC.idees.start, 0.3, 0.2), -0.55);
  const tChange = C.mach_dit + 3.5;
  return {
    ...B, update(t) {
      st.userData.tick(t); const ch = t > tChange;
      mud.root.visible = !ch; court.root.visible = ch;
      mud.pose({ aL: [0.2, 0.1], aR: [0.6, 0.2], eR: 0.6 }); mud.face(env('machiavel', t), 'neutral', t);
      court.pose(L.sitPose(0.5, { aL: [1.0, 0.1], aR: [1.1 + 0.05 * Math.sin(t * 6), 0.15], eL: 0.9, eR: 1.0, hp: t > C.prince ? 0.3 : 0 })); court.face(env('machiavel', t), 'serious', t);
      const gk = win(t, C.mach_dit + 6.5, C.prince + 1.0, 0.6, 0.6); ghosts.forEach((h, i) => { fade(h.root, gk * 0.45); h.pose({ aR: [0.4 + 0.3 * Math.sin(t + i), 0.2], eR: 0.6 }); });
      fade(book, sstep(C.prince + 0.3, C.prince + 1.0, t));
      camKeys(cam, t, [{ t: SC.lettre.start, p: [0.4, 1.6, 3.4], l: [-0.4, 1.2, 0.5], f: 44 }, { t: C.mach_dit, p: [-0.6, 1.6, 2.6], l: [-0.85, 1.5, 0.9], f: 40 }, { t: tChange - 0.1, p: [-0.6, 1.6, 2.5], l: [-0.85, 1.5, 0.9], f: 40 }, { t: tChange, p: [0.3, 1.5, 1.6], l: [0, 1.4, -0.45], f: 42 }, { t: C.mach_dit + 6.0, p: [0.3, 1.5, 1.5], l: [0, 1.4, -0.45], f: 42 }, { t: C.mach_dit + 7.0, p: [0.6, 1.8, 3.2], l: [0, 1.2, -0.6], f: 46 }, { t: C.prince, p: [0.6, 1.8, 3.2], l: [0, 1.2, -0.6], f: 46 }, { t: C.prince + 1.0, p: [0.3, 1.5, 1.2], l: [0, 0.9, 0.3], f: 44 }, { t: SC.idees.start, p: [0.3, 1.5, 1.1], l: [0, 0.9, 0.3], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- les idees : le renard et le lion ; craint ou aime
function studioBase(o = {}) {
  const B = base({ bg: 0x07060c, fog: [0x07060c, 8, 30], hemi: [0xb0a8c8, 0x18141c, 1.0], sun: [0xffffff, 1.0, [2, 5, 4]], shadow: false, bloom: [0.5, 0.5, 0.82], ...o });
  B.scene.add(new THREE.GridHelper(40, 40, new THREE.Color(0xd99a57).multiplyScalar(0.9), new THREE.Color(0xd99a57).multiplyScalar(0.25)));
  return B;
}
SETS.idees = () => {
  const B = studioBase(); const { scene, cam } = B;
  const fx = fox(); fx.position.set(-0.9, 0, 0); fx.rotation.y = 0.6; scene.add(fx);
  const li = L.makeAnimal('lion'); li.position.set(0.9, 0, -0.2); li.rotation.y = -0.6; scene.add(li);
  const rig = claudeRig(scene, [1.2, 0, 1.2], -0.3, [0.45, 0, 0.1], 0xffd070, 0.45, 0.28);
  const bal = new THREE.Group(); rig.holoG.add(bal); bal.position.y = 0.15; bal.scale.setScalar(2.0);
  const lc = label('CRAINT', { w: 0.42, h: 0.12, color: '#ff8a7a', font: 'bold 120px Inter' }); lc.position.set(-0.3, 0.05, 0); bal.add(lc);
  const gt = label('>', { w: 0.15, h: 0.12, color: '#ffffff', font: 'bold 120px Inter' }); gt.position.set(0, 0.05, 0); bal.add(gt);
  const la = label('AIMÉ', { w: 0.34, h: 0.12, color: '#7dffb0', font: 'bold 120px Inter' }); la.position.set(0.27, 0.05, 0); bal.add(la);
  const hate = label('HAÏ ✕', { w: 0.35, h: 0.1, color: '#ff4a4a', font: 'bold 110px Inter' }); hate.position.set(0, 0.62, 0); hate.scale.setScalar(1.8); rig.holoG.add(hate);
  const K = cardsMgr(scene, cam);
  K('Le Prince, chapitre 18', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, SC.idees.start + 0.8, C.craint, 0.3, 0.2), -0.55);
  K('RENARD : voir les pièges', { w: 1.3, h: 0.22, border: '#ffb070', color: '#ffd0a0' }, t => win(t, SC.idees.start + 1.5, C.craint - 0.2, 0.3, 0.2), 0.3);
  K('LION : effrayer les loups', { w: 1.3, h: 0.22, border: '#ffe0a0', color: '#fff0c0' }, t => win(t, SC.idees.start + 3.5, C.craint - 0.2, 0.3, 0.2), 0.05);
  K('Le Prince, chapitre 17', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.craint + 0.3, C.craint + 5.5, 0.3, 0.2), -0.55);
  K('CRAINT  >  AIMÉ', { w: 1.2, h: 0.26, border: '#ff8a7a', color: '#ffd0c8' }, t => win(t, C.craint + 0.6, SC.posterite.start, 0.3, 0.2), 0.3);
  K('… mais jamais HAÏ', { w: 1.2, h: 0.22, border: '#ff4a4a', color: '#ff9a9a' }, t => win(t, C.craint + 3.2, SC.posterite.start, 0.3, 0.2), 0.08);
  K('« la fin justifie les moyens » :\nphrase jamais écrite par Machiavel', { w: 1.6, h: 0.42, border: '#ff8a7a', small: true }, t => win(t, C.craint + 5.8, SC.posterite.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.idees.start; const ak = 1 - sstep(C.craint - 0.4, C.craint, t);
      fade(fx, ak); fade(li, ak); fx.userData.walk(t * 3); fx.position.x = -0.9 + 0.1 * Math.sin(t * 0.5);
      rig.c.update(t, env('claude', t), {}); const on = sstep(C.craint, C.craint + 0.6, t); beamOn(rig, on, t); fade(bal, on);
      bal.visible = false; hate.visible = false;
      camKeys(cam, t, [{ t: T0, p: [0, 1.5, 4.4], l: [0, 0.9, 0], f: 46 }, { t: C.craint - 0.3, p: [0, 1.5, 4.2], l: [0, 0.9, 0], f: 46 }, { t: C.craint + 0.3, p: [1.5, 1.2, 3.4], l: [1.55, 0.85, 1.3], f: 46 }, { t: SC.posterite.start, p: [1.5, 1.2, 3.3], l: [1.55, 0.85, 1.3], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- la posterite
SETS.posterite = () => {
  const B = studioBase(); const { scene, cam } = B;
  const mk = (title, sub, c, x) => { const g = new THREE.Group(); g.position.set(x, 0.9, 0); scene.add(g); g.add(box(0.7, 0.9, 0.12, M(c))); const l = label(title, { w: 0.62, h: 0.14, color: '#ffe0a0', font: 'bold 110px Inter' }); l.position.set(0, 0.2, 0.07); g.add(l); const s = label(sub, { w: 0.62, h: 0.1, color: '#f0e8d8', font: 'bold 80px Inter' }); s.position.set(0, -0.05, 0.07); g.add(s); return g; };
  const b1 = mk('Le Prince', 'publié en 1532', 0x6a1a1a, -0.5), b2 = mk('Discours', 'sur Tite-Live', 0x1a3a6a, 0.5);
  const ban = label('INTERDIT · 1559', { w: 0.8, h: 0.16, color: '#ff5a4a', font: 'bold 110px Inter' }); ban.position.set(-0.5, 0.95, 0.15); ban.rotation.z = 0.25; scene.add(ban);
  const lib = label('républiques · liberté', { w: 0.8, h: 0.12, color: '#7dffb0', font: 'bold 90px Inter' }); lib.position.set(0.5, 1.6, 0.1); scene.add(lib);
  const adj = label('« machiavélique »', { w: 1.2, h: 0.16, color: '#ff9a8a', font: 'bold 110px Inter' }); adj.position.set(-0.4, 1.7, 0.1); scene.add(adj);
  const K = cardsMgr(scene, cam);
  K('Le Prince mis à l\'Index par l\'Église (1559)', { w: 1.6, h: 0.28, border: '#ff8a7a' }, t => win(t, SC.posterite.start + 3.5, SC.posterite.start + 7.5, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.posterite.start;
      fade(b1, sstep(T0 + 0.3, T0 + 0.8, t)); fade(ban, sstep(T0 + 3.6, T0 + 4.0, t)); fade(adj, win(t, T0 + 5.0, T0 + 8.0, 0.3, 0.3));
      fade(b2, sstep(T0 + 7.8, T0 + 8.3, t)); fade(lib, sstep(T0 + 9.0, T0 + 9.4, t));
      b1.rotation.y = 0.2 * Math.sin(t * 0.5); b2.rotation.y = -0.2 * Math.sin(t * 0.5);
      camKeys(cam, t, [{ t: T0, p: [-0.4, 1.3, 3.0], l: [-0.4, 1.1, 0], f: 46 }, { t: T0 + 7.0, p: [-0.2, 1.3, 3.2], l: [-0.2, 1.1, 0], f: 46 }, { t: SC.fin.start, p: [0.1, 1.3, 3.4], l: [0.1, 1.15, 0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- fin
SETS.fin = () => {
  const B = base({ bg: 0x0a0806, fog: [0x0a0806, 6, 20], hemi: [0xffe0c0, 0x1a1008, 0.7], sun: [0xc0d0ff, 0.5, [3, 5, 4]], shadowSize: 3, bloom: [0.6, 0.5, 0.82], exposure: 1.0 }); const { scene, cam } = B;
  const st = study(scene, [0, 0, -1.2], { night: true });
  const rig = claudeRig(scene, [-0.3, 0, 0.8], 0.2, [0.5, 0, 0.0], 0xffd070, 0.5, 0.3);
  faceLight(scene, [-0.1, 1.0, 2.2], 1.5, 0xfff0d8);
  const icons = ['CRAINT ?', 'AIMÉ ?'].map((s, i) => { const l = label(s, { w: 0.6, h: 0.16, color: ['#ff8a7a', '#7dffb0'][i], font: 'bold 120px Inter' }); rig.holoG.add(l); l.position.set(0, 0.22 - i * 0.2, 0); return l; });
  return {
    ...B, update(t) {
      const T0 = SC.fin.start; st.userData.tick(t);
      const qk = sstep(T0 + 0.8, T0 + 1.3, t); beamOn(rig, qk, t);
      icons.forEach((l, i) => { fade(l, sstep(T0 + 1.5 + i * 1.0, T0 + 1.9 + i * 1.0, t)); l.lookAt(cam.position); });
      rig.c.update(t, env('claude', t), { wave: sstep(TL.duration - 2.0, TL.duration - 1.5, t) });
      camKeys(cam, t, [{ t: T0, p: [0.2, 1.0, 3.4], l: [0.0, 0.75, 0], f: 46 }, { t: TL.duration, p: [0.15, 0.95, 3.1], l: [0.0, 0.72, 0], f: 46 }]);
    }
  };
};

// ---------- couverture
SETS.cover = () => {
  const B = base({ bg: 0x0a0806, fog: [0x0a0806, 6, 20], hemi: [0xffe0c0, 0x1a1008, 0.55], sun: [0xc0d0ff, 0.4, [3, 5, 4]], shadowSize: 3, bloom: [0.6, 0.5, 0.82], exposure: 1.0 }); const { scene, cam } = B;
  const st = study(scene, [0, 0, 0], { night: true });
  const mac = machiavel(); mac.place(0, 0, -0.45, 0); scene.add(mac.root); faceLight(scene, [0.2, 1.6, 0.7], 1.6, 0xffd8a8);
  return { ...B, update(t) { st.userData.tick(1); mac.pose(L.sitPose(0.5, { aL: [1.0, 0.1], aR: [1.1, 0.15], eL: 0.9, eR: 1.0 })); mac.face(0, 'serious', 1); cam.position.set(0.25, 1.55, 1.5); cam.fov = 46; cam.updateProjectionMatrix(); cam.lookAt(0, 1.2, -0.45); } };
};

const SHOTS = [
  ['intro', 0, SC.florence.start], ['florence', SC.florence.start, SC.borgia.start], ['borgia', SC.borgia.start, SC.chute.start], ['chute', SC.chute.start, SC.lettre.start],
  ['lettre', SC.lettre.start, SC.idees.start], ['idees', SC.idees.start, SC.posterite.start], ['posterite', SC.posterite.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9],
];
