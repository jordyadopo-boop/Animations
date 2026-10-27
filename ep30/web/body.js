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


// ---------- l'Arche (en metres : ≈ 1,15 x 0,7 x 0,7) ; grand cote selon x
const GOLD = () => M(0xd8a83a, { emissive: new THREE.Color(0x3a2400) });
function ark(o = {}) {
  const g = new THREE.Group(); const gold = GOLD(), wood = M(0x7a5232);
  const bodyM = o.wood ? wood : gold;
  const chest = box(1.15, 0.62, 0.7, bodyM); chest.position.y = 0.36; g.add(chest); g.userData.chest = chest;
  g.add(at(box(1.19, 0.05, 0.74, gold), 0, 0.68, 0)); // moulure
  g.add(at(box(1.17, 0.04, 0.72, gold), 0, 0.06, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 5, 10), gold); r.position.set(sx * 0.42, 0.14, sz * 0.37); g.add(r); }
  for (const sz of [-1, 1]) { const p = box(2.3, 0.05, 0.05, o.wood ? wood : gold); p.position.set(0, 0.14, sz * 0.39); g.add(p); }
  // propitiatoire et cherubins face a face
  const lid = new THREE.Group(); lid.position.y = 0.7; g.add(lid);
  lid.add(at(box(1.15, 0.04, 0.7, gold), 0, 0.02, 0));
  const cherubs = [];
  for (const s of [-1, 1]) {
    const c = new THREE.Group(); c.position.set(s * 0.42, 0.04, 0); c.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; lid.add(c);
    c.add(at(box(0.16, 0.14, 0.2, gold), 0, 0.07, -0.02)); // jambes repliees
    const tor = box(0.15, 0.2, 0.12, gold); tor.position.set(0, 0.22, 0.0); tor.rotation.x = 0.35; c.add(tor);
    c.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 1), gold), 0, 0.36, 0.06));
    for (const w of [-1, 1]) { const wg = new THREE.Group(); wg.position.set(w * 0.06, 0.3, -0.02); c.add(wg); const wing = box(0.03, 0.08, 0.36, gold); wing.position.set(w * 0.02, 0.06, 0.16); wing.rotation.x = -0.55; wg.add(wing); const w2 = box(0.025, 0.06, 0.2, gold); w2.position.set(w * 0.02, 0.18, 0.3); w2.rotation.x = -0.15; wg.add(w2); wg.rotation.y = w * 0.25; }
    cherubs.push(c);
  }
  g.userData.lid = lid;
  g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}
// la presence, selon les textes, seulement figuree par la lumiere
function glory(scene, pos, k0 = 1) {
  const g = new THREE.Group(); g.position.set(...pos); scene.add(g);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2c0).multiplyScalar(1.6), transparent: true }));
  const halo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 2), holoMat(0xffe8a0, 0.12));
  const beamM = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.3, 3.0, 16, 1, true), holoMat(0xfff0c0, 0.05)); beamM.position.y = 1.4;
  g.add(core, halo, beamM);
  const light = new THREE.PointLight(0xffe0a0, 1.6 * k0, 5, 1.4); g.add(light);
  g.userData.set = (t, k) => { fade(g, k); light.intensity = 1.6 * k * (0.9 + 0.1 * Math.sin(t * 3)); halo.scale.setScalar(1 + 0.08 * Math.sin(t * 2)); };
  return g;
}
function tablets(mat) {
  const g = new THREE.Group();
  for (const s of [-1, 1]) { const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 12, 1, false, 0, Math.PI), mat ?? M(0x9a9488)); tb.rotation.x = Math.PI / 2; tb.position.set(s * 0.13, 0.24, 0); g.add(tb); g.add(at(box(0.22, 0.24, 0.03, mat ?? M(0x9a9488)), s * 0.13, 0.12, 0)); }
  return g;
}
function priest(i, o = {}) {
  const skins = [0xa86c44, 0xc68a5a, 0x8a5a3a, 0xd09a70];
  return new Human({ skin: skins[i % 4], hair: 0x1a1210, hairStyle: 'short', hat: 'cap', hatColor: 0xf2eee4, top: 0xf2eee4, bottom: 0xf2eee4, robe: 0xf2eee4, robeL: 0.75, beard: i % 2 ? 'full' : 'long', beardColor: 0x2a1a10, seed: 3000 + i, ...o });
}
function israelite(i, o = {}) {
  const skins = [0xa86c44, 0xc68a5a, 0x8a5a3a, 0xd09a70, 0x6a4028];
  return new Human({ skin: skins[i % 5], hair: [0x1a1210, 0x3a2a1a, 0x8a8a88][i % 3], hairStyle: ['short', 'long', 'short', 'bun', 'curly'][i % 5], hat: i % 3 === 0 ? 'cap' : undefined, hatColor: 0xd8c8a0, top: [0xb88a5a, 0x8a5a4a, 0xd8c8a0, 0x5a6a8a, 0xa8603a][i % 5], bottom: 0xc8b090, robe: [0xb88a5a, 0x8a5a4a, 0xd8c8a0, 0x5a6a8a, 0xa8603a][i % 5], robeL: 0.7, beard: i % 3 === 1 ? 'full' : undefined, seed: 3100 + i, ...o });
}
function desertLand(o = {}) {
  const B = base({ sky: o.sky ?? [0x5a8ad0, 0xf0d0a0], hemi: [0xfff0d8, 0x8a6a40, 1.0], sun: [0xfff0d0, o.sunK ?? 1.6, o.sunPos ?? [6, 9, 6]], shadowSize: o.shadowSize ?? 6, bloom: [0.4, 0.5, 0.88], exposure: o.exposure ?? 1.05, fog: [o.fogC ?? 0xf0d8b0, 20, 90] });
  const sand = L.groundPlane(200, 80, o.ground ?? 0xc8a878, 0.3, 4); sand.position.y = -0.05; B.scene.add(sand);
  return B;
}
// carrying : prêtres qui portent l'arche sur leurs epaules (face a +z)
function carriers(scene, n = 4) {
  const ps = []; for (let i = 0; i < n; i++) { const p = priest(i); scene.add(p.root); ps.push(p); }
  return ps;
}

// ---------- intro : l'arche dans l'obscurite, puis elle disparait
SETS.intro = () => {
  const B = base({ bg: 0x080604, fog: [0x080604, 4, 14], hemi: [0xffe8c0, 0x100a06, 0.6], sun: [0xffe0b0, 0.6, [2, 5, 3]], shadowSize: 3, bloom: [0.6, 0.6, 0.75], exposure: 1.0 }); const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 8, M(0x6a5a48)), 0, -0.05, 0)); scene.add(at(box(8, 5, 0.3, M(0x5a4a38)), 0, 2.5, -2.2));
  for (const s of [-1, 1]) scene.add(at(box(0.3, 5, 8, M(0x4a3a2a)), s * 2.4, 2.5, 0));
  const a = ark(); scene.add(a);
  const ghost = ark(); ghost.traverse(m => { if (m.isMesh) m.material = holoMat(0xffd070, 0.12); }); scene.add(ghost);
  const gl = glory(scene, [0, 1.0, 0]);
  const lD = label('« ne pas le toucher »', { w: 1.2, h: 0.16, color: '#ffe0a0', font: 'bold 90px Inter' }); lD.position.set(0, 1.75, 0.3); scene.add(lD);
  return {
    ...B, update(t) {
      const gone = sstep(C.title - 2.2, C.title - 0.6, t);
      gl.userData.set(t, (1 - gone) * sstep(0.2, 1.5, t)); fade(a, 1 - gone); a.visible = gone < 0.99; fade(ghost, gone * (0.6 + 0.2 * Math.sin(t * 3)));
      fade(lD, win(t, 3.5, 7.0, 0.4, 0.4)); lD.lookAt(cam.position);
      camKeys(cam, t, [{ t: 0, p: [1.6, 1.1, 2.6], l: [0, 0.7, 0], f: 44 }, { t: C.title, p: [-1.3, 1.3, 3.0], l: [0, 0.7, 0], f: 44 }, { t: SC.atelier.start, p: [-1.4, 1.4, 3.0], l: [0, 0.7, 0], f: 44 }]);
    }
  };
};

// ---------- au pied du Sinai : Moise, l'atelier de Betsalel
SETS.atelier = () => {
  const B = desertLand({ sunPos: [5, 8, 7] }); const { scene, cam } = B;
  const mount = new THREE.Group(); mount.position.set(-6, 0, -45); scene.add(mount); [[0, 0, 0, 12, 1.1], [-9, 0, 4, 8, 0.8], [8, 0, 3, 9, 0.7]].forEach(([x, y, z, r, k]) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), M(0x9a7058)); m.position.set(x, y, z); m.scale.y = k; mount.add(m); });
  const cloud = L.makeCloud(7, 2.2, 0xf4ecd8); cloud.position.set(-6, 13.5, -45); scene.add(cloud);
  const peak = glory(scene, [-6, 13.5, -44]); peak.scale.setScalar(8);
  // tente-atelier
  const tent = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 4.0, 3, 1, true), M(0x8a6a4a, { side: THREE.DoubleSide })); tent.rotation.z = Math.PI / 2; tent.rotation.y = Math.PI / 2; tent.position.set(0.5, 0.8, -3.0); scene.add(tent);
  const a = ark({ wood: false }); a.position.set(0, 0, 0); scene.add(a); a.rotation.y = 0.15;
  const bez = new Human({ skin: 0xb07a50, hair: 0x2a1a10, hairStyle: 'short', hat: 'cap', hatColor: 0xc8a878, top: 0x8a5a3a, bottom: 0x6a4a2a, robe: 0x8a5a3a, robeL: 0.65, beard: 'full', seed: 3010, shortSleeve: true });
  bez.place(0.0, 0, -0.85, 0); scene.add(bez.root);
  const ham = box(0.04, 0.16, 0.04, M(0x5a3a22)); bez.hand.R.add(ham); ham.position.set(0, -0.08, 0.05); ham.add(at(box(0.09, 0.05, 0.05, M(0x6a6a70)), 0, -0.08, 0));
  const moses = new Human({ skin: 0xb07a50, hair: 0xe8e4dc, hairStyle: 'long', beard: 'long', beardColor: 0xe8e4dc, top: 0xe8dcc0, bottom: 0xd8c8a0, robe: 0xd8c8a0, robeL: 0.75, seed: 3011 });
  moses.place(-2.0, 0, 0.8, 0.35); scene.add(moses.root);
  const staff = box(0.04, 1.8, 0.04, M(0x6a4a2a)); moses.hand.R.add(staff); staff.position.set(0, 0.5, 0.05);
  faceLight(scene, [-1.8, 1.7, 2.2], 1.6, 0xfff0d8); faceLight(scene, [0.0, 1.7, 2.6], 1.6, 0xfff0d8);
  const rig = claudeRig(scene, [1.5, 0, 1.6], -0.6, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28);
  const tb = tablets(holoMat(0xffd070, 0.5)); rig.holoG.add(tb); tb.scale.setScalar(1.3);
  const dims = label('≈ 2,5 × 1,5 × 1,5 coudées', { w: 1.3, h: 0.16, color: '#ffe0a0', font: 'bold 90px Inter' }); dims.position.set(0, 1.55, 0.3); dims.visible = false;
  const K = cardsMgr(scene, cam);
  K('Exode 25 · bois d\'acacia\nrecouvert d\'or pur', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.atelier.start + 3.5, C.bezalel_dit - 0.2, 0.3, 0.2), -0.55);
  K('Betsalel, l\'artisan cité dans l\'Exode', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.bezalel_dit, C.cherubins, 0.3, 0.2), -0.55);
  imagined(K, 'réplique imaginée', C.bezalel_dit, C.cherubins);
  K('les deux tables de pierre de la Loi\n(Exode 25, 16 · Deutéronome 10)', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.cherubins + 4.5, SC.jourdain.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.atelier.start; peak.userData.set(t, 1);
      const work = t < C.bezalel_dit - 0.3 || t > C.cherubins;
      bez.pose({ aR: [work ? 1.0 + 0.5 * Math.abs(Math.sin(t * 5)) : 0.6, 0.2], eR: work ? 0.9 : 0.9, aL: [0.8, 0.1], eL: 0.8, lean: work ? 0.3 : 0.0, hp: work ? 0.15 : 0 });
      bez.face(env('bezalel', t), 'serious', t);
      moses.pose({ aR: [0.5, 0.2], eR: 0.9, aL: [0.1 + 0.9 * win(t, T0 + 4.0, C.bezalel_dit - 1.0, 0.6, 0.6), 0.3] }); moses.face(0, 'serious', t);
      rig.c.update(t, env('claude', t), {}); const on = sstep(C.cherubins + 4.0, C.cherubins + 4.6, t); beamOn(rig, on, t); fade(tb, on); tb.rotation.y = t * 0.6;
      camKeys(cam, t, [{ t: T0, p: [-2.4, 2.4, 6.5], l: [-1.0, 3.0, -10], f: 46 }, { t: T0 + 3.5, p: [-1.4, 1.5, 3.4], l: [-1.4, 1.3, 0.6], f: 44 }, { t: C.bezalel_dit - 0.4, p: [0.6, 1.5, 3.0], l: [0, 1.0, -0.4], f: 44 }, { t: C.bezalel_dit, p: [0.2, 1.6, 1.2], l: [0, 1.5, -0.85], f: 40 }, { t: C.cherubins - 0.1, p: [0.2, 1.6, 1.1], l: [0, 1.5, -0.85], f: 40 }, { t: C.cherubins + 0.4, p: [0.7, 2.1, 1.5], l: [0, 0.75, 0], f: 42 }, { t: C.cherubins + 4.0, p: [0.5, 2.0, 1.7], l: [0, 0.75, 0], f: 42 }, { t: C.cherubins + 4.6, p: [1.0, 1.2, 3.6], l: [1.2, 0.75, 1.4], f: 44 }, { t: SC.jourdain.start, p: [1.0, 1.2, 3.7], l: [1.2, 0.75, 1.4], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- le Jourdain s'arrete ; Jericho
SETS.jourdain = () => {
  const B = desertLand({ ground: 0xb89a6a, sunPos: [4, 9, -8] }); const { scene, cam } = B;
  const W = L.makeWater(60, 50, 0x3a7aa0, { opacity: 0.92 }); W.mesh.scale.set(1, 1, 0.12); W.mesh.position.set(0, 0.02, -3); scene.add(W.mesh);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(60, 1.0, 0.6), new THREE.MeshLambertMaterial({ color: 0x5aa8d0, transparent: true, opacity: 0.6, emissive: new THREE.Color(0x0a2a3a) })); wall.position.set(0, 0.5, -6.5); scene.add(wall);
  for (let i = 0; i < 8; i++) { const pm = L.makePalm(2 + hash(i) * 1.2, i * 3); pm.position.set(-10 + i * 2.8, 0, -9 - hash(i) * 2); scene.add(pm); }
  const a = ark(); scene.add(a);
  const ps = carriers(scene, 4);
  const crowd = []; for (let i = 0; i < 8; i++) { const h = israelite(i); scene.add(h.root); crowd.push(h); }
  // Jericho
  const jer = new THREE.Group(); jer.position.set(0, 0, -60); scene.add(jer);
  for (let k = 0; k < 24; k++) { const an = k / 24 * Math.PI * 2; const w = box(2.2, 3.0, 0.8, M(0xc8a878)); w.position.set(Math.cos(an) * 8, 1.5, Math.sin(an) * 8); w.rotation.y = -an + Math.PI / 2; jer.add(w); if (k % 4 === 0) jer.add(at(box(1.6, 4.2, 1.6, M(0xb89868)), Math.cos(an) * 8, 2.1, Math.sin(an) * 8)); }
  for (let k = 0; k < 10; k++) jer.add(at(box(1.4, 1 + hash(k) * 1.2, 1.4, M(0xd8c098)), (hash(k * 3) - 0.5) * 9, 0.6, (hash(k * 5) - 0.5) * 9));
  const jps = carriers(scene, 4); const ja = ark(); scene.add(ja);
  faceLight(scene, [0, 1.8, 3.5], 1.8, 0xfff0d8, 5);
  const K = cardsMgr(scene, cam);
  K('Josué 3 · les eaux du Jourdain s\'arrêtent\nselon les textes', { w: 1.6, h: 0.42, border: '#7dd8ff', small: true }, t => win(t, SC.jourdain.start + 4.0, C.jericho, 0.3, 0.2), -0.55);
  K('Josué 6 · sept jours autour de Jéricho', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.jericho + 0.5, SC.dagon.start, 0.3, 0.2), -0.55);
  const placeCarry = (arkG, pl, x, z, ry, t, ph0 = 0) => {
    arkG.position.set(x, 0.92, z); arkG.rotation.y = ry;
    const fw = new THREE.Vector3(Math.sin(ry + Math.PI / 2), 0, Math.cos(ry + Math.PI / 2));
    pl.forEach((p, i) => { const sx = i < 2 ? -0.95 : 0.95, sz = i % 2 ? 0.39 : -0.39; const v = new THREE.Vector3(sx, 0, sz).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry); p.place(x + v.x, 0, z + v.z, ry + Math.PI / 2 - Math.PI / 2 + Math.atan2(fw.x, fw.z) - ry); p.root.rotation.y = Math.atan2(fw.x, fw.z); p.pose(L.walkPose(t * 3 + i + ph0, 0.4, { aL: [2.6, i % 2 ? 0.15 : -0.05], aR: [2.6, i % 2 ? -0.05 : 0.15], eL: 0.4, eR: 0.4 })); p.face(0, 'serious', t); });
  };
  return {
    ...B, update(t) {
      const T0 = SC.jourdain.start; W.update(t, 0.05);
      const stop = sstep(T0 + 2.5, T0 + 4.5, t); W.mesh.scale.y = 1; W.mesh.position.y = 0.02 - 0.1 * stop; wall.scale.y = 0.2 + 1.6 * stop; wall.position.y = 0.5 * wall.scale.y; wall.material.opacity = 0.6 * stop;
      const z = 2.0 - 0.35 * (t - T0);
      placeCarry(a, ps, 0, z, Math.PI / 2, t);
      crowd.forEach((h, i) => { h.place((i % 4 - 1.5) * 0.8, 0, z + 2.0 + Math.floor(i / 4) * 0.9, Math.PI); h.root.rotation.y = Math.PI; h.pose(L.walkPose(t * 3 + i, 0.6)); h.face(0, 'awe', t); });
      // Jericho : procession circulaire
      const an = (t - C.jericho) * 0.12; const R = 10.5; placeCarry(ja, jps, Math.cos(an) * R, -60 + Math.sin(an) * R, -an, t, 1.0);
      if (t < C.jericho) camKeys(cam, t, [{ t: T0, p: [-2.4, 1.0, z - 3.6], l: [0, 1.0, z], f: 44 }, { t: C.jericho, p: [-1.8, 1.3, z - 4.2], l: [0, 1.0, z], f: 44 }]);
      else camKeys(cam, t, [{ t: C.jericho, p: [6, 10, -38], l: [0, 1, -60], f: 46 }, { t: SC.dagon.start, p: [10, 8, -42], l: [0, 1, -60], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- le temple de Dagon ; le retour sur un chariot tire par deux vaches
function cow(c = 0x8a5a3a) {
  const g = new THREE.Group(); const m = M(c), legs = [];
  g.add(at(box(0.5, 0.5, 1.2, m), 0, 0.85, 0)); g.add(at(box(0.32, 0.34, 0.4, m), 0, 1.05, 0.75));
  for (const s of [-1, 1]) { g.add(at(box(0.04, 0.04, 0.02, new THREE.MeshBasicMaterial({ color: 0x050505 })), s * 0.12, 1.12, 0.95)); const h = box(0.18, 0.04, 0.04, M(0xe8e0c8)); h.position.set(s * 0.2, 1.25, 0.7); h.rotation.z = s * 0.4; g.add(h); }
  for (let k = 0; k < 3; k++) g.add(at(box(0.52, 0.2, 0.18, M(0xf0ece0)), 0, 0.9, -0.4 + k * 0.35));
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const lg = new THREE.Group(); lg.position.set(sx * 0.18, 0.6, sz * 0.45); lg.add(at(box(0.1, 0.6, 0.1, m), 0, -0.3, 0)); g.add(lg); legs.push(lg); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.userData.walk = (ph) => legs.forEach((l, i) => l.rotation.x = 0.35 * Math.sin(ph + [0, Math.PI, Math.PI, 0][i]));
  return g;
}
SETS.dagon = () => {
  const B = base({ bg: 0x14100c, fog: [0x14100c, 6, 22], hemi: [0xffe0c0, 0x201810, 0.55], sun: [0xffe0b0, 0.9, [-3, 6, 4]], shadowSize: 5, bloom: [0.5, 0.5, 0.85], exposure: 1.0 }); const { scene, cam } = B;
  scene.add(at(box(10, 0.1, 12, M(0x8a7a62)), 0, -0.05, -2));
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) scene.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 4.5, 10), M(0xc8b898)), s * 2.2, 2.25, 1 - i * 2.2));
  scene.add(at(box(10, 0.3, 12, M(0x6a5a48)), 0, 4.6, -2));
  const ped = at(box(1.4, 0.8, 1.2, M(0x9a8a72)), 0, 0.4, -5.5); scene.add(ped);
  const statue = new THREE.Group(); scene.add(statue);
  const stM = M(0xa89a82); statue.add(at(box(0.6, 1.4, 0.4, stM), 0, 0.7, 0)); statue.add(at(box(0.36, 0.36, 0.36, stM), 0, 1.6, 0)); statue.add(at(box(0.5, 0.1, 0.5, stM), 0, 1.84, 0));
  for (const s of [-1, 1]) statue.add(at(box(0.16, 0.7, 0.16, stM), s * 0.4, 1.0, 0));
  const a = ark(); a.position.set(0, 0, -3.6); a.rotation.y = 0; scene.add(a);
  const torch = []; for (const s of [-1, 1]) { const f = L.makeFire(); f.scale.setScalar(0.4); f.position.set(s * 1.6, 0.9, -4.6); scene.add(f); torch.push(f); scene.add(at(box(0.2, 0.9, 0.2, M(0x5a4a3a)), s * 1.6, 0.45, -4.6)); }
  // la route du retour (decor separe)
  const road = desertLand({ ground: 0xa8a060, fogC: 0xe8e0c0 }); const rs = road.scene;
  for (let i = 0; i < 18; i++) { const f = box(1.8, 0.05, 1.8, M(i % 2 ? 0xd8c050 : 0xc8b040)); f.position.set((i % 2 ? 1 : -1) * (3 + hash(i) * 2), 0.02, -i * 2 + 6); rs.add(f); }
  const cart = new THREE.Group(); rs.add(cart);
  cart.add(at(box(1.4, 0.08, 2.0, M(0x7a5a3a)), 0, 0.6, 0)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 10), M(0x5a3a22)); wh.rotation.z = Math.PI / 2; wh.position.set(sx * 0.75, 0.35, sz * 0.7); cart.add(wh); }
  const ca = ark(); ca.position.set(0, 0.64, 0); ca.rotation.y = Math.PI / 2; cart.add(ca);
  const cows = [cow(0x8a5a3a), cow(0x6a4a3a)]; cows.forEach((c, i) => { c.position.set(i ? 0.38 : -0.38, 0, 1.9); cart.add(c); });
  cart.add(at(box(1.0, 0.06, 0.06, M(0x5a3a22)), 0, 1.25, 1.95));
  const K = cardsMgr(scene, cam), K2 = cardsMgr(rs, road.cam);
  K('1 Samuel 5 · le temple de Dagon\nà Ashdod, chez les Philistins', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.dagon.start + 2.5, C.vaches, 0.3, 0.2), -0.55);
  K2('1 Samuel 6 · le retour de l\'arche', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.vaches + 0.3, SC.temple.start, 0.3, 0.2), -0.55);
  const out = {
    ...B, update(t) {
      const T0 = SC.dagon.start;
      if (t >= C.vaches) { const z = 4 - 0.6 * (t - C.vaches); cart.position.set(0, 0, z); cows.forEach((c, i) => c.userData.walk(t * 4 + i)); camKeys(road.cam, t, [{ t: C.vaches, p: [2.2, 1.6, z + 5.0], l: [0, 1.0, z + 1.0], f: 46 }, { t: SC.temple.start, p: [2.6, 1.8, z + 5.6], l: [0, 1.0, z + 1.0], f: 46 }]); K2.update(t); out.scene = rs; out.cam = road.cam; out.bloom = road.bloom; return; }
      out.scene = scene; out.cam = cam; out.bloom = B.bloom;
      torch.forEach(f => f.userData.update(t, 1));
      const fall = sstep(T0 + 6.5, T0 + 7.6, t), night = win(t, T0 + 5.0, T0 + 6.4, 0.4, 0.4);
      statue.position.set(0, 0.8 - 0.65 * fall, -5.5 + 1.2 * fall); statue.rotation.x = 1.45 * fall;
      camKeys(cam, t, [{ t: T0, p: [1.8, 1.8, 2.6], l: [0, 1.4, -4.5], f: 44 }, { t: T0 + 6.0, p: [1.4, 1.6, 0.6], l: [0, 1.2, -4.6], f: 44 }, { t: T0 + 7.0, p: [2.2, 2.4, -1.5], l: [0, 0.6, -4.6], f: 46 }, { t: C.vaches, p: [2.2, 2.4, -1.6], l: [0, 0.6, -4.6], f: 46 }]);
      K.update(t);
    }
  };
  return out;
};

// ---------- David danse ; le Saint des Saints du Temple de Salomon
SETS.temple = () => {
  const B = desertLand({ sky: [0x4a7ac8, 0xf0d8b0], ground: 0xb8a070 }); const { scene, cam } = B;
  const david = new Human({ skin: 0xc68a5a, hair: 0x5a2a14, hairStyle: 'curly', beard: 'full', beardColor: 0x5a2a14, top: 0xf4f0e4, bottom: 0xf4f0e4, robe: 0xf4f0e4, robeL: 0.55, hat: 'crown', seed: 3020 });
  scene.add(david.root);
  const a = ark(); scene.add(a); const ps = carriers(scene, 4);
  const musicians = [0, 1, 2].map(i => { const h = israelite(i + 4); scene.add(h.root); return h; });
  // Saint des Saints (decor separe, plus loin)
  const hs = new THREE.Group(); hs.position.set(0, 0, -80); scene.add(hs);
  hs.add(at(box(9, 0.1, 9, M(0xd8c8a0)), 0, 0, 0)); hs.add(at(box(9, 6, 0.3, M(0xc8a060)), 0, 3, -3)); for (const s of [-1, 1]) hs.add(at(box(0.3, 6, 9, M(0xb89050)), s * 3.2, 3, 0));
  const ha = ark(); hs.add(ha);
  for (const s of [-1, 1]) { const big = new THREE.Group(); big.position.set(s * 1.4, 0, -0.8); hs.add(big); const gm = GOLD(); big.add(at(box(0.5, 2.2, 0.4, gm), 0, 1.1, 0)); big.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), gm), 0, 2.4, 0.05)); const wg = box(1.6, 0.12, 0.3, gm); wg.position.set(-s * 0.7, 2.1, 0); wg.rotation.z = s * 0.15; big.add(wg); const wo = box(1.2, 0.12, 0.3, gm); wo.position.set(s * 0.6, 2.1, 0); wo.rotation.z = -s * 0.3; big.add(wo); }
  const gl = glory(scene, [0, 1.15, -80]);
  const K = cardsMgr(scene, cam);
  K('2 Samuel 6 · David danse devant l\'arche', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, SC.temple.start + 0.8, SC.temple.start + 3.8, 0.3, 0.2), -0.55);
  K('1 Rois 8 · le Saint des Saints\ndu Temple de Salomon', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.temple.start + 4.2, SC.babylone.start, 0.3, 0.2), -0.55);
  const tIn = SC.temple.start + 3.9;
  return {
    ...B, update(t) {
      const T0 = SC.temple.start; const z = -2 + 0.4 * (t - T0);
      david.place(0.2 * Math.sin(t * 2), 0.08 * Math.abs(Math.sin(t * 6)), z + 2.4, Math.PI + 0.6 * Math.sin(t * 3)); david.root.rotation.y = Math.PI * 0 + 0.6 * Math.sin(t * 3);
      david.pose({ aL: [2.6 + 0.3 * Math.sin(t * 6), 0.5], aR: [2.6 + 0.3 * Math.cos(t * 6), 0.5], eL: 0.4, eR: 0.4, lL: 0.4 * Math.sin(t * 6), kL: 0.6 * Math.max(0, Math.sin(t * 6)), lR: -0.4 * Math.sin(t * 6), kR: 0.6 * Math.max(0, -Math.sin(t * 6)) }); david.face(0, 'joy', t);
      a.position.set(0, 0.92, z); a.rotation.y = Math.PI / 2;
      ps.forEach((p, i) => { const sx = i % 2 ? 0.39 : -0.39, sz = i < 2 ? -0.95 : 0.95; p.place(sx, 0, z + sz, 0); p.pose(L.walkPose(t * 3 + i, 0.4, { aL: [2.6, 0.1], aR: [2.6, 0.1], eL: 0.4, eR: 0.4 })); p.face(0, 'serious', t); });
      musicians.forEach((h, i) => { h.place([-1.2, 1.2, 0][i], 0, z - 1.8 - (i === 2 ? 0.8 : 0), 0); h.pose({ aL: [1.6 + 0.3 * Math.sin(t * 8 + i), 0.3], aR: [1.6 + 0.3 * Math.cos(t * 8 + i), -0.1], eL: 1.0, eR: 1.0 }); h.face(0, 'happy', t); });
      gl.userData.set(t, sstep(tIn + 0.5, tIn + 2.0, t));
      if (t < tIn) camKeys(cam, t, [{ t: T0, p: [0.6, 1.5, z + 6.5], l: [0, 1.2, z + 1.5], f: 46 }, { t: tIn, p: [0.4, 1.5, z + 6.0], l: [0, 1.2, z + 1.5], f: 46 }]);
      else camKeys(cam, t, [{ t: tIn, p: [0, 1.6, -74], l: [0, 1.2, -80], f: 46 }, { t: SC.babylone.start, p: [0.4, 1.4, -76.5], l: [0, 1.0, -80], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- 587 av. J.-C. : le Temple detruit ; l'arche n'est plus nommee
SETS.babylone = () => {
  const B = base({ sky: [0x2a1a20, 0xa04a20], hemi: [0xffb080, 0x201010, 0.7], sun: [0xff9a50, 1.2, [-6, 4, 6]], shadowSize: 8, bloom: [0.6, 0.5, 0.8], exposure: 1.0, fog: [0x6a3020, 15, 60] }); const { scene, cam } = B;
  const sand = L.groundPlane(200, 60, 0x8a6a4a, 0.3, 4); scene.add(sand);
  const tmp = new THREE.Group(); scene.add(tmp);
  tmp.add(at(box(6, 0.6, 12, M(0xc8b890)), 0, 0.3, 0)); tmp.add(at(box(4.4, 5, 10, M(0xd8c8a0)), 0, 3.1, -0.5)); tmp.add(at(box(6, 7, 1.4, M(0xd8c8a0)), 0, 3.5, 5.2)); tmp.add(at(box(1.6, 3.2, 0.2, M(0x1a1008)), 0, 2.2, 5.95));
  for (const s of [-1, 1]) tmp.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 4.5, 10), M(0xa8702a)), s * 1.6, 2.85, 6.6));
  const fires = []; [[-1.5, 5.6, 3], [1.8, 5.6, 0], [0, 5.6, -3], [-2, 0.6, 6.5], [2.5, 0.6, 7]].forEach(([x, y, z], i) => { const f = L.makeFire(); f.scale.setScalar(1.6); f.position.set(x, y, z); scene.add(f); fires.push(f); });
  // liste hologramme des objets emportes (2 Rois 25)
  const rig = claudeRig(scene, [2.4, 0, 10.2], -0.4, [-0.45, 0, 0.1], 0xffd070, 0.5, 0.3);
  const items = ['colonnes de bronze', 'bassins · pelles', 'coupes · encensoirs', 'l\'arche : ?'].map((s, i) => { const l = label(s, { w: 1.0, h: 0.15, color: i === 3 ? '#ff8a6a' : '#ffe0a0', font: 'bold 84px Inter' }); rig.holoG.add(l); l.position.set(0, 0.35 - i * 0.14, 0); return l; });
  const K = cardsMgr(scene, cam);
  K('2 Rois 25 · la liste des objets emportés\nne mentionne pas l\'arche', { w: 1.6, h: 0.42, border: '#ff9a6a', small: true }, t => win(t, SC.babylone.start + 1.5, SC.babylone.start + 4.8, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.babylone.start; fires.forEach(f => f.userData.update(t, 1));
      rig.c.update(t, env('claude', t), {}); const on = sstep(T0 + 4.5, T0 + 5.0, t); beamOn(rig, on, t);
      items.forEach((l, i) => { fade(l, sstep(T0 + 5.0 + i * 0.7, T0 + 5.4 + i * 0.7, t)); l.lookAt(cam.position); });
      camKeys(cam, t, [{ t: T0, p: [6, 4, 22], l: [0, 3, 0], f: 46 }, { t: T0 + 4.5, p: [3.8, 1.6, 14.6], l: [2.0, 1.2, 9.0], f: 46 }, { t: SC.pistes.start, p: [3.2, 1.25, 12.6], l: [2.2, 1.0, 10.2], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- les pistes : le mont Nebo ; Aksoum
SETS.pistes = () => {
  const B = desertLand({ sky: [0x5a8ad0, 0xf0d0a0], ground: 0xb89a70 }); const { scene, cam } = B;
  const mt = new THREE.Group(); mt.position.set(0, 0, -14); scene.add(mt); [[0, 0, 0, 8, 0.7], [-6, 0, 2, 5, 0.6], [6, 0, 1, 6, 0.55]].forEach(([x, y, z, r, k]) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), M(0xa88a68)); m.position.set(x, y, z); m.scale.y = k; mt.add(m); });
  const cave = new THREE.Mesh(new THREE.CircleGeometry(1.0, 10), new THREE.MeshBasicMaterial({ color: 0x0a0604 })); cave.position.set(0, 0.9, -6.35); cave.rotation.x = -0.2; scene.add(cave);
  const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 0), M(0x8a7458)); scene.add(rock);
  const jer = new Human({ skin: 0xb07a50, hair: 0x6a6a68, hairStyle: 'short', hat: 'cap', hatColor: 0x8a7a6a, beard: 'long', beardColor: 0x8a8a88, top: 0x7a5a3a, bottom: 0x6a4a2a, robe: 0x7a5a3a, robeL: 0.75, seed: 3030 }); scene.add(jer.root);
  // Aksoum (decor separe)
  const ak = new THREE.Group(); ak.position.set(80, 0, 0); scene.add(ak);
  ak.add(at(box(14, 0.1, 14, M(0x8a9a5a)), 0, 0, 0));
  const chapel = new THREE.Group(); chapel.position.set(0, 0, -3.5); ak.add(chapel);
  chapel.add(at(box(3.2, 2.6, 3.2, M(0xd8d0c0)), 0, 1.3, 0)); const dome = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0x3a7a4a)); dome.position.y = 2.6; chapel.add(dome);
  chapel.add(at(box(0.08, 0.5, 0.08, G(0xffd070, 1.4)), 0, 3.9, 0)); chapel.add(at(box(0.3, 0.08, 0.08, G(0xffd070, 1.4)), 0, 3.95, 0));
  chapel.add(at(box(0.9, 1.6, 0.05, M(0x5a3a22)), 0, 0.8, 1.61));
  for (let i = 0; i < 9; i++) ak.add(at(box(0.08, 1.2, 0.08, M(0x2a2a2a)), -4 + i, 0.6, 0.5)); ak.add(at(box(8.2, 0.06, 0.06, M(0x2a2a2a)), 0, 1.1, 0.5));
  const monk = new Human({ skin: 0x5a3420, hair: 0x2a2a2a, hairStyle: 'short', hat: 'cap', hatColor: 0xf4f0e8, beard: 'full', beardColor: 0x2a2a2a, top: 0xf0ece0, bottom: 0xe8e0d0, robe: 0xf0ece0, robeL: 0.78, seed: 3031 }); monk.place(80, 0, -1.2, 0); scene.add(monk.root);
  const cross = new THREE.Group(); cross.add(box(0.03, 0.18, 0.02, GOLD())); cross.add(at(box(0.12, 0.03, 0.02, GOLD()), 0, 0.03, 0)); monk.hand.R.add(cross); cross.position.set(0, -0.1, 0.06);
  faceLight(scene, [80, 1.7, 0.6], 2.0, 0xfff0d8, 5); faceLight(scene, [0.9, 1.7, -1.0], 1.8, 0xfff0d8, 5);
  const K = cardsMgr(scene, cam);
  K('2 Maccabées 2 · Jérémie cache l\'arche\ndans une grotte du mont Nebo', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.pistes.start + 3.5, C.aksoum, 0.3, 0.2), -0.55);
  K('Aksoum (Éthiopie) · église\nSainte-Marie-de-Sion', { w: 1.6, h: 0.42, border: '#7dffb0', small: true }, t => win(t, C.aksoum + 1.5, C.moine_dit - 0.2, 0.3, 0.2), -0.55);
  imagined(K, 'personnage et réplique imaginés', C.moine_dit - 0.1, C.verif);
  K('aucune piste vérifiée\npar les archéologues', { w: 1.6, h: 0.42, border: '#ff9a6a', small: true }, t => win(t, C.verif + 0.3, SC.fin.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.pistes.start;
      const seal = sstep(T0 + 6.5, T0 + 8.0, t); rock.position.set(lerp(1.8, 0, seal), 0.9, -6.0); rock.rotation.z = seal * 2;
      const wk = sstep(T0 + 1.0, T0 + 5.5, t); jer.place(lerp(0.2, 0.9, wk), 0, lerp(-5.6, -2.8, wk), 0); jer.root.rotation.y = 0.15; jer.pose(wk < 0.99 && wk > 0.01 ? L.walkPose(t * 3, 0.6) : { aL: [0.2, 0.1], aR: [1.0, 0.2] }); jer.face(0, 'serious', t);
      monk.pose({ aR: [0.9, 0.2], eR: 1.2, aL: [0.15, 0.12] }); monk.face(env('moine', t), 'serious', t);
      if (t < C.aksoum) camKeys(cam, t, [{ t: T0, p: [2.4, 2.2, 4.5], l: [0, 1.4, -6], f: 46 }, { t: T0 + 6.0, p: [1.6, 1.6, 1.2], l: [0.4, 1.1, -4.5], f: 44 }, { t: C.aksoum, p: [1.6, 1.6, 1.0], l: [0.4, 1.1, -4.5], f: 44 }]);
      else camKeys(cam, t, [{ t: C.aksoum, p: [84, 3.0, 8.0], l: [80, 2.0, -3.5], f: 46 }, { t: C.moine_dit - 0.5, p: [81.2, 1.8, 3.6], l: [80, 1.4, -2.0], f: 44 }, { t: C.moine_dit, p: [80.25, 1.55, 1.0], l: [80, 1.45, -1.2], f: 42 }, { t: C.verif, p: [80.25, 1.55, 0.9], l: [80, 1.45, -1.2], f: 42 }, { t: C.verif + 0.8, p: [81.8, 2.2, 6.0], l: [80, 1.8, -3.5], f: 46 }, { t: SC.fin.start, p: [82.0, 2.3, 6.4], l: [80, 1.8, -3.5], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- fin : Claude et l'arche en hologramme
SETS.fin = () => {
  const B = base({ bg: 0x080604, fog: [0x080604, 4, 14], hemi: [0xffe8c0, 0x100a06, 0.6], sun: [0xffe0b0, 0.7, [2, 5, 3]], shadowSize: 3, bloom: [0.7, 0.6, 0.75], exposure: 1.0 }); const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 8, M(0x6a5a48)), 0, -0.05, 0)); scene.add(at(box(8, 5, 0.3, M(0x5a4a38)), 0, 2.5, -2.2));
  const rig = claudeRig(scene, [-0.4, 0, 0.6], 0.25, [0.5, 0, 0.0], 0xffd070, 0.5, 0.3);
  const ha = ark(); ha.traverse(m => { if (m.isMesh) m.material = holoMat(0xffd070, 0.35); }); ha.scale.setScalar(0.35); rig.holoG.add(ha); ha.position.y = -0.05;
  const qm = label('?', { w: 0.3, h: 0.3, color: '#ffe0a0', font: 'bold 260px Inter' }); rig.holoG.add(qm); qm.position.y = 0.45;
  faceLight(scene, [-0.2, 1.0, 2.0], 1.6, 0xfff0d8);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start; const on = sstep(T0 + 0.6, T0 + 1.2, t); beamOn(rig, on, t); fade(ha, on); fade(qm, sstep(T0 + 1.6, T0 + 2.0, t)); ha.rotation.y = t * 0.5; qm.lookAt(cam.position);
      rig.c.update(t, env('claude', t), { wave: sstep(TL.duration - 2.0, TL.duration - 1.5, t) });
      camKeys(cam, t, [{ t: T0, p: [0.1, 1.0, 3.3], l: [-0.1, 0.75, 0], f: 46 }, { t: TL.duration, p: [0.05, 0.95, 3.0], l: [-0.1, 0.72, 0], f: 46 }]);
    }
  };
};

// ---------- couverture
SETS.cover = () => {
  const B = base({ bg: 0x080604, fog: [0x080604, 4, 14], hemi: [0xffe8c0, 0x100a06, 0.35], sun: [0xffe0b0, 0.5, [2, 5, 3]], shadowSize: 3, bloom: [0.8, 0.6, 0.7], exposure: 1.0 }); const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 8, M(0x6a5a48)), 0, -0.05, 0)); scene.add(at(box(8, 5, 0.3, M(0x5a4a38)), 0, 2.5, -2.2));
  const a = ark(); scene.add(a); const gl = glory(scene, [0, 1.0, 0]);
  return { ...B, update(t) { gl.userData.set(2, 1); cam.position.set(1.1, 1.3, 3.0); cam.fov = 46; cam.updateProjectionMatrix(); cam.lookAt(0, 0.45, 0); } };
};

const SHOTS = [
  ['intro', 0, SC.atelier.start], ['atelier', SC.atelier.start, SC.jourdain.start], ['jourdain', SC.jourdain.start, SC.dagon.start], ['dagon', SC.dagon.start, SC.temple.start],
  ['temple', SC.temple.start, SC.babylone.start], ['babylone', SC.babylone.start, SC.pistes.start], ['pistes', SC.pistes.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9],
];
