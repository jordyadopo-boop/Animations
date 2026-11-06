
// ================= episode 56 : le royaume de la bete plonge dans les tenebres (Apocalypse 16, 10-11)
function throneHall(o = {}) {
  const B = base({ bg: 0x0c0810, fog: [0x0c0810, 10, 40], hemi: [0xffd8b0, 0x1a0c10, 0.7], sun: [0xffe0c0, 0.7, [2, 8, 6]], shadow: false, bloom: [0.5, 0.5, 0.82], exposure: 1.15 });
  const { scene } = B;
  scene.add(at(box(16, 0.2, 24, M(0x3a2a30)), 0, -0.1, -6));
  const carpet = box(1.6, 0.03, 16, M(0x8a1a2a)); carpet.position.set(0, 0.02, -2); scene.add(carpet);
  const cols = []; for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 7, 16), M(0x6a5a50)); c.position.set(s * 3.4, 3.5, 2 - k * 3.2); scene.add(c); cols.push(c); }
  const th = new THREE.Group(); th.position.set(0, 0, -9); scene.add(th);
  th.add(at(box(3.2, 0.5, 2.4, M(0x4a2a3a)), 0, 0.25, 0)); th.add(at(box(1.6, 0.6, 1.1, M(0x6a1a2a)), 0, 0.8, 0)); th.add(at(box(1.6, 3.0, 0.3, M(0x6a1a2a)), 0, 2.0, -0.45)); th.add(at(box(1.8, 0.14, 1.2, G(0xffcc55, 1.1)), 0, 1.12, 0));
  const bt = beast13(); bt.scale.setScalar(1.0); bt.position.set(0, 0.5, -11.5); scene.add(bt);
  const torches = []; for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const t = new THREE.Group(); t.position.set(s * 2.9, 2.4, 1 - k * 3.2); scene.add(t); t.add(box(0.12, 0.4, 0.12, M(0x3a2a1a))); const f = softGlow(1.2, 0xffa040); f.position.y = 0.35; t.add(f); const l = new THREE.PointLight(0xffa050, 3, 7, 1.5); l.position.y = 0.4; t.add(l); t.userData = { f, l }; torches.push(t); }
  B.dark = (k, t) => { torches.forEach((tr, i) => { const kk = clamp(k * 1.6 - (i % 4) * 0.15, 0, 1); tr.userData.f.visible = kk < 0.98; tr.userData.f.scale.setScalar(1.2 * (1 - kk) * (1 + 0.15 * Math.sin(t * 11 + i))); tr.userData.l.intensity = 3 * (1 - kk); }); B.hemi.intensity = 0.7 * (1 - 0.9 * k); if (B.sun) B.sun.intensity = 0.7 * (1 - 0.9 * k); scene.fog.far = lerp(40, 9, k); };
  B.bt = bt; B.th = th; return B;
}

