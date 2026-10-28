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

const REF = 'Apocalypse 22, 6-15 · traduction Louis Segond';
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
const refCard = (K) => K(REF, { w: 1.6, h: 0.12, border: '#807060', color: '#e8e0d4' }, t => t > SC.certain.start + 0.3 && t < SC.fin.start ? 0.85 : 0, -0.88, 0.75);


function nightSet(o = {}) {
  const B = base({ bg: 0x0a0814, fog: [0x0a0814, 6, 22], hemi: [0xd8d0ff, 0x10101a, 0.6], sun: [0xfff0d8, 0.8, [1, 5, 5]], shadowSize: 4, bloom: [0.45, 0.5, 0.85], exposure: 1.05, target: [0, 1, 0], ...o });
  B.scene.add(at(box(10, 0.1, 10, M(0x2a2430)), 0, -0.05, 0)); B.scene.add(L.stars(600, 60, 1.2)); return B;
}
function angelLight(scene, pos) { const l = new THREE.PointLight(0xfff0d0, 1.2, 4, 1.6); l.position.set(...pos); scene.add(l); return l; }
// genuflexion de Jean
const kneel = (j, k) => { if (k < 0.05) { j.pose({}); return; } j.pose(L.kneelPose({ lean: 0.5 * k, hp: 0.3 * k, aL: [0.4, 0.2], aR: [0.4, 0.2] })); };

// ---------- intro : l'accroche (Jean a genoux), puis le principe de la serie
SETS.intro = () => {
  const B = nightSet(); const { scene, cam } = B;
  const an = angel(); an.place(0.45, 0, -0.4, -0.35); scene.add(an.root); angelLight(scene, [0.45, 2.2, -0.9]);
  const j = john(); j.place(-0.45, 0, 0.3, 0.6); scene.add(j.root); faceLight(scene, [-0.1, 1.4, 2.0], 1.4, 0xfff0d8);
  const rig = claudeRig(scene, [1.5, 0, 1.6], -0.6, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [1.2, 0.7, 2.8], 1.0);
  const back = label('◀ une scène avant', { w: 0.8, h: 0.12, color: '#ffd070', font: 'bold 80px Inter' }); rig.holoG.add(back);
  return {
    ...B, update(t) {
      kneel(j, sstep(1.0, 2.6, t)); j.face(0, 'awe', t);
      an.pose({ aR: [1.4 * sstep(3.6, 4.4, t), 0.3], eR: 0.2, aL: [0.1, 0.2] }); an.face(0, 'serious', t);
      const bk = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, bk, t); fade(back, bk); back.lookAt(cam.position); rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [0.0, 1.5, 4.0], l: [0, 1.0, 0], f: 46 }, { t: C.serie, p: [0.0, 1.4, 3.6], l: [0, 1.0, 0], f: 46 }, { t: C.serie + 0.8, p: [1.0, 1.2, 4.6], l: [1.1, 0.9, 1.4], f: 46 }, { t: SC.certain.start, p: [1.0, 1.2, 4.5], l: [1.1, 0.9, 1.4], f: 46 }]);
    }
  };
};

// ---------- l'ange parle a Jean devant la grotte
SETS.certain = () => {
  const B = seaWorld(); const { scene, cam } = B;
  cave(scene); const lp = lamp(scene, [0.55, 0.42, 0.25]); scene.add(at(box(0.9, 0.4, 0.5, M(0x6a5a48)), 0.3, 0.2, 0.1));
  scene.add(at(box(0.45, 0.42, 0.4, M(0x6a5a48)), -0.35, 0.21, -0.2));
  const j = john(); j.place(-0.35, 0, 0.0, 0.5); scene.add(j.root);
  const an = angel(); an.place(0.9, 0, 0.9, -0.7); scene.add(an.root); angelLight(scene, [0.9, 2.1, 1.6]);
  faceLight(scene, [0.2, 1.4, 2.4], 1.3, 0xffe0c0, 5);
  const K = cardsMgr(scene, cam); refCard(K);
  K('l\'ange qui a montré toute la vision à Jean', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, SC.certain.start + 2.0, C.heureux - 0.2, 0.3, 0.2), -0.6);
  K('« je viens bientôt » : Jésus parle', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.heureux + 0.3, SC.genoux.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.certain.start; B.water.update(t, 0.15); lp.userData.tick(t);
      j.pose({ hp: -0.15, hy: 0.4 }); j.face(0, 'awe', t);
      an.pose({ aR: [0.6 + 0.3 * env('ange', t), 0.3], eR: 0.4 }); an.face(env('ange', t), 'serious', t);
      camKeys(cam, t, [{ t: T0, p: [0.3, 1.6, 4.8], l: [0.2, 1.0, 0.2], f: 46 }, { t: C.heureux, p: [0.6, 1.5, 4.3], l: [0.6, 1.15, 0.6], f: 46 }, { t: SC.genoux.start, p: [0.5, 1.5, 3.8], l: [0.3, 1.0, 0.4], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- Jean tombe a genoux ; « Garde-toi de le faire ! » ; deja en Apocalypse 19
SETS.genoux = () => {
  const B = nightSet(); const { scene, cam } = B;
  const an = angel(); an.place(0.45, 0, -0.4, -0.35); scene.add(an.root); angelLight(scene, [0.45, 2.2, -0.9]);
  const j = john(); j.place(-0.45, 0, 0.3, 0.6); scene.add(j.root); faceLight(scene, [-0.1, 1.4, 2.0], 1.4, 0xfff0d8);
  // la premiere fois (Apocalypse 19, 10) : souvenir en hologramme
  const ghostJ = john({ holo: 0x9adfff }), ghostA = new Human({ holo: 0x9adfff, robe: 0xffffff, robeL: 0.9, hairStyle: 'long', seed: 4010 });
  [ghostJ, ghostA].forEach(h => h.root.traverse(m => { if (m.isMesh && m.material && m.material.blending === THREE.AdditiveBlending) m.material.opacity = 0.25; }));
  ghostJ.place(-1.6, 0, -1.6, 0.6); ghostA.place(-0.8, 0, -2.2, -0.35); scene.add(ghostJ.root, ghostA.root);
  const K = cardsMgr(scene, cam); refCard(K);
  K('« Je suis ton compagnon de service »', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.deuxfois - 6.0, C.deuxfois + 0.2, 0.3, 0.2), -0.6);
  K('Apocalypse 19, 10 : la même scène, déjà', { w: 1.6, h: 0.24, border: '#9adfff' }, t => win(t, C.deuxfois + 4.5, SC.sceau.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.genoux.start; kneel(j, sstep(T0 + 4.0, T0 + 5.5, t) * (1 - sstep(C.deuxfois + 0.5, C.deuxfois + 2.0, t))); j.face(0, 'awe', t);
      an.pose({ aR: [1.5 * sstep(T0 + 9.5, T0 + 10.2, t), 0.3], eR: 0.2, aL: [0.1, 0.2] }); an.face(env('ange', t), 'serious', t);
      const gk = sstep(C.deuxfois + 4.0, C.deuxfois + 5.0, t); [ghostJ, ghostA].forEach(h => fade(h.root, gk)); kneel(ghostJ, 1); ghostA.pose({ aR: [1.4, 0.3], eR: 0.2 });
      camKeys(cam, t, [{ t: T0, p: [0.0, 1.5, 4.2], l: [0, 1.0, 0], f: 46 }, { t: T0 + 9.0, p: [0.2, 1.3, 2.9], l: [0.2, 1.1, 0], f: 44 }, { t: C.deuxfois + 3.5, p: [0.2, 1.3, 3.0], l: [0.2, 1.0, 0], f: 44 }, { t: C.deuxfois + 4.5, p: [0.6, 1.8, 5.0], l: [-0.5, 0.9, -0.8], f: 48 }, { t: SC.sceau.start, p: [0.6, 1.8, 4.9], l: [-0.5, 0.9, -0.8], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- ne scelle point : le livre de Daniel scelle, celui de Jean ouvert
SETS.sceau = () => {
  const B = base({ bg: 0x0a0806, fog: [0x0a0806, 5, 16], hemi: [0xffe0c0, 0x1a1008, 0.6], sun: [0xffe0b0, 0.6, [1, 5, 3]], shadowSize: 3, bloom: [0.5, 0.5, 0.85], exposure: 1.05, target: [0, 0.9, 0] });
  const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 8, M(0x3a2e24)), 0, -0.05, 0));
  scene.add(at(box(2.0, 0.06, 0.8, M(0x5a3a22)), 0, 0.8, 0)); for (const [x, z] of [[-0.9, -0.35], [0.9, -0.35], [-0.9, 0.35], [0.9, 0.35]]) scene.add(at(box(0.06, 0.8, 0.06, M(0x3a2414)), x, 0.4, z));
  // rouleau ferme et scelle (Daniel)
  const closed = new THREE.Group(); closed.position.set(-0.5, 0.9, 0.05); scene.add(closed);
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 16), M(0xe0cc9c)); roll.rotation.z = Math.PI / 2; closed.add(roll);
  const cord = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.008, 6, 20), M(0x6a3a1a)); cord.rotation.y = Math.PI / 2; closed.add(cord);
  const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16), M(0xa81a1a, { emissive: new THREE.Color(0x200404) })); wax.rotation.x = Math.PI / 2; wax.position.set(0, 0, 0.075); closed.add(wax);
  // rouleau ouvert (Jean)
  const open = scroll(0.55); open.position.set(0.5, 0.84, 0.05); scene.add(open);
  const lp = lamp(scene, [0, 0.83, -0.3]);
  const lD = label('DANIEL : « scelle »', { w: 0.7, h: 0.12, color: '#ff8a7a', font: 'bold 90px Inter' }); lD.position.set(-0.45, 1.2, 0.1); scene.add(lD);
  const lJ = label('JEAN : « ne scelle point »', { w: 0.8, h: 0.12, color: '#9adfff', font: 'bold 80px Inter' }); lJ.position.set(0.45, 1.1, 0.1); scene.add(lJ);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Daniel 12, 4 : « jusqu\'au temps de la fin »', { w: 1.6, h: 0.24, border: '#ff8a7a' }, t => win(t, C.daniel + 6.0, C.daniel + 11.5, 0.3, 0.2), -0.6);
  K('Apocalypse : « le temps est proche »', { w: 1.6, h: 0.24, border: '#9adfff' }, t => win(t, C.daniel + 11.7, SC.alpha.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.sceau.start; lp.userData.tick(t);
      const ok = sstep(C.daniel + 11.5, C.daniel + 13.0, t); open.scale.set(0.2 + 0.8 * ok, 1, 1); 
      fade(lD, sstep(C.daniel + 5.5, C.daniel + 6.0, t)); fade(lJ, sstep(C.daniel + 11.5, C.daniel + 12.0, t)); lD.lookAt(cam.position); lJ.lookAt(cam.position);
      camKeys(cam, t, [{ t: T0, p: [0.5, 1.5, 1.4], l: [0.5, 0.88, 0.05], f: 44 }, { t: C.daniel, p: [-0.4, 1.4, 1.3], l: [-0.5, 0.9, 0.05], f: 44 }, { t: C.daniel + 5.0, p: [-0.4, 1.4, 1.3], l: [-0.5, 0.9, 0.05], f: 44 }, { t: C.daniel + 6.0, p: [0.0, 1.6, 3.0], l: [0, 0.95, 0], f: 46 }, { t: SC.alpha.start, p: [0.0, 1.6, 2.9], l: [0, 0.95, 0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- l'alpha et l'omega
SETS.alpha = () => {
  const B = nightSet({ bloom: [0.7, 0.5, 0.75] }); const { scene, cam } = B;
  const A = label('Α', { w: 1.2, h: 1.2, color: '#ffd070', font: 'bold 420px Inter' }); A.position.set(-0.7, 1.6, 0); scene.add(A);
  const O = label('Ω', { w: 1.2, h: 1.2, color: '#ffd070', font: 'bold 420px Inter' }); O.position.set(0.7, 1.6, 0); scene.add(O);
  const line = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.0, 6), G(0xffd070, 1.6)); line.rotation.z = Math.PI / 2; line.position.set(0, 1.0, 0); scene.add(line);
  const greek = label('Α Β Γ Δ Ε Ζ Η Θ Ι Κ Λ Μ Ν Ξ Ο Π Ρ Σ Τ Υ Φ Χ Ψ Ω', { w: 2.4, h: 0.12, color: '#c8b090', font: 'bold 60px Inter' }); greek.position.set(0, 0.7, 0); scene.add(greek);
  const rig = claudeRig(scene, [0.0, 0, 1.4], 0, [0.45, 0, 0.1], 0xffd070, 0.45, 0.28); rig.pr.visible = false; faceLight(scene, [0, 0.6, 2.6], 1.0);
  const K = cardsMgr(scene, cam); refCard(K);
  K('ALPHA (Α) : 1re lettre · OMÉGA (Ω) : dernière', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.lettres + 0.4, SC.robes.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.alpha.start; const k = sstep(T0 + 0.8, T0 + 1.8, t);
      fade(A, k); fade(O, sstep(T0 + 2.5, T0 + 3.5, t)); line.scale.y = 0.01 + 1.4 * sstep(T0 + 3.5, T0 + 9.0, t); fade(greek, sstep(C.lettres + 0.5, C.lettres + 1.2, t));
      [A, O, greek].forEach(l => l.lookAt(cam.position)); rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0, 1.4, 4.4], l: [0, 1.3, 0], f: 48 }, { t: SC.robes.start, p: [0, 1.3, 4.1], l: [0, 1.2, 0], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- les robes lavees, les portes de la ville
SETS.robes = () => {
  const B = base({ sky: [0x3a2a6a, 0xffd0a0], hemi: [0xfff0e0, 0x3a2a3a, 0.9], sun: [0xfff0d0, 1.2, [2, 6, 6]], shadowSize: 6, bloom: [0.55, 0.5, 0.82], exposure: 0.95, fog: [0x8a6a8a, 14, 60], target: [0, 1, 0] }); const { scene, cam } = B;
  scene.add(L.groundPlane(60, 30, 0x8a7a6a, 0.1, 3));
  const wall = new THREE.Group(); wall.position.set(0, 0, -3); scene.add(wall);
  const gold = M(0xd8a83a, { emissive: new THREE.Color(0x3a2400) });
  for (const s of [-1, 1]) wall.add(at(box(4, 3.4, 0.6, gold), s * 2.6, 1.7, 0));
  wall.add(at(box(1.2, 0.6, 0.6, gold), 0, 3.1, 0));
  const glowGate = glowStar(4, 0xfff4d0); glowGate.position.set(0, 1.4, -3.5); scene.add(glowGate);
  const ppl = [0, 1, 2, 3].map(i => { const h = new Human({ skin: [0x8a5a3a, 0xe0b890, 0xa86c44, 0x5a3420][i], hair: 0x2a1a10, hairStyle: ['short', 'long', 'curly', 'bun'][i], top: 0x8a7a6a, bottom: 0x6a5a48, robe: 0x8a7a6a, robeL: 0.75, seed: 4020 + i }); scene.add(h.root); return h; });
  const K = cardsMgr(scene, cam); refCard(K);
  K('« laver sa robe » : une vie purifiée', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.dehors + 0.3, C.dehors + 5.0, 0.3, 0.2), -0.6);
  K('« les chiens » : insulte de l\'époque', { w: 1.6, h: 0.24, border: '#ff8a7a' }, t => win(t, C.dehors + 9.0, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.robes.start; const wh = sstep(T0 + 2.0, T0 + 6.0, t);
      ppl.forEach((h, i) => { const go = clamp((t - T0 - 6.0 - i * 0.8) / 8, 0, 1); h.place(-0.9 + i * 0.6, 0, 1.2 - 4.0 * go, 0); h.pose(L.walkPose(t * 4 + i, 0.6 * (go > 0 && go < 1 ? 1 : 0))); h.face(0, 'happy', t); h.mats.top.color.setHex(0x8a7a6a).lerp(new THREE.Color(0xffffff), wh); if (h.skirt) h.skirt.material.color.setHex(0x8a7a6a).lerp(new THREE.Color(0xffffff), wh); });
      camKeys(cam, t, [{ t: T0, p: [0, 1.5, 4.6], l: [0, 1.0, 0.5], f: 48 }, { t: SC.fin.start, p: [0, 1.8, 5.2], l: [0, 1.4, -2], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- fin : apercu du fleuve de cristal et de l'arbre de vie (prochain episode)
SETS.fin = () => {
  const B = base({ sky: [0xe8f0ff, 0xfff0d8], hemi: [0xffffff, 0xc0b0a0, 0.8], sun: [0xfff8e8, 1.0, [3, 8, 6]], shadowSize: 6, bloom: [0.4, 0.5, 0.9], exposure: 0.85, fog: [0xf0e8e0, 10, 50], target: [0, 1, 0] }); const { scene, cam } = B;
  scene.add(L.groundPlane(60, 30, 0x9ac87a, 0.1, 5));
  const riv = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 60), new THREE.MeshLambertMaterial({ color: 0xbfeaff, emissive: new THREE.Color(0x4a8ab0), transparent: true, opacity: 0.9 })); riv.rotation.x = -Math.PI / 2; riv.position.set(0, 0.05, -20); scene.add(riv);
  const trees = []; for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const tr = new THREE.Group(); tr.position.set(s * 1.5, 0, -1 - k * 4); scene.add(tr); tr.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 1.4, 8), M(0x6a4a2a)), 0, 0.7, 0)); const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 1), M(0x4a9a3a)); crown.position.y = 1.8; tr.add(crown); for (let f = 0; f < 6; f++) tr.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), G([0xff6a4a, 0xffd04a, 0xc04aff][f % 3], 1.3)), Math.cos(f) * 0.6, 1.7 + Math.sin(f * 2) * 0.3, Math.sin(f) * 0.6)); trees.push(tr); }
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 22, 1-5', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 6.0, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start; trees.forEach((tr, i) => tr.rotation.y = 0.1 * Math.sin(t * 0.5 + i));
      camKeys(cam, t, [{ t: T0, p: [0, 1.2, 5.0], l: [0, 0.8, -10], f: 50 }, { t: TL.duration, p: [0, 1.6, 1.5], l: [0, 1.4, -10], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : l'ange arrete Jean
SETS.cover = () => {
  const B = nightSet({ bloom: [0.5, 0.5, 0.8] }); const { scene, cam } = B;
  const an = angel(); an.place(0.4, 0, -0.4, -0.3); scene.add(an.root); angelLight(scene, [0.4, 2.2, -0.9]); an.pose({ aR: [1.5, 0.3], eR: 0.2, aL: [0.1, 0.2] }); an.face(0, 'serious', 0);
  const j = john(); j.place(-0.45, 0, 0.3, 0.6); scene.add(j.root); kneel(j, 1); j.face(0, 'awe', 0); faceLight(scene, [-0.1, 1.4, 2.0], 1.4, 0xfff0d8);
  return { ...B, update() { cam.position.set(0, 1.2, 4.6); cam.fov = 50; cam.updateProjectionMatrix(); cam.lookAt(0, 0.65, 0); } };
};

const SHOTS = [['intro', 0, SC.certain.start], ['certain', SC.certain.start, SC.genoux.start], ['genoux', SC.genoux.start, SC.sceau.start], ['sceau', SC.sceau.start, SC.alpha.start], ['alpha', SC.alpha.start, SC.robes.start], ['robes', SC.robes.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
