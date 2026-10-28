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
function openBook(texL, texR, ph = 0.36) {
  const g = new THREE.Group();
  const aw = (tex) => tex.image ? tex.image.width / tex.image.height : 0.72;
  const pw = ph * 0.72;
  const cover = M(0xc8b48a);
  g.add(at(box(pw * 2 + 0.03, 0.02, ph + 0.03, cover), 0, 0.0, 0));
  for (const [s, tex] of [[-1, texL], [1, texR]]) {
    const pg = new THREE.Group(); pg.position.set(0, 0.012, 0); g.add(pg);
    pg.add(at(box(pw, 0.025, ph, M(0xe8dcc0)), s * pw / 2, 0.012, 0));
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshLambertMaterial({ map: tex, color: 0xffffff }));
    pl.rotation.x = -Math.PI / 2; pl.position.set(s * pw / 2, 0.026, 0); pg.add(pl);
    pg.rotation.z = -s * 0.08;
  }
  g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}
function canvasTex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function versePage(lines) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 720; const g = c.getContext('2d');
  g.fillStyle = '#efe4c8'; g.fillRect(0, 0, 512, 720); g.fillStyle = '#3a2a1a'; g.textAlign = 'center';
  lines.forEach((l, i) => { g.font = i === 0 ? 'bold 40px Inter' : '32px Inter'; g.fillText(l, 256, 110 + i * 62); });
  for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(58,42,26,0.25)'; g.fillRect(70, 470 + k * 34, 372 - (k % 3) * 40, 10); }
  return canvasTex(c);
}

const REF = 'Apocalypse 22, 16-21 · traduction Louis Segond';
// personnages
function john(o = {}) { return new Human({ skin: 0xc8946a, hair: 0xe8e4dc, hairStyle: 'long', beard: 'long', beardColor: 0xe8e4dc, top: 0xe8dcc0, bottom: 0xc8b890, robe: 0xd8c8a0, robeL: 0.85, seed: 3901, ...o }); }
function angel() {
  const h = new Human({ skin: 0xf0d8c0, hair: 0xf0d080, hairStyle: 'long', top: 0xffffff, bottom: 0xffffff, robe: 0xffffff, robeL: 0.9, seed: 3902 });
  h.root.traverse(m => { if (m.isMesh && m.material && m.material.emissive) m.material.emissive = new THREE.Color(0x1a160e); });
  for (const s of [-1, 1]) { const w = new THREE.Group(); w.position.set(s * 0.12, 0.45, -0.14); h.spine.add(w); for (let k = 0; k < 3; k++) { const f = box(0.04, 0.5 - k * 0.1, 0.12, M(0xfff8e8, { emissive: new THREE.Color(0x605840) })); f.position.set(s * (0.15 + k * 0.12), 0.1 - k * 0.08, -0.05 * k); f.rotation.z = s * (0.7 + k * 0.25); w.add(f); } }
  return h;
}
function glowStar(size = 1, color = 0xfff4d0) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.12, 'rgba(255,240,200,0.9)'); gr.addColorStop(0.4, 'rgba(255,220,150,0.18)'); gr.addColorStop(1, 'rgba(255,200,120,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256); g.strokeStyle = 'rgba(255,250,230,0.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(128, 10); g.lineTo(128, 246); g.moveTo(10, 128); g.lineTo(246, 128); g.stroke();
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); s.scale.setScalar(size); return s;
}
// mer et ile
function seaWorld(o = {}) {
  const B = base({ sky: o.sky ?? [0x0a1430, 0x3a2a4a], hemi: [o.hemiC ?? 0x9aa8d8, 0x1a1420, o.hemiK ?? 0.7], sun: [o.sunC ?? 0xc8d0ff, o.sunK ?? 0.7, o.sunPos ?? [-4, 6, 6]], shadowSize: 6, bloom: [0.6, 0.5, 0.8], exposure: o.exposure ?? 1.0, fog: [o.fog ?? 0x2a2440, 18, 90], target: [0, 1, 0] });
  const water = L.makeWater(160, 80, o.water ?? 0x1a3050, { emissive: 0x050a18 }); water.mesh.position.set(0, -0.2, -20); B.scene.add(water.mesh);
  const isl = L.groundPlane(14, 30, 0x6a5a48, 0.5, 9); isl.position.y = 0.0; B.scene.add(isl);
  for (let i = 0; i < 7; i++) { const r = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5 + hash(i) * 2, 0), M(0x5a4a3a)); r.position.set(-12 + i * 4, -0.5, -18 - hash(i * 3) * 10); r.scale.y = 0.6 + hash(i * 5); B.scene.add(r); }
  B.water = water; return B;
}
function cave(scene) {
  const g = new THREE.Group(); scene.add(g);
  const rock = M(0x7a6a58);
  g.add(at(box(4, 3, 0.6, rock), 0, 1.5, -1.6)); g.add(at(box(0.8, 3, 2.5, rock), -1.7, 1.5, -0.6)); g.add(at(box(0.8, 3, 2.5, rock), 1.7, 1.5, -0.6)); g.add(at(box(4, 0.6, 2.5, rock), 0, 3.0, -0.6));
  for (let i = 0; i < 10; i++) { const r = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3 + hash(i) * 0.4, 0), rock); r.position.set(-2 + hash(i * 3) * 4, 3.2 + hash(i * 5) * 0.4, -0.6 + (hash(i * 7) - 0.5) * 2); g.add(r); }
  return g;
}
function lamp(scene, pos) {
  const g = new THREE.Group(); g.position.set(...pos); scene.add(g);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0x8a5a3a)));
  const f = at(new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.05, 6), G(0xffb040, 2.6)), 0.05, 0.04, 0); g.add(f);
  const l = new THREE.PointLight(0xffa050, 1.2, 3, 1.6); l.position.set(0.05, 0.3, 0.1); g.add(l);
  g.userData.tick = (t) => { f.scale.y = 1 + 0.25 * Math.sin(t * 13); l.intensity = 1.1 + 0.2 * Math.sin(t * 11); };
  return g;
}
function scroll(w = 0.5) {
  const g = new THREE.Group();
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#e8d8b0'; x.fillRect(0, 0, 512, 256); for (let i = 0; i < 9; i++) { x.fillStyle = 'rgba(60,40,20,0.55)'; x.fillRect(40, 30 + i * 24, 430 - (i % 3) * 40, 8); }
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 2), new THREE.MeshLambertMaterial({ map: canvasTex(c), side: THREE.DoubleSide })); p.rotation.x = -Math.PI / 2; g.add(p);
  for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, w / 2 + 0.04, 8), M(0x8a6a4a)); r.rotation.x = Math.PI / 2; r.position.x = s * w / 2; g.add(r); }
  return g;
}
const refCard = (K) => K(REF, { w: 1.6, h: 0.12, border: '#807060', color: '#e8e0d4' }, t => t > SC.patmos.start + 0.3 ? 0.85 : 0, -0.88, 0.75);

// ---------- intro : la Bible, les pages qui remontent
SETS.intro = () => {
  const B = base({ bg: 0x0a0806, fog: [0x0a0806, 5, 14], hemi: [0xffe0c0, 0x1a1008, 0.6], sun: [0xffe0b0, 0.6, [0, 6, 1]], shadowSize: 3, bloom: [0.55, 0.5, 0.82], exposure: 1.1, target: [0, 0.9, 0] });
  const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 8, M(0x2a1e18)), 0, -0.05, 0));
  scene.add(at(box(1.4, 0.06, 0.9, M(0x4a3222)), 0, 0.8, 0)); for (const [x, z] of [[-0.6, -0.38], [0.6, -0.38], [-0.6, 0.38], [0.6, 0.38]]) scene.add(at(box(0.06, 0.8, 0.06, M(0x3a2414)), x, 0.4, z));
  const book = openBook(versePage(['APOCALYPSE 22', '', '« Que la grâce', 'du Seigneur Jésus', 'soit avec tous ! »']), versePage(['', '', 'FIN']), 0.5); book.position.set(0, 0.84, 0); scene.add(book);
  // pages qui tournent a l'envers
  const pages = []; for (let i = 0; i < 6; i++) { const pg = new THREE.Group(); pg.position.set(0, 0.875, 0); scene.add(pg); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.5), M(0xe8dcc0, { side: THREE.DoubleSide })); p.rotation.x = -Math.PI / 2; p.position.x = 0.18; pg.add(p); pages.push(pg); }
  const lp = lamp(scene, [-0.55, 0.83, -0.3]);
  const rig = claudeRig(scene, [0.95, 0, 0.75], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [0.7, 0.7, 1.9], 1.2);
  const arrow = label('◀ ◀ ◀  on remonte', { w: 0.7, h: 0.1, color: '#ffd070', font: 'bold 80px Inter' }); arrow.position.set(0, 0.35, 0); rig.holoG.add(arrow);
  return {
    ...B, update(t) {
      lp.userData.tick(t);
      pages.forEach((pg, i) => { const u = clamp((t - C.serie - 0.5 - i * 0.6) / 0.8, 0, 1); pg.rotation.z = Math.PI * u; pg.visible = u > 0 && u < 1; });
      const ak = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, ak, t); fade(arrow, ak); arrow.lookAt(cam.position);
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [0.0, 1.75, 1.3], l: [0, 0.85, 0], f: 44 }, { t: C.serie, p: [0.3, 1.6, 2.4], l: [0.25, 0.9, 0.3], f: 46 }, { t: C.title, p: [0.4, 1.6, 3.2], l: [0.3, 0.9, 0.3], f: 46 }, { t: SC.patmos.start, p: [0.4, 1.6, 3.2], l: [0.3, 0.9, 0.3], f: 46 }]);
    }
  };
};

// ---------- Patmos : Jean dans la grotte
SETS.patmos = () => {
  const B = seaWorld(); const { scene, cam } = B;
  cave(scene); const lp = lamp(scene, [0.45, 0.42, 0.2]);
  scene.add(at(box(0.9, 0.4, 0.5, M(0x6a5a48)), 0.2, 0.2, 0.05));
  scene.add(at(box(0.45, 0.42, 0.4, M(0x6a5a48)), -0.25, 0.21, -0.3));
  const j = john(); j.place(-0.25, 0, -0.1, 0.15); scene.add(j.root);
  const sc = scroll(0.42); sc.position.set(0.15, 0.415, 0.15); scene.add(sc);
  faceLight(scene, [0.0, 1.4, 1.4], 1.4, 0xffd8a8);
  const K = cardsMgr(scene, cam);
  refCard(K);
  K('PATMOS · île grecque de la mer Égée\nfin du Ier siècle', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.patmos.start + 1.0, SC.patmos.start + 6.5, 0.3, 0.2), -0.6);
  K('la « grotte de l\'Apocalypse »\nlieu de la vision selon la tradition', { w: 1.6, h: 0.42, border: '#e0b070', small: true }, t => win(t, SC.patmos.start + 7.5, SC.etoile.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.patmos.start; B.water.update(t, 0.15); lp.userData.tick(t);
      j.pose(L.sitPose(0.42, { aL: [0.9, 0.1], aR: [1.0 + 0.05 * Math.sin(t * 5), 0.15], eL: 0.9, eR: 1.0, hp: 0.3 })); j.face(0, 'neutral', t);
      camKeys(cam, t, [{ t: T0, p: [0, 3.5, 12], l: [0, 1.2, -1], f: 46 }, { t: T0 + 6.0, p: [0.3, 1.4, 4.2], l: [0, 0.9, -0.2], f: 46 }, { t: SC.etoile.start, p: [0.3, 1.3, 3.4], l: [0, 0.85, -0.2], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- l'etoile du matin
SETS.etoile = () => {
  const B = seaWorld({ sky: [0x0a1030, 0xd8885a], hemiK: 0.6 }); const { scene, cam } = B;
  const star = glowStar(1.6); star.position.set(-8, 6, -12); scene.add(star);
  const j = john(); j.place(0, 0, 1.2, -0.6); scene.add(j.root);
  faceLight(scene, [0.4, 1.6, 2.4], 1.0, 0xffd8b0, 5);
  const rig = claudeRig(scene, [-0.9, 0, 2.6], 0.4, [0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [-0.7, 0.7, 3.7], 1.0, 0xfff0d8, 3);
  const crown = new THREE.Group(); rig.holoG.add(crown); crown.add(holo(new THREE.CylinderGeometry(0.15, 0.15, 0.07, 10, 1, true), 0xffd070, 0.3)); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; crown.add(at(holo(new THREE.ConeGeometry(0.025, 0.08, 4), 0xffd070, 0.4), Math.cos(a) * 0.15, 0.07, Math.sin(a) * 0.15)); }
  const lD = label('DAVID', { w: 0.5, h: 0.1, color: '#ffd070', font: 'bold 90px Inter' }); lD.position.y = -0.12; rig.holoG.add(lD);
  const lV = label('Vénus', { w: 2.0, h: 0.5, color: '#fff4d0', font: 'bold 160px Inter' }); lV.position.set(-8, 4.9, -12); scene.add(lV);
  const K = cardsMgr(scene, cam); refCard(K);
  K('« rejeton de David » = descendant du roi David', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.david + 0.3, C.david + 6.0, 0.3, 0.2), -0.6);
  K('l\'étoile du matin : Vénus, juste avant l\'aube', { w: 1.6, h: 0.24, border: '#fff4d0' }, t => win(t, C.david + 6.2, SC.viens.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.etoile.start; B.water.update(t, 0.15); star.scale.setScalar(2.0 + 0.25 * Math.sin(t * 2)); j.pose({ hp: -0.45, hy: -0.3, aR: [0.3, 0.2] }); j.face(0, 'awe', t);
      const ck = win(t, C.david, C.david + 6.0, 0.4, 0.3); beamOn(rig, ck, t); fade(crown, ck); fade(lD, ck); crown.rotation.y = t; lD.lookAt(cam.position);
      fade(lV, win(t, C.david + 6.0, SC.viens.start, 0.4, 0.3)); lV.lookAt(cam.position);
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [1.0, 1.2, 3.7], l: [-1.0, 1.7, 0.4], f: 52 }, { t: C.david - 0.3, p: [1.1, 1.25, 4.0], l: [-1.0, 1.7, 0.4], f: 52 }, { t: C.david + 0.5, p: [-0.4, 1.2, 4.6], l: [-0.6, 0.9, 2.4], f: 46 }, { t: C.david + 6.0, p: [-0.4, 1.2, 4.6], l: [-0.6, 0.9, 2.4], f: 46 }, { t: C.david + 6.8, p: [1.0, 1.2, 3.8], l: [-1.4, 2.0, -0.2], f: 52 }, { t: SC.viens.start, p: [1.0, 1.2, 3.7], l: [-1.4, 2.0, -0.2], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- « Viens » : l'eau de la vie, gratuitement
SETS.viens = () => {
  const B = base({ sky: [0xf0e8ff, 0xffe8c8], hemi: [0xffffff, 0xc0b0a0, 0.8], sun: [0xfff8e8, 1.0, [3, 8, 6]], shadowSize: 6, bloom: [0.4, 0.5, 0.9], exposure: 0.85, fog: [0xf0e0d0, 12, 60], target: [0, 0.5, 0] });
  const { scene, cam } = B;
  const gr = L.groundPlane(60, 40, 0x9ac87a, 0.15, 5); scene.add(gr);
  const riv = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 60), new THREE.MeshLambertMaterial({ color: 0xbfeaff, emissive: new THREE.Color(0x4a8ab0), transparent: true, opacity: 0.9 })); riv.rotation.x = -Math.PI / 2; riv.position.set(0, 0.06, -20); scene.add(riv);
  const src = glowStar(5, 0xffffff); src.position.set(0, 2.2, -40); scene.add(src);
  const sparks = []; for (let i = 0; i < 40; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), G(0xe8f8ff, 2)); scene.add(s); sparks.push(s); }
  const people = [0, 1, 2, 3, 4].map(i => { const h = new Human({ skin: [0x8a5a3a, 0xe0b890, 0xa86c44, 0x5a3420, 0xd09a70][i], hair: [0x1a1210, 0x8a6a3a, 0x2a1a10, 0x120c08, 0x5a3a20][i], hairStyle: ['short', 'long', 'curly', 'short', 'bun'][i], top: [0xd8c8a0, 0x8a5a8a, 0x5a8aaa, 0xc86a4a, 0xf0f0f0][i], bottom: 0x6a5a48, robe: [0xd8c8a0, 0x8a5a8a, 0x5a8aaa, 0xc86a4a, 0xf0f0f0][i], robeL: 0.7, seed: 3910 + i }); scene.add(h.root); return h; });
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.035, 0.08, 10), M(0xc8a060)); scene.add(cup);
  const lG = label('« gratuitement »', { w: 1.4, h: 0.22, color: '#3a6a9a', font: 'bold 120px Inter' }); lG.position.set(0, 2.0, -1); scene.add(lG);
  const K = cardsMgr(scene, cam); refCard(K);
  K('« l\'épouse » : image de tous les croyants', { w: 1.6, h: 0.24, border: '#5a8aaa' }, t => win(t, C.epouse + 0.3, C.epouse + 5.0, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.viens.start;
      sparks.forEach((s, i) => { const u = (t * 0.12 + hash(i)) % 1; s.position.set((hash(i * 3) - 0.5) * 1.3, 0.12 + 0.05 * Math.sin(t * 3 + i), -40 + u * 42); });
      people.forEach((h, i) => { const k = clamp((t - T0 - 1.0 - i * 0.6) / 14, 0, 1); const side = i % 2 ? 1 : -1; h.place(side * (1.2 + 0.4 * (i % 3)), 0, 3.5 - i * 0.9 - 2.5 * k, side * 0.35 + Math.PI * 0 ); h.root.rotation.y = -side * 0.45; h.pose(L.walkPose(t * 4 + i, 0.6 * (1 - sstep(0.9, 1, k)))); h.face(0, 'happy', t); });
      const hk = sstep(C.epouse + 5.0, C.epouse + 6.0, t); const hp = new THREE.Vector3(); people[0].hand.R.getWorldPosition(hp); cup.position.copy(hp); cup.visible = hk > 0.5; people[0].pose({ aR: [1.2 * hk, 0.1], eR: 0.6 });
      fade(lG, sstep(C.epouse + 2.0, C.epouse + 2.6, t)); lG.lookAt(cam.position);
      camKeys(cam, t, [{ t: T0, p: [0, 2.6, 7.5], l: [0, 1.0, -6], f: 50 }, { t: C.epouse, p: [0.5, 2.0, 5.5], l: [0, 0.9, 0], f: 50 }, { t: SC.avertissement.start, p: [0.8, 1.6, 4.8], l: [0, 0.9, 0.5], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- l'avertissement ; un copiste recopie
SETS.avertissement = () => {
  const B = base({ bg: 0x0a0806, fog: [0x0a0806, 5, 16], hemi: [0xffe0c0, 0x1a1008, 0.6], sun: [0xffe0b0, 0.5, [1, 5, 3]], shadowSize: 3, bloom: [0.55, 0.5, 0.82], exposure: 1.05, target: [0, 0.9, 0] });
  const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 8, M(0x3a2e24)), 0, -0.05, 0)); scene.add(at(box(8, 4, 0.2, M(0x5a4a3a)), 0, 2, -1.6));
  scene.add(at(box(1.3, 0.06, 0.7, M(0x5a3a22)), 0, 0.8, 0)); for (const [x, z] of [[-0.58, -0.28], [0.58, -0.28], [-0.58, 0.28], [0.58, 0.28]]) scene.add(at(box(0.06, 0.8, 0.06, M(0x3a2414)), x, 0.4, z));
  const sc = scroll(0.5); sc.position.set(0, 0.835, 0.1); scene.add(sc);
  const blank = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1), M(0xe8d8b0)); blank.rotation.x = -Math.PI / 2; blank.position.set(0, 0.838, 0.1); scene.add(blank);
  const scr = new Human({ skin: 0xa86c44, hair: 0x2a1a10, hairStyle: 'short', beard: 'full', top: 0x6a5a4a, bottom: 0x5a4a3a, robe: 0x6a5a4a, robeL: 0.7, seed: 3920 }); scr.place(0, 0, -0.55, 0); scene.add(scr.root);
  const quill = at(box(0.006, 0.006, 0.2, M(0xf4f0e8)), 0, -0.04, 0.08); quill.rotation.x = 0.7; scr.hand.R.add(quill);
  const lp = lamp(scene, [-0.45, 0.83, -0.1]); faceLight(scene, [0.1, 1.5, 0.8], 1.6, 0xffd8b0);
  const plus = label('+ ajouter', { w: 0.8, h: 0.16, color: '#ff8a6a', font: 'bold 100px Inter' }), minus = label('− retrancher', { w: 0.9, h: 0.16, color: '#ff8a6a', font: 'bold 100px Inter' });
  plus.position.set(-0.55, 1.75, 0.2); minus.position.set(0.55, 1.75, 0.2); scene.add(plus, minus);
  const K = cardsMgr(scene, cam); refCard(K);
  imagined(K, 'scène imaginée', C.copistes, SC.bientot.start);
  K('Codex Sinaiticus · IVe siècle\nplus ancien manuscrit complet de l\'Apocalypse', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.copistes + 6.0, SC.bientot.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.avertissement.start; lp.userData.tick(t);
      const wr = sstep(C.copistes, SC.bientot.start - 0.5, t); blank.scale.y = 0.25 * (1 - wr) + 0.001; blank.position.z = 0.1 + 0.125 * wr;
      scr.pose(L.sitPose(0.45, { aL: [0.75, 0.15], aR: [0.95 + 0.05 * Math.sin(t * 6), 0.12], eL: 1.1, eR: 1.3 + 0.08 * Math.sin(t * 7), hp: 0.45, lean: 0.12 })); scr.face(0, 'neutral', t);
      const wk = win(t, T0 + 4.5, C.copistes, 0.3, 0.3); fade(plus, wk * sstep(T0 + 4.5, T0 + 5.0, t)); fade(minus, wk * sstep(T0 + 8.5, T0 + 9.0, t)); plus.lookAt(cam.position); minus.lookAt(cam.position);
      camKeys(cam, t, [{ t: T0, p: [0.0, 1.9, 2.6], l: [0, 1.2, -0.4], f: 46 }, { t: C.copistes - 0.3, p: [0.0, 1.8, 2.5], l: [0, 1.2, -0.4], f: 46 }, { t: C.copistes + 0.5, p: [0.25, 1.4, 0.6], l: [0.0, 0.84, 0.0], f: 44 }, { t: C.copistes + 5.5, p: [0.2, 1.45, 0.7], l: [0.0, 0.84, 0.0], f: 44 }, { t: C.copistes + 6.5, p: [0.0, 1.85, 2.3], l: [0, 1.15, -0.4], f: 46 }, { t: SC.bientot.start, p: [0.0, 1.85, 2.2], l: [0, 1.15, -0.4], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- « je viens bientot » : l'aube sur la mer
SETS.bientot = () => {
  const B = seaWorld({ sky: [0x3a5a9a, 0xffb070], hemiC: 0xffe0c0, hemiK: 0.9, sunC: 0xffd8a0, sunK: 1.3, sunPos: [0, 3, -10], fog: 0xe0a080, water: 0x3a5a8a }); const { scene, cam } = B;
  const sun = glowStar(14, 0xffd090); sun.position.set(0, 2, -60); scene.add(sun);
  const j = john(); j.place(0, 0, 1.0, 0); scene.add(j.root);
  faceLight(scene, [0, 1.6, 2.6], 1.5, 0xffe0c0, 5);
  const mar = label('MARANATHA', { w: 2.4, h: 0.4, color: '#ffe0a0', font: 'bold 170px Inter' }); mar.position.set(0, 2.5, 0.5); scene.add(mar);
  const K = cardsMgr(scene, cam); refCard(K);
  K('MARANATHA', { w: 1.4, h: 0.3, border: '#ffd070', color: '#ffe0a0' }, t => win(t, C.repond + 5.5, C.repond + 11.5, 0.3, 0.2), 0.3, 0.6);
  K('« Seigneur, viens » en araméen', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.repond + 6.5, C.repond + 11.5, 0.3, 0.2), -0.6);
  K('le dernier verset de la Bible\n« Que la grâce du Seigneur Jésus soit avec tous ! »', { w: 1.6, h: 0.42, border: '#ffffff', small: true }, t => win(t, C.repond + 11.7, C.attente, 0.3, 0.2), -0.6);
  K('≈ 2 000 ans d\'attente', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.attente + 0.6, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.bientot.start; B.water.update(t, 0.15); const up = sstep(T0, SC.fin.start, t); sun.position.y = 0 + 6 * up;
      const arms = sstep(C.repond, C.repond + 1.0, t); j.pose({ aL: [2.2 * arms + 0.05, 0.4], aR: [2.2 * arms + 0.05, 0.4], hp: -0.2 * arms }); j.face(env('claude', t) * 0, arms > 0.5 ? 'awe' : 'neutral', t);
      fade(mar, 0);
      camKeys(cam, t, [{ t: T0, p: [0, 1.4, 4.4], l: [0, 1.6, -20], f: 48 }, { t: C.repond, p: [0, 1.4, 3.6], l: [0, 1.3, 0], f: 48 }, { t: SC.fin.start, p: [0.4, 1.5, 4.2], l: [0, 1.5, 0], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- fin : la scene d'avant (prochain episode) : Jean a genoux devant l'ange
SETS.fin = () => {
  const B = base({ bg: 0x0a0814, fog: [0x0a0814, 6, 22], hemi: [0xd8d0ff, 0x10101a, 0.6], sun: [0xfff0d8, 0.8, [1, 5, 5]], shadowSize: 4, bloom: [0.45, 0.5, 0.85], exposure: 1.05, target: [0, 1, 0] }); const { scene, cam } = B;
  scene.add(at(box(10, 0.1, 10, M(0x2a2430)), 0, -0.05, 0));
  const an = angel(); an.place(0.45, 0, -0.4, -0.35); scene.add(an.root);
  const glow = new THREE.PointLight(0xfff0d0, 1.2, 4, 1.6); glow.position.set(0.45, 2.2, -0.9); scene.add(glow);
  const j = john(); j.place(-0.45, 0, 0.3, 0.6); scene.add(j.root);
  faceLight(scene, [-0.1, 1.4, 2.0], 1.4, 0xfff0d8, 5);
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 22, 6-15', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 4.0, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start; const kn = sstep(T0 + 1.0, T0 + 3.0, t), st = sstep(T0 + 5.5, T0 + 6.3, t);
      j.pose(L.kneelPose({ lean: 0.5 * kn, hp: 0.3 * kn, aL: [0.4, 0.2], aR: [0.4, 0.2] })); j.root.position.y = 0; if (kn < 0.05) j.pose({}); j.face(0, 'awe', t);
      an.pose({ aR: [1.4 * st, 0.3], eR: 0.2, aL: [0.1, 0.2] }); an.face(0, 'serious', t); glow.intensity = 1.1 + 0.2 * Math.sin(t * 2);
      camKeys(cam, t, [{ t: T0, p: [0.0, 1.5, 4.2], l: [0, 1.0, 0], f: 46 }, { t: TL.duration, p: [0.0, 1.4, 3.6], l: [0, 1.0, 0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : l'aube sur Patmos, l'etoile du matin, la Bible ouverte
SETS.cover = () => {
  const B = seaWorld({ sky: [0x0a1030, 0xe8905a], hemiK: 0.7, sunC: 0xffd0a0, sunK: 1.0, sunPos: [0, 3, -10] }); const { scene, cam } = B;
  B.water.update(1, 0.15);
  const star = glowStar(4); star.position.set(4, 16, -40); scene.add(star);
  const sun = glowStar(18, 0xffc080); sun.position.set(0, 0.2, -60); scene.add(sun);
  const j = john(); j.place(0, 0, 1.0, 0); scene.add(j.root); j.pose({ aL: [2.3, 0.4], aR: [2.3, 0.4], hp: -0.15 }); j.face(0, 'awe', 0); faceLight(scene, [0, 1.6, 2.8], 1.6, 0xffe0c0, 5);
  return { ...B, update() { cam.position.set(0.0, 0.7, 4.8); cam.fov = 56; cam.updateProjectionMatrix(); cam.lookAt(0.0, 0.85, 0); } };
};

const SHOTS = [['intro', 0, SC.patmos.start], ['patmos', SC.patmos.start, SC.etoile.start], ['etoile', SC.etoile.start, SC.viens.start], ['viens', SC.viens.start, SC.avertissement.start], ['avertissement', SC.avertissement.start, SC.bientot.start], ['bientot', SC.bientot.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
