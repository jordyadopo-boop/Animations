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
const beam = L.beam;
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
function bubble(color = 0xffffff, r = 0.32) {
  const g = new THREE.Group();
  const disk = new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshBasicMaterial({ color: 0x0a0c16, transparent: true, opacity: 0.75, depthWrite: false }));
  const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.025, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.8), transparent: true, depthWrite: false }));
  g.add(disk, ring);
  for (const [x, y, rr] of [[-0.12, -r - 0.1, 0.05], [-0.2, -r - 0.22, 0.03]]) g.add(at(new THREE.Mesh(new THREE.CircleGeometry(rr, 16), ring.material), x, y, 0));
  const inner = new THREE.Group(); inner.position.z = 0.02; g.add(inner); g.userData.inner = inner;
  return g;
}
function cardsMgr(scene, cam) {
  const cards = [];
  const K = (text, o, show, yf = -0.55, frac = 0.82) => { const c = card(text, o); scene.add(c); cards.push([c, show, yf, frac]); return c; };
  K.update = (t) => cards.forEach(([c, show, yf, frac]) => { fade(c, show(t)); camCard(cam, c, frac, yf); });
  return K;
}
function studioBase(o = {}) {
  const B = base({ bg: 0x05070f, fog: [0x05070f, 8, 30], hemi: [0x8a9ac8, 0x14141c, 1.0], sun: [0xffffff, 1.0, [2, 5, 4]], shadow: false, bloom: [0.5, 0.5, 0.82], ...o });
  const grid = new THREE.GridHelper(40, 40, new THREE.Color(0x3a8aff).multiplyScalar(1.3), new THREE.Color(0x3a8aff).multiplyScalar(0.4)); B.scene.add(grid);
  return B;
}
// reseau de neurones : noeuds + liaisons ; un chemin 'path' s'epaissit
function neuronNet(n = 26, R = 1.6, seed = 3) {
  const g = new THREE.Group(); const nodes = [];
  for (let i = 0; i < n; i++) {
    const p = new THREE.Vector3((hash(seed + i) - 0.5) * 2 * R, (hash(seed + i * 3) - 0.5) * 2 * R * 1.2, (hash(seed + i * 7) - 0.5) * R);
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 1), G(0x9ad0ff, 0.9)); m.position.copy(p); g.add(m); nodes.push(m);
    for (let k = 0; k < 4; k++) { const d = p.clone().add(new THREE.Vector3((hash(i * 11 + k) - 0.5) * 0.4, (hash(i * 13 + k) - 0.5) * 0.4, (hash(i * 17 + k) - 0.5) * 0.3)); g.add(beam(p.toArray(), d.toArray(), 0.008, holoMat(0x55a8ff, 0.4))); }
  }
  const links = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (nodes[i].position.distanceTo(nodes[j].position) < R * 0.75 && hash(i * 31 + j) < 0.5) { const b = beam(nodes[i].position.toArray(), nodes[j].position.toArray(), 0.012, holoMat(0x55a8ff, 0.3)); g.add(b); links.push([i, j, b]); }
  // chemin principal
  const order = nodes.map((m, i) => [m.position.x, i]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const path = [order[0], order[Math.floor(n * 0.25)], order[Math.floor(n * 0.5)], order[Math.floor(n * 0.75)], order[n - 1]];
  const pathBeams = []; for (let k = 0; k < path.length - 1; k++) { const b = beam(nodes[path[k]].position.toArray(), nodes[path[k + 1]].position.toArray(), 0.03, G(0xffb040, 1.0)); g.add(b); pathBeams.push(b); }
  const spark = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 1), G(0xffffff, 3)); g.add(spark);
  g.userData = { nodes, links, path, pathBeams, spark };
  g.userData.update = (t, thick = 1, speed = 1) => {
    pathBeams.forEach(b => b.scale.set(thick, thick, 1));
    const u = (t * 0.6 * speed) % 1 * (path.length - 1), k = Math.floor(u), f = u - k;
    spark.position.lerpVectors(nodes[path[k]].position, nodes[path[k + 1]].position, f);
    nodes.forEach((m, i) => m.scale.setScalar(path.includes(i) ? 1.3 + 0.3 * Math.sin(t * 6 + i) : 1));
  };
  return g;
}

// ---------- intro : la phrase repetee
SETS.intro = () => {
  const B = studioBase(); const { scene, cam } = B;
  const echoes = []; for (let i = 0; i < 6; i++) { const l = label('LA MURAILLE SE VOIT DE L\'ESPACE', { w: 1.7, h: 0.2, color: '#ffd070', font: 'bold 50px Inter' }); scene.add(l); echoes.push(l); }
  const stamp = card('FAUX', { w: 0.9, h: 0.34, border: '#ff4a4a', color: '#ff6a5a', bg: 'rgba(30,6,6,0.85)' }); scene.add(stamp);
  const rig = claudeRig(scene, [-0.6, 0, 1.4], 0.3, [0.45, 0, 0], 0x55e6ff, 0.5, 0.3); rig.pr.visible = false;
  return {
    ...B, update(t) {
      echoes.forEach((l, i) => { const k = sstep(0.3 + i * 0.35, 0.7 + i * 0.35, t); l.position.set(0.1, 2.6 - i * 0.28, -i * 0.3); fade(l, k * (1 - i * 0.12)); l.scale.setScalar(1 - i * 0.06); });
      fade(stamp, win(t, C.false - 0.1, C.title, 0.15, 0.3)); camCard(cam, stamp, 0.45, 0.25); stamp.rotation.z = -0.15;
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [0.1, 2.2, 4.4], l: [0.1, 2.0, 0], f: 46 }, { t: C.title, p: [0.0, 1.8, 4.8], l: [0, 1.5, 0], f: 46 }, { t: SC.labo.start, p: [-0.4, 1.6, 5.0], l: [0, 1.2, 0], f: 46 }]);
    }
  };
};

// ---------- le labo de 1977
SETS.labo = () => {
  const B = base({ bg: 0x2a2620, hemi: [0xfff0d8, 0x3a3020, 1.0], sun: [0xfff0d8, 1.4, [3, 6, 3]], shadowSize: 5, bloom: [0.4, 0.5, 0.86], exposure: 1.2 });
  const { scene, cam } = B;
  scene.add(at(box(10, 0.1, 8, M(0x7a6a50)), 0, -0.05, 0)); scene.add(at(box(10, 4, 0.2, M(0xc8b890)), 0, 2, -2)); scene.add(at(box(2.4, 1.0, 0.05, M(0x2a3a2a)), 0, 2.2, -1.88));
  scene.add(at(box(1.6, 0.06, 0.8, M(0x8a5a3a)), 0, 0.75, -0.3)); for (const [x, z] of [[-0.7, -0.6], [0.7, -0.6], [-0.7, 0.0], [0.7, 0.0]]) scene.add(at(box(0.05, 0.75, 0.05, M(0x3a3a3a)), x, 0.37, z));
  scene.add(at(box(0.45, 0.05, 0.42, M(0x3a2a20)), 0, 0.45, 0.35));
  const stu = new Human({ skin: 0xc68a5a, hair: 0x2a1a10, hairStyle: 'curly', top: 0xd88a3a, bottom: 0x4a3a6a, seed: 2001 }); stu.place(0, 0, 0.35, Math.PI); scene.add(stu.root);
  const cards = []; for (let i = 0; i < 6; i++) { const c = card(['La Lune est en fromage ?', 'L\'eau bout à 100 °C', 'Les chats ont 9 vies', 'Le Soleil est une étoile', 'On voit la Muraille de l\'espace', 'Le cœur a 4 cavités'][i] + '\nVRAI ☐   FAUX ☐', { w: 0.7, h: 0.28, bg: 'rgba(245,240,225,0.97)', border: '#5a5a5a', color: '#1a1a1a', subColor: '#3a3a3a', small: true }); c.material.depthTest = true; c.renderOrder = 0; scene.add(c); cards.push(c); }
  const rig = claudeRig(scene, [1.2, 0.78, -0.4], -0.5, [0.0, 0, 0.0], 0x55e6ff, 0.4, 0.25); rig.pr.visible = false; rig.c.g.scale.setScalar(0.4);
  const K = cardsMgr(scene, cam);
  K('1977 · Hasher, Goldstein, Toppino\nrépété = jugé plus vrai', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.labo.start + 3, C.effet, 0.3, 0.2));
  K('EFFET DE VÉRITÉ ILLUSOIRE\n2015 : même quand on sait', { w: 1.6, h: 0.42, border: '#55e6ff', small: true }, t => win(t, C.effet + 0.5, C.facile, 0.3, 0.2));
  K('familier → facile → « vrai »', { w: 1.6, h: 0.3, border: '#ff9a5a' }, t => win(t, C.facile + 2.5, SC.neurones.start, 0.3, 0.2));
  return {
    ...B, update(t) {
      const T0 = SC.labo.start;
      cards.forEach((c, i) => { const row = Math.floor(i / 3), col = i % 3; c.position.set(-0.55 + col * 0.55, 2.0 + row * 0.38 - 0.35, -1.5); const rep = i % 2 === 0; c.scale.setScalar(rep ? 1 + 0.1 * win(t, C.effet - 6, C.effet, 0.5, 0.5) : 1); c.material.color.setScalar(rep && t > C.effet - 6 ? 1.0 : 0.82); });
      stu.pose(sitPose(0.47, { aL: [0.9, 0.15], aR: [1.0 + 0.15 * Math.sin(t * 3), 0.2], eL: 1.0, eR: 0.9, hp: 0.2 })); stu.root.position.y = 0; stu.face(0, 'neutral', t);
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [1.2, 1.9, 2.8], l: [0, 1.4, -0.8], f: 46 }, { t: C.effet, p: [-0.6, 1.8, 2.4], l: [0, 1.6, -1.2], f: 46 }, { t: C.facile, p: [1.3, 1.6, -1.3], l: [0, 1.25, 0.35], f: 46 }, { t: SC.neurones.start, p: [1.4, 1.7, -1.2], l: [0, 1.3, 0.35], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- dans les neurones
SETS.neurones = () => {
  const B = studioBase({ bloom: [0.5, 0.5, 0.8] }); const { scene, cam } = B;
  const net = neuronNet(30, 1.6, 7); net.position.set(0.15, 1.8, 0); scene.add(net);
  const rig = claudeRig(scene, [-0.9, 0, 1.6], 0.35, [0.6, 0, -0.2], 0x55e6ff, 0.5, 0.3); rig.pr.visible = false;
  const K = cardsMgr(scene, cam);
  K('≈ 86 MILLIARDS DE NEURONES\nreliés par des synapses', { w: 1.6, h: 0.42, border: '#9ad0ff', small: true }, t => win(t, SC.neurones.start + 2.5, C.hebb, 0.3, 0.2));
  K('DONALD HEBB · 1949\nactivés ensemble → connexion renforcée', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.hebb + 1.5, C.chemin, 0.3, 0.2));
  K('vraie ou fausse,\nune pensée répétée devient un chemin rapide', { w: 1.6, h: 0.42, border: '#ff9a5a', small: true }, t => win(t, C.chemin + 4.0, SC.sami.start, 0.3, 0.2));
  return {
    ...B, update(t) {
      const thick = 1 + 3 * sstep(C.hebb + 2, C.chemin + 3, t);
      net.userData.update(t, thick, 1 + 1.5 * sstep(C.chemin, C.chemin + 4, t)); net.rotation.y = 0.25 * Math.sin(t * 0.3);
      rig.c.update(t, env('claude', t), {});
      const T0 = SC.neurones.start;
      camKeys(cam, t, [{ t: T0, p: [0.15, 1.9, 5.0], l: [0.15, 1.8, 0], f: 46 }, { t: C.hebb, p: [0.6, 2.0, 3.6], l: [0.15, 1.8, 0], f: 44 }, { t: SC.sami.start, p: [-0.4, 1.9, 3.2], l: [0.15, 1.8, 0], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- Sami
SETS.sami = () => {
  const B = base({ bg: 0x2a2a3a, hemi: [0xd8e0ff, 0x2a2a3a, 1.0], sun: [0xfff0d8, 1.3, [-2, 5, 3]], shadowSize: 5, bloom: [0.45, 0.5, 0.85], exposure: 1.25 });
  const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 6, M(0x6a5a5a)), 0, -0.05, 0)); scene.add(at(box(8, 3.5, 0.2, M(0x7a8aaa)), 0, 1.75, -1.6));
  scene.add(at(box(1.4, 0.06, 0.7, M(0x8a6a4a)), 0, 0.75, 0.6)); for (const [x, z] of [[-0.6, 0.85], [0.6, 0.85], [-0.6, 0.35], [0.6, 0.35]]) scene.add(at(box(0.05, 0.75, 0.05, M(0x3a3a3a)), x, 0.37, z));
  scene.add(at(box(0.3, 0.01, 0.4, M(0xf8f8f0)), 0, 0.79, 0.45)); scene.add(at(box(0.45, 0.05, 0.42, M(0x3a2a20)), 0, 0.45, 0.0));
  const sami = new Human({ skin: 0x8a5a3a, hair: 0x101010, hairStyle: 'short', top: 0x3a8a6a, bottom: 0x2a2a3a, seed: 2010 }); sami.place(0, 0, 0.0, 0); scene.add(sami.root);
  const bub = bubble(0x8a8a9a, 0.26); scene.add(bub);
  const txt = label('Je suis nul', { w: 0.6, h: 0.16, color: '#b0b0c0', font: 'bold 110px Inter' }); bub.userData.inner.add(txt);
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.1), G(0xffe070, 2.4)); scene.add(star);
  const ok = label('exercice réussi ✓', { w: 0.7, h: 0.14, color: '#7dffb0', font: 'bold 100px Inter' }); scene.add(ok);
  const K = cardsMgr(scene, cam);
  K('2009 · Wood, Perunovic, Lee\nles phrases positives peuvent se retourner', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.etude + 4, C.verifier, 0.3, 0.2));
  K('remarquer la pensée · la vérifier', { w: 1.6, h: 0.3, border: '#7dffb0' }, t => win(t, C.verifier + 1, SC.apprendre.start, 0.3, 0.2));
  K('personnage imaginé', { w: 0.9, h: 0.2, border: '#ffd070', color: '#ffe0a0' }, t => win(t, SC.sami.start, C.soi, 0.2, 0.2), -0.45, 0.42);
  return {
    ...B, update(t) {
      const fix = sstep(C.verifier + 3.5, C.verifier + 4.5, t);
      sami.pose(sitPose(0.47, { aL: [0.9, 0.15], aR: [1.0, 0.2], eL: 1.2, eR: 1.0, hp: 0.35 * (1 - fix) - 0.1 * fix })); sami.root.position.y = 0; sami.face(env('sami', t), fix > 0.5 ? 'happy' : 'sad', t);
      bub.position.set(0.35, 1.95, 0.0); bub.lookAt(cam.position);
      const echo = 1 + 0.08 * Math.sin(t * 5) * (1 - fix); txt.scale.setScalar(echo);
      fade(bub, (1 - fix) * sstep(SC.sami.start + 0.3, SC.sami.start + 0.8, t)); bub.rotation.z += 0.3 * fix;
      star.position.set(0.35, 1.95, 0); star.rotation.y = t * 2; fade(star, fix); star.scale.setScalar(fix);
      ok.position.set(0.35, 1.7, 0.05); ok.lookAt(cam.position); fade(ok, fix);
      const T0 = SC.sami.start;
      camKeys(cam, t, [{ t: T0, p: [0.6, 1.55, 2.3], l: [0.1, 1.35, 0], f: 46 }, { t: C.etude, p: [1.2, 1.8, 2.8], l: [0.1, 1.3, 0], f: 48 }, { t: C.verifier, p: [0.5, 1.6, 2.2], l: [0.15, 1.5, 0], f: 46 }, { t: SC.apprendre.start, p: [0.4, 1.7, 2.4], l: [0.2, 1.5, 0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- apprendre : taxis de Londres, jonglage
SETS.apprendre = () => {
  const B = studioBase(); const { scene, cam } = B;
  const map = new THREE.Group(); map.position.set(0.15, 0.6, 0); scene.add(map);
  for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) if (hash(i * 7 + j) < 0.75) { const h = 0.1 + hash(i * 13 + j) * 0.35; const b = holo(new THREE.BoxGeometry(0.22, h, 0.22), 0x55e6ff, 0.12); b.position.set((i - 3) * 0.3, h / 2, (j - 3) * 0.3); map.add(b); }
  const taxi = box(0.12, 0.08, 0.2, M(0x1a1a1a, { emissive: new THREE.Color(0x111111) })); taxi.add(at(box(0.04, 0.02, 0.04, G(0xffd070, 2)), 0, 0.05, 0)); map.add(taxi);
  const br = makeBrain(0x55e6ff, { holo: true }); br.scale.setScalar(1.0); br.position.set(0.15, 2.2, 0); scene.add(br);
  const hippo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), G(0xffd070, 2.2)); hippo.scale.set(1, 0.6, 1.8); hippo.position.set(0.15 + 0.2, 2.05, -0.1); scene.add(hippo);
  const lea = new Human({ skin: 0xf0d0b0, hair: 0xc89a5a, hairStyle: 'long', top: 0xc04a6a, bottom: 0x2a3a5a, seed: 2020 }); lea.place(0.15, 0, 0.2, 0); scene.add(lea.root);
  const balls = [0xff6a5a, 0x7dffb0, 0x55c8ff].map(c => { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 1), G(c, 1.6)); scene.add(b); return b; });
  const rig = claudeRig(scene, [-1.0, 0, 1.4], 0.4, [0.45, 0, 0], 0x55e6ff, 0.5, 0.3); rig.pr.visible = false;
  const K = cardsMgr(scene, cam);
  K('LONDRES · 2000\nchauffeurs de taxi : mémoire de l\'espace', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.taxi + 1.0, C.lea, 0.3, 0.2));
  K('2004 · 3 mois de jonglage\nle cerveau change… puis recule si on arrête', { w: 1.6, h: 0.42, border: '#ff9a5a', small: true }, t => win(t, C.jongle + 1.5, C.muscle, 0.3, 0.2));
  K('le cerveau se garde en forme\nen apprenant', { w: 1.6, h: 0.42, border: '#7dffb0', small: true }, t => win(t, C.muscle + 0.5, SC.mythe.start, 0.3, 0.2));
  K('personnage imaginé', { w: 0.9, h: 0.2, border: '#ffd070', color: '#ffe0a0' }, t => win(t, C.lea, C.jongle + 1.2, 0.2, 0.2), -0.45, 0.42);
  return {
    ...B, update(t) {
      const mk = win(t, SC.apprendre.start + 0.3, C.lea - 0.2, 0.4, 0.4); fade(map, mk); fade(br, win(t, C.taxi + 3, C.lea - 0.2, 0.4, 0.3)); fade(hippo, win(t, C.taxi + 5, C.lea - 0.2, 0.4, 0.3) * (0.7 + 0.3 * Math.sin(t * 5)));
      const u = (t * 0.25) % 1, seg = Math.floor(u * 4), f = (u * 4) % 1; const pts = [[-0.9, -0.9], [0.9, -0.9], [0.9, 0.9], [-0.9, 0.9], [-0.9, -0.9]]; taxi.position.set(lerp(pts[seg][0], pts[seg + 1][0], f), 0.04, lerp(pts[seg][1], pts[seg + 1][1], f)); taxi.rotation.y = [Math.PI / 2, 0, -Math.PI / 2, Math.PI][seg];
      const lk = win(t, C.lea - 0.3, C.muscle + 1.5, 0.3, 0.4); lea.root.visible = lk > 0.02;
      lea.pose({ aL: [1.0 + 0.3 * Math.sin(t * 7), 0.25], aR: [1.0 + 0.3 * Math.sin(t * 7 + Math.PI), 0.25], eL: 0.9, eR: 0.9, hp: -0.25 }); lea.face(env('lea', t), 'happy', t);
      balls.forEach((b, i) => { const ph = (t * 1.6 + i / 3) % 1; const x = ph < 0.5 ? lerp(-0.18, 0.18, ph * 2) : lerp(0.18, -0.18, (ph - 0.5) * 2); b.position.set(0.15 + x * 1.6, 1.0 + Math.sin(ph * Math.PI) * 0.45, 0.5); b.visible = lea.root.visible; });
      rig.c.update(t, env('claude', t), {});
      const T0 = SC.apprendre.start;
      camKeys(cam, t, [{ t: T0, p: [0.15, 2.6, 3.4], l: [0.15, 0.9, 0], f: 46 }, { t: C.taxi + 3, p: [0.15, 2.4, 3.6], l: [0.15, 1.6, 0], f: 46 }, { t: C.lea - 0.3, p: [0.4, 1.5, 2.8], l: [0.15, 1.3, 0.2], f: 44 }, { t: C.muscle + 1.5, p: [0.2, 1.6, 3.2], l: [0.15, 1.3, 0.2], f: 46 }, { t: SC.mythe.start, p: [-0.4, 1.7, 3.8], l: [0, 1.2, 0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- le mythe des 10 %
SETS.mythe = () => {
  const B = studioBase({ bloom: [0.7, 0.6, 0.65] }); const { scene, cam } = B;
  const br = makeBrain(0x55e6ff, { holo: true }); br.scale.setScalar(1.4); br.position.set(0.15, 1.8, 0); scene.add(br);
  const spots = []; for (let i = 0; i < 40; i++) { const a = hash(i) * Math.PI * 2, b = (hash(i * 3) - 0.5) * 1.4; const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 0), G([0xffd070, 0xff8a5a, 0x7dffb0, 0xb08aff][i % 4], 2.2)); s.position.set(0.15 + Math.cos(a) * 0.42 * Math.cos(b), 1.85 + Math.sin(b) * 0.35, Math.sin(a) * 0.55 * Math.cos(b)); scene.add(s); spots.push(s); }
  const gauge = label('10 %', { w: 0.8, h: 0.3, color: '#ff6a5a', font: 'bold 200px Inter' }); gauge.position.set(0.15, 2.75, 0.4); scene.add(gauge);
  const stamp = card('MYTHE', { w: 1.0, h: 0.36, border: '#ff4a4a', color: '#ff6a5a', bg: 'rgba(30,6,6,0.85)' }); scene.add(stamp);
  const rig = claudeRig(scene, [-0.9, 0, 1.6], 0.35, [0.6, 0, -0.2], 0x55e6ff, 0.5, 0.3); rig.pr.visible = false;
  const K = cardsMgr(scene, cam);
  K('au fil d\'une journée,\npresque toutes les zones travaillent', { w: 1.6, h: 0.42, border: '#7dffb0', small: true }, t => win(t, C.imagerie + 1, C.epilepsie, 0.3, 0.2));
  K('tout en même temps ?\nplutôt une crise d\'épilepsie', { w: 1.6, h: 0.42, border: '#ff9a5a', small: true }, t => win(t, C.epilepsie + 1, C.james, 0.3, 0.2));
  K('WILLIAM JAMES\nparlait de « potentiel inutilisé »', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.james + 2, SC.fin.start, 0.3, 0.2));
  return {
    ...B, update(t) {
      const T0 = SC.mythe.start;
      fade(gauge, win(t, T0 + 0.5, C.imagerie, 0.3, 0.3) * (0.6 + 0.4 * Math.abs(Math.sin(t * 4))));
      fade(stamp, win(t, T0 + 4.0, C.imagerie + 0.5, 0.15, 0.3)); camCard(cam, stamp, 0.5, 0.1); stamp.rotation.z = -0.12;
      const flash = t > C.epilepsie + 2 && t < C.epilepsie + 3.2;
      spots.forEach((s, i) => { const on = t < C.imagerie ? (i < 4) : flash ? true : (Math.sin(t * 2 + i * 1.7) > 0.3); s.visible = on; s.scale.setScalar(flash ? 1.6 : 1); });
      br.rotation.y = 0.3 * Math.sin(t * 0.4);
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0.15, 2.1, 4.0], l: [0.15, 1.9, 0], f: 44 }, { t: C.james, p: [0.6, 1.9, 4.2], l: [0, 1.6, 0], f: 46 }, { t: SC.fin.start, p: [-0.2, 1.8, 4.6], l: [0, 1.4, 0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- fin
SETS.fin = () => {
  const B = studioBase({ bloom: [0.5, 0.5, 0.8] }); const { scene, cam } = B;
  const net = neuronNet(30, 1.8, 11); net.position.set(0.15, 2.0, -0.6); scene.add(net);
  const rig = claudeRig(scene, [0.0, 0, 1.2], 0.0, [0.45, 0, 0], 0x55e6ff, 0.5, 0.3); rig.pr.visible = false;
  const panel = card('À MOITIÉ VRAI', { w: 1.2, h: 0.3, border: '#ffd070', color: '#ffe070' }); scene.add(panel);
  const K = cardsMgr(scene, cam);
  K('répéter renforce · apprendre fait grandir', { w: 1.6, h: 0.3, border: '#7dffb0' }, t => win(t, SC.fin.start + 4, C.question, 0.3, 0.2));
  return {
    ...B, update(t) {
      net.userData.update(t, 2.5, 1.5); net.rotation.y = 0.2 * Math.sin(t * 0.3);
      rig.c.update(t, env('claude', t), { wave: sstep(C.question, C.question + 0.5, t) });
      fade(panel, win(t, SC.fin.start + 0.5, SC.fin.start + 4.2, 0.3, 0.3)); camCard(cam, panel, 0.6, 0.15);
      const T0 = SC.fin.start;
      camKeys(cam, t, [{ t: T0, p: [0.2, 1.9, 5.2], l: [0.1, 1.5, 0], f: 46 }, { t: C.question - 0.3, p: [0.4, 1.1, 3.2], l: [0.1, 0.8, 1.0], f: 44 }, { t: TL.duration, p: [0.3, 1.0, 2.8], l: [0.05, 0.7, 1.1], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- couverture
SETS.cover = () => {
  const B = studioBase({ bloom: [0.6, 0.5, 0.75] }); const { scene, cam } = B;
  const br = makeBrain(0x55c8ff, { holo: true }); br.scale.setScalar(1.6); br.position.set(0, 2.6, 0); br.rotation.y = -Math.PI / 2 + 0.3; scene.add(br);
  const net = neuronNet(22, 0.75, 5); net.position.set(0, 2.65, 0.1); scene.add(net);
  return { ...B, update(t) { net.userData.update(1.3, 3, 1); cam.position.set(0, 2.3, 4.2); cam.fov = 46; cam.updateProjectionMatrix(); cam.lookAt(0, 1.9, 0); } };
};

const SHOTS = [
  ['intro', 0, SC.labo.start], ['labo', SC.labo.start, SC.neurones.start], ['neurones', SC.neurones.start, SC.sami.start], ['sami', SC.sami.start, SC.apprendre.start],
  ['apprendre', SC.apprendre.start, SC.mythe.start], ['mythe', SC.mythe.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9],
];
