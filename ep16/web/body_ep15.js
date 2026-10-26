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
function glowOrb(r, c, k = 1.6) { return new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), G(c, k)); }
function holoFig(c, o = {}) {
  const h = new Human({ holo: c, robe: o.robe ? c : undefined, robeL: 0.82, hairStyle: o.hair ?? 'short', beard: o.beard, seed: o.seed ?? 1 });
  h.root.traverse(m => { if (m.isMesh && m.material && m.material.blending === THREE.AdditiveBlending) m.material.opacity = o.op ?? 0.3; });
  h.root.scale.setScalar(o.s ?? 1); return h;
}
function symCross(c) { const g = new THREE.Group(); const m = G(c, 1.6); g.add(box(0.07, 0.5, 0.05, m)); g.add(at(box(0.32, 0.07, 0.05, m), 0, 0.09, 0)); return g; }
function tree(seed, c = 0x3f8a45) { const g = new THREE.Group(); g.add(at(box(0.1, 0.5, 0.1, M(0x6a4a30)), 0, 0.25, 0)); for (let i = 0; i < 3; i++) g.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.4 - i * 0.1, 0.45, 6), M(c, { emissive: new THREE.Color(c).multiplyScalar(0.2) })), 0, 0.6 + i * 0.25, 0)); g.scale.setScalar(0.8 + hash(seed) * 0.4); return g; }
function looks(i) {
  return [
    { skin: 0x8a5a3a, hair: 0x141010, hairStyle: 'curly', top: 0xd04a4a, bottom: 0x2a2a3a },
    { skin: 0xf0c8a0, hair: 0xd8b060, hairStyle: 'long', top: 0x4a8ad0, bottom: 0x3a3a4a },
    { skin: 0xc68a5a, hair: 0x1a1010, hairStyle: 'wrap', top: 0x6aa86a, bottom: 0x4a3a2a, robe: 0x6aa86a },
    { skin: 0xe0b890, hair: 0x2a1a10, hairStyle: 'short', top: 0x6a6a7a, bottom: 0x2a2a3a, jacket: 0x2a3a5a },
    { skin: 0x5a3a2a, hair: 0x101010, hairStyle: 'bald', top: 0xe8c040, bottom: 0x3a3a4a },
    { skin: 0xd8a878, hair: 0x101010, hairStyle: 'bun', top: 0xb07ad0, bottom: 0x2a2a3a },
    { skin: 0xa87050, hair: 0x2a1a10, hairStyle: 'short', top: 0x3a3a3a, bottom: 0x6a5a4a, beard: 'full' },
    { skin: 0xf0d0b0, hair: 0x8a5a3a, hairStyle: 'long', top: 0xff9a6a, bottom: 0x3a4a6a },
  ][i % 8];
}
const MARC = { skin: 0xe8c0a0, hair: 0x6a4a2a, hairStyle: 'short', top: 0xdde4f0, bottom: 0x3a3a48, jacket: 0x5a4a3a, beard: 'side', seed: 1550 };
const INES = { skin: 0xa86f48, hair: 0x1a1010, hairStyle: 'curly', top: 0xffd040, bottom: 0x3a4a8a, seed: 1560 };
const AICHA = { skin: 0x8a5a3a, hair: 0x2a1a10, hairStyle: 'wrap', top: 0xf0e0f0, bottom: 0x5a6a9a, seed: 1570 };
// rangee de vignettes : la vignette active au centre, les precedentes en petit en bas
function vignetteRow(items, times, center, slotY, spacing, small = 0.32) {
  return (t) => items.forEach((g, i) => {
    const t0 = times[i], t1 = times[i + 1] ?? 1e9;
    if (t < t0 - 0.05) { g.visible = false; return; }
    g.visible = true; fade(g, sstep(t0 - 0.05, t0 + 0.35, t));
    const k = sstep(t1 - 0.1, t1 + 0.35, t);
    const slot = [(i - (items.length - 1) / 2) * spacing, slotY, center[2]];
    g.position.set(lerp(center[0], slot[0], k), lerp(center[1], slot[1], k), lerp(center[2], slot[2], k));
    g.scale.setScalar(lerp(1, small, k));
  });
}

// ---------- chambre de Marc (intro)
SETS.bed = () => {
  const B = base({ bg: 0x1a1a2a, hemi: [0xb0b8d8, 0x2a2430, 0.9], sun: [0xffd0a0, 1.4, [4, 4, -2]], shadowSize: 5, bloom: [0.45, 0.5, 0.85], exposure: 1.35 });
  const { scene, cam } = B;
  scene.add(at(box(8, 0.1, 8, M(0x5a4a5a)), 0, -0.05, 0));
  scene.add(at(box(8, 4, 0.2, M(0x6a7a9a)), 0, 2, -2.2)); scene.add(at(box(0.2, 4, 8, M(0x5a6a8a)), -2.4, 2, 0));
  scene.add(at(box(1.2, 1.4, 0.05, G(0xffd8a8, 1.1)), 1.2, 2.1, -2.08));
  scene.add(at(box(1.7, 0.4, 2.3, M(0x4a3a3a)), -1.2, 0.2, -0.95)); scene.add(at(box(1.7, 0.14, 2.3, M(0xf0ece4)), -1.2, 0.47, -0.95));
  scene.add(at(box(0.8, 0.18, 0.35, M(0xfaf6ff)), -1.2, 0.6, -1.85));
  const blanket = at(box(1.6, 0.16, 1.6, M(0x3a6aa0)), -1.2, 0.62, -0.4); scene.add(blanket);
  scene.add(at(box(0.55, 0.55, 0.45, M(0x6a4a30)), 0.0, 0.27, -1.6));
  const clock = new THREE.Group(); clock.position.set(-0.05, 0.68, -1.5); scene.add(clock);
  clock.add(box(0.32, 0.22, 0.12, M(0xd04a3a))); clock.add(at(box(0.26, 0.15, 0.01, G(0x111111, 1)), 0, 0, 0.061));
  for (const s of [-1, 1]) clock.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), M(0xe0c040)), s * 0.1, 0.14, 0));
  const face = label('7:00', { w: 0.24, h: 0.12, color: '#ff5a4a', font: 'bold 150px Inter' }); face.position.set(0, 0, 0.068); clock.add(face);
  const marc = new Human(MARC); scene.add(marc.root);
  const rig = claudeRig(scene, [0.22, 0.55, -1.75], -0.4, [0, 0, 0]); rig.pr.visible = false; rig.c.g.scale.setScalar(0.5);
  const cMon = card('LUNDI', { w: 0.7, h: 0.24, border: '#ff7a6a', color: '#ffb0a0' }); scene.add(cMon);
  return {
    ...B, update(t) {
      const ring = t > 0.3 && t < 3.0;
      clock.rotation.z = ring ? Math.sin(t * 60) * 0.06 : 0; clock.position.x = -0.05 + (ring ? Math.sin(t * 45) * 0.01 : 0);
      marc.root.position.set(-1.2, 0.62, -0.1); marc.root.rotation.set(-Math.PI / 2, 0, 0);
      const reach = sstep(1.6, 2.6, t);
      marc.pose({ aR: [0.1 + reach * 1.6, 0.1 + reach * 0.9], aL: [0.1, 0.1], hideSkirt: true });
      marc.face(0, 'sad', t); if (t < 1.4) marc.eyes.forEach(e => e.scale.y = 0.15);
      rig.c.update(t, 0, { squint: t < 2.0 }); rig.c.body.rotation.z = t < 2.0 ? 0.25 : Math.sin(t * 1.3) * 0.03;
      fade(cMon, win(t, 0.8, 4.4, 0.3, 0.2)); camCard(cam, cMon, 0.4, -0.55);
      camKeys(cam, t, [{ t: 0, p: [0.5, 1.15, -0.6], l: [-0.1, 0.72, -1.55], f: 40 }, { t: 2.0, p: [0.9, 1.6, 0.9], l: [-0.6, 0.75, -1.2], f: 46 }, { t: 4.3, p: [1.0, 1.7, 1.2], l: [-0.6, 0.75, -1.2], f: 46 }]);
    }
  };
};

// ---------- rue : intro (matin) et arret de bus (Marc)
function streetSet(mode) {
  const B = base({ sky: [0x6aa0e0, 0xf0e8e0, 0xc0d4ea], fog: [0xd0dce8, 25, 110], hemi: [0xffffff, 0x6a6a7a, 1.0], sun: [0xfff0d8, 2.2, [8, 12, 5]], shadowSize: 14, bloom: [0.35, 0.5, 0.9] });
  const { scene, cam } = B;
  scene.add(at(box(80, 0.1, 80, M(0x4a4a52)), 0, -0.05, 0));
  scene.add(at(box(4, 0.12, 80, M(0x2e2e34)), 0, 0.0, 0));
  for (const s of [-1, 1]) scene.add(at(box(2.4, 0.18, 80, M(0x8a8a90)), s * 3.2, 0.05, 0));
  const bcols = [0x8a6a5a, 0x5a6a8a, 0xb0a090, 0x6a5a6a, 0x9a8a7a, 0x4a5a6a];
  for (let i = 0; i < 18; i++) {
    const s = i % 2 ? 1 : -1, z = -Math.floor(i / 2) * 5 + 6, h = 6 + hash(i) * 10, w = 4.2;
    const b = at(box(w, h, 4.5, M(bcols[i % 6])), s * (4.4 + w / 2), h / 2, z); b.castShadow = true; scene.add(b);
    for (let fy = 1.5; fy < h - 0.5; fy += 1.4) for (let fz = -1.6; fz <= 1.6; fz += 1.1) scene.add(at(box(0.05, 0.7, 0.6, M(0x9ab0c8)), s * 4.38, fy, z + fz));
  }
  // arret de bus
  const stop = new THREE.Group(); stop.position.set(3.4, 0.12, -2); scene.add(stop); stop.visible = mode === 'marc';
  stop.add(at(box(0.08, 2.3, 0.08, M(0x333338)), -0.9, 1.15, -0.4)); stop.add(at(box(0.08, 2.3, 0.08, M(0x333338)), 0.9, 1.15, -0.4));
  stop.add(at(box(2.0, 0.06, 0.9, M(0x3a3a42)), 0, 2.3, 0)); stop.add(at(box(1.9, 1.6, 0.04, M(0xa8c8e0, { transparent: true, opacity: 0.4 })), 0, 1.2, -0.42));
  stop.add(at(box(1.4, 0.06, 0.4, M(0x6a5a4a)), 0, 0.45, -0.2)); stop.add(at(box(0.5, 0.25, 0.04, G(0xffd040, 1.2)), 0.6, 2.05, 0.2));
  const bus = new THREE.Group(); bus.add(at(box(2.4, 2.6, 9, M(0x2a8a5a)), 0, 1.5, 0)); bus.add(at(box(2.45, 0.9, 8.8, M(0x1a2a3a)), 0, 2.0, 0));
  for (const z of [-3, 3]) for (const x of [-1.2, 1.2]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 12), M(0x111111)); w.rotation.z = Math.PI / 2; w.position.set(x, 0.45, z); bus.add(w); }
  bus.traverse(m => { if (m.isMesh) m.castShadow = true; }); scene.add(bus);
  const ppl = []; for (let i = 0; i < 8; i++) { const h = new Human({ ...looks(i), seed: 1400 + i }); scene.add(h.root); ppl.push(h); }
  const marc = new Human(MARC); scene.add(marc.root);
  const ines = new Human(INES); scene.add(ines.root); ines.root.visible = mode === 'intro';
  const rig = claudeRig(scene, [3.78, 0.6, -2.25], -0.5, [0.27, 0, 0.12], 0x55e6ff, 0.45, 0.3); rig.c.g.scale.setScalar(0.55); rig.c.g.visible = rig.pr.visible = mode === 'marc';
  const hg = rig.holoG;
  // holo : horloge + avion (jet lag social)
  const clockH = new THREE.Group(); hg.add(clockH);
  clockH.add(new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.02, 6, 32), G(0x55e6ff, 1.6)));
  const hand1 = at(box(0.02, 0.2, 0.01, G(0xffffff, 1.6)), 0, 0.1, 0), hand2 = at(box(0.02, 0.14, 0.01, G(0xffd070, 1.6)), 0, 0.07, 0);
  const pv1 = new THREE.Group(), pv2 = new THREE.Group(); pv1.add(hand1); pv2.add(hand2); clockH.add(pv1, pv2);
  const plane = new THREE.Group(); plane.add(box(0.2, 0.03, 0.04, G(0xffffff, 1.4))); plane.add(at(box(0.05, 0.02, 0.22, G(0xffffff, 1.4)), 0.02, 0, 0)); hg.add(plane);
  const cJet = card('JET LAG SOCIAL\nl\'horloge du corps est décalée', { w: 1.6, h: 0.42, border: '#55e6ff', small: true }); scene.add(cJet);
  const cSun = card('DIMANCHE SOIR\nl\'angoisse arrive avant le lundi', { w: 1.6, h: 0.42, border: '#b08aff', small: true }); scene.add(cSun);
  const cSoc = card('temps libre  |  obligations', { w: 1.6, h: 0.3, border: '#ffd070' }); scene.add(cSoc);
  const cloud = new THREE.Group(); for (let i = 0; i < 5; i++) cloud.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.12 + hash(i) * 0.06, 0), holoMat(0xb08aff, 0.35)), (i - 2) * 0.12, Math.sin(i) * 0.05, 0)); scene.add(cloud);
  const q = label('LUN. 7:45', { w: 0.6, h: 0.18, color: '#ff8a7a', font: 'bold 120px Inter' }); scene.add(q);
  return {
    ...B, update(t) {
      const tb = mode === 'intro' ? t : t - SC.marc.start;
      ppl.forEach((h, i) => { const dir = i % 2 ? 1 : -1; const lane = i % 4 < 2 ? -(2.7 + hash(i) * 0.9) : 2.15 + hash(i) * 0.3; const z = ((dir * t * 1.0 + i * 4.7) % 36 + 36) % 36 - 26; h.place(lane, 0.12, z, dir > 0 ? 0 : Math.PI); h.pose(L.walkPose(t * 5 + i, 0.8, { hp: 0.35, lean: 0.1 })); h.face(0, 'sad', t); });
      if (mode === 'intro') {
        bus.position.set(1.0, 0, -30);
        marc.place(-2.9, 0.12, 1.5 - tb * 0.9, Math.PI); marc.pose(L.walkPose(t * 5, 0.8, { hp: 0.4, lean: 0.12 })); marc.face(0, 'sad', t);
        ines.place(2.7, 0.12, -3.0 + tb * 0.9, 0); ines.pose(L.walkPose(t * 6, 1, { aR: [2.6 * sstep(6.4, 6.9, t), 0.4], eR: 0.3 })); ines.face(0, 'joy', t);
        camKeys(cam, t, [{ t: 4.3, p: [1.0, 1.5, 7.5], l: [1.4, 1.3, -2], f: 48 }, { t: 6.5, p: [1.6, 1.5, 5.0], l: [2.6, 1.3, -0.5], f: 46 }, { t: SC.genesis.start, p: [1.8, 1.7, 5.8], l: [2.6, 1.7, 0.5], f: 48 }]);
        [cJet, cSun, cSoc, cloud, q].forEach(o => o.visible = false); hg.visible = false;
      } else {
        // le bus part sans Marc
        const bz = -2 - Math.max(0, tb - 1.0) ** 2 * 1.6; bus.position.set(1.0, 0, bz);
        const run = tb < 3.6; const mz = run ? 6 - tb * 2.2 : -1.9;
        if (run) { marc.place(3.2, 0.12, mz, Math.PI); marc.pose(L.walkPose(t * 9, 1.4, { aR: [1.4 + 0.3 * Math.sin(t * 9), 0.3], eR: 0.2 })); }
        else { marc.place(3.4, 0.12, -2.2, 0.15); marc.pose(L.sitPose(0.45, { aL: [0.5, 0.1], aR: [0.5, 0.1], eL: 1.2, eR: 1.2, hp: 0.35, lean: 0.25 })); }
        marc.face(env('marc', t), 'sad', t);
        const hk = win(t, C.why + 0.2, SC.myths.start + 0.5, 0.5, 0.2); beamOn(rig, hk, t); hg.visible = hk > 0.01; fade(hg, hk);
        const jk = win(t, C.why + 0.4, C.psy, 0.4, 0.3); fade(clockH, jk); fade(plane, jk);
        pv1.rotation.z = -t * 6; pv2.rotation.z = -t * 0.8; plane.position.set(Math.cos(t * 2) * 0.42, 0.1 + Math.sin(t * 2) * 0.12, Math.sin(t * 2) * 0.42); plane.rotation.y = -t * 2;
        fade(cJet, win(t, S[25].start - 0.3, C.psy, 0.3, 0.3)); fade(cSun, win(t, C.psy + 0.5, S[27].start, 0.3, 0.3)); fade(cSoc, win(t, S[27].start + 0.3, SC.myths.start, 0.3, 0.3));
        fade(cloud, win(t, C.psy + 0.3, S[27].start, 0.4, 0.3)); cloud.position.set(3.35, 1.6 + Math.sin(t * 2) * 0.03, -2.0);
        fade(q, win(t, SC.marc.start, SC.marc.start + 3.5, 0.3, 0.3));
        rig.c.update(t, env('claude', t), {});
        camKeys(cam, t, [
          { t: SC.marc.start, p: [1.7, 1.5, 9.5], l: [3.0, 1.1, 1], f: 48 },
          { t: S[23].start, p: [1.8, 1.5, 3.2], l: [3.2, 1.1, -2.2], f: 46 },
          { t: C.why, p: [2.6, 1.4, 1.2], l: [3.75, 1.05, -2.15], f: 46 },
          { t: S[27].start, p: [2.7, 1.45, 1.0], l: [3.75, 1.05, -2.15], f: 46 },
          { t: SC.myths.start, p: [2.6, 1.55, 1.6], l: [3.75, 1.05, -2.15], f: 46 },
        ]);
        q.position.set(3.4, 2.75, -1.6); q.scale.setScalar(1.4); q.quaternion.copy(cam.quaternion);
        for (const c of [cJet, cSun, cSoc]) camCard(cam, c, 0.82, 0.3);
      }
    }
  };
}
SETS.street = () => streetSet('intro');
SETS.marc = () => streetSet('marc');

// ---------- studio (Genese, ciel, noms, week-end, mythes, conseils)
SETS.studio = () => {
  const B = base({ bg: 0x05070f, fog: [0x05070f, 8, 30], hemi: [0x6a7ab0, 0x0a0a14, 0.7], sun: [0xffffff, 1.0, [2, 5, 4]], shadow: false, bloom: [0.4, 0.5, 0.85] });
  const { scene, cam } = B;
  const grid = new THREE.GridHelper(40, 40, new THREE.Color(0x3a8aff).multiplyScalar(1.3), new THREE.Color(0x3a8aff).multiplyScalar(0.4)); scene.add(grid);
  const rig = claudeRig(scene, [-0.95, 0, 1.5], 0.35, [0.6, 0, -0.2], 0x55e6ff, 0.5, 0.3); rig.pr.visible = false;
  const groups = {}; const G0 = (k) => { const g = new THREE.Group(); scene.add(g); groups[k] = g; return g; };
  const cards = []; const K = (text, o, show, yf = 0.3, frac = 0.82) => { const c = card(text, o); scene.add(c); cards.push([c, show, yf, frac]); return c; };
  const CEN = [0.15, 1.75, 0];

  // ===== GENESE
  const gen = G0('genesis');
  const book = new THREE.Group(); gen.add(book); book.position.set(...CEN);
  for (const s of [-1, 1]) { const p = box(0.55, 0.04, 0.75, M(0xf0e8d0, { emissive: new THREE.Color(0x3a3020) })); p.position.set(s * 0.28, 0, 0); p.rotation.z = -s * 0.15; book.add(p); }
  book.add(at(box(1.15, 0.03, 0.8, M(0x6a3a2a)), 0, -0.04, 0)); book.rotation.x = 0.9;
  const bookGlow = glowOrb(0.12, 0xfff0c0, 2.2); bookGlow.position.set(0, 0.25, 0); book.add(bookGlow);
  const D = [];
  { const g = new THREE.Group(); g.add(glowOrb(0.28, 0xfff6e0, 2.2)); const dark = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12, Math.PI, Math.PI), M(0x111122)); g.add(dark); for (let i = 0; i < 12; i++) { const r = box(0.03, 0.7, 0.02, holoMat(0xfff0c0, 0.3)); const pv = new THREE.Group(); r.position.y = 0.55; pv.add(r); pv.rotation.z = i / 12 * Math.PI * 2; g.add(pv); } D.push(g); }
  { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), holoMat(0x7ac8ff, 0.25))); for (let i = 0; i < 4; i++) g.add(at(L.makeCloud(i + 3, 0.07, 0xf0f4ff), (i - 1.5) * 0.25, 0.25 + hash(i) * 0.15, 0)); D.push(g); }
  { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.06, 20), M(0x2a6ab0, { emissive: new THREE.Color(0x0a2a50) }))); g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.14, 8), M(0x5aa050)), 0, 0.07, 0)); for (let i = 0; i < 4; i++) g.add(at(tree(i + 30), (hash(i) - 0.5) * 0.4, 0.14, (hash(i + 4) - 0.5) * 0.3)); g.children.slice(2).forEach(c => c.scale.multiplyScalar(0.35)); g.rotation.x = 0.35; D.push(g); }
  { const g = new THREE.Group(); g.add(at(glowOrb(0.22, 0xffb040, 2.0), -0.3, 0.1, 0)); g.add(at(glowOrb(0.12, 0xe8f0ff, 1.6), 0.35, 0.25, 0)); for (let i = 0; i < 14; i++) g.add(at(new THREE.Mesh(new THREE.OctahedronGeometry(0.025, 0), G(0xffffff, 2.5)), (hash(i) - 0.5) * 1.2, (hash(i + 7) - 0.3) * 0.8, -0.2)); D.push(g); }
  const fishes = [], birds = [];
  { const g = new THREE.Group(); g.add(at(box(1.2, 0.02, 0.5, holoMat(0x4aa8ff, 0.35)), 0, -0.15, 0)); for (let i = 0; i < 3; i++) { const f = new THREE.Group(); f.add(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 6), M(0xff9a40))); f.children[0].rotation.z = Math.PI / 2; f.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.07, 3), M(0xff9a40)), 0.12, 0, 0)); g.add(f); fishes.push(f); } for (let i = 0; i < 3; i++) { const b = L.makeBird(0xf2f2f2, 0.35); g.add(b); birds.push(b); } D.push(g); }
  { const g = new THREE.Group(); const el = L.makeAnimal('elephant'); el.scale.setScalar(0.28); el.position.set(-0.45, -0.3, 0); el.rotation.y = 0.8; g.add(el); const gi = L.makeAnimal('giraffe'); gi.scale.setScalar(0.22); gi.position.set(0.5, -0.3, -0.1); gi.rotation.y = -0.6; g.add(gi);
    const h1 = new Human({ skin: 0x9a6a48, hair: 0x1a1010, hairStyle: 'short', top: 0xc8a878, bottom: 0x8a6a48, seed: 1590 }); h1.root.scale.setScalar(0.38); h1.place(-0.07, -0.3, 0.15, 0.2); g.add(h1.root);
    const h2 = new Human({ skin: 0xb88058, hair: 0x2a1a10, hairStyle: 'long', top: 0xc8a878, bottom: 0x8a6a48, robe: 0xc8a878, seed: 1591 }); h2.root.scale.setScalar(0.36); h2.place(0.12, -0.3, 0.15, -0.2); g.add(h2.root); g.userData.h = [h1, h2]; D.push(g); }
  { const g = new THREE.Group(); g.add(glowOrb(0.3, 0xffe8b0, 1.4)); g.add(new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.015, 6, 40), G(0xffe0a0, 1.4))); g.add(new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.01, 6, 40), G(0xffe0a0, 1.0))); D.push(g); }
  D.forEach(g => gen.add(g));
  const dayT = [1, 2, 3].map(k => S[3].start + (k - 1) * (S[3].end - S[3].start) / 3).concat([4, 5, 6].map(k => S[4].start + (k - 4) * (S[4].end - S[4].start) / 3)).concat([C.rest]);
  D[4].scale.setScalar(1); D[4].children.forEach(c => c.scale.multiplyScalar(1.5)); D[5].children.forEach(c => c.scale.multiplyScalar(1.7));
  const dayRow = vignetteRow(D, dayT, CEN, 0.8, 0.34, 0.3);
  const dayLab = ['la lumière', 'le ciel', 'la terre, les mers, les plantes', 'le soleil, la lune, les étoiles', 'les poissons et les oiseaux', 'les animaux et l\'homme', 'le repos'];
  dayLab.forEach((l, i) => K(`JOUR ${i + 1}\n${l}`, { w: 1.6, h: 0.42, border: '#ffe0a0', small: true }, (t) => win(t, dayT[i], dayT[i + 1] ?? SC.sky.start, 0.25, 0.2)));
  K('LA GENÈSE\nle premier livre de la Bible', { w: 1.6, h: 0.42, border: '#ffe0a0', small: true }, (t) => win(t, SC.genesis.start + 0.3, C.days, 0.3, 0.2));
  K('Genèse 2, 2-3', { w: 0.9, h: 0.22, border: '#ffe0a0' }, (t) => win(t, C.rest + 2.5, SC.sky.start, 0.3, 0.2), -0.62, 0.45);

  // ===== CIEL : Babylone, astres, cycles, echecs
  const sky = G0('sky');
  const zig = new THREE.Group(); zig.position.set(0.15, 0.5, 0); sky.add(zig);
  for (let i = 0; i < 4; i++) zig.add(at(holo(new THREE.BoxGeometry(1.2 - i * 0.26, 0.22, 1.0 - i * 0.22), 0xffc070, 0.15), 0, i * 0.22, 0));
  const astres = [['Soleil', 0xffb040, 0.14], ['Lune', 0xe8f0ff, 0.09], ['Mars', 0xff5a3a, 0.07], ['Mercure', 0x9ad0ff, 0.06], ['Jupiter', 0xffc890, 0.11], ['Vénus', 0xffa0d0, 0.08], ['Saturne', 0xe0d090, 0.1]];
  const astroG = astres.map(([n, c, r], i) => { const g = new THREE.Group(); g.add(glowOrb(r, c, 1.8)); if (n === 'Saturne') { const ri = new THREE.Mesh(new THREE.TorusGeometry(r * 1.7, 0.012, 4, 24), G(c, 1.5)); ri.rotation.x = 1.2; g.add(ri); } const a = Math.PI * (0.92 - i / 6 * 0.84); g.position.set(0.15 + Math.cos(a) * 1.15, 1.55 + Math.sin(a) * 0.75, 0); const lb = label(n, { w: 0.5, h: 0.12, color: '#ffffff', font: 'bold 80px Inter' }); lb.position.y = -0.18; g.add(lb); sky.add(g); return g; });
  const phases = new THREE.Group(); phases.position.set(0.15, 0.75, 0.3); sky.add(phases);
  for (let i = 0; i < 4; i++) { const g = new THREE.Group(); g.position.x = (i - 1.5) * 0.36; g.add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), M(0x222230))); if (i > 0) { const lit = new THREE.Mesh(new THREE.SphereGeometry(0.122, 12, 8, i === 2 ? 0 : (i === 1 ? -Math.PI / 2 : Math.PI / 2), i === 2 ? Math.PI * 2 : Math.PI), G(0xe8f0ff, 1.5)); g.add(lit); } phases.add(g); }
  const orrery = new THREE.Group(); orrery.position.set(0.15, 1.55, 0); sky.add(orrery);
  orrery.add(glowOrb(0.2, 0xffb040, 2.0));
  const earthPiv = new THREE.Group(); orrery.add(earthPiv); const earth = new THREE.Group(); earth.position.x = 0.85; earthPiv.add(earth);
  const eb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 1), M(0x3a7ad0, { emissive: new THREE.Color(0x0a2040) })); earth.add(eb); eb.add(at(box(0.08, 0.06, 0.06, M(0x4aa050)), 0.06, 0.02, 0.04));
  const moonPiv = new THREE.Group(); earth.add(moonPiv); moonPiv.add(at(glowOrb(0.035, 0xe8f0ff, 1.5), 0.24, 0, 0));
  orrery.add(new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.006, 4, 64), G(0x55e6ff, 1.0))); orrery.children[orrery.children.length - 1].rotation.x = Math.PI / 2;
  const qm = label('?', { w: 0.6, h: 0.6, color: '#ff9a70', font: 'bold 300px Inter' }); qm.position.set(0.15, 1.45, 0.2); qm.scale.setScalar(3); sky.add(qm);
  const cal = (n, c, y) => { const g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(at(box(0.18, 0.18, 0.02, holoMat(c, 0.5)), (i - (n - 1) / 2) * 0.21, 0, 0)); g.position.set(0.15, y, 0); sky.add(g); return g; };
  const cal10 = cal(10, 0x9ab0ff, 1.85), cal5 = cal(5, 0xff7a6a, 1.35), cal6 = cal(6, 0xff7a6a, 1.35), cal7 = cal(7, 0x7dffb0, 0.75);
  const x1 = new THREE.Group(); for (const s of [-1, 1]) { const b = box(2.2, 0.04, 0.02, G(0xff4a3a, 1.6)); b.rotation.z = s * 0.15; x1.add(b); } x1.position.set(0.15, 1.85, 0.05); sky.add(x1);
  const x2 = x1.clone(); x2.position.y = 1.35; x2.scale.x = 0.6; sky.add(x2);
  K('BABYLONE\nil y a plus de 4 000 ans', { w: 1.6, h: 0.42, border: '#ffc070', small: true }, (t) => win(t, SC.sky.start + 0.3, S[7].start + 0.2, 0.3, 0.2));
  K('7 astres mobiles dans le ciel', { w: 1.6, h: 0.3, border: '#ffc070' }, (t) => win(t, S[7].start + 0.3, S[7].end - 3.2, 0.3, 0.2));
  K('la Lune : une phase ≈ 7 jours', { w: 1.6, h: 0.3, border: '#e8f0ff' }, (t) => win(t, S[7].end - 3.2, C.cycles, 0.3, 0.2));
  const c3 = (S[8].end - S[8].start) / 3;
  K('JOUR\nla Terre tourne sur elle-même', { w: 1.6, h: 0.42, border: '#55e6ff', small: true }, (t) => win(t, C.cycles + 1.5, C.cycles + c3 + 0.8, 0.3, 0.2));
  K('MOIS\n≈ le cycle de la Lune', { w: 1.6, h: 0.42, border: '#e8f0ff', small: true }, (t) => win(t, C.cycles + c3 + 0.8, C.cycles + 2 * c3 + 0.5, 0.3, 0.2));
  K('AN\nle tour du Soleil', { w: 1.6, h: 0.42, border: '#ffb040', small: true }, (t) => win(t, C.cycles + 2 * c3 + 0.5, S[9].start, 0.3, 0.2));
  K('SEMAINE\nune invention humaine', { w: 1.6, h: 0.42, border: '#ff9a70', small: true }, (t) => win(t, S[9].start + 0.3, C.fails, 0.3, 0.2));
  K('1793 · France : 10 jours', { w: 1.6, h: 0.3, border: '#9ab0ff' }, (t) => win(t, C.fails + 0.3, C.fails + 3.2, 0.3, 0.2));
  K('1929 · URSS : 5, puis 6 jours', { w: 1.6, h: 0.3, border: '#ff7a6a' }, (t) => win(t, C.fails + 3.2, C.fails + 6.4, 0.3, 0.2));
  K('ÉCHEC → retour à 7 jours', { w: 1.6, h: 0.3, border: '#7dffb0' }, (t) => win(t, C.fails + 6.4, SC.names.start, 0.3, 0.2));

  // ===== NOMS DES JOURS
  const nm = G0('names');
  const col = new THREE.Group(); col.position.set(0.15, 0.6, 0); nm.add(col);
  col.add(holo(new THREE.CylinderGeometry(0.16, 0.18, 1.6, 10), 0xe8e0c8, 0.15)); col.children[0].position.y = 0.8; col.add(at(holo(new THREE.BoxGeometry(0.5, 0.12, 0.5), 0xe8e0c8, 0.15), 0, 1.65, 0)); col.add(at(holo(new THREE.BoxGeometry(0.5, 0.12, 0.5), 0xe8e0c8, 0.15), 0, 0, 0));
  function god(c, kind) {
    const h = holoFig(c, { robe: kind === 'venus' || kind === 'luna', hair: kind === 'venus' || kind === 'luna' ? 'long' : 'short', beard: kind === 'jupiter' || kind === 'thor' ? 'full' : undefined, s: 0.55, op: 0.35 });
    const m = G(c, 1.6);
    if (kind === 'mars') { h.neck.add(at(box(0.05, 0.12, 0.3, m), 0, 0.37, 0)); const sp = box(0.03, 1.3, 0.03, m); sp.position.y = 0.2; h.hand.R.add(sp); const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 12), m); sh.rotation.x = Math.PI / 2; sh.position.set(0, 0, 0.08); h.hand.L.add(sh); }
    if (kind === 'mercury') { for (const s of [-1, 1]) { const w = box(0.04, 0.12, 0.16, m); w.position.set(s * 0.17, 0.25, -0.02); w.rotation.z = s * -0.5; h.neck.add(w); } const st = box(0.025, 0.8, 0.025, m); st.position.y = 0.2; h.hand.R.add(st); }
    if (kind === 'jupiter') { for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; h.neck.add(at(box(0.04, 0.09, 0.04, m), Math.cos(a) * 0.12, 0.36, Math.sin(a) * 0.12)); } const bolt = new THREE.Group(); bolt.add(L.beam([0, 0, 0], [0.08, 0.15, 0], 0.03, m)); bolt.add(L.beam([0.08, 0.15, 0], [-0.02, 0.22, 0], 0.03, m)); bolt.add(L.beam([-0.02, 0.22, 0], [0.06, 0.4, 0], 0.03, m)); h.hand.R.add(bolt); }
    if (kind === 'venus') { const fl = new THREE.Group(); for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(new THREE.OctahedronGeometry(0.04, 0), G(0xff9ad0, 2)); p.position.set(Math.cos(i * 1.26) * 0.05, 0.08 + Math.sin(i * 1.26) * 0.05, 0.05); fl.add(p); } h.hand.R.add(fl); }
    if (kind === 'luna') { const cr = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 16, Math.PI * 1.3), m); cr.position.set(0, 0.42, 0); cr.rotation.z = 2.2; h.neck.add(cr); }
    if (kind === 'thor') { const hm = new THREE.Group(); hm.add(at(box(0.03, 0.25, 0.03, M(0x8a6a4a)), 0, 0, 0)); hm.add(at(box(0.16, 0.1, 0.1, m), 0, 0.15, 0)); hm.position.y = -0.05; h.hand.R.add(hm); }
    return h;
  }
  const dayDefs = [['luna', 0xe8f0ff, 'LUNDI\nLunae dies · la Lune'], ['mars', 0xff5a3a, 'MARDI\nMartis dies · Mars'], ['mercury', 0x9ad0ff, 'MERCREDI\nMercurii dies · Mercure'], ['jupiter', 0xffc070, 'JEUDI\nJovis dies · Jupiter'], ['venus', 0xffa0d0, 'VENDREDI\nVeneris dies · Vénus']];
  const NV = dayDefs.map(([k, c], i) => { const g = new THREE.Group(); const gd = god(c, k); gd.place(0.12, -0.45, 0, 0); g.add(gd.root); g.userData.god = gd; const orb = glowOrb(0.12, c, 1.8); orb.position.set(0.55, 0.55, -0.1); g.add(orb); nm.add(g); return g; });
  // samedi : bougies du Shabbat ; dimanche : lever de soleil et croix
  const sat = new THREE.Group(); nm.add(sat); for (const s of [-1, 1]) { sat.add(at(box(0.08, 0.36, 0.08, M(0xf8f0e0, { emissive: new THREE.Color(0x2a2010) })), s * 0.18, -0.1, 0)); sat.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.13, 6), G(0xffc060, 2.4)), s * 0.18, 0.16, 0)); } sat.add(at(box(0.7, 0.05, 0.3, holoMat(0xe8e0ff, 0.3)), 0, -0.3, 0));
  const sun = new THREE.Group(); nm.add(sun); sun.add(at(glowOrb(0.3, 0xffd890, 1.6), 0, -0.1, -0.2)); const sx = symCross(0xfff0c0); sx.position.set(0, 0.25, 0.1); sun.add(sx); for (let i = 0; i < 10; i++) { const r = box(0.03, 0.5, 0.02, holoMat(0xffd890, 0.3)); const pv = new THREE.Group(); r.position.y = 0.55; pv.add(r); pv.rotation.z = (i - 4.5) * 0.3; pv.position.set(0, -0.1, -0.2); sun.add(pv); }
  const thorG = new THREE.Group(); nm.add(thorG); { const gd = god(0x9ad0ff, 'thor'); gd.place(0, -0.45, 0, 0); thorG.add(gd.root); thorG.userData.god = gd; }
  const nameItems = [...NV, sat, sun];
  const nameT = [12, 13, 14, 15, 16].map(i => S[i].start).concat([C.samedi + 1.6, S[18].start, C.thor]);
  const nameRow = vignetteRow(nameItems, nameT, CEN, 0.8, 0.34, 0.3);
  dayDefs.forEach(([k, c, txt], i) => K(txt, { w: 1.6, h: 0.42, border: '#' + c.toString(16).padStart(6, '0'), small: true }, (t) => win(t, nameT[i], nameT[i + 1], 0.25, 0.2)));
  K('LATIN : dies = jour', { w: 1.4, h: 0.3, border: '#e8e0c8' }, (t) => win(t, SC.names.start + 0.3, C.lundi, 0.3, 0.2));
  K('SAMEDI\nsambati dies · le Shabbat', { w: 1.6, h: 0.42, border: '#e8e0ff', small: true }, (t) => win(t, nameT[5], S[18].start, 0.3, 0.2));
  K('DIMANCHE\ndies dominicus · le jour du Seigneur', { w: 1.6, h: 0.42, border: '#ffd890', small: true }, (t) => win(t, S[18].start, C.thor, 0.3, 0.2));
  K('THURSDAY = Thor\'s day', { w: 1.5, h: 0.3, border: '#9ad0ff' }, (t) => win(t, C.thor + 0.3, SC.weekend.start, 0.3, 0.2));

  // ===== WEEK-END
  const we = G0('weekend');
  const consta = holoFig(0xffe0a0, { robe: true, s: 0.75, op: 0.35, seed: 1600 }); consta.place(0.15, 0.6, 0, 0); we.add(consta.root);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; consta.neck.add(at(new THREE.Mesh(new THREE.OctahedronGeometry(0.035, 0), G(0x9aff9a, 1.6)), Math.cos(a) * 0.14, 0.31, Math.sin(a) * 0.14)); }
  const doc = new THREE.Group(); we.add(doc); doc.add(box(0.55, 0.75, 0.02, M(0xf4ecd8, { emissive: new THREE.Color(0x3a3020) }))); for (let i = 0; i < 6; i++) doc.add(at(box(0.4, 0.025, 0.01, M(0x5a4a3a)), 0, 0.25 - i * 0.09, 0.015)); doc.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 12), M(0xc03a3a)), 0.15, -0.28, 0.02)); doc.children[doc.children.length - 1].rotation.x = Math.PI / 2; doc.position.set(0.15, 1.5, 0);
  const fac = new THREE.Group(); fac.position.set(-0.2, 0.55, -0.3); we.add(fac);
  fac.add(at(holo(new THREE.BoxGeometry(1.0, 0.5, 0.5), 0x9ab0ff, 0.15), 0, 0.25, 0)); for (let i = 0; i < 3; i++) fac.add(at(holo(new THREE.ConeGeometry(0.2, 0.2, 4), 0x9ab0ff, 0.15), -0.33 + i * 0.33, 0.6, 0)); fac.add(at(holo(new THREE.CylinderGeometry(0.06, 0.07, 0.6, 8), 0x9ab0ff, 0.15), 0.4, 0.8, 0));
  const car = new THREE.Group(); car.add(at(box(0.5, 0.14, 0.24, M(0x1a1a1a)), 0, 0.14, 0)); car.add(at(box(0.25, 0.16, 0.22, M(0x1a1a1a)), -0.05, 0.3, 0)); for (const x of [-0.17, 0.17]) for (const z of [-0.13, 0.13]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 10), M(0x444444)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.07, z); car.add(w); } car.position.set(0.7, 0.55, 0.3); we.add(car);
  const week = new THREE.Group(); week.position.set(0.15, 1.75, 0.1); we.add(week);
  const wkC = []; 'LMMJVSD'.split('').forEach((d, i) => { const g = new THREE.Group(); g.position.x = (i - 3) * 0.3; const bx = box(0.26, 0.26, 0.02, holoMat(0x9ab0ff, 0.45)); g.add(bx); const lb = label(d, { w: 0.2, h: 0.2, color: '#ffffff', font: 'bold 160px Inter' }); lb.position.z = 0.02; g.add(lb); week.add(g); wkC.push(bx); });
  K('321 · Constantin\nle dimanche devient jour de repos', { w: 1.7, h: 0.42, border: '#ffe0a0', small: true }, (t) => win(t, SC.weekend.start + 0.3, SC.weekend.start + 4.4, 0.3, 0.2));
  K('1906 · France\n1 jour de repos par semaine', { w: 1.6, h: 0.42, border: '#f4ecd8', small: true }, (t) => win(t, SC.weekend.start + 4.4, C.ford, 0.3, 0.2));
  K('1926 · Henry Ford\nsamedi + dimanche = le week-end', { w: 1.7, h: 0.42, border: '#7dffb0', small: true }, (t) => win(t, C.ford + 0.3, C.ford + 5.0, 0.3, 0.2));
  K('LUNDI = le jour de la rentrée', { w: 1.6, h: 0.3, border: '#ff7a6a' }, (t) => win(t, C.ford + 5.0, SC.marc.start, 0.3, 0.2));

  // ===== MYTHES
  const my = G0('myths');
  const blue = card('BLUE MONDAY', { w: 2.2, h: 0.55, border: '#5a8aff', color: '#9ab8ff', bg: 'rgba(10,20,60,0.85)' }); blue.position.set(0.1, 1.9, 0); my.add(blue);
  const stamp = card('PUBLICITÉ · 2005', { w: 1.6, h: 0.38, border: '#ff4a3a', color: '#ff6a5a', bg: 'rgba(40,0,0,0.5)' }); stamp.position.set(0.25, 1.45, 0.05); stamp.rotation.z = 0.18; my.add(stamp);
  const chart = new THREE.Group(); chart.position.set(0.15, 0.55, 0); my.add(chart);
  const vals = [0.62, 0.64, 0.64, 0.65, 0.72, 0.9, 0.86]; const bars = vals.map((v, i) => { const g = new THREE.Group(); g.position.x = (i - 3) * 0.3; const b = box(0.2, 1, 0.1, G(i >= 5 ? 0x7dffb0 : (i === 0 ? 0xff9a70 : 0x5a8aff), 1.1)); b.position.y = 0.5; g.add(b); g.userData.b = b; g.userData.v = v; const lb = label('LMMJVSD'[i], { w: 0.2, h: 0.2, color: '#ffffff', font: 'bold 160px Inter' }); lb.position.set(0, -0.14, 0.06); g.add(lb); chart.add(g); return g; });
  K('Gallup · plus de 300 000 Américains\nhumeur selon le jour (schéma simplifié)', { w: 1.8, h: 0.42, border: '#5a8aff', small: true }, (t) => win(t, C.gallup + 0.3, S[30].start + 3.5, 0.3, 0.2));
  K('le vrai effet : le week-end', { w: 1.6, h: 0.3, border: '#7dffb0' }, (t) => win(t, S[30].start + 0.2, S[30].start + 3.6, 0.3, 0.2), -0.62, 0.7);
  K('le lundi paraît pire… dans nos souvenirs', { w: 1.8, h: 0.3, border: '#ff9a70' }, (t) => win(t, S[30].start + 3.8, SC.lovers.start, 0.3, 0.2));

  // ===== CONSEILS
  const tp = G0('tips');
  const tipC = ['1 · mêmes heures de sommeil', '2 · prépare ta semaine vendredi', '3 · un petit plaisir le lundi'].map((s, i) => { const c = card(s, { w: 1.9, h: 0.3, border: ['#55e6ff', '#ffd070', '#7dffb0'][i] }); scene.add(c); return c; });
  const qT = label('?', { w: 0.6, h: 0.6, color: '#ff9a70', font: 'bold 300px Inter' }); qT.position.set(-0.95, 1.05, 1.5); tp.add(qT);

  const sceneOf = (t) => t < SC.sky.start ? 'genesis' : t < SC.names.start ? 'sky' : t < SC.weekend.start ? 'names' : t < SC.marc.start ? 'weekend' : t < SC.lovers.start ? 'myths' : 'tips';
  return {
    ...B, update(t) {
      const sn = sceneOf(t);
      for (const k in groups) groups[k].visible = k === sn;
      // genese
      fade(book, win(t, SC.genesis.start + 0.2, C.days, 0.4, 0.3)); book.rotation.y = Math.sin(t) * 0.2;
      if (sn === 'genesis') {
        dayRow(t);
        D[0].rotation.z = t * 0.2; D[1].rotation.y = t * 0.3; D[2].rotation.y = t * 0.4; D[3].rotation.y = Math.sin(t) * 0.3;
        fishes.forEach((f, i) => { const a = t * 1.5 + i * 2.1; f.position.set(Math.cos(a) * 0.4, -0.2, Math.sin(a) * 0.15); f.rotation.y = -a + Math.PI / 2; });
        birds.forEach((b, i) => { const a = t * 1.2 + i * 2.1; b.position.set(Math.cos(a) * 0.45, 0.35 + Math.sin(a * 2) * 0.05, Math.sin(a) * 0.2); b.rotation.y = -a; b.userData.flap?.(t + i); });
        D[5].userData.h.forEach((h, i) => { h.root.position.y = -0.5; h.pose({ aL: [0.2, 0.15], aR: [0.2, 0.15] }); h.face(0, 'happy', t); });
        D[6].rotation.z = t * 0.1; D[6].children[1].rotation.x = t * 0.5;
      }
      // ciel
      if (sn === 'sky') {
        fade(zig, win(t, SC.sky.start + 0.2, S[7].end - 3.2, 0.4, 0.3));
        astroG.forEach((g, i) => fade(g, win(t, S[7].start + i * 0.6, C.cycles, 0.3, 0.3)));
        fade(phases, win(t, S[7].end - 3.2, C.cycles, 0.3, 0.3));
        fade(orrery, win(t, C.cycles + 0.2, S[9].start + 0.2, 0.4, 0.3)); earthPiv.rotation.y = t * 0.5; eb.rotation.y = t * 3; moonPiv.rotation.y = t * 2;
        fade(qm, win(t, S[9].start + 0.2, C.fails, 0.4, 0.3)); qm.rotation.y = Math.sin(t * 2) * 0.3;
        fade(cal10, win(t, C.fails + 0.3, C.fails + 6.6, 0.3, 0.3)); fade(cal5, win(t, C.fails + 3.2, C.fails + 4.8, 0.3, 0.2)); fade(cal6, win(t, C.fails + 4.8, C.fails + 6.6, 0.2, 0.3));
        fade(x1, win(t, C.fails + 2.4, C.fails + 6.6, 0.2, 0.3)); fade(x2, win(t, C.fails + 5.6, C.fails + 6.6, 0.2, 0.3)); fade(cal7, sstep(C.fails + 6.4, C.fails + 6.9, t));
      }
      // noms
      if (sn === 'names') {
        fade(col, win(t, SC.names.start + 0.2, C.lundi, 0.4, 0.3));
        nameRow(t); NV.forEach(g => { g.userData.god.pose({ aL: [0.3, 0.2], aR: [0.9, 0.2], eR: 0.6 }); });
        sun.children[0].scale.setScalar(1 + 0.05 * Math.sin(t * 2));
        fade(thorG, win(t, C.thor + 0.2, SC.weekend.start, 0.3, 0.3)); thorG.position.set(...CEN); thorG.userData.god.pose({ aR: [2.4, 0.3], eR: 0.3 });
      }
      // week-end
      if (sn === 'weekend') {
        const t4 = SC.weekend.start + 4.4;
        fade(consta.root, win(t, SC.weekend.start + 0.2, t4, 0.4, 0.3)); consta.pose({ aR: [0.9, 0.2], aL: [0.3, 0.2] });
        fade(doc, win(t, t4, C.ford, 0.3, 0.3)); doc.rotation.y = Math.sin(t) * 0.3;
        fade(fac, win(t, C.ford + 0.2, SC.marc.start, 0.4, 0.3)); fade(car, win(t, C.ford + 0.2, SC.marc.start, 0.4, 0.3)); car.position.x = 0.9 - ((t - C.ford) * 0.25) % 1.6;
        fade(week, win(t, C.ford + 0.5, SC.marc.start, 0.4, 0.3));
        wkC.forEach((b, i) => { const on = i >= 5 && t > C.ford + 2.0; const mon = i === 0 && t > C.ford + 5.0; b.material.color.set(mon ? 0xff6a5a : on ? 0x7dffb0 : 0x9ab0ff); });
      }
      // mythes
      if (sn === 'myths') {
        fade(blue, win(t, SC.myths.start + 0.2, C.gallup, 0.4, 0.3)); fade(stamp, win(t, SC.myths.start + 4.5, C.gallup, 0.15, 0.3)); stamp.scale.setScalar(1 + 0.4 * (1 - sstep(SC.myths.start + 4.5, SC.myths.start + 4.8, t)));
        fade(chart, win(t, C.gallup + 0.2, SC.lovers.start, 0.4, 0.3));
        bars.forEach((g, i) => { const k = sstep(C.gallup + 0.3 + i * 0.15, C.gallup + 1.3 + i * 0.15, t); g.userData.b.scale.y = Math.max(0.001, g.userData.v * 1.1 * k); g.userData.b.position.y = g.userData.v * 1.1 * k / 2; });
      }
      // conseils
      if (sn === 'tips') {
        const tt = (S[35].end - S[35].start);
        tipC.forEach((c, i) => fade(c, sstep(S[35].start + 0.3 + i * tt * 0.3, S[35].start + 0.7 + i * tt * 0.3, t)));
        fade(qT, sstep(C.question, C.question + 0.4, t));
      }
      rig.c.update(t, env('claude', t), { wave: t > S[37].start ? 1 : 0, armsUp: sn === 'genesis' && t > C.rest && t < C.rest + 1.5 ? 0.5 : 0 });
      const k0 = { genesis: SC.genesis.start, sky: SC.sky.start, names: SC.names.start, weekend: SC.weekend.start, myths: SC.myths.start, tips: SC.tips.start }[sn];
      if (sn === 'tips') camKeys(cam, t, [{ t: k0, p: [0, 2.0, 6.2], l: [0, 1.9, 0], f: 45 }, { t: SC.tips.end + 2, p: [-0.1, 1.9, 5.6], l: [-0.1, 1.8, 0], f: 45 }]);
      else camKeys(cam, t, [{ t: k0, p: [0.3, 2.0, 6.6], l: [0.1, 1.95, 0], f: 45 }, { t: k0 + 6, p: [0, 2.0, 6.2], l: [0.1, 1.95, 0], f: 45 }, { t: k0 + 30, p: [-0.3, 2.0, 6.0], l: [0.1, 1.95, 0], f: 45 }]);
      if (sn !== 'tips') tipC.forEach(c => c.visible = false); else tipC.forEach((c, i) => camCard(cam, c, 0.8, 0.32 - i * 0.24));
      cards.forEach(([c, show, yf, frac]) => { const v = show(t); fade(c, v); if (v > 0) camCard(cam, c, frac, yf); });
    }
  };
};

// ---------- ceux qui aiment le lundi
SETS.lovers = () => {
  const B = base({ sky: [0x6aa0e0, 0xf8f0e0, 0xc8dcf0], fog: [0xd8e4f0, 25, 110], hemi: [0xffffff, 0x6a7a5a, 1.0], sun: [0xfff0d8, 2.2, [6, 10, 6]], shadowSize: 12, bloom: [0.35, 0.5, 0.9] });
  const { scene, cam } = B;
  scene.add(L.groundPlane(120, 40, 0x6aa060, 0.05, 31));
  // lycee
  const school = new THREE.Group(); school.position.set(0, 0, -6); scene.add(school);
  school.add(at(box(9, 4, 3, M(0xd8c8a8)), 0, 2, 0)); for (let i = -3; i <= 3; i++) for (const y of [1.3, 2.9]) school.add(at(box(0.8, 0.7, 0.05, M(0x6a8ab0)), i * 1.2, y, 1.52));
  school.add(at(box(1.4, 2.0, 0.06, M(0x7a4a2a)), 0, 1.0, 1.53)); const sign = card('LYCÉE', { w: 1.6, h: 0.4, border: '#3a5a8a', color: '#ffffff', bg: 'rgba(30,60,120,0.95)' }); sign.material.depthTest = true; sign.renderOrder = 0; sign.position.set(0, 3.6, 1.6); school.add(sign);
  scene.add(at(box(12, 0.06, 4, M(0x9a9aa0)), 0, 0.03, -3));
  const ines = new Human(INES); scene.add(ines.root);
  const friends = [0, 1, 5].map((k, i) => { const h = new Human({ ...looks(k), seed: 1660 + i }); h.root.scale.setScalar(0.95); scene.add(h.root); return h; });
  // terrasse de cafe (Aicha)
  const cafe = new THREE.Group(); cafe.position.set(30, 0, 0); scene.add(cafe);
  cafe.add(at(box(8, 0.06, 6, M(0xb0a090)), 0, 0.03, 0)); cafe.add(at(box(8, 3.5, 0.3, M(0xe0a070)), 0, 1.75, -2.5)); cafe.add(at(box(8, 0.2, 1.4, M(0xc04a4a)), 0, 2.9, -1.9));
  cafe.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 16), M(0xf0f0f0)), 0, 0.75, 0)); cafe.add(at(box(0.06, 0.75, 0.06, M(0x333333)), 0, 0.375, 0));
  cafe.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.09, 10), M(0xffffff)), 0.15, 0.82, 0.1));
  for (let i = 0; i < 4; i++) cafe.add(at(tree(i + 50), -3.5 + i * 2.3, 0, 2.5));
  const aicha = new Human(AICHA); scene.add(aicha.root);
  const fillA = new THREE.PointLight(0xfff0e0, 3, 6, 1.5); fillA.position.set(30.3, 1.8, -1.2); scene.add(fillA);
  const chair = at(box(0.45, 0.06, 0.45, M(0x6a4a30)), 30.0, 0.46, 0.8); scene.add(chair);
  const cA = card('Aïcha · infirmière\npersonnage imaginé', { w: 1.3, h: 0.36, border: '#f0e0f0', small: true }); scene.add(cA);
  const cI = card('Inès, 15 ans\npersonnage imaginé', { w: 1.2, h: 0.36, border: '#ffd040', small: true }); scene.add(cI);
  const cF = card('L\'EFFET « NOUVEAU DÉPART »\nde bonnes résolutions le lundi', { w: 1.8, h: 0.42, border: '#7dffb0', small: true }); scene.add(cF);
  const calF = new THREE.Group(); 'LMMJVSD'.split('').forEach((d, i) => { const g = new THREE.Group(); g.position.x = (i - 3) * 0.24; g.add(box(0.21, 0.21, 0.02, holoMat(i === 0 ? 0x7dffb0 : 0x9ab0ff, 0.5))); const lb = label(d, { w: 0.18, h: 0.18, color: '#ffffff', font: 'bold 160px Inter' }); lb.position.z = 0.02; g.add(lb); calF.add(g); }); scene.add(calF);
  return {
    ...B, update(t) {
      // Ines court vers ses amis
      const r = sstep(SC.lovers.start + 2.0, S[32].start + 1.2, t);
      ines.place(lerp(-1.5, -0.6, r), 0.06, lerp(0.6, -2.6, r), lerp(2.8, 3.6, r)); ines.pose(r > 0 && r < 1 ? L.walkPose(t * 9, 1.3) : { aL: [2.6, 0.5], aR: [2.6, 0.5], eL: 0.3, eR: 0.3 }); ines.face(env('ines', t), 'joy', t);
      friends.forEach((h, i) => { h.place(0.4 + i * 0.7, 0.06, -3.2 + (i === 1 ? -0.3 : 0), -0.6 - i * 0.2); h.pose(t > S[32].start + 1 ? { aR: [2.4, 0.4], eR: 0.4, aL: [0.2, 0.1] } : { aL: [0.2, 0.1], aR: [0.2, 0.1] }); h.face(0, 'joy', t); });
      // Aicha a la terrasse
      aicha.place(30.0, 0, 0.75, Math.PI); aicha.pose(L.sitPose(0.49, { aR: [1.1, 0.1], eR: 1.2, aL: [0.4, 0.1] })); aicha.face(env('aicha', t), 'happy', t);
      const atC = t >= C.aicha;
      fade(cI, win(t, S[32].start, C.aicha, 0.3, 0.2)); fade(cA, win(t, C.aicha + 0.3, C.fresh, 0.3, 0.2)); fade(cF, win(t, C.fresh + 0.3, SC.tips.start, 0.3, 0.2)); fade(calF, win(t, C.fresh + 0.3, SC.tips.start, 0.3, 0.2));
      if (!atC) camKeys(cam, t, [{ t: SC.lovers.start, p: [-1.5, 1.8, 6.0], l: [-0.8, 1.6, -2], f: 48 }, { t: S[32].start, p: [-1.4, 1.5, 1.6], l: [-0.1, 1.3, -2.8], f: 46 }, { t: C.aicha, p: [-1.2, 1.5, 1.4], l: [0, 1.3, -2.8], f: 46 }]);
      else camKeys(cam, t, [{ t: C.aicha, p: [30.35, 1.35, -1.5], l: [30.0, 1.0, 0.6], f: 46 }, { t: C.fresh, p: [30.4, 1.45, -1.8], l: [30.0, 1.05, 0.6], f: 46 }, { t: SC.tips.start, p: [30.5, 1.7, -2.6], l: [30.0, 1.3, 0.6], f: 48 }]);
      camCard(cam, cI, 0.6, -0.55); camCard(cam, cA, 0.62, -0.55); camCard(cam, cF, 0.85, 0.3);
      { const dir = new THREE.Vector3(); cam.getWorldDirection(dir); const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion); calF.position.copy(cam.position).addScaledVector(dir, 2.6).addScaledVector(up, -0.62); calF.quaternion.copy(cam.quaternion); }
    }
  };
};

const SHOTS = [
  ['bed', 0, 4.3], ['street', 4.3, SC.genesis.start], ['studio', SC.genesis.start, SC.marc.start], ['marc', SC.marc.start, SC.myths.start],
  ['studio', SC.myths.start, SC.lovers.start], ['lovers', SC.lovers.start, SC.tips.start], ['studio', SC.tips.start, 1e9],
];
