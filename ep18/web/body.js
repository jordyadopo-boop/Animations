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
function cardsMgr(scene, cam) {
  const cards = [];
  const K = (text, o, show, yf = -0.55, frac = 0.82) => { const c = card(text, o); scene.add(c); cards.push([c, show, yf, frac]); return c; };
  K.update = (t) => cards.forEach(([c, show, yf, frac]) => { fade(c, show(t)); camCard(cam, c, frac, yf); });
  return K;
}
// ---------- la vraie Joconde (domaine public)
const PAINT = await new THREE.TextureLoader().loadAsync('/assets/joconde.jpg');
PAINT.colorSpace = THREE.SRGBColorSpace; PAINT.anisotropy = 8;
const PA = 1908 / 1280;
function painting(w, o = {}) {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ map: PAINT, toneMapped: false, transparent: true, fog: false });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, w * PA), mat); p.position.z = 0.012; g.add(p);
  const back = box(w, w * PA, 0.02, M(0x6a4a2a)); g.add(back);
  const frame = new THREE.Group(); g.add(frame);
  if (o.frame !== false) { const fm = M(o.frame ?? 0x8a6a2a, { emissive: new THREE.Color(0x2a1a00) }); const t = 0.07 * w; for (const [x, y, ww, hh] of [[0, w * PA / 2 + t / 2, w + 2 * t, t], [0, -w * PA / 2 - t / 2, w + 2 * t, t], [w / 2 + t / 2, 0, t, w * PA], [-w / 2 - t / 2, 0, t, w * PA]]) frame.add(at(box(ww, hh, t * 0.7, fm), x, y, 0.01)); }
  g.userData = { w, h: w * PA, mat, frame };
  return g;
}
function pview(pg, u, v, frac, fov = 40) {
  const w = pg.userData.w, h = pg.userData.h;
  const lp = new THREE.Vector3((u - 0.5) * w, (0.5 - v) * h, 0); const d = frac * h / 2 / Math.tan(fov * Math.PI / 360);
  pg.updateWorldMatrix(true, false);
  const P = pg.localToWorld(new THREE.Vector3(lp.x, lp.y, d)), Lk = pg.localToWorld(lp.clone());
  return { p: [P.x, P.y, P.z], l: [Lk.x, Lk.y, Lk.z], f: fov };
}
function frameOtherPainting(w, h, c, seed) {
  const g = new THREE.Group(); g.add(box(w, h, 0.03, M(c)));
  for (let i = 0; i < 4; i++) g.add(at(box(w * (0.2 + hash(seed + i) * 0.4), h * 0.15, 0.01, M([0x8a6a3a, 0x3a5a3a, 0xc8a070, 0x5a3a2a][i])), (hash(seed + i * 3) - 0.5) * w * 0.5, (hash(seed + i * 7) - 0.5) * h * 0.6, 0.02));
  const t = 0.06; const fm = M(0xb08a3a, { emissive: new THREE.Color(0x2a1a00) });
  for (const [x, y, ww, hh] of [[0, h / 2 + t / 2, w + 2 * t, t], [0, -h / 2 - t / 2, w + 2 * t, t], [w / 2 + t / 2, 0, t, h], [-w / 2 - t / 2, 0, t, h]]) g.add(at(box(ww, hh, 0.05, fm), x, y, 0.01));
  return g;
}
// Salon carre du Louvre
function salon(scene) {
  scene.add(at(box(14, 0.1, 10, M(0x7a5a3a)), 0, -0.05, 0));
  for (let i = -7; i < 7; i++) scene.add(at(box(0.02, 0.005, 10, M(0x5a3a22)), i + 0.5, 0.005, 0));
  scene.add(at(box(14, 5.5, 0.2, M(0x8a2a22)), 0, 2.75, -2.6));
  scene.add(at(box(0.2, 5.5, 10, M(0x7a2a22)), -5, 2.75, 1));
  scene.add(at(box(14, 0.3, 0.3, M(0xc8a060)), 0, 5.2, -2.45));
  const others = [[-3.4, 2.4, 1.5, 1.9, 0x5a4a3a, 1], [3.4, 2.5, 1.8, 1.4, 0x4a5a6a, 2], [-3.4, 4.3, 1.2, 0.9, 0x6a5a3a, 3], [3.4, 4.3, 1.4, 0.9, 0x3a4a3a, 4], [-4.88, 2.4, 1.6, 1.2, 0x5a3a3a, 5]];
  others.forEach(([x, y, w, h, c, s], i) => { const p = frameOtherPainting(w, h, c, s); p.position.set(x, y, -2.47); if (i === 4) { p.position.set(-4.88, 2.4, 0.5); p.rotation.y = Math.PI / 2; } scene.add(p); });
  const hooks = new THREE.Group(); hooks.position.set(0, 2.4, -2.47); scene.add(hooks);
  for (const [x, y] of [[-0.4, 0.62], [0.4, 0.62], [-0.4, -0.62], [0.4, -0.62]]) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 8), M(0x2a2a2a)); h.rotation.x = Math.PI / 2; h.position.set(x, y, 0.04); hooks.add(h); }
  const pg = painting(0.77); pg.position.set(0, 2.4, -2.44); scene.add(pg);
  return { pg, hooks };
}
const POLICE_HAT = { hat: 'cap', hatColor: 0x1a2a4a };

// ---------- intro : le mur qui se vide
SETS.intro = () => {
  const B = base({ bg: 0x1a1210, hemi: [0xffe8d0, 0x3a2a20, 1.0], sun: [0xfff0d8, 1.2, [2, 6, 4]], shadowSize: 6, bloom: [0.35, 0.5, 0.88], exposure: 1.2 });
  const { scene, cam } = B;
  const { pg } = salon(scene);
  const rig = claudeRig(scene, [0.45, 0, -1.3], -0.3, [0.4, 0, 0.1], 0x55e6ff, 0.5, 0.3); rig.pr.visible = false; rig.c.g.scale.setScalar(0.7);
  return {
    ...B, update(t) {
      const gone = sstep(C.empty - 0.4, C.empty + 0.3, t);
      pg.visible = gone < 0.99; pg.userData.mat.opacity = 1 - gone; pg.userData.frame.visible = gone < 0.5; pg.children[1].visible = gone < 0.5;
      rig.c.update(t, env('claude', t), {}); rig.c.body.rotation.z = t > C.empty ? -0.15 : Math.sin(t * 1.3) * 0.03;
      camKeys(cam, t, [{ t: 0, ...pview(pg, 0.5, 0.36, 0.6, 40) }, { t: C.empty - 0.5, ...pview(pg, 0.5, 0.42, 0.95, 40) }, { t: C.empty + 0.8, p: [1.2, 1.3, 2.4], l: [0.1, 1.3, -2.4], f: 48 }, { t: C.title, p: [1.0, 1.7, 3.4], l: [0.1, 1.9, -2.4], f: 46 }, { t: SC.vol.start, p: [1.4, 1.6, 3.8], l: [0.1, 1.8, -2.4], f: 46 }]);
    }
  };
};

// ---------- le vol (lundi, musee ferme) + escalier
SETS.vol = () => {
  const B = base({ bg: 0x0a0c14, hemi: [0xa8b8e8, 0x24242c, 1.0], sun: [0xc8d8ff, 1.1, [3, 6, 3]], shadowSize: 6, bloom: [0.4, 0.5, 0.85], exposure: 1.6 });
  const { scene, cam } = B;
  const { pg } = salon(scene);
  // escalier de service, a cote (x = 20)
  const st = new THREE.Group(); st.position.set(20, 0, 0); scene.add(st);
  st.add(at(box(6, 0.1, 6, M(0x5a5a5a)), 0, -0.05, 0)); st.add(at(box(6, 5, 0.2, M(0x9a9488)), 0, 2.5, -1.5)); st.add(at(box(0.2, 5, 6, M(0x8a8478)), -1.6, 2.5, 0));
  for (let i = 0; i < 9; i++) st.add(at(box(1.6, 0.2, 0.4, M(0x7a7468)), 0, 0.1 + i * 0.2, 1.5 - i * 0.35));
  st.add(at(box(0.9, 2.0, 0.05, M(0x5a4a3a)), 1.2, 1.0, -1.4));
  const light = new THREE.PointLight(0xffe0b0, 8, 8, 1.2); light.position.set(21, 2.8, 0.5); scene.add(light);
  const thief = new Human({ skin: 0xe0b890, hair: 0x1a1010, hairStyle: 'short', top: 0xf0eee8, bottom: 0x2a2a30, jacket: 0xf0eee8, beard: 'side', seed: 1801 }); scene.add(thief.root);
  const carried = painting(0.62); scene.add(carried);
  const frameDrop = new THREE.Group(); scene.add(frameDrop);
  { const fm = M(0x8a6a2a); const w = 0.62, h = 0.62 * PA, t = 0.045; for (const [x, y, ww, hh] of [[0, h / 2 + t / 2, w + 2 * t, t], [0, -h / 2 - t / 2, w + 2 * t, t], [w / 2 + t / 2, 0, t, h], [-w / 2 - t / 2, 0, t, h]]) frameDrop.add(at(box(ww, hh, 0.03, fm), x, y, 0)); }
  const c = L.makeClaude(); c.g.scale.setScalar(0.5); scene.add(c.g);
  return {
    ...B, update(t) {
      const T0 = SC.vol.start, inStairs = t >= C.stairs;
      const onWall = t < T0 + 3.4;
      pg.visible = onWall;
      if (!inStairs) {
        const tw = t - T0;
        // il arrive, decroche, repart vers la porte
        const x = tw < 2.5 ? lerp(3.5, 0.4, tw / 2.5) : tw < 3.6 ? 0.4 : 0.4 - (tw - 3.6) * 0.9;
        const z = tw < 2.5 ? lerp(1.0, -1.85, tw / 2.5) : tw < 3.6 ? -1.85 : -1.85 + (tw - 3.6) * 0.6;
        thief.place(x, 0, z, tw < 2.5 ? -2.3 : tw < 3.6 ? Math.PI : -1.2);
        const walking = tw < 2.5 || tw > 3.6;
        thief.pose(walking ? L.walkPose(tw * 5, 0.8, { aL: [1.2, 0.2], aR: [1.2, 0.2], eL: 0.6, eR: 0.6 }) : { aL: [2.4, 0.3], aR: [2.4, 0.3], eL: 0.3, eR: 0.3 });
        carried.visible = !onWall;
        if (!onWall) { const fwd = new THREE.Vector3(0, 0, 0.42).applyAxisAngle(new THREE.Vector3(0, 1, 0), thief.root.rotation.y); carried.position.copy(thief.root.position).add(fwd).add(new THREE.Vector3(0, 1.15, 0)); carried.rotation.set(0, thief.root.rotation.y, 0); }
        frameDrop.visible = false; c.g.position.set(-2.2, 0, 0.6); c.g.rotation.y = 0.5;
        const tp = thief.root.position; cam.position.set(tp.x + 1.8, 1.9, tp.z + 2.6); cam.lookAt(tp.x - 0.2, 1.4, tp.z - 0.6); if (cam.fov !== 48) { cam.fov = 48; cam.updateProjectionMatrix(); }
      } else {
        const ts = t - C.stairs;
        const k = clamp(ts / 6, 0, 1);
        thief.place(20.0, 0.2 * 9 * (1 - k) * 0 + Math.max(0, 1.8 - ts * 0.35), lerp(-1.0, 2.2, k), 0);
        thief.pose(L.walkPose(ts * 4, 0.6, { aL: [0.6, 0.2], aR: [0.6, 0.2], eL: 1.2, eR: 1.2 }));
        const hidden = sstep(1.2, 1.8, ts);
        carried.userData.frame.visible = ts < 0.6; carried.visible = hidden < 0.98;
        const fwd = new THREE.Vector3(0, 1.1, 0.25 - 0.1 * hidden); carried.position.copy(thief.root.position).add(fwd); carried.rotation.set(0, 0, 0); carried.scale.setScalar(1 - 0.3 * hidden);
        frameDrop.visible = ts >= 0.6; frameDrop.position.set(20.5, 1.85, -1.1); frameDrop.rotation.set(-1.2, 0.3, 0.1);
        thief.spine.scale.z = 1 + 0.25 * hidden;
        c.g.position.set(19.0, 0, 2.0); c.g.rotation.y = 0.8;
        const ty = thief.root.position.y, tz = thief.root.position.z;
        camKeys(cam, t, [{ t: C.stairs, p: [21.2, 2.4, 3.6], l: [20, 1.6 + ty * 0.5, tz], f: 50 }, { t: SC.decouverte.start, p: [21.4, 1.8, 4.2], l: [20, 1.2, tz], f: 48 }]);
        cam.lookAt(20, 1.0 + ty, tz);
      }
      thief.face(0, 'serious', t);
      c.update(t, env('claude', t), { squint: true });
    }
  };
};

// ---------- la decouverte (mardi)
SETS.decouverte = () => {
  const B = base({ bg: 0x1a1210, hemi: [0xffe8d0, 0x3a2a20, 1.05], sun: [0xfff0d8, 1.3, [2, 6, 4]], shadowSize: 6, bloom: [0.35, 0.5, 0.88], exposure: 1.2 });
  const { scene, cam } = B;
  const { pg } = salon(scene); pg.visible = false;
  const ber = new Human({ skin: 0xe8c8a8, hair: 0x6a5a4a, hairStyle: 'short', top: 0xf0ece4, bottom: 0x3a3a40, jacket: 0x4a3a2a, beard: 'full', beardColor: 0x6a5a4a, hat: 'wide', hatColor: 0x2a2420, seed: 1810 }); ber.place(0.6, 0, -0.4, Math.PI * 0.95); scene.add(ber.root);
  const easel = new THREE.Group(); easel.position.set(1.1, 0, -0.7); easel.rotation.y = Math.PI * 0.9; scene.add(easel);
  for (const s of [-1, 1]) { const l = box(0.04, 1.6, 0.04, M(0x6a4a2a)); l.position.set(s * 0.3, 0.8, 0); l.rotation.z = s * 0.08; easel.add(l); }
  easel.add(at(box(0.6, 0.7, 0.02, M(0xf4f0e4)), 0, 1.25, 0.03));
  const guard = new Human({ skin: 0xc8946a, hair: 0x2a2a2a, hairStyle: 'short', top: 0x1a2a4a, bottom: 0x1a2a4a, jacket: 0x1a2a4a, beard: 'side', ...POLICE_HAT, seed: 1811 }); scene.add(guard.root);
  const K = cardsMgr(scene, cam);
  const cImg = K('répliques imaginées', { w: 0.9, h: 0.2, border: '#ffd070', color: '#ffe0a0' }, t => win(t, C.where, C.hours, 0.2, 0.2), -0.45, 0.42);
  K('LE LOUVRE FERME\npendant une semaine', { w: 1.6, h: 0.42, border: '#ff6a5a', small: true }, t => win(t, C.hours + 2.2, SC.suspects.start, 0.3, 0.2));
  return {
    ...B, update(t) {
      const run = sstep(C.hours, C.hours + 0.4, t);
      ber.pose({ hp: -0.15, hy: 0.3 * win(t, C.where - 0.3, C.hours, 0.3, 0.3), aR: [1.4 * win(t, C.where, C.where + 1.5, 0.3, 0.3), 0.3], eR: 0.2 }); ber.face(env('beroud', t), 'awe', t);
      const gx = t < C.hours ? 2.6 : 2.6 - (t - C.hours) * 2.5;
      guard.place(gx, 0, 0.6 + (t < C.hours ? 0 : (t - C.hours) * 0.4), t < C.hours ? -1.6 : -2.2);
      guard.pose(t < C.hours ? { aL: [0.1, 0.1], aR: [0.1, 0.1], hy: -0.2 } : L.walkPose((t - C.hours) * 9, 1.3, { lean: 0.2 })); guard.face(env('gardien', t), t < C.hours ? 'neutral' : 'fear', t);
      const T0 = SC.decouverte.start;
      camKeys(cam, t, [{ t: T0, p: [2.0, 1.9, 3.2], l: [0.2, 2.0, -2.2], f: 46 }, { t: C.where - 0.45, p: [2.0, 1.9, 3.0], l: [0.2, 2.0, -2.2], f: 46 }, { t: C.where - 0.4, p: [0.0, 1.85, -2.2], l: [0.6, 1.65, -0.4], f: 44 }, { t: C.where + 1.6, p: [0.2, 1.8, -1.9], l: [1.8, 1.4, 0.4], f: 50 }, { t: C.hours - 0.05, p: [0.2, 1.8, -1.9], l: [1.8, 1.4, 0.4], f: 50 }, { t: C.hours, p: [2.8, 2.0, 3.2], l: [0.4, 1.6, -1.6], f: 48 }, { t: SC.suspects.start, p: [2.0, 2.0, 3.4], l: [0.0, 2.2, -2.4], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- suspects : journaux, bureau de police
SETS.suspects = () => {
  const B = base({ bg: 0x14100c, hemi: [0xffd8a8, 0x2a1a10, 0.8], sun: [0xffd8a0, 0.9, [2, 5, 3]], shadowSize: 5, bloom: [0.5, 0.5, 0.82], exposure: 1.3 });
  const { scene, cam } = B;
  scene.add(at(box(10, 0.1, 8, M(0x4a3a2a)), 0, -0.05, 0)); scene.add(at(box(10, 4, 0.2, M(0x6a5a48)), 0, 2, -2));
  scene.add(at(box(1.8, 0.08, 0.9, M(0x5a3a22)), 0, 0.78, -0.6)); for (const [x, z] of [[-0.8, -0.95], [0.8, -0.95], [-0.8, -0.25], [0.8, -0.25]]) scene.add(at(box(0.06, 0.78, 0.06, M(0x3a2a1a)), x, 0.39, z));
  const lamp = new THREE.PointLight(0xffc070, 3, 5, 1.5); lamp.position.set(0.4, 1.5, -0.5); scene.add(lamp); scene.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.2, 8, 1, true), G(0xffc070, 1.2)), 0.4, 1.15, -0.7));
  const cop = new Human({ skin: 0xe0b890, hair: 0x3a2a1a, hairStyle: 'short', top: 0x1a2a4a, bottom: 0x1a2a4a, jacket: 0x1a2a4a, beard: 'full', seed: 1820, ...POLICE_HAT }); cop.place(0, 0, -1.3, 0); scene.add(cop.root);
  const apo = new Human({ skin: 0xe8c0a0, hair: 0x3a2a1a, hairStyle: 'short', top: 0xf0ece4, bottom: 0x3a3a48, jacket: 0x3a3a48, seed: 1821, h: 1.08 }); apo.place(-0.45, 0, 0.15, Math.PI); scene.add(apo.root);
  const pic = new Human({ skin: 0xd0a070, hair: 0x101010, hairStyle: 'short', top: 0xf4f4f4, bottom: 0x2a2a3a, jacket: 0x2a3a6a, seed: 1822, h: 0.95 }); pic.place(0.5, 0, 0.15, Math.PI); scene.add(pic.root);
  for (const x of [-0.45, 0.5]) scene.add(at(box(0.45, 0.05, 0.42, M(0x3a2a20)), x, 0.45, 0.15));
  const papers = ['LA JOCONDE VOLÉE !', 'OÙ EST LA JOCONDE ?', 'MYSTÈRE AU LOUVRE'].map((tx, i) => { const p = card(tx + '\nParis · août 1911', { w: 1.2, h: 0.5, bg: 'rgba(240,232,212,0.97)', border: '#3a3a3a', color: '#1a1a1a', subColor: '#4a4a4a', small: true }); p.material.depthTest = true; p.renderOrder = 0; scene.add(p); return p; });
  const statues = new THREE.Group(); scene.add(statues);
  for (let i = 0; i < 2; i++) { const s = new THREE.Group(); s.add(holo(new THREE.BoxGeometry(0.14, 0.22, 0.12), 0xffd070, 0.25)); s.add(at(holo(new THREE.BoxGeometry(0.2, 0.18, 0.12), 0xffd070, 0.25), 0, -0.2, 0)); s.position.set(-0.2 + i * 0.4, 1.35, -0.5); statues.add(s); }
  const K = cardsMgr(scene, cam);
  K('GUILLAUME APOLLINAIRE\narrêté le 7 septembre 1911', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.suspects.start + 3.0, SC.suspects.start + 7.5, 0.3, 0.2));
  K('PABLO PICASSO\ninterrogé par la police', { w: 1.6, h: 0.42, border: '#9ad0ff', small: true }, t => win(t, SC.suspects.start + 7.5, C.statues, 0.3, 0.2));
  const sbx = S.find(x => x.en.startsWith('They hadn')); const tB = sbx ? sbx.end - 2.6 : 0;
  K('des statuettes volées au Louvre…\npas la Joconde', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.statues + 2.0, tB, 0.3, 0.2));
  K('libérés tous les deux', { w: 1.6, h: 0.3, border: '#7dffb0' }, t => win(t, tB, SC.foule.start, 0.3, 0.2));
  return {
    ...B, update(t) {
      const T0 = SC.suspects.start; const sb = S.find(x => x.en.startsWith('They hadn')); const tBoth = sb ? sb.end - 2.6 : C.statues + 8;
      papers.forEach((p, i) => { const k = sstep(T0 + 0.2 + i * 0.5, T0 + 0.7 + i * 0.5, t) * (1 - sstep(T0 + 2.6, T0 + 3.0, t)); p.visible = k > 0.01; p.position.set(-0.6 + i * 0.6, 2.4 - i * 0.35 + (1 - k) * 0.5, 0.6 + i * 0.1); p.rotation.set(0, 0, (i - 1) * 0.15); p.scale.setScalar(k); });
      cop.pose(sitPose(0.49, { aL: [1.0, 0.2], aR: [1.3 + 0.2 * Math.sin(t * 2), 0.2], eL: 1.0, eR: 0.6 })); cop.root.position.y = 0; cop.face(0.2 * Math.abs(Math.sin(t * 7)) * (t < C.statues ? 1 : 0), 'serious', t);
      [apo, pic].forEach((h, i) => { h.pose(sitPose(0.49, { aL: [0.6, 0.15], aR: [0.6, 0.15], eL: 1.0, eR: 1.0, hp: 0.1 + (t > tBoth ? -0.2 : 0) })); h.root.position.y = 0; h.face(0, t > tBoth ? 'happy' : 'sad', t); });
      fade(statues, win(t, C.statues + 1.0, tBoth, 0.4, 0.3)); statues.rotation.y = t * 0.6;
      camKeys(cam, t, [{ t: T0, p: [0, 2.3, 3.6], l: [0, 2.0, 0], f: 46 }, { t: T0 + 2.95, p: [0, 2.3, 3.6], l: [0, 2.0, 0], f: 46 }, { t: T0 + 3.0, p: [-0.3, 2.15, -1.85], l: [-0.45, 1.25, 0.15], f: 46 }, { t: T0 + 7.5, p: [0.3, 2.15, -1.85], l: [0.5, 1.25, 0.15], f: 46 }, { t: C.statues, p: [0.2, 2.0, 2.4], l: [0, 1.3, -0.5], f: 46 }, { t: SC.foule.start, p: [0.2, 2.1, 2.8], l: [0, 1.3, -0.5], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- la foule devant le mur vide
SETS.foule = () => {
  const B = base({ bg: 0x1a1210, hemi: [0xffe8d0, 0x3a2a20, 1.05], sun: [0xfff0d8, 1.3, [2, 6, 4]], shadowSize: 7, bloom: [0.4, 0.5, 0.86], exposure: 1.2 });
  const { scene, cam } = B;
  const { pg } = salon(scene); pg.visible = false;
  const ppl = []; for (let i = 0; i < 16; i++) { const h = new Human({ ...looks(i), hat: i % 3 === 0 ? 'top' : (i % 5 === 1 ? 'wide' : undefined), hatColor: [0x1a1a1a, 0x5a4a3a][i % 2], seed: 1830 + i }); scene.add(h.root); ppl.push(h); }
  const news = []; for (let i = 0; i < 6; i++) { const p = card(['LA JOCONDE', 'MONA LISA', 'LA GIOCONDA', 'DIE MONA LISA', 'LA JOCONDE', 'MONA LISA'][i] + '\nVOLÉE · STOLEN · RUBATA', { w: 0.8, h: 0.34, bg: 'rgba(240,232,212,0.97)', border: '#3a3a3a', color: '#1a1a1a', subColor: '#5a5a5a', small: true }); p.material.depthTest = true; p.renderOrder = 0; scene.add(p); news.push(p); }
  const K = cardsMgr(scene, cam);
  K('LA JOCONDE DEVIENT UNE STAR', { w: 1.6, h: 0.3, border: '#ffd070' }, t => win(t, C.star + 1.5, SC.voleur.start, 0.3, 0.2));
  return {
    ...B, update(t) {
      ppl.forEach((h, i) => { const row = Math.floor(i / 4), col = i % 4; const shuffle = ((t * 0.25 + i * 0.13) % 1); h.place(-1.2 + col * 0.8 + Math.sin(i) * 0.15, 0, -1.5 + row * 0.7 + shuffle * 0.1, Math.PI + (hash(i) - 0.5) * 0.4); h.pose({ hp: -0.25, hy: 0.15 * Math.sin(t * 0.5 + i), aL: [i % 3 === 0 ? 1.2 : 0.1, 0.1], eL: i % 3 === 0 ? 1.4 : 0.15 }); h.face(0, 'awe', t); });
      news.forEach((p, i) => { const k = sstep(C.star + i * 0.25, C.star + 0.4 + i * 0.25, t); p.visible = k > 0.01; const a = t * 0.4 + i * 1.05; p.position.set(Math.cos(a) * 1.6, 3.2 + Math.sin(a * 1.3) * 0.4, -0.6 + Math.sin(a) * 0.8); p.lookAt(cam.position); p.scale.setScalar(k); });
      const T0 = SC.foule.start;
      camKeys(cam, t, [{ t: T0, p: [0.4, 2.4, 4.6], l: [0, 2.2, -2.4], f: 48 }, { t: C.star, p: [0.0, 2.3, 3.4], l: [0, 2.2, -2.4], f: 46 }, { t: SC.voleur.start, p: [0.0, 2.6, 4.2], l: [0, 2.8, -1.4], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- le voleur : la chambre, Florence, la verite
SETS.voleur = () => {
  const B = base({ bg: 0x14100c, hemi: [0xffd8a8, 0x2a1a10, 0.85], sun: [0xffe0b8, 1.1, [2, 5, 3]], shadowSize: 5, bloom: [0.45, 0.5, 0.84], exposure: 1.3 });
  const { scene, cam } = B;
  // chambre a Paris
  scene.add(at(box(8, 0.1, 6, M(0x5a4030)), 0, -0.05, 0)); scene.add(at(box(8, 3.5, 0.2, M(0x7a6a50)), 0, 1.75, -1.6)); scene.add(at(box(0.2, 3.5, 6, M(0x6a5a44)), -2.2, 1.75, 0));
  scene.add(at(box(1.0, 0.4, 1.9, M(0x4a3a2a)), -1.4, 0.2, -0.5)); scene.add(at(box(1.0, 0.12, 1.9, M(0xe8e0d0)), -1.4, 0.46, -0.5));
  scene.add(at(box(0.5, 0.7, 0.05, G(0x8ab0e0, 1.0)), 0.6, 1.9, -1.48));
  const trunk = new THREE.Group(); trunk.position.set(0.5, 0, -0.6); scene.add(trunk);
  trunk.add(at(box(1.0, 0.5, 0.6, M(0x6a3a1a)), 0, 0.25, 0)); for (const x of [-0.3, 0.3]) trunk.add(at(box(0.06, 0.52, 0.62, M(0x2a2a2a)), x, 0.25, 0));
  const lid = new THREE.Group(); lid.position.set(0, 0.5, -0.3); trunk.add(lid); lid.add(at(box(1.0, 0.08, 0.6, M(0x5a3016)), 0, 0.04, 0.3));
  const inTrunk = painting(0.36, { frame: false }); inTrunk.rotation.x = -Math.PI / 2; inTrunk.rotation.z = Math.PI / 2; inTrunk.position.set(0, 0.42, 0); trunk.add(inTrunk);
  const glow = new THREE.PointLight(0xffd080, 0, 2.5, 1.5); glow.position.set(0.5, 0.9, -0.6); scene.add(glow);
  const per = new Human({ skin: 0xe0b890, hair: 0x1a1010, hairStyle: 'short', top: 0xe8e4dc, bottom: 0x2a2a30, jacket: 0x3a3028, beard: 'side', seed: 1801 }); scene.add(per.root);
  // Florence (x = 20)
  const fl = new THREE.Group(); fl.position.set(20, 0, 0); scene.add(fl);
  fl.add(at(box(8, 0.1, 6, M(0x8a6a4a)), 0, -0.05, 0)); fl.add(at(box(8, 3.5, 0.2, M(0xd8c098)), 0, 1.75, -1.6));
  fl.add(at(box(1.0, 1.3, 0.05, G(0xffe0a0, 1.1)), 1.8, 2.0, -1.48));
  fl.add(at(box(1.2, 0.08, 0.8, M(0x6a4a2a)), 0, 0.75, -0.4)); for (const [x, z] of [[-0.5, -0.7], [0.5, -0.7], [-0.5, -0.1], [0.5, -0.1]]) fl.add(at(box(0.05, 0.75, 0.05, M(0x3a2a1a)), x, 0.37, z));
  const onTable = painting(0.42, { frame: false }); onTable.position.set(20, 0.8, -0.4); onTable.rotation.x = -Math.PI / 2 + 0.25; scene.add(onTable);
  const geri = new Human({ skin: 0xe0b890, hair: 0x5a5a5a, hairStyle: 'bald', top: 0xf0ece4, bottom: 0x2a2a30, jacket: 0x2a2a30, beard: 'full', beardColor: 0x8a8a8a, seed: 1840 }); geri.place(19.3, 0, -1.0, 0.4); scene.add(geri.root);
  const poggi = new Human({ skin: 0xd8b090, hair: 0x2a2a2a, hairStyle: 'short', top: 0xf0ece4, bottom: 0x3a3028, jacket: 0x3a3028, seed: 1841 }); poggi.place(20.6, 0, -1.05, -0.4); scene.add(poggi.root);
  const cop = new Human({ skin: 0xc8946a, hair: 0x2a2a2a, hairStyle: 'short', top: 0x1a2a4a, bottom: 0x1a2a4a, jacket: 0x1a2a4a, seed: 1842, ...POLICE_HAT }); scene.add(cop.root);
  // holo : carte Italie -> France
  const map = new THREE.Group(); map.position.set(20, 2.3, 0.4); scene.add(map);
  const it = label('ITALIE', { w: 0.6, h: 0.16, color: '#7dffb0', font: 'bold 120px Inter' }); it.position.set(0.55, -0.25, 0); map.add(it);
  const fr = label('FRANCE', { w: 0.6, h: 0.16, color: '#9ad0ff', font: 'bold 120px Inter' }); fr.position.set(-0.55, 0.2, 0); map.add(fr);
  const arrow = beam([0.45, -0.12, 0], [-0.45, 0.08, 0], 0.025, G(0xffd070, 1.8)); map.add(arrow);
  const leo = holoFig(0xffd070, { beard: 'long', hair: 'long', s: 0.35, op: 0.4, seed: 1850 }); map.add(leo.root);
  const K = cardsMgr(scene, cam);
  K('VINCENZO PERUGGIA\nvitrier, ancien ouvrier du Louvre', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, subAt('The thief'), C.florence, 0.3, 0.2));
  K('réplique imaginée', { w: 0.9, h: 0.2, border: '#ffd070', color: '#ffe0a0' }, t => win(t, C.why, C.false, 0.2, 0.2), -0.45, 0.42);
  K('LÉONARD DE VINCI\nvient en France vers 1516', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.false + 2.5, subAt('Peruggia serves'), 0.3, 0.2));
  K('JANVIER 1914\nretour au Louvre', { w: 1.6, h: 0.42, border: '#7dffb0', small: true }, t => win(t, subAt('Peruggia serves') + 2.5, SC.aujourdhui.start, 0.3, 0.2));
  return {
    ...B, update(t) {
      const T0 = SC.voleur.start, inFl = t >= C.florence;
      const open = win(t, T0 + 1.5, subAt('The thief') + 2.5, 0.8, 0.8);
      lid.rotation.x = -1.6 * open; glow.intensity = 3 * open; inTrunk.visible = open > 0.05;
      per.face(env('peruggia', t), 'angry', t);
      if (!inFl) { per.place(0.5, 0, 0.35, Math.PI); per.pose(kneel()); }
      else if (t < C.why - 0.5) { per.place(20, 0, 0.35, Math.PI); per.pose({ aL: [0.3, 0.1], aR: [0.8, 0.2], eR: 0.6, hp: 0.2 }); }
      else { per.place(20.3, 0, 0.7, Math.PI + 0.3); per.pose({ aL: [0.6, 0.3], aR: [1.6, 0.4], eR: 0.3, hp: -0.1 }); }
      const arrest = sstep(C.florence + 6.5, C.florence + 7.5, t);
      cop.visible = arrest > 0.01; cop.place(lerp(23, 20.7, arrest), 0, 0.9, -1.4); cop.pose(arrest < 1 ? L.walkPose(t * 6, 0.8) : { aR: [1.1, 0.3], eR: 0.2 }); cop.face(0, 'serious', t);
      geri.pose({ hp: 0.5, aL: [0.4, 0.1], aR: [0.4, 0.1] }); poggi.pose({ hp: 0.45, aR: [0.9 + 0.2 * Math.sin(t * 2), 0.2], eR: 0.5 }); geri.face(0, 'awe', t); poggi.face(0, 'awe', t);
      const mk = win(t, C.false, subAt('Peruggia serves'), 0.4, 0.3); fade(map, mk);
      const u = clamp((t - C.false - 0.5) / 3, 0, 1); leo.place(lerp(0.45, -0.45, u), lerp(-0.25, -0.05, u) - 0.15, 0.05, -Math.PI / 2); leo.pose(L.walkPose(t * 5, 0.6));
      if (!inFl) camKeys(cam, t, [{ t: T0, p: [2.4, 1.9, 2.6], l: [0.3, 0.6, -0.5], f: 46 }, { t: subAt('The thief'), p: [-0.6, 1.7, 2.6], l: [0.4, 0.9, -0.2], f: 46 }, { t: C.florence, p: [-0.9, 1.8, 3.0], l: [0.4, 0.9, 0], f: 48 }]);
      else camKeys(cam, t, [{ t: C.florence, p: [21.6, 2.0, 2.6], l: [20, 1.0, -0.5], f: 46 }, { t: C.why - 0.4, p: [21.4, 1.8, 2.0], l: [20.2, 1.3, 0.4], f: 44 }, { t: C.why + 0.2, p: [19.4, 1.7, 2.2], l: [20.3, 1.5, 0.6], f: 42 }, { t: C.false, p: [20.0, 2.2, 3.4], l: [20, 2.0, 0.3], f: 46 }, { t: subAt('Peruggia serves'), p: [22.6, 2.5, 2.4], l: [20, 1.0, -0.5], f: 50 }, { t: SC.aujourdhui.start, p: [22.8, 2.6, 2.6], l: [20, 1.0, -0.5], f: 50 }]);
      K.update(t);
    }
  };
};
const kneel = () => L.kneelPose({ aL: [1.0, 0.2], aR: [1.0, 0.2], eL: 0.6, eR: 0.6, hp: 0.4 });

// ---------- aujourd'hui
SETS.aujourdhui = () => {
  const B = base({ bg: 0xe8e4dc, hemi: [0xffffff, 0x6a6a6a, 1.15], sun: [0xffffff, 1.3, [2, 6, 4]], shadowSize: 7, bloom: [0.35, 0.5, 0.9], exposure: 1.1 });
  const { scene, cam } = B;
  scene.add(at(box(14, 0.1, 10, M(0x9a8a7a)), 0, -0.05, 0)); scene.add(at(box(14, 5, 0.2, M(0x2a3a5a)), 0, 2.5, -2.6));
  const pg = painting(0.7, { frame: 0xb08a3a }); pg.position.set(0, 1.9, -2.4); scene.add(pg);
  scene.add(at(box(1.3, 1.6, 0.04, new THREE.MeshBasicMaterial({ color: 0xbfd8ff, transparent: true, opacity: 0.15, depthWrite: false })), 0, 1.9, -2.2));
  scene.add(at(box(4, 0.9, 0.08, M(0x5a4a3a)), 0, 0.45, -1.95));
  const ppl = []; for (let i = 0; i < 14; i++) { const h = new Human({ ...looks(i + 3), seed: 1860 + i }); scene.add(h.root); const ph = at(box(0.08, 0.14, 0.015, M(0x1a1a1a)), 0, 0, 0); ph.add(at(box(0.07, 0.12, 0.002, G(0x9ad0ff, 1.2)), 0, 0, 0.009)); h.hand.R.add(ph); ph.position.set(0, -0.08, 0.05); ppl.push(h); }
  const rig = claudeRig(scene, [0.0, 0, 0.05], Math.PI, [0.4, 0, -0.1], 0x55e6ff, 0.5, 0.3); rig.pr.visible = false;
  return {
    ...B, update(t) {
      ppl.forEach((h, i) => { const row = Math.floor(i / 5), col = i % 5; h.place(-1.8 + col * 0.9 + (row % 2) * 0.4, 0, 0.4 + row * 0.7, Math.PI + (hash(i) - 0.5) * 0.3); h.pose({ aR: [2.2 + 0.1 * Math.sin(t + i), 0.2], eR: 0.6, hp: -0.15 }); h.face(0, 'happy', t); });
      rig.c.update(t, env('claude', t), { wave: sstep(C.question, C.question + 0.5, t) });
      
      const T0 = SC.aujourdhui.start;
      camKeys(cam, t, [{ t: T0, ...pview(pg, 0.5, 0.4, 2.6, 44) }, { t: T0 + 3.5, p: [0.0, 2.2, 4.6], l: [0, 1.6, -1.6], f: 48 }, { t: C.question - 0.35, p: [0.0, 2.2, 4.6], l: [0, 1.6, -1.6], f: 48 }, { t: C.question - 0.3, p: [0.3, 1.3, -1.85], l: [0, 0.8, 0.3], f: 52 }, { t: TL.duration, p: [0.25, 1.2, -1.75], l: [0, 0.75, 0.3], f: 52 }]);
    }
  };
};

// ---------- couverture
SETS.cover = () => {
  const B = base({ bg: 0x1a1210, hemi: [0xffe8d0, 0x3a2a20, 1.05], sun: [0xfff0d8, 1.3, [2, 6, 4]], shadowSize: 6, bloom: [0.35, 0.5, 0.88], exposure: 1.2 });
  const { scene, cam } = B;
  const { pg } = salon(scene);
  return { ...B, update(t) { pg.position.set(-0.55, 2.4, -2.44); const v = pview(pg, 1.05, 0.38, 1.3, 46); cam.position.set(...v.p); cam.position.x += 0.15; cam.fov = 46; cam.updateProjectionMatrix(); cam.lookAt(0.0, 2.3, -2.44); } };
};

const SHOTS = [
  ['intro', 0, SC.vol.start], ['vol', SC.vol.start, SC.decouverte.start], ['decouverte', SC.decouverte.start, SC.suspects.start],
  ['suspects', SC.suspects.start, SC.foule.start], ['foule', SC.foule.start, SC.voleur.start], ['voleur', SC.voleur.start, SC.aujourdhui.start],
  ['aujourdhui', SC.aujourdhui.start, 1000], ['cover', 1000, 1e9],
];
