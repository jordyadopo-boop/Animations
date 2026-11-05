
// ================= episode 49 : Babylone coule comme une pierre (Apocalypse 18, 21-24)
const gone = (t, at, d = 0.8) => 1 - sstep(at, at + d, t);
// ---------- mer de nuit, lune, Babylone illuminee a l'horizon
function nightSea(o = {}) {
  const B = base({ sky: [0x05081a, 0x2a2440, 0x141a38], hemi: [0x9aa8d8, 0x1a1420, 0.75], sun: [0xc8d0ff, 0.8, [-4, 6, 6]], shadow: false, bloom: [0.6, 0.5, 0.8], exposure: o.exposure ?? 1.15, fog: [0x1a1830, 25, 110] });
  const { scene } = B;
  scene.add(L.stars(700, 90, 1.3));
  const moon = glowStar(9, 0xe8f0ff); moon.position.set(-14, 22, -70); scene.add(moon);
  const water = L.makeWater(200, 90, 0x1a3050, { emissive: 0x060c1c }); water.mesh.position.set(0, -0.2, -30); scene.add(water.mesh);
  const city = new THREE.Group(); city.position.set(o.cityX ?? 6, 0, -75); scene.add(city);
  const wins = [];
  for (let i = 0; i < 40; i++) { const h = 1 + hash(i * 3) * 6, x = (hash(i * 5) - 0.5) * 34; city.add(at(box(1.6 + hash(i) * 1.6, h, 1.6, M(0x1a1626, { emissive: new THREE.Color(0x0a0810) })), x, h / 2, (hash(i * 7) - 0.5) * 6)); const w = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.5), G(0xffb050, 1.4)); w.position.set(x, h * 0.6, 3.2); city.add(w); wins.push(w); }
  const zig = new THREE.Mesh(new THREE.CylinderGeometry(2, 5, 9, 4, 4), M(0x2a2030, { emissive: new THREE.Color(0x140c10) })); zig.position.set(0, 4.5, 0); zig.rotation.y = Math.PI / 4; city.add(zig);
  const cglow = glowStar(30, 0xffa050); cglow.position.set(0, 4, -1); city.add(cglow);
  B.water = water; B.city = city; B.cityWins = wins; B.cityGlow = cglow;
  B.cityLight = (k) => { wins.forEach((w, i) => w.visible = k > hash(i * 9.3)); cglow.material.opacity = 0.7 * k; };
  return B;
}
function rock(scene, x, y, z, s = 1) { const r = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), M(0x4a4440)); r.scale.set(1.4 * s, 0.6 * s, 1.1 * s); r.position.set(x, y, z); scene.add(r); return r; }
// l'ange geant leve la meule et la lance vers un point de la mer
function throwRig(scene, o = {}) {
  const an = angel(); an.root.scale.setScalar(o.s ?? 4.5); an.place(...(o.pos ?? [-2.5, -1, -14]), o.ry ?? 0.4); scene.add(an.root);
  const al = angelLight(scene, [an.root.position.x + 1, 8, an.root.position.z + 4]); al.intensity = 6; al.distance = 20;
  const ms = millstone(1.3); scene.add(ms);
  const target = new THREE.Vector3(...(o.target ?? [2.0, -0.2, -8]));
  const splash = []; for (let i = 0; i < 46; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 0), M(0xd8e8ff, { emissive: new THREE.Color(0x4a5a7a) })); scene.add(s); splash.push(s); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 6, 40), M(0xe8f0ff, { emissive: new THREE.Color(0x5a6a8a) })); ring.rotation.x = Math.PI / 2; scene.add(ring);
  const hp = new THREE.Vector3(), hr = new THREE.Vector3();
  return {
    an, ms, target, update(t, t0, tHit) { // t0 : debut du lever ; tHit : la meule touche l'eau
      const lift = sstep(t0, t0 + 2.5, t), thr = sstep(tHit - 1.6, tHit, t);
      an.pose({ aL: [lerp(0.3, 2.9, lift) - 1.3 * thr, 0.25], aR: [lerp(0.3, 2.9, lift) - 1.3 * thr, 0.25], eL: 0.2, eR: 0.2, lean: 0.3 * thr, hp: 0.15 * thr }); an.face(0, 'serious', t);
      an.root.updateMatrixWorld(true); an.hand.L.getWorldPosition(hp); an.hand.R.getWorldPosition(hr); hp.add(hr).multiplyScalar(0.5); hp.y += 1.0;
      if (thr <= 0) ms.position.copy(hp); else { ms.position.lerpVectors(hp, target, thr); ms.position.y += 3 * Math.sin(Math.PI * thr) * (1 - thr); }
      ms.rotation.set(1.3 + thr * 3, 0.3, 0.2 + thr * 2); ms.visible = t < tHit + 0.05;
      const sp = clamp((t - tHit) / 2.2, 0, 1);
      splash.forEach((s, i) => { const a = hash(i) * Math.PI * 2, v = 2 + hash(i * 3) * 4; s.visible = sp > 0 && sp < 1; s.position.set(target.x + Math.cos(a) * v * sp * 1.5, target.y + (6 + hash(i * 5) * 6) * sp - 12 * sp * sp, target.z + Math.sin(a) * v * sp); });
      fade(ring, 1 - sp); ring.visible = sp > 0 && sp < 1; ring.position.set(target.x, 0.0, target.z); ring.scale.setScalar(0.5 + sp * 9);
    }
  };
}
// ---------- personnages de la ville
function citizen(i, o = {}) { return new Human({ skin: [0xd09a70, 0x8a5a3a, 0xa86c44, 0xe0b890, 0x5a3420, 0xc68a5a][i % 6], hair: [0x1a1210, 0x2a1a10, 0x5a3a20, 0x120c08][i % 4], hairStyle: ['short', 'long', 'curly', 'wrap', 'bun'][i % 5], beard: i % 3 === 0 ? 'full' : undefined, top: [0x8a3a2a, 0x2a4a6a, 0x6a5a2a, 0x4a2a5a, 0x2a5a3a][i % 5], bottom: 0x3a2a20, robe: [0x8a3a2a, 0x2a4a6a, 0x6a5a2a, 0x4a2a5a, 0x2a5a3a][i % 5], robeL: 0.85, seed: 4960 + i, ...o }); }
function harp() { const g = new THREE.Group(); const w = M(0x9a6a2a); g.add(at(box(0.04, 0.7, 0.04, w), 0, 0.35, 0)); const arc = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 5, 16, Math.PI), w); arc.position.set(0.0, 0.7, 0); arc.rotation.z = -Math.PI / 2; g.add(arc); for (let k = 0; k < 6; k++) g.add(at(box(0.005, 0.5 - k * 0.06, 0.005, G(0xfff0c0, 1.2)), 0.05 + k * 0.04, 0.38 + k * 0.03, 0)); return g; }
function pipe(l = 0.35, c = 0xd0a050) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.015, l > 0.4 ? 0.06 : 0.02, l, 8), M(c)); p.rotation.x = Math.PI / 2; return p; }
function handMill() { const g = new THREE.Group(); const st = M(0x7a7470); g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.12, 16), st), 0, 0.06, 0)); const top = new THREE.Group(); top.position.y = 0.17; g.add(top); top.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16), st)); top.add(at(box(0.04, 0.22, 0.04, M(0x6a4a2a)), 0.22, 0.14, 0)); g.userData.top = top; return g; }
function oilLamp(scene, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0x8a5a3a))); const f = glowStar(0.6, 0xffb040); f.position.set(0.05, 0.08, 0); g.add(f); const l = new THREE.PointLight(0xffa050, 2.0, 4, 1.4); l.position.set(0, 0.3, 0.2); g.add(l); g.userData = { f, l }; return g; }
function streetSet() {
  const B = base({ bg: 0x080612, fog: [0x080612, 8, 34], hemi: [0x8a90c0, 0x140c10, 0.5], sun: [0xc8d0ff, 0.35, [-3, 6, 4]], shadow: false, bloom: [0.55, 0.5, 0.8], exposure: 1.15 });
  const { scene } = B; scene.add(L.stars(500, 70, 1.1));
  scene.add(at(box(30, 0.1, 40, M(0x3a3028)), 0, -0.05, -8));
  const houses = [], wins = [];
  for (const s of [-1, 1]) for (let k = 0; k < 7; k++) { const h = 2.4 + hash(k * 3 + s) * 2.2, z = 1 - k * 3.2; const hs = box(2.6, h, 2.8, M(0xc8a878, { emissive: new THREE.Color(0x1a1208) })); hs.position.set(s * 3.6, h / 2, z); scene.add(hs); houses.push(hs); for (const dz of [-0.7, 0.7]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), G(0xffb050, 1.3)); w.position.set(s * 2.29, h * 0.62, z + dz); w.rotation.y = -s * Math.PI / 2; scene.add(w); wins.push(w); } }
  B.wins = wins; return B;
}

// ---------- intro : l'ange geant lance la meule
SETS.intro = () => {
  const B = nightSea(); const { scene, cam } = B;
  const R = throwRig(scene);
  rock(scene, 1.0, -0.2, 1.4, 1.1);
  const rig = claudeRig(scene, [1.1, 0.2, 1.4], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [0.9, 0.9, 2.8], 1.2);
  const back = label('◀ une scène avant', { w: 0.8, h: 0.12, color: '#ffd070', font: 'bold 80px Inter' }); rig.holoG.add(back);
  const al = goldWord('ALLÉLUIA !', 0.9, 0.22); rig.holoG.add(al); al.position.y = 0.2;
  const K = cardsMgr(scene, cam);
  K('une pierre… le sort de toute une ville', { w: 1.6, h: 0.24, border: '#9adfff' }, t => win(t, 1.0, C.serie - 0.5, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      B.water.update(t, 0.35); B.cityLight(1); R.update(t, 0.6, C.serie - 2.2);
      const bk = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, bk, t); fade(back, bk); fade(al, bk); back.position.y = 0.45; back.lookAt(cam.position); al.lookAt(cam.position); rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [1.5, 2.2, 6.5], l: [-1.5, 5.5, -14], f: 56 }, { t: C.serie - 2.4, p: [2.0, 2.0, 7.0], l: [0, 4, -12], f: 58 }, { t: C.serie - 1.6, p: [2.5, 2.4, 6.5], l: [1.5, 1.0, -8], f: 58 }, { t: C.serie + 0.2, p: [2.5, 2.4, 6.5], l: [1.5, 1.0, -8], f: 58 }, { t: C.serie + 1.0, p: [0.9, 0.95, 4.2], l: [0.6, 0.6, 0], f: 48 }, { t: C.title - 0.3, p: [0.9, 0.95, 4.2], l: [0.6, 0.6, 0], f: 48 }, { t: C.title + 0.8, p: [0, 3.0, 9.0], l: [2, 3, -40], f: 56 }, { t: SC.meule.start, p: [0, 3.0, 9.0], l: [2, 3, -40], f: 56 }]);
      K.update(t);
    }
  };
};

// ---------- la meule : le geste ; le poids ; Jeremie et l'Euphrate
SETS.meule = () => {
  const B = nightSea(); const { scene, cam } = B;
  const T0 = SC.meule.start, HIT = T0 + 9.0;
  const R = throwRig(scene, { pos: [-1.5, -1, -16], target: [2.5, -0.2, -9] });
  // hologramme : la meule tournee par un ane
  const mill = new THREE.Group(); mill.position.set(0, 0.6, 1.0); scene.add(mill);
  const base0 = holo(new THREE.CylinderGeometry(0.9, 1.0, 0.3, 20), 0x9adfff, 0.2); mill.add(base0);
  const stone = holo(new THREE.CylinderGeometry(0.75, 0.75, 0.35, 20), 0x9adfff, 0.25); stone.position.y = 0.35; mill.add(stone);
  const arm = holo(new THREE.BoxGeometry(2.0, 0.06, 0.06), 0x9adfff, 0.5); arm.position.set(1.0, 0.55, 0); const armG = new THREE.Group(); armG.add(arm); mill.add(armG);
  const donkey = holoAnimal('zebra', 0xffd070); donkey.scale.setScalar(0.55); donkey.position.set(2.0, -0.6, 0); armG.add(donkey);
  rock(scene, 0, -0.2, 1.0, 1.6);
  // hologramme : Jeremie, le livre et la pierre, l'Euphrate
  const jer = new THREE.Group(); jer.position.set(0.2, 0.6, 1.0); jer.scale.setScalar(0.75); scene.add(jer);
  const river = holo(new THREE.BoxGeometry(3.2, 0.02, 1.0), 0x5ac8ff, 0.35); river.position.set(0.4, 0, -0.6); jer.add(river);
  const pr = new Human({ holo: 0xffd070 }); pr.root.scale.setScalar(0.8); pr.place(-0.8, 0, 0.3, 0.6); jer.add(pr.root);
  const bk = holo(new THREE.BoxGeometry(0.2, 0.06, 0.26), 0xffffff, 0.5); jer.add(bk);
  const K = cardsMgr(scene, cam); refCard(K);
  K('meule de moulin : des centaines de kilos', { w: 1.6, h: 0.24, border: '#9adfff' }, t => win(t, C.poids + 0.3, C.jeremie, 0.3, 0.2), -0.6);
  K('Jérémie 51, 63-64 : un livre, une pierre, l\'Euphrate', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.jeremie + 0.3, SC.rome.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      B.water.update(t, 0.35); B.cityLight(1); R.update(t, T0 + 1.0, HIT);
      fade(mill, win(t, C.poids + 0.3, C.jeremie, 0.5, 0.4)); armG.rotation.y = t * 0.8; stone.rotation.y = t * 0.8; donkey.rotation.y = Math.PI / 2; donkey.userData.walk(t * 6);
      const jk = win(t, C.jeremie + 0.5, SC.rome.start, 0.5, 0.4); fade(jer, jk);
      const th = sstep(C.jeremie + 5.0, C.jeremie + 6.5, t); pr.pose({ aR: [lerp(1.0, 2.6, sstep(C.jeremie + 3.5, C.jeremie + 5, t)) - 1.6 * th, 0.2] });
      pr.root.updateMatrixWorld(true); const hh = new THREE.Vector3(); pr.hand.R.getWorldPosition(hh); jer.worldToLocal(hh);
      bk.position.lerpVectors(hh, new THREE.Vector3(0.6, -0.05 - 0.4 * sstep(C.jeremie + 6.5, C.jeremie + 8, t), -0.6), th); bk.position.y += 0.6 * Math.sin(Math.PI * th); bk.rotation.z = th * 4;
      camKeys(cam, t, [{ t: T0, p: [1.0, 2.0, 7.0], l: [-1.0, 5.5, -16], f: 56 }, { t: HIT - 1.8, p: [1.5, 2.2, 7.5], l: [0, 4, -14], f: 58 }, { t: HIT - 0.8, p: [3.0, 2.4, 6.0], l: [2.5, 0.8, -9], f: 56 }, { t: C.poids, p: [3.0, 2.4, 6.0], l: [2.5, 0.8, -9], f: 56 }, { t: C.poids + 0.8, p: [0.9, 3.4, 7.6], l: [0.6, 0.8, 0.6], f: 52 }, { t: C.jeremie, p: [0.9, 3.4, 7.6], l: [0.6, 0.8, 0.6], f: 52 }, { t: C.jeremie + 0.8, p: [0.2, 2.2, 6.0], l: [0.1, 0.9, 0.6], f: 52 }, { t: SC.rome.start, p: [0.2, 2.2, 5.8], l: [0.1, 0.9, 0.6], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- Babylone en ruine ? Rome aux sept collines ; 1 Pierre 5, 13
SETS.rome = () => {
  const T0r = SC.rome.start;
  const B = nightSet({ exposure: 1.1 }); const { scene, cam } = B;
  
  const ruins = new THREE.Group(); ruins.position.set(0.4, 0, -1.2); scene.add(ruins);
  for (let i = 0; i < 16; i++) { const h = 0.1 + hash(i * 3) * 0.6; const b = holo(new THREE.BoxGeometry(0.3, h, 0.3), 0xc8a070, 0.25); b.position.set((hash(i * 5) - 0.5) * 2.6, h / 2, (hash(i * 7) - 0.5) * 1.4); b.rotation.z = (hash(i) - 0.5) * 0.6; ruins.add(b); }
  
  const rome = new THREE.Group(); rome.position.set(0.4, 0, -1.4); scene.add(rome);
  const hills = []; for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const h = holo(new THREE.ConeGeometry(0.45, 0.5 + hash(i) * 0.3, 8), 0xff6a4a, 0.22); h.position.set(Math.cos(a) * 1.1, 0.3, Math.sin(a) * 0.7); rome.add(h); hills.push(h); const n = label(String(i + 1), { w: 0.2, h: 0.2, color: '#ffd0c0', font: 'bold 160px Inter' }); n.position.set(Math.cos(a) * 1.1, 0.85, Math.sin(a) * 0.7); rome.add(n); hills.push(n); }
  const colis = holo(new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16, 1, true), 0xffd070, 0.4); colis.position.set(0, 0.15, 0); rome.add(colis);
  const letter = scroll(1.5); letter.position.set(0.4, 1.3, -0.6); letter.rotation.x = 1.15; scene.add(letter);
  const anyP = holo(new THREE.OctahedronGeometry(0.5, 0), 0xb08aff, 0.25); anyP.position.set(0.4, 1.0, -1.2); scene.add(anyP);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Babylone, vers l\'an 95 : une ville en ruine', { w: 1.6, h: 0.24, border: '#c8a070' }, t => win(t, T0r + 0.8, C.collines, 0.3, 0.2), -0.6);
  K('Apocalypse 17, 9 : « sept montagnes, sur lesquelles la femme est assise »', { w: 1.6, h: 0.32, border: '#ff6a4a' }, t => win(t, C.collines + 0.3, C.pierre, 0.3, 0.2), -0.6);
  K('1 Pierre 5, 13 : « L\'Église des élus qui est à Babylone vous salue »', { w: 1.6, h: 0.32, border: '#ffd070' }, t => win(t, C.pierre + 0.3, C.pierre + 7.5, 0.3, 0.2), -0.6);
  K('ou : toute puissance dressée contre Dieu', { w: 1.6, h: 0.24, border: '#b08aff' }, t => win(t, C.pierre + 7.7, SC.silence.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.rome.start; 
      const rk = win(t, T0 + 0.5, C.collines, 0.5, 0.4); fade(ruins, rk);
      fade(rome, win(t, C.collines + 0.2, C.pierre + 0.5, 0.5, 0.4)); rome.rotation.y = 0.2 * Math.sin(t * 0.4);
      fade(letter, win(t, C.pierre + 0.3, C.pierre + 7.6, 0.4, 0.3)); fade(anyP, win(t, C.pierre + 7.7, SC.silence.start, 0.4, 0.3)); anyP.rotation.y = t;
      camKeys(cam, t, [{ t: T0, p: [0.1, 1.9, 5.2], l: [0.1, 0.8, -1], f: 52 }, { t: SC.silence.start, p: [0.3, 2.0, 4.8], l: [0.2, 0.8, -1], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- le silence : musiciens, artisan, meule, lampe, epoux et epouse s'eteignent un a un
SETS.silence = () => {
  const B = streetSet(); const { scene, cam } = B;
  const T0 = SC.silence.start;
  const harper = citizen(0); harper.place(-1.3, 0, 0.6, 0.5); scene.add(harper.root); const hp_ = harp(); hp_.position.set(0.15, -0.35, 0.25); harper.spine.add(hp_);
  const flu = citizen(1); flu.place(-0.5, 0, -0.6, 0.2); scene.add(flu.root); const fp = pipe(0.35); fp.position.set(0, 0.1, 0.25); flu.neck.add(fp);
  const tru = citizen(2); tru.place(0.6, 0, -1.4, -0.2); scene.add(tru.root); const tp = pipe(0.6, 0xe0b040); tp.position.set(0, 0.1, 0.38); tru.neck.add(tp);
  const smith = citizen(3, { top: 0x5a4a3a, robe: 0x5a4a3a }); smith.place(1.5, 0, -2.6, -0.6); scene.add(smith.root); const anvil = box(0.4, 0.3, 0.2, M(0x3a3a40)); anvil.position.set(1.15, 0.15, -2.3); scene.add(anvil); const spark = glowStar(0.5, 0xffa040); spark.position.set(1.15, 0.35, -2.3); scene.add(spark);
  const miller = citizen(4, { hairStyle: 'wrap' }); miller.place(-1.4, 0, -3.2, 0.4); scene.add(miller.root); const hm = handMill(); hm.position.set(-1.1, 0, -2.85); scene.add(hm);
  const lamps = [[-0.8, 1.2, 0.6], [0.9, 1.4, -0.5], [-1.6, 1.6, -2.0], [1.6, 1.5, -3.4], [0, 1.8, -4.5]].map(p => oilLamp(scene, ...p));
  const groom = citizen(5, { top: 0xf0e8d8, robe: 0xf0e8d8 }); groom.place(-0.3, 0, -5.4, 0); scene.add(groom.root);
  const brid = new Human({ skin: 0xa86c44, hair: 0x2a1a10, hairStyle: 'bun', top: 0xffffff, bottom: 0xffffff, robe: 0xffffff, robeL: 0.9, robeW: 0.4, seed: 4991 }); brid.place(0.3, 0, -5.4, 0); scene.add(brid.root);
  const ppl = [harper, flu, tru, smith, miller, groom, brid];
  const al = goldWord('ALLÉLUIA !', 4.0, 1.0); scene.add(al);
  // moments ou chaque son s'eteint (pendant la citation)
  const off = { harp: T0 + 3.4, flute: T0 + 5.6, trump: T0 + 7.0, smith: T0 + 8.6, mill: C.lampe - 1.0, lamp: C.lampe + 1.6, couple: C.lampe + 4.6 };
  const K = cardsMgr(scene, cam); refCard(K); imagined(K, 'scène imaginée', T0 + 0.3, T0 + 3);
  const list = ['harpes', 'flûtes', 'trompettes', 'artisans', 'meule', 'lampe', 'époux et épouse'];
  const tags = list.map((s, i) => { const c = card(s, { w: 0.62, h: 0.13, border: '#ffb050', color: '#ffe0b0' }); scene.add(c); return c; });
  const tagOff = [off.harp, off.flute, off.trump, off.smith, off.mill, off.lamp, off.couple];
  const strikes = tags.map(c => { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.012), new THREE.MeshBasicMaterial({ color: 0xff4a3a, transparent: true, depthTest: false, depthWrite: false, toneMapped: false })); b.renderOrder = 22; scene.add(b); return b; });
  K('Jérémie 25, 10 : « le bruit de la meule et la lumière de la lampe »', { w: 1.6, h: 0.32, border: '#ffd070' }, t => win(t, C.jer25 + 0.3, C.noces, 0.3, 0.2), -0.6);
  K('épisode 48 : les noces de l\'Agneau', { w: 1.6, h: 0.24, border: '#ffcf5a', color: '#ffe8a0' }, t => win(t, C.noces + 0.3, SC.raisons.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const ph = t * 6;
      harper.pose({ aL: [0.8, 0.1], aR: [0.9 + 0.15 * Math.sin(ph) * gone(t, off.harp), 0.1], eL: 1.2, eR: 1.4 }); fade(harper.root, gone(t, off.harp, 1.2));
      flu.pose({ aL: [1.3, 0.1], aR: [1.3, 0.05], eL: 1.6, eR: 1.6 }); fade(flu.root, gone(t, off.flute, 1.2));
      tru.pose({ aL: [1.4, 0.05], aR: [1.4, 0.05], eL: 1.6, eR: 1.6, hp: -0.2 }); fade(tru.root, gone(t, off.trump, 1.2));
      const hit = Math.max(0, Math.sin(t * 7)); smith.pose({ aR: [1.0 + 1.0 * hit * gone(t, off.smith), 0.1], eR: 0.6 }); fade(smith.root, gone(t, off.smith, 1.2)); spark.visible = hit > 0.95 && t < off.smith;
      miller.pose(L.kneelPose({ lean: 0.4, aL: [1.0, 0.1], aR: [1.0, 0.1] })); hm.userData.top.rotation.y = t * 3 * gone(t, off.mill); fade(miller.root, gone(t, off.mill, 1.2));
      lamps.forEach((l, i) => { const k = gone(t, off.lamp + i * 0.25, 0.5); l.userData.f.visible = k > 0.05; l.userData.f.scale.setScalar(0.6 * k * (1 + 0.15 * Math.sin(t * 13 + i))); l.userData.l.intensity = 2 * k; });
      groom.pose({ aR: [0.5, 0.4] }); brid.pose({ aL: [0.5, 0.4] }); groom.face(0, 'joy', t); brid.face(0, 'joy', t); fade(groom.root, gone(t, off.couple, 1.5)); fade(brid.root, gone(t, off.couple, 1.5));
      ppl.forEach(h => h.root.visible && h !== groom && h !== brid && h.face(0, 'happy', t));
      B.wins.forEach((w, i) => w.visible = t < C.eteint + 0.6 + (i % 5) * 1.1 + hash(i) * 0.4);
      camKeys(cam, t, [{ t: T0, p: [0.6, 1.7, 4.8], l: [0, 1.1, -1.5], f: 52 }, { t: C.lampe, p: [0.3, 1.8, 3.6], l: [0, 1.0, -4], f: 52 }, { t: C.eteint, p: [0, 2.2, 3.0], l: [0, 1.1, -6], f: 52 }, { t: C.jer25, p: [0, 4.5, 8.0], l: [0, 1.0, -8], f: 56 }, { t: C.noces, p: [0, 4.5, 8.0], l: [0, 4.0, -8], f: 56 }, { t: SC.raisons.start, p: [0, 4.6, 8.4], l: [0, 4.4, -8], f: 56 }]);
      tags.forEach((c, i) => { const k = win(t, T0 + 1.5 + i * 0.3, C.jer25, 0.3, 0.4); fade(c, k); camCard(cam, c, 0.3, 0.5 - i * 0.11); const s = strikes[i]; s.visible = k > 0.1 && t > tagOff[i]; s.position.copy(c.position); s.quaternion.copy(c.quaternion); s.scale.x = sstep(tagOff[i], tagOff[i] + 0.4, t); s.translateZ(0.001); });
      fade(al, win(t, C.noces + 0.5, SC.raisons.start, 0.8, 0.3)); al.position.set(0, 5.5 + 0.1 * Math.sin(t * 2), -10);
      K.update(t);
    }
  };
};

// ---------- les raisons : les marchands, pharmakeia, le sang des prophetes
SETS.raisons = () => {
  const B = nightSet({ exposure: 1.1 }); const { scene, cam } = B;
  const mer = [0, 1, 2].map(i => { const h = citizen(i + 6, { top: [0x8a1a3a, 0x5a2a8a, 0x1a5a6a][i], robe: [0x8a1a3a, 0x5a2a8a, 0x1a5a6a][i], hat: i === 1 ? 'crown' : undefined }); h.place(-1.0 + i * 1.0, 0, -0.6, 0); scene.add(h.root); return h; });
  const gold = []; for (let i = 0; i < 30; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10), G(0xffc040, 1.3)); c.position.set((hash(i * 3) - 0.5) * 1.6, 0.02 + Math.floor(i / 10) * 0.025, 0.4 + (hash(i * 5) - 0.5) * 0.4); scene.add(c); gold.push(c); }
  const word = label('φαρμακεία', { w: 2.2, h: 0.5, color: '#c8a0ff', font: 'bold 150px Inter', sub: '→ pharmacie', subColor: '#ffffff' }); word.position.set(0, 2.2, -1); scene.add(word);
  const pots = [0, 1, 2, 3].map(i => { const p = holo(new THREE.SphereGeometry(0.16, 10, 8), [0x9aff7a, 0xb08aff, 0xff7ab0, 0x7ad8ff][i], 0.35); p.position.set(-0.9 + i * 0.6, 1.2, -0.4); scene.add(p); return p; });
  const K = cardsMgr(scene, cam); refCard(K);
  K('« tes marchands étaient les grands de la terre »', { w: 1.6, h: 0.24, border: '#ffc040' }, t => win(t, SC.raisons.start + 0.5, C.pharmakeia, 0.3, 0.2), -0.6);
  K('pharmakeia : potions, drogues, sortilèges', { w: 1.6, h: 0.24, border: '#b08aff' }, t => win(t, C.pharmakeia + 4, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.raisons.start;
      mer.forEach((h, i) => { h.pose({ aL: [0.6 + 0.2 * Math.sin(t * 2 + i), 0.2], aR: [0.4, 0.2], eL: 1.0 }); h.face(0, 'serious', t); fade(h.root, 1 - sstep(C.pharmakeia - 0.3, C.pharmakeia + 0.5, t) * 0.75); });
      const wk = win(t, C.pharmakeia + 0.3, SC.fin.start, 0.5, 0.3); fade(word, wk); word.lookAt(cam.position);
      pots.forEach((p, i) => { fade(p, wk); p.position.y = 1.2 + 0.08 * Math.sin(t * 2 + i); });
      camKeys(cam, t, [{ t: T0, p: [0, 1.6, 4.2], l: [0, 1.0, -0.6], f: 52 }, { t: C.pharmakeia, p: [0, 1.8, 4.0], l: [0, 1.4, -0.6], f: 52 }, { t: SC.fin.start, p: [0, 2.0, 4.4], l: [0, 1.6, -0.8], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- fin : les rois et les marchands regardent de loin la ville bruler (prochain episode)
SETS.fin = () => {
  const B = nightSea({ cityX: 0 }); const { scene, cam } = B;
  B.city.position.set(0, 0, -40); B.cityGlow.material.color.set(0xff6020);
  const smoke = []; for (let i = 0; i < 26; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), M(0x3a3038, { transparent: true, opacity: 0.5, emissive: new THREE.Color(0x3a1a10) })); scene.add(s); smoke.push(s); }
  const fires = []; for (let i = 0; i < 12; i++) { const f = glowStar(4 + hash(i) * 3, 0xff7020); f.position.set((hash(i * 3) - 0.5) * 30, 2 + hash(i * 5) * 4, -38); scene.add(f); fires.push(f); }
  const hill = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 1, 12), M(0x2a2420)); hill.position.set(0, -0.3, 1.0); scene.add(hill);
  const watchers = [0, 1, 2, 3].map(i => { const h = i % 2 ? citizen(i + 9, { top: [0x8a1a3a, 0x1a5a6a][i % 2], robe: 0x5a2a3a }) : king(i); h.place(-1.5 + i * 1.0, 0.2, 0.6, Math.PI); scene.add(h.root); return h; });
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 18, 9-20', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 8.5, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start; B.water.update(t, 0.3); B.cityLight(0.6 + 0.4 * Math.sin(t * 9) * 0.3);
      smoke.forEach((s, i) => { const ph = (t * 0.06 + hash(i)) % 1; s.position.set((hash(i * 3) - 0.5) * 30 + ph * 6, 3 + ph * 22, -40); s.scale.setScalar(1 + ph * 3); s.material.opacity = 0.55 * (1 - ph); });
      fires.forEach((f, i) => f.scale.setScalar((4 + hash(i) * 3) * (1 + 0.15 * Math.sin(t * 7 + i))));
      watchers.forEach((h, i) => { h.pose({ aL: [i % 2 ? 2.4 : 0.3, 0.3], aR: [i % 2 ? 2.4 : 0.6, 0.3], hp: 0.2 }); h.face(0, 'sad', t); });
      camKeys(cam, t, [{ t: T0, p: [0, 2.4, 6.5], l: [0, 2.5, -40], f: 54 }, { t: TL.duration, p: [0.4, 2.8, 7.5], l: [0, 4, -40], f: 54 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : l'ange geant, la meule au-dessus de la tete ; Babylone s'eteint au loin
SETS.cover = () => {
  const B = nightSea({ cityX: 4 }); const { scene, cam } = B;
  const R = throwRig(scene, { pos: [0, -1.5, -12], ry: 0.15, s: 4.6 });
  return { ...B, update() { B.water.update(3, 0.4); B.cityLight(0.35); R.update(10, 0, 1000); cam.position.set(0.8, 0.6, 5.5); cam.fov = 62; cam.updateProjectionMatrix(); cam.lookAt(0.8, 4.2, -12); } };
};

const SHOTS = [['intro', 0, SC.meule.start], ['meule', SC.meule.start, SC.rome.start], ['rome', SC.rome.start, SC.silence.start], ['silence', SC.silence.start, SC.raisons.start], ['raisons', SC.raisons.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
