
function holoify(obj, color, op = 0.45) { obj.traverse(m => { if (m.isMesh) m.material = holoMat(color, op); }); return obj; }
// ================= episode 55 : trois esprits verts sortent de la gueule du dragon (Apocalypse 16, 12-16)
function frogSpirit() {
  const g = new THREE.Group(); const mat = new THREE.MeshStandardMaterial({ color: 0x5aff6a, emissive: new THREE.Color(0x2aa83a), emissiveIntensity: 1.2, roughness: 0.4, transparent: true, opacity: 0.92 });
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 12), mat); b.scale.set(1.25, 0.72, 1.05); g.add(b);
  for (const s of [-1, 1]) { const eb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), mat); eb.position.set(s * 0.17, 0.2, 0.2); g.add(eb); const e = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), G(0xffff70, 2.2)); e.position.set(s * 0.17, 0.23, 0.28); g.add(e); const leg = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), mat); leg.scale.set(0.8, 0.5, 1.5); leg.position.set(s * 0.3, -0.12, -0.12); g.add(leg); }
  const gl = softGlow(2.4, 0x5aff6a); gl.material.opacity = 0.55; g.add(gl);
  return g;
}
function beast13() { const b = dragon(); b.traverse(m => { if (m.isMesh && m.material && m.material.color && m.material.color.getHex() === 0xa8261c) { m.material = m.material.clone(); m.material.color.set(0x4a2a5a); m.material.emissive = new THREE.Color(0x120818); } }); return b; }
function falseProphet() { const h = new Human({ skin: 0xd0a080, hair: 0x2a1a10, hairStyle: 'short', beard: 'full', top: 0x3a3a4a, bottom: 0x2a2a34, robe: 0x2a2a3a, robeL: 0.9, seed: 5500 }); for (const s of [-1, 1]) { const hn = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 6), M(0xf0e8d0)); hn.position.set(s * 0.08, 0.36, 0.02); h.neck.add(hn); } h.root.scale.setScalar(1.5); return h; }
function riverBed(scene, z = -20) {
  const bed = new THREE.Mesh(new THREE.PlaneGeometry(9, 120), M(0x5a4430)); bed.rotation.x = -Math.PI / 2; bed.position.set(0, 0.32, z); scene.add(bed);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 120), new THREE.MeshStandardMaterial({ color: 0x2a6aa8, emissive: new THREE.Color(0x0a2a4a), roughness: 0.15, metalness: 0.2, transparent: true })); water.rotation.x = -Math.PI / 2; water.position.set(0, 0.36, z); scene.add(water);
  const cracks = []; for (let i = 0; i < 40; i++) { const c = box(0.05, 0.02, 0.8 + hash(i) * 1.2, M(0x2a1e14)); c.position.set((hash(i * 3) - 0.5) * 8, 0.33, z + (hash(i * 5) - 0.5) * 60); c.rotation.y = (hash(i * 7) - 0.5) * 2; scene.add(c); cracks.push(c); }
  return { water, set(k) { water.material.opacity = 1 - 0.9 * k; water.scale.x = 1 - 0.75 * k; water.visible = k < 0.98; cracks.forEach(c => c.visible = k > 0.6); } };
}
function trio(scene, z = -5) {
  const dr = dragon(); dr.scale.setScalar(1.2); dr.position.set(-3.2, 0, z); dr.rotation.y = 0.35; scene.add(dr);
  const bt = beast13(); bt.scale.setScalar(1.1); bt.position.set(3.2, 0, z); bt.rotation.y = -0.35; scene.add(bt);
  const fp = falseProphet(); fp.place(0, 0, z + 1.2, 0); scene.add(fp.root);
  return { dr, bt, fp };
}
function mouthOf(obj, kind) { const v = new THREE.Vector3(); (obj.root || obj).updateMatrixWorld(true); if (kind === 'fp') { obj.head.getWorldPosition(v); v.y -= 0.05; v.z += 0.25; } else { obj.userData.necks[3].head.getWorldPosition(v); v.z += 0.4; } return v; }

