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
function holoStudio(o = {}) {
  const B = base({ bg: 0x0c0614, fog: [0x0c0614, 8, 30], hemi: [0xd0b0ff, 0x10101c, 1.0], sun: [0xffffff, 1.0, [2, 5, 4]], shadow: false, bloom: [0.5, 0.5, 0.82], ...o });
  const grid = new THREE.GridHelper(40, 40, new THREE.Color(0xd97757).multiplyScalar(0.9), new THREE.Color(0xd97757).multiplyScalar(0.25)); B.scene.add(grid);
  return B;
}
// silhouette feminine : hanches et fessier (sous les vetements, low-poly)
function curvy(h, k = 1, mat) {
  const m = mat ?? h.mats.bot;
  const hips = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), m); hips.scale.set(1.28 * (0.85 + 0.15 * k), 0.75, 0.95); hips.position.set(0, -0.02, -0.02); h.pelvis.add(hips);
  for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1 + 0.025 * k, 1), m); b.scale.set(1, 1, 0.9 + 0.2 * k); b.position.set(s * 0.085, -0.06, -0.09 - 0.02 * k); h.pelvis.add(b); }
  h.spine.children[0].scale.x = 0.85; // taille plus fine
  h.root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return h;
}
// trois silhouettes differentes, toutes avec un fessier volumineux : ronde, mince, type BBL
function woman(o, type = 'mince') {
  const h = curvy(new Human(o), 1);
  const P = {
    ronde: { torso: [1.2, 1.3], arms: 1.15, hips: [1.5, 1.3], butt: Math.cbrt(3) * 1.05, bx: 1.3, bz: -0.08, thigh: [1.35, 1.3], hipX: 1.2, belly: true },
    mince: { torso: [0.72, 0.85], arms: 0.85, hips: [1.15, 1.0], butt: Math.cbrt(3), bx: 1.1, bz: -0.06, thigh: [0.9, 0.95], hipX: 1.0 },
    bbl: { torso: [0.62, 0.8], arms: 0.8, hips: [1.5, 1.1], butt: Math.cbrt(3) * 1.2, bx: 1.25, bz: -0.1, thigh: [1.05, 1.0], hipX: 1.05 },
  }[type];
  h.spine.children[0].scale.set(P.torso[0], 1, P.torso[1]);
  for (const k of ['L', 'R']) { h.sh[k].position.x *= P.arms; h.hip[k].position.x *= P.hipX; h.hip[k].children[0].scale.set(P.thigh[0], 1, P.thigh[1]); }
  h.pelvis.children.forEach(m => {
    if (!m.isMesh || m.geometry.type !== 'IcosahedronGeometry') return;
    if (m.position.z < -0.05) { m.scale.multiplyScalar(P.butt); m.position.z += P.bz; m.position.y -= 0.02; m.position.x *= P.bx; }
    else { m.scale.x *= P.hips[0]; m.scale.z *= P.hips[1]; }
  });
  if (P.belly) h.spine.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 1), h.mats.top), 0, 0.12, 0.08));
  h.root.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return h;
}
function holoWoman(color, k, op = 0.3) {
  const h = new Human({ holo: color, hairStyle: 'long', robe: color, robeL: 0.5, seed: 9 });
  curvy(h, k, holoMat(color, 0.45));
  h.root.traverse(m => { if (m.isMesh && m.material && m.material.blending === THREE.AdditiveBlending) m.material.opacity = op; });
  return h;
}
// rue et terrasse de cafe
function street(scene) {
  scene.add(at(box(14, 0.1, 3, M(0x9a948a)), 0, -0.05, 0)); scene.add(at(box(14, 0.08, 4, M(0x4a4a50)), 0, -0.08, 3.4));
  const cols = [0xd8b890, 0xc88a6a, 0xa8b8c8, 0xe0d0a0, 0x9ab08a];
  for (let i = 0; i < 6; i++) { const w = 2.2, h = 3.5 + hash(i) * 1.5; scene.add(at(box(w, h, 1, M(cols[i % 5])), -5.5 + i * 2.25, h / 2, -2.0));
    for (let j = 0; j < 2; j++) scene.add(at(box(0.6, 0.9, 0.05, M(0x3a4a5a)), -5.9 + i * 2.25 + j * 0.8, 2.6, -1.48)); scene.add(at(box(0.8, 1.6, 0.05, M(0x5a3a2a)), -5.5 + i * 2.25, 0.8, -1.48)); }
  const aw = at(box(2.4, 0.06, 1.0, M(0xb04a3a)), -1.2, 2.2, -1.0); aw.rotation.x = 0.25; scene.add(aw);
  const table = new THREE.Group(); table.position.set(-0.55, 0, -0.35); scene.add(table);
  table.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 12), M(0xe8e8e0)), 0, 0.74, 0)); table.add(at(box(0.05, 0.74, 0.05, M(0x2a2a2a)), 0, 0.37, 0));
  table.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.08, 8), M(0xffffff)), 0.1, 0.8, 0.05));
  scene.add(at(box(0.42, 0.05, 0.42, M(0x7a4a2a)), -1.2, 0.45, -0.35));
  for (let i = 0; i < 5; i++) { const tr = new THREE.Group(); tr.position.set(-6.3 + i * 3.2, 0, -1.2); scene.add(tr); tr.add(at(box(0.12, 1.4, 0.12, M(0x5a3a22)), 0, 0.7, 0)); tr.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), M(0x5a8a4a)), 0, 1.8, 0)); }
}
const looksW = [
  { skin: 0x8a5a3a, hair: 0x141010, hairStyle: 'curly', top: 0xe0c040, bottom: 0x3a4a7a, seed: 2301 },
  { skin: 0xf0c8a0, hair: 0x6a3a1a, hairStyle: 'bun', top: 0x3a8a7a, bottom: 0x4a5a8a, seed: 2302 },
  { skin: 0xc68a5a, hair: 0x1a1010, hairStyle: 'long', top: 0xc04a6a, bottom: 0x2a2a34, seed: 2305 },
];
function cafeScene(B, o = {}) {
  const { scene } = B; street(scene);
  const man = new Human({ skin: 0xc89a72, hair: 0x2a1a10, hairStyle: 'short', beard: 'side', top: 0x4a6a9a, bottom: 0x2a2a3a, seed: 2303 }); man.place(-1.2, 0, -0.35, Math.PI / 2); scene.add(man.root);
  const w1 = woman(looksW[0], 'bbl'), w2 = woman(looksW[1], 'mince'), w3 = woman(looksW[2], 'ronde'); scene.add(w1.root, w2.root, w3.root);
  return { man, w1, w2, w3 };
}

// ---------- intro : la terrasse
SETS.intro = () => {
  const B = base({ sky: [0x7ab8e8, 0xe8f0f8], hemi: [0xffffff, 0x6a6050, 1.1], sun: [0xfff0d8, 1.6, [4, 8, 5]], shadowSize: 6, bloom: [0.3, 0.5, 0.93], exposure: 1.05, target: [0, 0.8, 0] });
  const { scene, cam } = B; const { man, w1, w2, w3 } = cafeScene(B);
  faceLight(scene, [-0.6, 1.5, 0.8], 1.4);
  const rig = claudeRig(scene, [-0.9, 0, 1.6], -0.6, [-0.45, 0, 0.1], 0x55e6ff, 0.45, 0.28); rig.pr.visible = false; rig.c.g.visible = false;
  return {
    ...B, update(t) {
      const z1 = lerp(1.7, -0.6, t / 10);
      w1.place(-0.4, 0, z1, Math.PI + 0.05); w2.place(0.03, 0, z1 + 0.2, Math.PI); w3.place(0.5, 0, z1 + 0.05, Math.PI - 0.05);
      w1.pose(L.walkPose(t * 4, 0.6)); w2.pose(L.walkPose(t * 4 + 1.3, 0.6)); w3.pose(L.walkPose(t * 4 + 2.4, 0.6)); w3.face(0, 'happy', t); w1.face(0, 'happy', t); w2.face(0, 'neutral', t);
      // la tete de l'homme suit les passantes
      const look = 0.15 * sstep(1, 4, t);
      man.pose(L.sitPose(0.46, { aL: [0.9, 0.1], aR: [0.5, 0.15], eL: 1.2, eR: 0.9, hy: -look * 0.6, hp: 0.05 })); man.face(0, 'neutral', t);
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [-0.3, 1.45, 4.9], l: [-0.3, 1.0, 0.3], f: 56 }, { t: C.title, p: [-0.3, 1.5, 4.6], l: [-0.3, 1.0, 0.0], f: 56 }, { t: SC.venus.start, p: [-0.3, 1.5, 4.55], l: [-0.3, 1.0, 0.0], f: 56 }]);
    }
  };
};

// ---------- Venus de Willendorf (modele 3D stylise)
function makeVenus() {
  const g = new THREE.Group(); const m = M(0xc8a070), m2 = M(0xb88a58);
  const S = (r, sx, sy, sz, x, y, z, mm = m) => { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mm); s.scale.set(sx, sy, sz); s.position.set(x, y, z); g.add(s); return s; };
  for (let i = 0; i < 6; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075 - i * 0.008, 0.012, 4, 12), m2); ring.rotation.x = Math.PI / 2; ring.position.y = 0.55 + i * 0.022; g.add(ring); }
  S(0.07, 1, 1.1, 1, 0, 0.6, 0, m2);
  S(0.1, 1.1, 0.9, 0.9, 0, 0.45, 0.0);
  for (const s of [-1, 1]) S(0.07, 1, 1.15, 1, s * 0.06, 0.4, 0.06);
  S(0.13, 1.15, 1.0, 1.05, 0, 0.3, 0.03);
  S(0.15, 1.35, 0.9, 1.05, 0, 0.22, -0.01);
  for (const s of [-1, 1]) S(0.08, 1, 1.5, 1, s * 0.07, 0.08, 0);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
SETS.venus = () => {
  const B = base({ bg: 0x0c0a0a, hemi: [0xffe8d0, 0x1a1410, 0.5], sun: [0xffe0c0, 0.4, [2, 5, 3]], shadow: false, bloom: [0.4, 0.5, 0.88], exposure: 1.15 });
  const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 8, M(0x2a2420)), 0, -0.05, 0)); scene.add(at(box(8, 4, 0.2, M(0x3a3028)), 0, 2, -2));
  scene.add(at(box(0.5, 1.0, 0.5, M(0x1a1a1e)), 0, 0.5, 0));
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.55, 0.46), new THREE.MeshLambertMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.08, depthWrite: false })); glass.position.set(0, 1.28, 0); scene.add(glass);
  const v = makeVenus(); v.position.set(0, 1.0, 0); scene.add(v);
  const sp = new THREE.SpotLight(0xffe8c8, 9, 5, 0.35, 0.5, 1.0); sp.position.set(0.6, 2.8, 1.2); sp.target = v; scene.add(sp);
  const fill = faceLight(scene, [0, 1.3, 1.0], 1.0, 0xffe0c0);
  const rig = claudeRig(scene, [-0.75, 0, 0.9], 0.45, [0.45, 0, 0.0], 0xffd070, 0.45, 0.28);
  const qs = ['fertilité ?', 'déesse ?', 'vraie femme ?'].map((s, i) => { const l = label(s, { w: 0.6, h: 0.1, color: ['#ffd070', '#ff9a7a', '#7dd8ff'][i], font: 'bold 80px Inter' }); l.position.y = 0.2 - i * 0.12; rig.holoG.add(l); return l; });
  const K = cardsMgr(scene, cam);
  K('VÉNUS DE WILLENDORF\n≈ 11 cm · musée d\'histoire naturelle de Vienne', { w: 1.6, h: 0.42, border: '#e0b070', small: true }, t => win(t, SC.venus.start + 3.2, C.sens, 0.3, 0.2));
  return {
    ...B, update(t) {
      const T0 = SC.venus.start;
      camKeys(cam, t, [{ t: T0, p: [0.0, 1.35, 1.1], l: [0, 1.3, 0], f: 40 }, { t: C.sens - 0.5, p: [0.45, 1.4, 0.85], l: [0, 1.3, 0], f: 40 }, { t: C.sens + 0.5, p: [-0.3, 1.25, 3.4], l: [-0.3, 0.95, 0.5], f: 44 }, { t: SC.singh.start, p: [-0.3, 1.25, 3.3], l: [-0.3, 0.95, 0.5], f: 44 }]);
      v.rotation.y = 0.25 * Math.sin(t * 0.4);
      const qk = win(t, C.sens + 0.6, SC.singh.start, 0.3, 0.3); beamOn(rig, qk, t);
      qs.forEach((l, i) => { fade(l, qk * sstep(C.sens + 0.8 + i * 1.0, C.sens + 1.1 + i * 1.0, t)); l.lookAt(cam.position); });
      rig.c.update(t, env('claude', t), {});
      K.update(t);
    }
  };
};

// ---------- Singh : le rapport taille-hanches
SETS.singh = () => {
  const B = holoStudio(); const { scene, cam } = B;
  const cs = [0x7dd8ff, 0x7dd8ff, 0xffb070];
  const figs = [0.2, 0.6, 1.1].map((k, i) => { const h = holoWoman(cs[i], k, 0.1); h.place(-0.75 + i * 0.75, 0, 0, 0); scene.add(h.root); return h; });
  const labs = ['0,9', '0,8', '0,7'].map((s, i) => { const l = label(s, { w: 0.4, h: 0.16, color: i === 2 ? '#ffd070' : '#9adfff', font: 'bold 110px Inter' }); l.position.set(-0.75 + i * 0.75, 2.0, 0); scene.add(l); return l; });
  const ringW = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.008, 4, 24), G(0xffd070, 1.8)); ringW.rotation.x = Math.PI / 2; ringW.position.set(0.75, 1.15, 0); scene.add(ringW);
  const ringH = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.008, 4, 24), G(0xff8a6a, 1.8)); ringH.rotation.x = Math.PI / 2; ringH.position.set(0.75, 0.86, -0.03); scene.add(ringH);
  const lt = label('taille', { w: 0.4, h: 0.1, color: '#ffd070', font: 'bold 80px Inter' }); lt.position.set(1.15, 1.15, 0); scene.add(lt);
  const lh = label('hanches', { w: 0.45, h: 0.1, color: '#ff9a7a', font: 'bold 80px Inter' }); lh.position.set(1.2, 0.86, 0); scene.add(lh);
  const rig = claudeRig(scene, [-0.9, 0, 1.3], 0.4, [0.45, 0, 0], 0x55e6ff, 0.4, 0.25); rig.pr.visible = false;
  const K = cardsMgr(scene, cam);
  K('DEVENDRA SINGH · années 1990\ndes silhouettes notées par des hommes', { w: 1.6, h: 0.42, border: '#e0b070', small: true }, t => win(t, SC.singh.start + 2.0, C.ratio, 0.3, 0.2));
  K('TOUR DE TAILLE ÷ TOUR DE HANCHES\n≈ 0,7 souvent préféré', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.ratio + 3.0, C.pourquoi, 0.3, 0.2));
  K('HYPOTHÈSE\nsignal de santé et de fertilité · débattu', { w: 1.6, h: 0.42, border: '#ff9a7a', small: true }, t => win(t, C.pourquoi + 1.5, SC.dos.start, 0.3, 0.2));
  return {
    ...B, update(t) {
      const T0 = SC.singh.start;
      camKeys(cam, t, [{ t: T0, p: [0.0, 1.4, 3.6], l: [0, 1.05, 0], f: 46 }, { t: C.ratio, p: [0.3, 1.3, 3.0], l: [0.3, 1.0, 0], f: 44 }, { t: C.ratio + 2.5, p: [0.85, 1.15, 2.6], l: [0.8, 1.0, 0], f: 42 }, { t: C.pourquoi, p: [0.8, 1.15, 2.7], l: [0.8, 1.0, 0], f: 42 }, { t: C.pourquoi + 1.0, p: [0.0, 1.4, 3.6], l: [0, 1.05, 0], f: 46 }, { t: SC.dos.start, p: [0.0, 1.4, 3.5], l: [0, 1.05, 0], f: 46 }]);
      figs.forEach((h, i) => { h.pose({ aL: [0.1, 0.25], aR: [0.1, 0.25] }); h.root.rotation.y = 0.3 * Math.sin(t * 0.5 + i); fade(h.root, sstep(T0 + 0.5 + i * 0.6, T0 + 1.0 + i * 0.6, t)); });
      labs.forEach((l, i) => { fade(l, sstep(T0 + 2 + i * 0.5, T0 + 2.4 + i * 0.5, t)); l.lookAt(cam.position); l.scale.setScalar(i === 2 ? 1 + 0.2 * sstep(C.ratio + 2, C.ratio + 2.5, t) : 1); });
      const rk = win(t, C.ratio + 1.0, C.pourquoi + 0.6, 0.4, 0.4); fade(ringW, rk); fade(ringH, rk); fade(lt, rk); fade(lh, rk); lt.lookAt(cam.position); lh.lookAt(cam.position);
      rig.c.update(t, env('claude', t), {});
      K.update(t);
    }
  };
};

// ---------- la courbure du dos (2015)
SETS.dos = () => {
  const B = holoStudio(); const { scene, cam } = B;
  const h = holoWoman(0xffb070, 1.0, 0.1); h.place(-0.15, 0, 0, Math.PI / 2); scene.add(h.root);
  const pts = []; for (let i = 0; i <= 20; i++) { const a = i / 20; pts.push(new THREE.Vector3(-0.15 - 0.12 - 0.08 * Math.sin(a * Math.PI), 0.75 + a * 0.55, 0.0)); }
  // arc lombaire (vu de cote)
  const arcPts = []; for (let i = 0; i <= 20; i++) { const a = i / 20; arcPts.push(new THREE.Vector3(-0.15 - 0.2 + 0.07 * Math.sin(a * Math.PI), 0.82 + a * 0.5, 0.3)); }
  const arc = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arcPts), 40, 0.012, 5), G(0xffd070, 1.8)); scene.add(arc);
  const ang = label('≈ 45°', { w: 0.5, h: 0.2, color: '#ffd070', font: 'bold 150px Inter' }); ang.position.set(-0.75, 1.1, 0.3); scene.add(ang);
  const preg = holoWoman(0x7dffb0, 0.8, 0.1); preg.place(0.75, 0, 0, Math.PI / 2); scene.add(preg.root);
  const belly = holo(new THREE.IcosahedronGeometry(0.17, 1), 0x7dffb0, 0.2); belly.position.set(0.14, 0.12, 0); preg.pelvis.add(belly);
  const axis = new THREE.Mesh(new THREE.BoxGeometry(0.012, 1.8, 0.012), G(0xffffff, 1.4)); axis.position.set(0.75, 0.9, 0.25); scene.add(axis);
  const rig = claudeRig(scene, [-1.0, 0, 1.3], 0.45, [0.45, 0, 0], 0x55e6ff, 0.4, 0.25); rig.pr.visible = false;
  const K = cardsMgr(scene, cam);
  K('2015 · Université du Texas\ncourbure du bas du dos ≈ 45°', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.dos.start + 2.0, C.enceinte, 0.3, 0.2));
  K('HYPOTHÈSE\naider l\'équilibre pendant la grossesse', { w: 1.6, h: 0.42, border: '#7dffb0', small: true }, t => win(t, C.enceinte + 1.5, SC.regard.start, 0.3, 0.2));
  return {
    ...B, update(t) {
      const T0 = SC.dos.start;
      camKeys(cam, t, [{ t: T0, p: [-0.15, 1.1, 3.4], l: [-0.15, 0.95, 0], f: 44 }, { t: C.enceinte - 0.5, p: [-0.3, 1.1, 3.0], l: [-0.3, 0.95, 0], f: 44 }, { t: C.enceinte + 0.5, p: [0.3, 1.2, 3.9], l: [0.3, 0.95, 0], f: 46 }, { t: SC.regard.start, p: [0.3, 1.2, 3.8], l: [0.3, 0.95, 0], f: 46 }]);
      h.pose({ aL: [0.1, 0.2], aR: [0.1, 0.2] }); fade(h.root, sstep(T0, T0 + 0.6, t));
      fade(arc, win(t, T0 + 2.5, C.enceinte + 2, 0.5, 0.4)); fade(ang, win(t, T0 + 3.5, C.enceinte + 2, 0.4, 0.4)); ang.lookAt(cam.position);
      const pk = sstep(C.enceinte - 0.2, C.enceinte + 0.5, t); fade(preg.root, pk); fade(axis, pk * (0.6 + 0.4 * Math.sin(t * 3)));
      preg.pose({ aL: [0.1, 0.2], aR: [0.4, 0.2], eR: 0.8, lean: -0.08 * Math.sin(t * 1.2) });
      rig.c.update(t, env('claude', t), {});
      K.update(t);
    }
  };
};

// ---------- le regard (suivi oculaire)
SETS.regard = () => {
  const B = base({ bg: 0x2a2a34, hemi: [0xf0f4ff, 0x3a3a44, 1.0], sun: [0xffffff, 1.2, [2, 5, 4]], shadowSize: 4, bloom: [0.35, 0.5, 0.9], exposure: 1.1, target: [0, 0.8, 0] });
  const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 8, M(0x5a5a64)), 0, -0.05, 0)); scene.add(at(box(8, 4, 0.2, M(0x7a8090)), 0, 2, -2));
  scene.add(at(box(1.2, 0.05, 0.6, M(0xe8e8ee)), 0, 0.75, 0)); scene.add(at(box(0.05, 0.75, 0.05, M(0x3a3a3a)), 0, 0.37, 0));
  scene.add(at(box(0.9, 0.56, 0.04, M(0x1a1a20)), 0, 1.15, -0.2));
  const sc = document.createElement('canvas'); sc.width = 512; sc.height = 320; const g = sc.getContext('2d');
  g.fillStyle = '#e8eef4'; g.fillRect(0, 0, 512, 320); g.fillStyle = '#c86a5a';
  g.beginPath(); g.ellipse(256, 60, 26, 30, 0, 0, 7); g.fillStyle = '#d8a878'; g.fill();
  g.fillStyle = '#5a7aaa'; g.beginPath(); g.moveTo(206, 95); g.lineTo(306, 95); g.lineTo(290, 170); g.quadraticCurveTo(335, 215, 320, 300); g.lineTo(192, 300); g.quadraticCurveTo(177, 215, 222, 170); g.closePath(); g.fill();
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.5), new THREE.MeshBasicMaterial({ map: canvasTex(sc), toneMapped: false, color: new THREE.Color(0.85, 0.85, 0.85) })); scr.position.set(0, 1.15, -0.175); scene.add(scr);
  const dots = [[0, 0.52, 0], [0.02, 0.45, 0], [-0.02, 0.05, 0], [0.01, 0.0, 0], [0.0, -0.05, 0], [0.0, 0.32, 0], [-0.03, 0.4, 0]].map(([x, y], i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.025, 12), new THREE.MeshBasicMaterial({ color: 0xff3a2a, transparent: true, opacity: 0.75, depthWrite: false })); d.position.set(x, 1.15 + (y - 0.25) * 0.8, -0.17); scene.add(d); return d; });
  const tracker = at(box(0.3, 0.025, 0.04, M(0x2a2a2a)), 0, 0.8, 0.05); scene.add(tracker); scene.add(at(box(0.04, 0.012, 0.01, G(0xff3a3a, 1.5)), 0, 0.8, 0.072));
  const guy = new Human({ skin: 0xe0b890, hair: 0xd8b060, hairStyle: 'short', top: 0xc04a4a, bottom: 0x2a2a3a, seed: 2304 }); guy.place(0.0, 0, 0.75, Math.PI); scene.add(guy.root);
  scene.add(at(box(0.42, 0.05, 0.42, M(0x2a2a3a)), 0, 0.45, 0.75));
  faceLight(scene, [0.0, 1.5, -0.1], 2.0);
  const rig = claudeRig(scene, [-0.8, 0.78, 0.15], 0.5, [0, 0, 0], 0x55e6ff, 0.4, 0.25); rig.pr.visible = false; rig.c.g.scale.setScalar(0.5);
  const K = cardsMgr(scene, cam);
  K('suivi du regard (Dixson et coll., 2011)\npremiers coups d\'œil : taille et poitrine', { w: 1.6, h: 0.42, border: '#ff8a7a', small: true }, t => win(t, SC.regard.start + 2.5, C.cobaye - 0.3, 0.3, 0.2));
  imagined(K, 'personnage imaginé', C.cobaye - 0.2, SC.culture.start);
  return {
    ...B, update(t) {
      const T0 = SC.regard.start;
      camKeys(cam, t, [{ t: T0, p: [0.9, 1.5, 1.2], l: [0, 1.1, -0.2], f: 44 }, { t: T0 + 2.0, p: [0.35, 1.3, 1.0], l: [0, 1.15, -0.2], f: 40 }, { t: C.cobaye - 0.4, p: [0.3, 1.3, 0.95], l: [0, 1.15, -0.2], f: 40 }, { t: C.cobaye, p: [0.35, 1.5, -0.05], l: [0.0, 1.38, 0.75], f: 42 }, { t: C.reflexe + 0.3, p: [0.35, 1.5, -0.05], l: [0.0, 1.38, 0.75], f: 42 }, { t: C.reflexe + 1.0, p: [-0.3, 1.15, 1.2], l: [-0.7, 0.95, 0.15], f: 44 }, { t: SC.culture.start, p: [-0.3, 1.15, 1.15], l: [-0.7, 0.95, 0.15], f: 44 }]);
      dots.forEach((d, i) => { fade(d, sstep(T0 + 1.5 + i * 0.5, T0 + 1.7 + i * 0.5, t) * 0.8); });
      guy.pose(L.sitPose(0.46, { aL: [0.9, 0.1], aR: [0.9, 0.1], eL: 1.0, eR: 1.0, hy: t > C.cobaye - 0.3 ? 0.0 : 0, hp: 0.05 }));
      guy.face(env('cobaye', t), t > C.cobaye - 0.2 && t < C.reflexe ? 'joy' : 'neutral', t);
      rig.c.update(t, env('claude', t), { squint: t > C.reflexe && t < C.reflexe + 1.5 });
      K.update(t);
    }
  };
};

// ---------- cultures, puis la terrasse : « Mes yeux sont ici ! »
SETS.culture = () => {
  const B = holoStudio(); const { scene, cam } = B;
  const globe = holo(new THREE.IcosahedronGeometry(0.55, 1), 0x7dd8ff, 0.08); globe.position.set(0, 1.45, 0); scene.add(globe);
  const pin = new THREE.Mesh(new THREE.OctahedronGeometry(0.05), G(0xffd070, 2)); globe.add(pin); pin.position.set(-0.32, -0.12, 0.42);
  const pl = label('Matsigenka · Pérou', { w: 0.8, h: 0.13, color: '#ffd070', font: 'bold 84px Inter' }); pl.position.set(-0.1, 1.0, 0.6); scene.add(pl);
  const figs = [0.2, 0.7, 1.2].map((k, i) => { const h = holoWoman([0x9adfff, 0xffb070, 0xd8a0ff][i], k, 0.1); h.place(-0.8 + i * 0.8, 0, 0.2, 0); scene.add(h.root); return h; });
  const vals = ['la voix', 'l\'humour', 'la gentillesse'].map((s, i) => { const l = label(s, { w: 0.7, h: 0.14, color: ['#7dd8ff', '#ffd070', '#7dffb0'][i], font: 'bold 100px Inter' }); l.position.set(0, 1.9 - i * 0.22, 0.3); scene.add(l); return l; });
  const rig = claudeRig(scene, [-1.0, 0, 1.3], 0.45, [0.45, 0, 0], 0x55e6ff, 0.4, 0.25); rig.pr.visible = false;
  const K = cardsMgr(scene, cam);
  K('les goûts changent\nselon les cultures et les époques', { w: 1.6, h: 0.42, border: '#7dd8ff', small: true }, t => win(t, SC.culture.start + 1.5, C.respect, 0.3, 0.2));
  return {
    ...B, update(t) {
      const T0 = SC.culture.start, mid = T0 + 8.5;
      camKeys(cam, t, [{ t: T0, p: [0.0, 1.5, 3.4], l: [0, 1.3, 0], f: 46 }, { t: C.respect, p: [0.2, 1.4, 3.2], l: [0, 1.25, 0], f: 46 }]);
      fade(globe, win(t, T0, mid, 0.4, 0.4)); globe.rotation.y = 0.4 + t * 0.15; fade(pin, win(t, T0 + 2.5, mid, 0.3, 0.4)); fade(pl, win(t, T0 + 2.8, mid, 0.3, 0.4)); pl.lookAt(cam.position);
      figs.forEach((h, i) => { fade(h.root, win(t, mid - 0.2 + i * 0.4, C.respect, 0.4, 0.3)); h.pose({ aL: [0.1, 0.2], aR: [0.1, 0.2] }); h.root.rotation.y = 0.4 * Math.sin(t * 0.6 + i); });
      vals.forEach((l, i) => { fade(l, win(t, C.respect + 2.2 + i * 0.7, C.nadia, 0.3, 0.3)); l.lookAt(cam.position); });
      rig.c.update(t, env('claude', t), {});
      K.update(t);
    }
  };
};
SETS.cafe = () => {
  const B = base({ sky: [0x7ab8e8, 0xe8f0f8], hemi: [0xffffff, 0x6a6050, 1.1], sun: [0xfff0d8, 1.6, [4, 8, 5]], shadowSize: 6, bloom: [0.3, 0.5, 0.93], exposure: 1.05, target: [0, 0.8, 0] });
  const { scene, cam } = B; const { man, w1, w2, w3 } = cafeScene(B);
  w2.root.visible = false; w3.root.visible = false;
  faceLight(scene, [-0.3, 1.6, 0.9], 1.8);
  const K = cardsMgr(scene, cam);
  imagined(K, 'personnages imaginés', C.nadia - 0.2, SC.fin.start);
  return {
    ...B, update(t) {
      camKeys(cam, t, [{ t: C.nadia - 0.6, p: [-1.25, 1.5, 2.2], l: [-0.72, 1.22, -0.15], f: 44 }, { t: SC.fin.start, p: [-1.27, 1.5, 2.15], l: [-0.72, 1.22, -0.15], f: 44 }]);
      w1.place(-0.25, 0, 0.0, -1.2); w1.pose({ aL: [0.2, 0.15], aR: [0.15, 0.6, 0.0], eR: 1.9, hy: -0.15 }); w1.face(env('nadia', t), 'happy', t);
      man.pose(L.sitPose(0.46, { aL: [0.9, 0.1], aR: [1.0, 0.15, 0.3], eL: 1.2, eR: 2.0, hy: -0.4, hp: -0.15 })); man.face(0, t > C.nadia + 0.8 ? 'happy' : 'awe', t);
      K.update(t);
    }
  };
};

// ---------- fin
SETS.fin = () => {
  const B = holoStudio(); const { scene, cam } = B;
  const rig = claudeRig(scene, [0.0, 0, 1.0], 0.0, [0.45, 0, 0.0], 0x55e6ff, 0.45, 0.28);
  const heart = new THREE.Group(); rig.holoG.add(heart);
  for (const s of [-1, 1]) heart.add(at(holo(new THREE.IcosahedronGeometry(0.1, 1), 0xff7a8a, 0.25), s * 0.07, 0.05, 0));
  const tip = holo(new THREE.ConeGeometry(0.14, 0.2, 4), 0xff7a8a, 0.25); tip.rotation.z = Math.PI; tip.position.y = -0.08; heart.add(tip);
  const K = cardsMgr(scene, cam);
  K('un peu d\'évolution · beaucoup de culture\ndes hypothèses encore discutées', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.fin.start + 2.0, C.question, 0.3, 0.2));
  return {
    ...B, update(t) {
      camKeys(cam, t, [{ t: SC.fin.start, p: [0.2, 1.3, 3.3], l: [0.2, 0.9, 1.0], f: 44 }, { t: TL.duration, p: [0.2, 1.15, 2.7], l: [0.2, 0.8, 1.0], f: 44 }]);
      const hk = sstep(SC.fin.start + 0.5, SC.fin.start + 1.0, t); beamOn(rig, hk, t); fade(heart, hk); heart.rotation.y = t * 0.8; heart.scale.setScalar(1 + 0.08 * Math.sin(t * 6));
      rig.c.update(t, env('claude', t), { wave: sstep(TL.duration - 2.0, TL.duration - 1.5, t) });
      K.update(t);
    }
  };
};

// ---------- couverture : un homme de profil regarde deux femmes de dos
SETS.cover = () => {
  const B = base({ sky: [0x7ab8e8, 0xe8f0f8], hemi: [0xffffff, 0x6a6050, 1.15], sun: [0xfff0d8, 1.6, [2, 8, 6]], shadowSize: 6, bloom: [0.3, 0.5, 0.93], exposure: 1.05, target: [0, 0.8, 0] });
  const { scene, cam } = B; const { man, w1, w2, w3 } = cafeScene(B);
  faceLight(scene, [-1.0, 1.5, 0.6], 1.6);
  return {
    ...B, update(t) {
      w1.place(-0.4, 0, 0.55, Math.PI + 0.05); w2.place(0.03, 0, 0.75, Math.PI); w3.place(0.5, 0, 0.6, Math.PI - 0.05);
      w1.pose(L.walkPose(1.0, 0.8)); w2.pose(L.walkPose(2.4, 0.8)); w3.pose(L.walkPose(3.5, 0.8));
      man.pose(L.sitPose(0.46, { aL: [0.9, 0.1], aR: [0.5, 0.15], eL: 1.2, eR: 0.9, hy: -0.15, hp: 0.12 })); man.face(0, 'awe', t);
      cam.position.set(-0.32, 1.4, 4.4); cam.fov = 58; cam.updateProjectionMatrix(); cam.lookAt(-0.32, 0.75, 0.1);
    }
  };
};

const SHOTS = [
  ['intro', 0, SC.venus.start], ['venus', SC.venus.start, SC.singh.start], ['singh', SC.singh.start, SC.dos.start], ['dos', SC.dos.start, SC.regard.start],
  ['regard', SC.regard.start, SC.culture.start], ['culture', SC.culture.start, C.nadia - 0.6], ['cafe', C.nadia - 0.6, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9],
];
