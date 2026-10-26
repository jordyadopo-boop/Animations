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
// ---------- la Terre low-poly ; mode 'now' ou 'mega' (oceans aux poles), gel 0..1
function noise3(x, y, z) { return Math.sin(x * 2.1 + Math.sin(y * 3.3)) * Math.cos(y * 1.7 - z * 2.3) + 0.6 * Math.sin(z * 3.1 + x * 1.3) + 0.35 * Math.sin(x * 5.3 + y * 4.1 + z * 2.7); }
function makeEarth(r = 1, mode = 'now') {
  const geo = new THREE.IcosahedronGeometry(r, 4);
  const p = geo.attributes.position, n = p.count;
  const base = new Float32Array(n * 3), cols = new Float32Array(n * 3);
  const OCEAN = new THREE.Color(0x2a6ac8), LAND = new THREE.Color(0x4a9a48), DESERT = new THREE.Color(0xc8a868), ICE = new THREE.Color(0xf4f8ff);
  for (let i = 0; i < n; i += 3) {
    const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3 / r, cy = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3 / r, cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3 / r;
    const lat = Math.asin(clamp(cy, -1, 1));
    let c;
    if (mode === 'mega') c = Math.abs(lat) < 0.62 + 0.08 * noise3(cx * 2, 0, cz * 2) ? (Math.abs(lat) < 0.25 ? DESERT : LAND) : (Math.abs(lat) > 1.25 ? ICE : OCEAN);
    else { const v = noise3(cx * 1.6, cy * 1.6, cz * 1.6); c = Math.abs(lat) > 1.2 ? ICE : (v > 0.55 ? (Math.abs(lat) < 0.45 && v > 0.9 ? DESERT : LAND) : OCEAN); }
    for (let k = 0; k < 3; k++) { cols.set([c.r, c.g, c.b], (i + k) * 3); base.set([c.r, c.g, c.b], (i + k) * 3); }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  mesh.userData.freeze = (k) => { for (let i = 0; i < n * 3; i++) cols[i] = lerp(base[i], [0.62, 0.68, 0.78][i % 3], k); geo.attributes.color.needsUpdate = true; };
  const atm = new THREE.Mesh(new THREE.IcosahedronGeometry(r * 1.06, 3), new THREE.MeshBasicMaterial({ color: 0x6ab8ff, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide }));
  mesh.add(atm); mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}
function makeSun(r = 3) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd070).multiplyScalar(2.2), fog: false })));
  g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(r * 1.25, 2), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })));
  return g;
}
function spaceBase(o = {}) {
  const B = base({ bg: 0x02030a, hemi: [0x223355, 0x000000, 0.25], sun: [0xfff4e0, 3.0, o.sunDir ?? [-10, 2, 6]], shadow: false, bloom: [0.8, 0.6, 0.6], exposure: 1.1, ...o });
  B.scene.add(L.stars(1400, 300, 1.8));
  return B;
}
function arrowH(c = 0xffd070, len = 0.5) { const g = new THREE.Group(); const m = G(c, 1.8); g.add(beam([0, 0, 0], [len, 0, 0], 0.03, m)); const h = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 6), m); h.rotation.z = -Math.PI / 2; h.position.x = len + 0.05; g.add(h); return g; }

// ---------- intro : on tourne sans le sentir
SETS.intro = () => {
  const B = spaceBase(); const { scene, cam } = B;
  const earth = makeEarth(1.5); scene.add(earth);
  const sun = makeSun(4); sun.position.set(-60, 8, 30); scene.add(sun);
  const c = L.makeClaude(); c.g.scale.setScalar(0.35); scene.add(c.g); { const pl = new THREE.PointLight(0xffffff, 3, 4, 1.5); pl.position.set(0.6, 2.2, 1.5); scene.add(pl); }
  const spd = label('1 670 km/h', { w: 1.4, h: 0.32, color: '#ffd070', font: 'bold 130px Inter' }); scene.add(spd);
  const K = cardsMgr(scene, cam);
  K('EXPÉRIENCE DE PENSÉE', { w: 1.2, h: 0.26, border: '#55e6ff' }, t => win(t, C.what + 0.5, SC.bus.start, 0.3, 0.2), -0.7, 0.6);
  return {
    ...B, update(t) {
      earth.rotation.y = t * 0.25; earth.rotation.z = 0.41;
      c.g.position.set(0, 1.5, 0.0); c.g.rotation.set(0, 0.3, 0); c.update(t, env('claude', t), {});
      spd.position.set(0.0, 2.25, 0.3); fade(spd, win(t, 0.8, C.what, 0.4, 0.3)); spd.lookAt(cam.position);
      camKeys(cam, t, [{ t: 0, p: [0.5, 1.75, 1.0], l: [0, 1.65, 0], f: 44 }, { t: C.what, p: [1.2, 2.2, 2.6], l: [0, 1.6, 0], f: 46 }, { t: C.title, p: [0.8, 1.2, 5.6], l: [0, 0.6, 0], f: 46 }, { t: SC.bus.start, p: [0.6, 1.0, 6.4], l: [0, 0.4, 0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- le bus : sans a-coups, puis il pile
SETS.bus = () => {
  const B = base({ bg: 0x05070f, fog: [0x05070f, 8, 30], hemi: [0x6a7ab0, 0x0a0a14, 0.9], sun: [0xffffff, 1.0, [2, 5, 4]], shadow: false, bloom: [0.45, 0.5, 0.85] });
  const { scene, cam } = B;
  const grid = new THREE.GridHelper(40, 40, new THREE.Color(0x3a8aff).multiplyScalar(1.3), new THREE.Color(0x3a8aff).multiplyScalar(0.4)); scene.add(grid);
  const bus = new THREE.Group(); bus.position.set(0, 0.3, 0); scene.add(bus);
  bus.add(holo(new THREE.BoxGeometry(3.4, 1.6, 1.3), 0x55e6ff, 0.08)); bus.children[0].position.y = 0.8;
  for (const x of [-1.1, 1.1]) for (const z of [-0.66, 0.66]) { const w = holo(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 12), 0x55e6ff, 0.2); w.rotation.x = Math.PI / 2; w.position.set(x, 0, z); bus.add(w); }
  const pax = [-0.9, 0.0, 0.9].map((x, i) => { const h = holoFig([0xffd070, 0x7dffb0, 0xff9ad0][i], { s: 0.55, op: 0.35, seed: 1900 + i, hair: ['curly', 'long', 'short'][i] }); h.place(x, 0.05, 0.1, Math.PI / 2); bus.add(h.root); return h; });
  const cups = [-0.9, 0.0, 0.9].map(x => { const cp = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.1, 8), G(0xffffff, 1.4)); cp.position.set(x + 0.18, 0.75, 0.2); bus.add(cp); return cp; });
  const rig = claudeRig(scene, [-2.6, 0, 1.6], 0.5, [0.45, 0, 0.0], 0x55e6ff, 0.5, 0.3); rig.pr.visible = false;
  const mini = makeEarth(0.55); mini.position.set(0.0, 2.3, 0); scene.add(mini);
  const arrows = []; for (let i = 0; i < 6; i++) { const a = arrowH(0xff9a5a, 0.35); scene.add(a); arrows.push(a); }
  const K = cardsMgr(scene, cam);
  K('à l\'équateur : ≈ 1 670 km/h', { w: 1.6, h: 0.3, border: '#ffd070' }, t => win(t, SC.bus.start + 0.5, subAt('Like on a bus'), 0.3, 0.2));
  K('aucune force connue\nne peut l\'arrêter d\'un coup', { w: 1.6, h: 0.42, border: '#7dffb0', small: true }, t => win(t, C.relief + 0.3, SC.lent.start, 0.3, 0.2));
  return {
    ...B, update(t) {
      const brake = t > C.brake + 0.3;
      const tb = Math.max(0, t - (C.brake + 0.3));
      bus.position.x = brake ? 0 : 0; bus.rotation.z = brake ? 0.06 * Math.exp(-tb * 3) * Math.sin(tb * 18) : 0.005 * Math.sin(t * 6);
      pax.forEach((h, i) => { const k = brake ? Math.min(1, tb * 3) : 0; h.pose({ lean: 0.5 * k, aL: [0.6 + 1.5 * k, 0.2], aR: [0.6 + 1.5 * k, 0.2], eL: 0.8, eR: 0.8 }); });
      cups.forEach((cp, i) => { const k = brake ? tb : 0; cp.position.set(-0.9 + i * 0.9 + 0.18 + k * 2.2, 0.75 + k * 0.6 - k * k * 1.2, 0.2); cp.rotation.z = -k * 4; cp.visible = k < 1.2; });
      rig.c.update(t, env('claude', t), {});
      const ek = win(t, subAt('But if the Earth') + 4, C.relief, 0.5, 0.4);
      fade(mini, ek); mini.rotation.y = t * 0.3;
      arrows.forEach((a, i) => { const ang = i / 6 * Math.PI * 2 + t * 0.3; a.position.set(Math.cos(ang) * 0.75, 2.3 + (i % 2 ? 0.15 : -0.15), Math.sin(ang) * 0.75); a.rotation.y = -ang - Math.PI / 2 - Math.PI; fade(a, ek); });
      const T0 = SC.bus.start;
      camKeys(cam, t, [{ t: T0, p: [1.4, 2.2, 7.6], l: [-0.4, 1.0, 0], f: 46 }, { t: C.brake, p: [1.0, 1.8, 6.4], l: [0, 1.0, 0], f: 44 }, { t: C.brake + 3.5, p: [0.4, 2.3, 4.4], l: [0, 1.8, 0], f: 46 }, { t: SC.lent.start, p: [0.4, 2.4, 4.8], l: [0, 1.9, 0], f: 46 }]);
      K.update(t);
    }
  };
};

// ---------- ralentissement : six mois de jour, oceans aux poles
SETS.lent = () => {
  const B = spaceBase({ sunDir: [-10, 0.5, 2] }); const { scene, cam } = B;
  const earth = makeEarth(1.5); scene.add(earth);
  const mega = makeEarth(1.5, 'mega'); scene.add(mega);
  const sun = makeSun(5); sun.position.set(-70, 3, 14); scene.add(sun);
  // petit diorama jour / nuit avec Ines et Tom
  const dio = new THREE.Group(); dio.position.set(0, -0.6, 2.2); scene.add(dio);
  const ines = new Human({ skin: 0xa86f48, hair: 0x1a1010, hairStyle: 'curly', top: 0xffd040, bottom: 0x3a4a8a, seed: 1910 }); ines.root.scale.setScalar(0.45); ines.place(-0.35, 0, 0, 0.3); dio.add(ines.root);
  const tom = new Human({ skin: 0xf0d0b0, hair: 0x8a5a3a, hairStyle: 'short', top: 0x3a3a6a, bottom: 0x2a2a3a, seed: 1911 }); tom.root.scale.setScalar(0.45); tom.place(0.35, 0, 0, -0.3); dio.add(tom.root);
  dio.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.06, 24), M(0x4a8a3a)), 0, -0.03, 0));
  const sunIcon = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 1), G(0xffd070, 1.1)); sunIcon.position.set(-0.35, 1.05, 0); dio.add(sunIcon);
  const moonIcon = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 1), G(0xd8e0ff, 0.9)); { const pl = new THREE.PointLight(0xffffff, 2.5, 3, 1.5); pl.position.set(0, 1.2, 1.0); dio.add(pl); } moonIcon.position.set(0.35, 1.05, 0); dio.add(moonIcon);
  const K = cardsMgr(scene, cam);
  K('1 jour = 1 an\n6 mois de jour · 6 mois de nuit', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, subAt("Let's imagine") + 4.5, C.ines, 0.3, 0.2));
  K('répliques imaginées', { w: 0.9, h: 0.2, border: '#ffd070', color: '#ffe0a0' }, t => win(t, C.ines, C.oceans, 0.2, 0.2), -0.45, 0.42);
  K('SIMULATION · 2010\n2 océans aux pôles · 1 super-continent', { w: 1.6, h: 0.42, border: '#7dffb0', small: true }, t => win(t, subAt('In 2010') + 1.0, SC.orbite.start, 0.3, 0.2));
  return {
    ...B, update(t) {
      const T0 = SC.lent.start;
      const slow = Math.max(0, 1 - (t - T0) / 6); earth.rotation.y = 1.2 + (t - T0) * 0.6 * slow * slow * 0.5; earth.rotation.z = 0.2;
      const toMega = sstep(subAt('In 2010') + 0.5, subAt('In 2010') + 2.5, t);
      earth.visible = toMega < 0.5; mega.visible = !earth.visible; mega.rotation.copy(earth.rotation);
      earth.scale.setScalar(1 - 0.08 * Math.sin(Math.PI * toMega)); mega.scale.copy(earth.scale);
      const dk = win(t, C.ines - 0.4, C.oceans, 0.4, 0.4); fade(dio, dk);
      ines.pose({ aL: [2.6, 0.4], aR: [2.6, 0.4] }); ines.face(env('ines', t), 'joy', t);
      tom.pose({ hp: 0.3, aL: [0.2, 0.1], aR: [0.2, 0.1] }); tom.face(env('tom', t), 'sad', t);
      camKeys(cam, t, [{ t: T0, p: [3.2, 0.6, 3.6], l: [0, 0, 0], f: 46 }, { t: C.ines - 0.4, p: [0.6, 0.0, 4.6], l: [0, -0.1, 2.0], f: 44 }, { t: C.oceans, p: [1.5, 1.0, 5.4], l: [0, 0, 0], f: 44 }, { t: SC.orbite.start, p: [-0.5, 1.3, 5.4], l: [0, 0, 0], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- quitter l'orbite
SETS.orbite = () => {
  const B = spaceBase({ sunDir: [-10, 2, 4], bloom: [0.5, 0.5, 0.75] }); B.sun.intensity = 2.0; const { scene, cam } = B;
  const earth = makeEarth(1.0); scene.add(earth);
  const sun = makeSun(2.2); scene.add(sun);
  const trail = []; for (let i = 0; i < 30; i++) { const d = new THREE.Mesh(new THREE.OctahedronGeometry(0.04), G(0x55e6ff, 1.5)); scene.add(d); trail.push(d); }
  const rogue = new THREE.Group(); scene.add(rogue);
  for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25 + hash(i) * 0.2, 1), M([0x8a9ab0, 0x6a7a9a, 0xa0a8c0][i], { emissive: new THREE.Color(0x0a0c18) })); r.position.set(-6 + i * 5, 2 - i * 1.5, -30 - i * 10); rogue.add(r); }
  const K = cardsMgr(scene, cam);
  K('≈ 30 km par seconde\n(≈ 107 000 km/h)', { w: 1.6, h: 0.42, border: '#55e6ff', small: true }, t => win(t, SC.orbite.start + 2.5, subAt('The Sun would'), 0.3, 0.2));
  K('HYPOTHÈSE\nrien n\'est sûr', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, C.life + 2.0, subAt('But one thing'), 0.3, 0.2));
  K('PLANÈTES VAGABONDES\nelles existent vraiment', { w: 1.6, h: 0.42, border: '#b08aff', small: true }, t => win(t, subAt('But one thing') + 1.5, SC.fin.start, 0.3, 0.2));
  return {
    ...B, update(t) {
      const T0 = SC.orbite.start, d = Math.max(0, t - T0 - 1.0);
      const x = 9 + d * d * 1.8 + d * 4;
      earth.position.set(x, 0, -d * 2); earth.rotation.y = t * 0.3;
      earth.userData.freeze(sstep(subAt('The Sun would') + 1.0, subAt('The Sun would') + 4.0, t));
      trail.forEach((p, i) => { const dd = Math.max(0, d - i * 0.12); p.position.set(9 + dd * dd * 1.8 + dd * 4, 0, -dd * 2); p.visible = d > i * 0.12; });
      fade(rogue, win(t, subAt('But one thing'), SC.fin.start + 1, 0.6, 0.3));
      const ep = earth.position;
      if (t < C.life) { const dir = ep.clone().normalize(); cam.position.copy(ep).addScaledVector(dir, 4.2).add(new THREE.Vector3(0, 1.2, 2.0)); cam.lookAt(ep.x * 0.72, -0.3, ep.z * 0.72); if (cam.fov !== 48) { cam.fov = 48; cam.updateProjectionMatrix(); } }
      else { cam.position.set(ep.x + 1.8, 0.8, ep.z + 2.6); cam.lookAt(ep.x, 0.2, ep.z); }
      K.update(t);
    }
  };
};

// ---------- fin : la Terre tourne, Claude se repose
SETS.fin = () => {
  const B = spaceBase({ sunDir: [-8, 3, 6] }); const { scene, cam } = B;
  const earth = makeEarth(1.5); scene.add(earth);
  const moon = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 1), M(0xc8c8d0)); scene.add(moon);
  const c = L.makeClaude(); c.g.scale.setScalar(0.35); scene.add(c.g);
  const K = cardsMgr(scene, cam);
  K('≈ 1,8 milliseconde de plus\npar siècle', { w: 1.6, h: 0.42, border: '#7dffb0', small: true }, t => win(t, SC.fin.start + 3.0, C.question, 0.3, 0.2));
  return {
    ...B, update(t) {
      earth.rotation.y = t * 0.25; earth.rotation.z = 0.41;
      moon.position.set(Math.cos(t * 0.3) * 4.5, 0.6, Math.sin(t * 0.3) * 4.5 - 1);
      c.g.position.set(0, 1.5, 0); c.g.rotation.set(0, 0.4, t < C.question ? -1.4 : 0); c.update(t, env('claude', t), { wave: sstep(C.question, C.question + 0.5, t) });
      const T0 = SC.fin.start;
      camKeys(cam, t, [{ t: T0, p: [0, 2.6, 6.5], l: [0, 0.6, 0], f: 46 }, { t: C.question - 0.5, p: [0.8, 2.0, 2.4], l: [0, 1.6, 0], f: 44 }, { t: TL.duration, p: [0.6, 1.9, 1.6], l: [0, 1.65, 0], f: 44 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : la Terre en bas a gauche, le systeme solaire au fond en haut a droite
SETS.cover = () => {
  const B = spaceBase({ sunDir: [5, 4, 4], bloom: [0.55, 0.5, 0.8] }); const { scene, cam } = B;
  const earth = makeEarth(1.0); earth.scale.setScalar(1.05); earth.position.set(-1.0, -2.15, 0); earth.rotation.set(0.3, 2.2, 0.41); scene.add(earth);
  const sys = new THREE.Group(); sys.position.set(12, 17, -60); sys.rotation.x = 0.5; scene.add(sys);
  sys.add(makeSun(0.9));
  [2.0, 3.0, 4.2, 6.0, 8.0].forEach((r, i) => { const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.03, 4, 96), new THREE.MeshBasicMaterial({ color: 0x55e6ff, transparent: true, opacity: 0.45, fog: false })); ring.rotation.x = Math.PI / 2; sys.add(ring); const pl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18 + i * 0.05, 1), new THREE.MeshBasicMaterial({ color: [0xb0a090, 0xe8c890, 0x5a8ad0, 0xd06a4a, 0xe0c090][i], fog: false })); const a = i * 1.7 + 0.5; pl.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); sys.add(pl); });
  return { ...B, update(t) { cam.position.set(0, 0, 6.2); cam.fov = 46; cam.updateProjectionMatrix(); cam.lookAt(0, 0, 0); } };
};

const SHOTS = [
  ['intro', 0, SC.bus.start], ['bus', SC.bus.start, SC.lent.start], ['lent', SC.lent.start, SC.orbite.start],
  ['orbite', SC.orbite.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9],
];
