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

// ---------- le vrai tableau (domaine public)
const PAINT = await new THREE.TextureLoader().loadAsync('/assets/cri.jpg');
PAINT.colorSpace = THREE.SRGBColorSpace; PAINT.anisotropy = 8;
const PA = 1589 / 1280; // hauteur / largeur
function painting(w, o = {}) {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ map: PAINT, toneMapped: false, transparent: !!o.transparent, fog: false, color: new THREE.Color(o.tint ?? 0xffffff) });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, w * PA), mat); g.add(p);
  if (o.frame) { const fm = M(o.frame); const t = 0.05 * w; for (const [x, y, ww, hh] of [[0, w * PA / 2 + t / 2, w + 2 * t, t], [0, -w * PA / 2 - t / 2, w + 2 * t, t], [w / 2 + t / 2, 0, t, w * PA], [-w / 2 - t / 2, 0, t, w * PA]]) g.add(at(box(ww, hh, t * 0.8, fm), x, y, -t * 0.3)); }
  if (o.holo) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w * 1.04, w * PA * 1.03, 0.001)), new THREE.LineBasicMaterial({ color: new THREE.Color(o.holo).multiplyScalar(2.2), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(e); }
  g.userData.w = w; g.userData.h = w * PA; g.userData.mat = mat;
  return g;
}
// point de vue cadrant le detail (u,v) du tableau, hauteur visible = frac * hauteur du tableau
function pview(pg, u, v, frac, fov = 40, ox = 0, oy = 0) {
  const w = pg.userData.w, h = pg.userData.h;
  const lp = new THREE.Vector3((u - 0.5) * w, (0.5 - v) * h, 0); const d = frac * h / 2 / Math.tan(fov * Math.PI / 360);
  const P = pg.localToWorld(new THREE.Vector3(lp.x + ox, lp.y + oy, d)), Lk = pg.localToWorld(lp.clone());
  return { p: [P.x, P.y, P.z], l: [Lk.x, Lk.y, Lk.z], f: fov };
}

// ---------- quai de metro (intro + fin)
function metroSet(mode) {
  const B = base({ bg: 0x14161c, fog: [0x14161c, 10, 40], hemi: [0xc8d4e8, 0x2a2a30, 0.85], sun: [0xf0f4ff, 1.3, [2, 6, 4]], shadowSize: 8, bloom: [0.45, 0.5, 0.82], exposure: 1.25 });
  const { scene, cam } = B;
  scene.add(at(box(40, 0.1, 6, M(0x6a6a70)), 0, -0.05, 0));
  scene.add(at(box(40, 0.12, 0.35, G(0xd8c040, 0.7)), 0, 0.0, 2.9));
  scene.add(at(box(40, 1.2, 3, M(0x1a1a1e)), 0, -0.65, 4.6));
  for (const x of [-20, 20]) {}
  // mur de carreaux blancs
  scene.add(at(box(40, 5, 0.2, M(0xd8dcd8)), 0, 2.5, -2.6));
  for (let y = 0.3; y < 4.8; y += 0.3) scene.add(at(box(40, 0.02, 0.02, M(0x9aa0a0)), 0, y, -2.48));
  scene.add(at(box(40, 0.5, 0.05, M(0x2a5a9a)), 0, 1.5, -2.47));
  const sign = label('LUNDI · 7:52', { w: 1.6, h: 0.3, color: '#ffd070', font: 'bold 110px Inter' }); sign.position.set(-1.4, 2.6, -2.4); scene.add(sign);
  const sb = box(1.8, 0.4, 0.05, M(0x15181e)); sb.position.set(-1.4, 2.6, -2.46); scene.add(sb);
  for (let x = -12; x <= 12; x += 3) scene.add(at(box(1.6, 0.06, 0.25, G(0xf4f8ff, 1.5)), x, 4.2, 0));
  scene.add(at(box(40, 0.1, 7, M(0x2a2a30)), 0, 4.4, 0));
  // banc
  scene.add(at(box(1.8, 0.08, 0.45, M(0x8a5a3a)), 1.6, 0.45, -1.9)); for (const s of [-1, 1]) scene.add(at(box(0.06, 0.45, 0.4, M(0x333338)), 1.6 + s * 0.8, 0.22, -1.9));
  // voyageurs
  const ppl = [];
  const spots = [[-2.6, 0.2], [-1.9, -0.6], [-0.9, 0.5], [2.6, 0.3], [3.4, -0.8], [-3.6, -0.5], [4.4, 0.6], [1.2, -1.9]];
  spots.forEach(([x, z], i) => { const h = new Human({ ...looks(i), seed: 1600 + i }); h.place(x, 0, z, (hash(i) - 0.5) * 0.8); scene.add(h.root); ppl.push(h); });
  const lea = ppl[3];
  const rig = claudeRig(scene, [0.15, 0, 1.0], 0.0, [0.42, 0, 0.05], 0x55e6ff, 0.6, 0.32);
  const pg = painting(1.5, { holo: 0x55e6ff }); pg.position.set(0.57, 1.95, 0.9); scene.add(pg);
  const glow = new THREE.PointLight(0xff8a50, 2.0, 5, 1.6); glow.position.set(0.57, 1.9, 1.4); scene.add(glow);
  return {
    ...B, pg, update(t) {
      ppl.forEach((h, i) => {
        if (i === 7) { h.pose(sitPose(0.49, { hp: 0.45, aL: [0.5, 0.1], aR: [0.5, 0.1], eL: 1.2, eR: 1.2 })); h.root.position.y = 0; h.face(0, 'sad', t); return; }
        h.pose({ hp: 0.3 + 0.05 * Math.sin(t * 0.7 + i), lean: 0.05, py: 0.88 + 0.006 * Math.sin(t * 1.4 + i) }); h.face(0, 'sad', t);
      });
      ppl[7].place(1.2, 0, -1.85, 0);
      if (mode === 'intro') {
        const k = 1;
        fade(pg, 1); beamOn(rig, 1, t); rig.c.update(t, env('claude', t), {});
        camKeys(cam, t, [
          { t: 0, ...pview(pg, 0.53, 0.55, 0.62, 40) }, { t: 2.9, ...pview(pg, 0.535, 0.56, 0.42, 40) },
          { t: 3.6, ...pview(pg, 0.54, 0.585, 0.26, 40) }, { t: 5.6, ...pview(pg, 0.54, 0.585, 0.23, 40) },
          { t: 7.4, p: [0.6, 1.75, 7.0], l: [0.45, 1.45, 0.4], f: 45 }, { t: SC.ekeberg.start, p: [-1.2, 1.6, 6.4], l: [0.45, 1.4, 0.4], f: 45 },
        ]);
      } else {
        const tb = t - SC.outro.start;
        const off = sstep(C.question - 1.2, C.question + 0.2, t);
        fade(pg, 1 - off); beamOn(rig, 1 - off, t);
        rig.c.update(t, env('claude', t), { wave: sstep(C.question - 0.2, C.question + 0.4, t) });
        const ek = win(tb, 0.8, 5.0, 0.6, 0.8);
        lea.pose({ ...ear(ek), hp: 0.1 * (1 - ek) }); lea.face(0, ek > 0.5 && tb < 4 ? 'sad' : 'happy', t);
        if (tb > 5) lea.face(0, 'joy', t);
        camKeys(cam, t, [
          { t: SC.outro.start, p: [3.4, 1.6, 4.0], l: [2.6, 1.4, 0.2], f: 42 }, { t: SC.outro.start + 5.2, p: [3.0, 1.55, 3.4], l: [2.6, 1.45, 0.3], f: 40 },
          { t: C.question - 0.5, p: [1.2, 1.3, 4.2], l: [0.5, 1.0, 0.8], f: 45 }, { t: TL.duration, p: [0.8, 1.0, 3.2], l: [0.3, 0.7, 0.9], f: 45 },
        ]);
      }
    }
  };
}
const sitPose = L.sitPose;
SETS.metro = () => metroSet('intro');
SETS.metro2 = () => metroSet('outro');

// ---------- colline d'Ekeberg
SETS.ekeberg = () => {
  const B = base({ fog: [0x6a3a40, 40, 190], hemi: [0xffb08a, 0x2a2a48, 0.9], sun: [0xff9a60, 1.8, [-12, 6, -20]], shadowSize: 10, bloom: [0.5, 0.5, 0.82], exposure: 1.15 });
  const { scene, cam } = B;
  const dusk = L.skyDome(0x2a3a6a, 0x3a3050, 0xe08a50); scene.add(dusk);
    // le ciel du tableau, enroule autour du decor
  const skyTex = (() => { const im = PAINT.image, c = document.createElement('canvas'); c.width = 2048; c.height = 512; const g = c.getContext('2d');
    const sw = im.width * 0.9, sh = im.height * 0.34;
    for (let i = 0; i < 4; i++) { g.save(); if (i % 2) { g.translate((i + 1) * 512, 0); g.scale(-1, 1); g.drawImage(im, 0, 0, sw, sh, 0, 0, 512, 512); } else g.drawImage(im, 0, 0, sw, sh, i * 512, 0, 512, 512); g.restore(); }
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; })();
  const red = new THREE.Mesh(new THREE.CylinderGeometry(200, 200, 150, 48, 1, true), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, transparent: true, opacity: 0, fog: false, depthWrite: false, toneMapped: false }));
  red.position.y = 55; red.rotation.y = 0.5 + Math.PI * 0.75; scene.add(red);
  const bands = [];
  // fjord
  const water = L.makeWater(300, 40, 0x2a3a6a, { emissive: 0x0a1020 }); water.mesh.position.set(0, -14, -60); scene.add(water.mesh);
  // colline + route
  const land = new THREE.Group(); land.rotation.y = 0.5; land.position.set(0, 0, -10); scene.add(land);
  land.add(at(box(14, 0.4, 90, M(0x5a4634)), 5.0, -0.2, 0));
  land.add(at(box(2.2, 0.1, 90, M(0x9a845e)), 0, 0.02, 0));
  { const sl = at(box(30, 1, 90, M(0x4a3a30)), -2.6 - 15 * Math.cos(1.0), -0.4 - 15 * Math.sin(1.0), 0); sl.rotation.z = 1.0; land.add(sl); }
  const rail = new THREE.Group(); rail.rotation.y = 0.5; rail.position.set(0, 0, -10); scene.add(rail);
  for (let z = -40; z < 40; z += 1.6) rail.add(at(box(0.1, 1.1, 0.1, M(0x6a4a2a)), -2.1, 0.55, z));
  for (const y of [0.55, 1.05]) rail.add(at(box(0.08, 0.08, 80, M(0x7a5a32)), -2.1, y, 0));
  // ville au loin
  for (let i = 0; i < 40; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), G([0xffd080, 0xffb060][i % 2], 1.8)); c.position.set(-60 + hash(i) * 120, -13 + hash(i + 3) * 2, -90 - hash(i + 7) * 30); scene.add(c); }
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(18 + hash(i) * 10, 10 + hash(i + 1) * 8, 6), M(0x2a2440)); m.position.set(-90 + i * 36, -14, -130); scene.add(m); }
  const COAT = { skin: 0xe8c0a0, hair: 0x5a3a20, hairStyle: 'short', top: 0xe8e4dc, bottom: 0x24222a, jacket: 0x24222a, seed: 1610 };
  const munch = new Human({ ...COAT, browColor: 0x3a2a18 }); scene.add(munch.root);
  const f1 = new Human({ skin: 0xe8c8a8, hair: 0x2a1a10, hairStyle: 'short', top: 0xd8d4cc, bottom: 0x1a1a22, jacket: 0x1a1a22, hat: 'top', seed: 1611 }); scene.add(f1.root);
  const f2 = new Human({ skin: 0xd8b090, hair: 0x6a4a2a, hairStyle: 'short', top: 0xd8d4cc, bottom: 0x2a2630, jacket: 0x2a2630, hat: 'wide', hatColor: 0x2a2630, beard: 'full', seed: 1612 }); scene.add(f2.root);
  const rig = claudeRig(scene, [0, 0, 0], 0, [0.35, 0, 0.1], 0x55e6ff, 0.4, 0.25); rig.c.g.scale.setScalar(0.5); rig.pr.scale.setScalar(0.6);
  const cName = card('« LE CRI DE LA NATURE »\nle premier titre choisi par Munch', { w: 1.6, h: 0.42, border: '#ff7a4a', small: true }); scene.add(cName);
  const tName = subAt('In fact');
  // repere le long de la route
  const dirv = new THREE.Vector3(Math.sin(0.5), 0, Math.cos(0.5));
  const onRoad = (s, x = 0) => { const p = new THREE.Vector3(x, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.5).add(new THREE.Vector3(0, 0, -10)).addScaledVector(dirv, s); return p; };
  return {
    ...B, update(t) {
      const t0 = SC.ekeberg.start, td = t - t0;
      const rk = sstep(C.diary - 0.3, C.diary + 2.5, t);
      red.material.opacity = rk; red.visible = rk > 0.01; dusk.visible = rk < 0.99;
      B.hemi.color.setHex(0xffb08a).lerp(new THREE.Color(0xff6a40), rk);
      water.update(t, 0.4);
      // Munch marche puis s'arrete a la barriere
      const stopT = C.diary - 0.2;
      const ms = 1.5 + Math.min(td, stopT - t0) * 0.9;
      const mp = onRoad(ms, -0.9); munch.root.position.copy(mp); munch.root.rotation.y = 0.5;
      const walking = t < stopT;
      const ek = sstep(C.cover - 0.4, C.cover + 0.6, t);
      if (walking) munch.pose(L.walkPose(td * 5, 0.8, { hp: 0.1 }));
      else { const turn = sstep(stopT, stopT + 1.4, t); munch.root.rotation.y = 0.5 + Math.PI * turn; munch.pose({ ...ear(ek), lean: 0.1 * ek, hp: -0.05 }); }
      munch.face(0, t > stopT ? 'fear' : 'neutral', t);
      if (ek > 0.5) munch.mouth.scale.set(0.6, 4.5, 1);
      [f1, f2].forEach((f, i) => { const fs_ = 2.4 + i * 0.5 + td * 0.9; const p = onRoad(fs_, -0.2 + i * 0.6); f.root.position.copy(p); f.root.rotation.y = 0.5; f.pose(L.walkPose(td * 5 + i * 1.3, 0.8)); f.face(0, 'neutral', t); });
      // Claude sur un poteau de la barriere
      const cp = onRoad(-0.5, -2.1); rig.c.g.position.set(cp.x, 1.1, cp.z); rig.c.g.rotation.y = 0.5 + Math.PI * 0.8; rig.pr.visible = false;
      rig.c.update(t, env('claude', t), { ears: ek > 0.6 && t < C.cover + 3 });
      fade(cName, win(t, tName, SC.tableau.start, 0.3, 0.2)); camCard(cam, cName, 0.82, -0.62);
      const mh = munch.root.position;
      camKeys(cam, t, [
        { t: t0, p: [mh.x - 5.0, 3.2, mh.z - 7.5], l: [mh.x + 0.5, 1.2, mh.z + 2], f: 50 },
        { t: C.diary - 1.0, p: [mh.x - 3.4, 2.2, mh.z - 4.6], l: [mh.x, 1.4, mh.z], f: 46 },
        { t: C.diary + 1.5, p: [mh.x - 2.2, 1.9, mh.z - 3.6], l: [mh.x, 1.5, mh.z], f: 44 },
        { t: C.cover - 0.6, p: [mh.x - 1.5, 1.75, mh.z - 2.6], l: [mh.x, 1.55, mh.z], f: 42 },
        { t: C.cover + 1.2, p: [mh.x - 1.0, 1.68, mh.z - 1.7], l: [mh.x, 1.58, mh.z], f: 42 },
        { t: SC.tableau.start, p: [mh.x - 2.8, 2.6, mh.z - 5.0], l: [mh.x + 0.4, 1.6, mh.z + 1], f: 48 },
      ]);
    }
  };
};

// ---------- musee : le tableau en detail + le message cache
SETS.musee = () => {
  const B = base({ bg: 0x0a0a0e, fog: [0x0a0a0e, 6, 26], hemi: [0x8a8aa0, 0x101014, 0.5], sun: [0xfff0dc, 1.2, [1, 5, 4]], shadowSize: 5, bloom: [0.35, 0.5, 0.86], exposure: 1.2 });
  const { scene, cam } = B;
  scene.add(at(box(14, 0.1, 10, M(0x3a2a22)), 0, -0.05, 0));
  scene.add(at(box(14, 6, 0.2, M(0x2a2a34)), 0, 3, -0.2));
  const pg = painting(1.6, { frame: 0x3a2a1a }); pg.position.set(0, 1.75, 0.0); scene.add(pg);
  const spot = new THREE.SpotLight(0xfff0dc, 30, 8, 0.5, 0.6, 1.5); spot.position.set(0, 4.2, 2.5); spot.target = pg; scene.add(spot);
  const rig = claudeRig(scene, [-0.25, 0, 1.6], 0.0, [0.42, 0, 0.05], 0x55e6ff, 0.5, 0.3);
  // infrarouge + inscription (reconstitution)
  const irMat = new THREE.MeshBasicMaterial({ color: 0x20060a, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.MultiplyBlending, premultipliedAlpha: true });
  const ir = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6 * PA), irMat); ir.position.set(0, 1.75, 0.003); scene.add(ir);
  const ink = (() => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const g = c.getContext('2d');
    g.font = 'italic 92px "Liberation Serif"'; g.fillStyle = '#f2ece0'; g.shadowColor = '#ffffff'; g.shadowBlur = 10; g.textBaseline = 'middle';
    g.translate(30, 130); g.rotate(-0.04); g.fillText('Kan kun være malet', 0, -45); g.fillText('af en gal Mand!', 60, 50);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.105), new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    return m;
  })();
  { const w = 1.6, h = 1.6 * PA; ink.position.set((0.17 - 0.5) * w, 1.75 + (0.5 - 0.06) * h, 0.006); } scene.add(ink);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.262, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd070).multiplyScalar(2), transparent: true, opacity: 0, depthWrite: false })); ring.scale.set(1, 0.42, 1); ring.position.copy(ink.position); ring.position.z += 0.002; scene.add(ring);
  // anges noirs : mere et soeur en hologramme
  const fam = new THREE.Group(); rig.holoG.add(fam);
  const mom = holoFig(0xb08aff, { robe: true, hair: 'bun', s: 0.42, op: 0.32, seed: 1620 }); mom.place(-0.13, -0.05, 0, 0.2); fam.add(mom.root);
  const sis = holoFig(0xb08aff, { robe: true, hair: 'long', s: 0.3, op: 0.32, seed: 1621 }); sis.place(0.15, -0.05, 0, -0.2); fam.add(sis.root);
  const cards = []; const K = (text, o, show, yf = -0.55, frac = 0.82) => { const c = card(text, o); scene.add(c); cards.push([c, show, yf, frac]); return c; };
  const tSky = C.sky, tOr = subAt('Or simply');
  K('HYPOTHÈSE 1\nun volcan (le Krakatoa, 1883)', { w: 1.6, h: 0.42, border: '#ff9a50', small: true }, t => win(t, tSky + 2.8, tSky + 6.3, 0.3, 0.2));
  K('HYPOTHÈSE 2\ndes nuages rares, dits « nacrés »', { w: 1.6, h: 0.42, border: '#9ad0ff', small: true }, t => win(t, tSky + 6.3, tOr, 0.3, 0.2));
  K('HYPOTHÈSE 3\nl\'angoisse de Munch', { w: 1.6, h: 0.42, border: '#ff6a6a', small: true }, t => win(t, tOr, C.angels, 0.3, 0.2));
  K('« les anges noirs\nqui veillaient sur mon berceau »', { w: 1.6, h: 0.42, border: '#b08aff' }, t => win(t, subAt('He wrote'), SC.secret.start, 0.3, 0.2), -0.5);
  K('« Ne peut avoir été peint\nque par un fou ! »', { w: 1.6, h: 0.42, border: '#ffd070' }, t => win(t, C.reveal + 0.2, C.museum, 0.3, 0.2), -0.42);
  K('MUSÉE NATIONAL DE NORVÈGE · 2021\nl\'écriture de Munch lui-même', { w: 1.6, h: 0.42, border: '#55e6ff', small: true }, t => win(t, subAt('For a long') + 3.0, SC.debat.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const ang = win(t, C.angels, SC.secret.start + 0.2, 0.8, 0.5);
      const amb = 1 - 0.55 * ang;
      pg.userData.mat.color.setScalar(amb);
      beamOn(rig, ang, t); fade(fam, ang); rig.c.update(t, env('claude', t), {});
      mom.face(0, 'neutral', t); sis.face(0, 'neutral', t); fam.rotation.y = Math.sin(t * 0.5) * 0.2;
      const irk = sstep(C.reveal - 0.6, C.reveal + 0.3, t) * (1 - sstep(C.museum + 6.5, SC.debat.start, t));
      irMat.opacity = 0.0; irMat.color.setRGB(lerp(1, 0.55, irk), lerp(1, 0.32, irk), lerp(1, 0.32, irk)); irMat.opacity = 1; ir.visible = irk > 0.002;
      ink.material.opacity = irk * (0.75 + 0.25 * Math.sin(t * 3));
      ring.material.opacity = win(t, C.corner + 0.6, C.reveal + 0.4, 0.3, 0.4);
      cards.forEach(([c, show, yf, frac]) => { fade(c, show(t)); camCard(cam, c, frac, yf); });
      const T0 = SC.tableau.start;
      camKeys(cam, t, [
        { t: T0, ...pview(pg, 0.5, 0.5, 1.75, 40) },
        { t: T0 + 2.0, ...pview(pg, 0.535, 0.545, 0.3, 40) }, { t: C.friends - 0.3, ...pview(pg, 0.535, 0.55, 0.24, 40) },
        { t: C.friends + 1.2, ...pview(pg, 0.08, 0.4, 0.3, 40) }, { t: C.sky - 0.4, ...pview(pg, 0.1, 0.42, 0.26, 40) },
        { t: C.sky + 1.6, ...pview(pg, 0.5, 0.2, 0.5, 40) }, { t: C.angels - 0.5, ...pview(pg, 0.45, 0.25, 0.42, 40) },
        { t: C.angels + 1.6, p: [0.6, 1.5, 4.6], l: [0.1, 1.2, 1.0], f: 42 }, { t: SC.secret.start, p: [0.3, 1.35, 3.6], l: [0.1, 1.25, 1.0], f: 42 },
        { t: C.corner - 0.3, ...pview(pg, 0.3, 0.2, 0.8, 40) }, { t: C.corner + 1.6, ...pview(pg, 0.17, 0.07, 0.44, 40) },
        { t: C.museum, ...pview(pg, 0.17, 0.075, 0.4, 40) }, { t: C.museum + 4.5, ...pview(pg, 0.5, 0.5, 1.2, 40) },
        { t: SC.debat.start, ...pview(pg, 0.5, 0.5, 1.35, 40) },
      ]);
    }
  };
};

// ---------- soiree-debat, 1895
SETS.debat = () => {
  const B = base({ bg: 0x1a120c, fog: [0x1a120c, 9, 28], hemi: [0xffd8a8, 0x2a1a10, 0.75], sun: [0xffd8a0, 0.9, [3, 6, 5]], shadowSize: 8, bloom: [0.55, 0.5, 0.8], exposure: 1.6 });
  const { scene, cam } = B;
  scene.add(at(box(14, 0.1, 14, M(0x5a3a22)), 0, -0.05, 0));
  scene.add(at(box(14, 5, 0.2, M(0x6a4a3a)), 0, 2.5, -4));
  for (const s of [-1, 1]) scene.add(at(box(0.2, 5, 14, M(0x5a4030)), s * 5, 2.5, 0));
  for (let x = -4; x <= 4; x += 2) { scene.add(at(box(0.12, 0.3, 0.12, G(0xffc070, 2.0)), x, 3.1, -3.85)); const l = new THREE.PointLight(0xffb060, 1.6, 6, 1.6); l.position.set(x, 3.0, -3.4); scene.add(l); }
  // chevalet + tableau
  const ease = new THREE.Group(); ease.position.set(-1.6, 0, -2.8); ease.rotation.y = 0.35; scene.add(ease);
  for (const s of [-1, 1]) { const leg = box(0.06, 2.2, 0.06, M(0x6a4a2a)); leg.position.set(s * 0.45, 1.05, 0); leg.rotation.z = s * 0.08; ease.add(leg); }
  const pg = painting(0.8, { frame: 0x3a2a1a }); pg.position.set(0, 1.45, 0.06); ease.add(pg);
  // public
  const aud = [], chairs = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
    const x = -2 + c * 1.0 + (r % 2) * 0.25, z = -0.6 + r * 1.2;
    scene.add(at(box(0.45, 0.06, 0.42, M(0x4a2a1a)), x, 0.45, z)); scene.add(at(box(0.45, 0.6, 0.05, M(0x4a2a1a)), x, 0.75, z + 0.2));
    if (r === 1 && c === 2) continue;
    const lk = looks(r * 5 + c); const h = new Human({ ...lk, jacket: lk.jacket ?? [0x2a2420, 0x3a2a2a, 0x1e2430][c % 3], hat: (r + c) % 4 === 0 ? 'top' : undefined, seed: 1630 + r * 5 + c });
    h.place(x, 0, z - 0.05, Math.PI); scene.add(h.root); aud.push(h);
  }
  const sch = new Human({ skin: 0xf0d0b0, hair: 0xc89a5a, hairStyle: 'short', top: 0xf0ece4, bottom: 0x2a2a34, jacket: 0x2a2a34, seed: 1650 });
  sch.place(0, 0, 0.55, Math.PI); scene.add(sch.root);
  const munch = new Human({ skin: 0xe8c0a0, hair: 0x5a3a20, hairStyle: 'short', top: 0xe8e4dc, bottom: 0x24222a, jacket: 0x24222a, browColor: 0x3a2a18, seed: 1610 });
  munch.place(3.6, 0, -2.4, -0.9); scene.add(munch.root);
  { const l = new THREE.PointLight(0xffc080, 2.5, 4, 1.5); l.position.set(3.0, 2.4, -1.4); scene.add(l); }
  const rig = claudeRig(scene, [-3.4, 0, 1.6], 0.6, [0.4, 0, 0.1], 0x55e6ff, 0.4, 0.25); rig.pr.visible = false; rig.c.g.scale.setScalar(0.6);
  const cImg = card('réplique imaginée', { w: 0.9, h: 0.2, border: '#ffd070', color: '#ffe0a0' }); scene.add(cImg);
  return {
    ...B, update(t) {
      const sk = sstep(C.stand - 0.5, C.stand + 0.2, t);
      aud.forEach((h, i) => { h.pose(sitPose(0.49, { hp: 0.05 * Math.sin(t + i), hy: sk * (i % 5 < 2 ? 0.4 : -0.3) * (i % 2 ? 1 : 0.6), aL: [0.5, 0.1], aR: [0.5, 0.1], eL: 1.2, eR: 1.2 })); h.face(0, sk > 0.5 ? 'awe' : 'neutral', t); h.root.position.y = 0; });
      sch.pose(sk < 0.01 ? sitPose(0.49) : { py: lerp(0.55, 0.88, sk), lL: lerp(1.5, 0, sk), lR: lerp(1.5, 0, sk), kL: lerp(1.5, 0, sk), kR: lerp(1.5, 0, sk), aR: [1.5 * sk, 0.2], eR: 0.1, hp: -0.05, hy: 0.4 * sk });
      sch.root.rotation.y = Math.PI + 0.5 * sk; sch.face(env('scharff', t), 'angry', t);
      const hk = sstep(C.hurt, C.hurt + 1.5, t);
      munch.pose({ hp: 0.45 * hk, aL: [0.1, 0.1], aR: [0.1, 0.1], lean: 0.08 * hk }); munch.face(0, hk > 0.3 ? 'sad' : 'serious', t);
      rig.c.update(t, env('claude', t), {});
      fade(cImg, win(t, C.stand, C.hurt + 0.2, 0.2, 0.2)); camCard(cam, cImg, 0.42, -0.45);
      const T0 = SC.debat.start;
      camKeys(cam, t, [
        { t: T0, p: [0.4, 2.6, 5.6], l: [-0.6, 1.2, -2.5], f: 48 }, { t: C.stand - 1.2, p: [0.0, 2.2, 4.4], l: [-0.6, 1.2, -2.5], f: 46 },
        { t: C.stand - 0.4, p: [-1.0, 1.5, -1.6], l: [0.1, 1.35, 0.6], f: 42 }, { t: C.hurt - 0.2, p: [-1.0, 1.55, -1.4], l: [0.1, 1.4, 0.6], f: 40 },
        { t: C.hurt + 0.4, p: [2.0, 1.7, -0.8], l: [3.6, 1.5, -2.4], f: 40 }, { t: SC.outro.start, p: [2.4, 1.6, -1.2], l: [3.6, 1.45, -2.4], f: 36 },
      ]);
    }
  };
};

const SHOTS = [
  ['metro', 0, SC.ekeberg.start], ['ekeberg', SC.ekeberg.start, SC.tableau.start], ['musee', SC.tableau.start, SC.debat.start],
  ['debat', SC.debat.start, SC.outro.start], ['metro2', SC.outro.start, 1e9],
];
