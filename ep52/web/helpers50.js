
// ================= episode 50 : tout perdu en une seule heure (Apocalypse 18, 9-20)
// ---------- la ville en feu au loin (fumee, flammes)
function softGlow(size, color) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const col = new THREE.Color(color); const rgb = `${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)}`;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, `rgba(${rgb},0.9)`); gr.addColorStop(0.35, `rgba(${rgb},0.35)`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false })); s.scale.setScalar(size); return s;
}
function burningCity(B, o = {}) {
  const { scene } = B;
  B.city.position.set(o.x ?? 0, 0, o.z ?? -40); B.cityGlow.visible = false; B.cityGlow.scale.setScalar(0.001);
  const cg = softGlow(34, 0xff5010); cg.material.opacity = 0.45; cg.position.set(o.x ?? 0, 4, (o.z ?? -40) - 2); scene.add(cg);
  const smoke = []; for (let i = 0; i < 30; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), M(0x3a3038, { transparent: true, opacity: 0.5, emissive: new THREE.Color(0x3a1a10) })); scene.add(s); smoke.push(s); }
  const fires = []; for (let i = 0; i < 14; i++) { const f = softGlow(5 + hash(i) * 4, 0xff7020); f.material.opacity = 0.6; f.position.set((o.x ?? 0) + (hash(i * 3) - 0.5) * 30, 2 + hash(i * 5) * 5, (o.z ?? -40) + 2); scene.add(f); fires.push(f); }
  return (t, k = 1) => {
    B.cityLight(0.6 + 0.12 * Math.sin(t * 9));
    smoke.forEach((s, i) => { const ph = (t * 0.06 + hash(i)) % 1; s.position.set((o.x ?? 0) + (hash(i * 3) - 0.5) * 30 + ph * 6, 3 + ph * 24, (o.z ?? -40)); s.scale.setScalar(1 + ph * 3.2); s.material.opacity = 0.55 * (1 - ph); });
    fires.forEach((f, i) => f.scale.setScalar((5 + hash(i) * 4) * k * (1 + 0.15 * Math.sin(t * 7 + i))));
  };
}
function mourners(scene, n = 4, z = 0.6) {
  return Array.from({ length: n }, (_, i) => { const h = i % 2 ? citizen(i + 9, { top: [0x8a1a3a, 0x1a5a6a, 0x6a4a1a][i % 3], robe: [0x5a2a3a, 0x1a3a4a, 0x4a3a1a][i % 3] }) : king(i); h.place(-1.5 + i * 1.0, 0.2, z, Math.PI); scene.add(h.root); return h; });
}
function hourglass() {
  const g = new THREE.Group(); const gl = holo(new THREE.ConeGeometry(0.4, 0.6, 16, 1, true), 0x9adfff, 0.2); gl.position.y = 0.3; gl.rotation.x = Math.PI; g.add(gl);
  const gl2 = holo(new THREE.ConeGeometry(0.4, 0.6, 16, 1, true), 0x9adfff, 0.2); gl2.position.y = -0.3; g.add(gl2);
  for (const y of [-0.62, 0.62]) g.add(at(holo(new THREE.CylinderGeometry(0.46, 0.46, 0.05, 16), 0xffd070, 0.4), 0, y, 0));
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.4, 16), G(0xffd070, 1.2)); top.rotation.x = Math.PI; g.add(top);
  const bot = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.4, 16), G(0xffd070, 1.2)); g.add(bot);
  g.userData.set = (u) => { top.scale.set(1 - u * 0.95, 1 - u * 0.95, 1 - u * 0.95); top.position.y = 0.3 + 0.15 * u; bot.scale.set(Math.max(0.05, u), Math.max(0.05, u), Math.max(0.05, u)); bot.position.y = -0.58 + 0.2 * u; };
  return g;
}
function ship(sc_ = 1, sail = 0xe8dcc0) {
  const g = new THREE.Group(); const w = M(0x5a3a22);
  const hull = box(0.8, 0.35, 2.6, w); hull.position.y = 0.1; g.add(hull);
  g.add(at(box(0.9, 0.12, 0.5, w), 0, 0.35, 1.2)); g.add(at(box(0.9, 0.12, 0.5, w), 0, 0.35, -1.2));
  g.add(at(box(0.06, 2.2, 0.06, w), 0, 1.3, 0));
  const s = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.3), M(sail, { side: THREE.DoubleSide })); s.position.set(0, 1.5, 0.04); g.add(s);
  g.scale.setScalar(sc_); return g;
}
function crate(c) { const g = new THREE.Group(); g.add(box(0.4, 0.3, 0.3, M(0x7a5a32))); const lid = box(0.42, 0.04, 0.32, M(0x5a3a22)); lid.position.y = 0.16; g.add(lid); const st = glowStar(0.35, c); st.position.y = 0.25; g.add(st); return g; }

