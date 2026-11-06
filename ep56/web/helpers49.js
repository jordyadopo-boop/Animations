
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

