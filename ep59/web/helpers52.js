
// ================= episode 52 : dix rois se retournent contre elle (Apocalypse 17, 7-18)
function desert(o = {}) {
  const B = base({ sky: [0x0a0a20, 0x3a2a4a, 0x2a2038], hemi: [0xb8a8d8, 0x2a1a1a, 0.8], sun: [0xd8d0ff, 0.9, [-4, 7, 6]], shadow: false, bloom: [0.55, 0.5, 0.82], exposure: o.exposure ?? 1.15, fog: [0x2a2038, 20, 90] });
  const { scene } = B; scene.add(L.stars(700, 90, 1.3));
  const moon = glowStar(8, 0xe8f0ff); moon.position.set(12, 20, -60); scene.add(moon);
  scene.add(L.groundPlane(160, 50, 0x8a6a48, 0.5, 5));
  for (let i = 0; i < 8; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(6 + hash(i) * 8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0x7a5a3e)); d.scale.y = 0.35; d.position.set((hash(i * 3) - 0.5) * 90, -0.5, -30 - hash(i * 5) * 30); scene.add(d); }
  return B;
}
function harlot() { const w = new Human({ skin: 0xe0b890, hair: 0x1a1210, hairStyle: 'long', top: 0x7a1a4a, bottom: 0x6a1a3a, robe: 0x8a1a2a, robeL: 0.7, hat: 'crown', seed: 5200 }); const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.03, 0.14, 10), G(0xffc040, 1.3)); w.hand.R.add(cup); cup.position.set(0, -0.08, 0.05); return w; }
function beastWithWoman(scene) {
  const g = new THREE.Group(); scene.add(g);
  const dr = dragon(); dr.scale.setScalar(1.3); g.add(dr);
  const w = harlot(); w.root.position.set(0, 1.95, 0.3); w.pose(L.sitPose(0.3, { lL: 1.2, lR: 1.2, kL: 1.2, kR: 1.2, lsL: 0.5, lsR: 0.5, aR: [1.4, 0.2], eR: 0.6 })); g.add(w.root);
  g.userData = { dr, w }; return g;
}
function swordKing(i) { const k = king(i); const sw = box(0.04, 0.8, 0.04, G(0xd8e0f0, 1.4)); sw.position.set(0, -0.45, 0.08); k.hand.R.add(sw); k.sword = sw; return k; }
function ringKings(scene, n = 10, R = 3.4, cx = 0, cz = 0) {
  return Array.from({ length: n }, (_, i) => { const k = swordKing(i); const a = Math.PI * (0.15 + 0.7 * i / (n - 1)) + Math.PI; const x = cx + Math.cos(a) * R * 1.15, z = cz + Math.sin(a) * R * 0.75 - 0.6; k.place(x, 0, z, Math.atan2(cx - x, cz - z)); scene.add(k.root); return k; });
}

