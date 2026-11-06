
// ================= episode 54 : une ville immense fendue par un tremblement de terre (Apocalypse 16, 17-21)
function stormCity(o = {}) {
  const B = nightSea({ cityX: 0, exposure: o.exposure ?? 1.1 }); const { scene } = B; B.city.position.set(0, 0, o.z ?? -30);
  const parts = [new THREE.Group(), new THREE.Group(), new THREE.Group()]; parts.forEach(p => scene.add(p));
  B.city.children.slice().forEach(c => { if (c.position.x < -6) parts[0].attach(c); else if (c.position.x > 6) parts[2].attach(c); else parts[1].attach(c); });
  parts.forEach(p => p.children.forEach(c => { c.userData.r0 = c.rotation.z; c.userData.y0 = c.position.y; }));
  B.cityGlow.visible = false; B.cityGlow.scale.setScalar(0.001); const cg = softGlow(30, 0xffb060); cg.material.opacity = 0.22; cg.position.set(0, 6, (o.z ?? -30) - 3); scene.add(cg);
  const cracks = [-6, 6].map(x => { const g = new THREE.Group(); g.position.set(x, 0, o.z ?? -30); scene.add(g); for (let k = 0; k < 4; k++) { const f = softGlow(3, 0xff6a20); f.position.set(0, 0.3, (k - 1.5) * 2); g.add(f); } const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 8), new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); pl.rotation.x = -Math.PI / 2; pl.position.y = 0.05; g.add(pl); g.visible = false; return g; });
  const clouds_ = []; for (let i = 0; i < 16; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(4 + hash(i) * 4, 1), M(0x1a1826, { emissive: new THREE.Color(0x0a0a12) })); c.scale.y = 0.4; c.position.set((hash(i * 3) - 0.5) * 80, 26 + hash(i * 5) * 6, -40 - hash(i * 7) * 20); scene.add(c); clouds_.push(c); }
  const bolts = [0, 1, 2, 3].map(k => { const b = L.makeBolt(k * 13 + 7, [(k - 1.5) * 12, 30, -40], [(k - 1.5) * 7, 2, o.z ?? -30], G(0xffffff, 2.6)); scene.add(b); return b; });
  B.split = (u, t) => { cracks.forEach(g => { g.visible = u > 0.02; g.scale.x = 0.3 + 3 * u; g.children.forEach(c => { if (c.material) c.material.opacity = (c.isSprite ? 0.7 : 0.9) * Math.min(1, u * 3); }); }); parts[0].position.x = -4 * u; parts[0].rotation.z = 0.14 * u; parts[2].position.x = 4 * u; parts[2].rotation.z = -0.14 * u; parts[1].position.y = -2 * u;
    parts.forEach((p, pi) => p.children.forEach((c, i) => { const f = clamp(u * 1.6 - hash(i * 3 + pi) * 0.6, 0, 1); c.rotation.z = c.userData.r0 + (hash(i + pi) - 0.5) * 1.2 * f; })); };
  B.storm = (t, times, k = 1) => { const fk = L.flashK(t, times); bolts.forEach((b, i) => b.visible = fk > 0.3 && (i === Math.floor(t * 6) % 4 || fk > 0.85)); B.hemi.intensity = 0.75 + 1.6 * fk * k; return fk; };
  B.parts = parts; return B;
}
function hailstones(scene, n = 60, R = 14, cz = -10) {
  const arr = []; for (let i = 0; i < n; i++) { const h = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25 + hash(i) * 0.35, 0), M(0xe8f0ff, { emissive: new THREE.Color(0x5a6a8a) })); scene.add(h); arr.push(h); }
  arr.update = (t, on = 1) => arr.forEach((h, i) => { const ph = (t * (0.35 + hash(i * 3) * 0.2) + hash(i)) % 1; h.visible = on > 0.02; h.position.set((hash(i * 5) - 0.5) * R * 2, 30 - ph * 31, cz + (hash(i * 7) - 0.5) * R); h.rotation.set(t * 2 + i, t + i, 0); });
  return arr;
}
function shake(cam, t, t0, amp = 0.15, dec = 0.6) { if (t < t0) return; const s = amp * Math.exp(-(t - t0) * dec); cam.position.x += s * Math.sin(t * 53); cam.position.y += s * Math.cos(t * 47); }

