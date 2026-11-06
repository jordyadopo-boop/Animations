// ---------- Mr A : le narrateur (lunettes rondes dorees, bouc, polo marron)
function mrA(o = {}) {
  const h = new Human({ skin: 0x5a3824, hair: 0x0e0a08, hairStyle: 'none', shortSleeve: true, top: 0xb48a6a, bottom: 0x3a3634, shoes: 0x2a2018, seed: 9001, ...o });
  const n = h.neck, hairM = M(0x0e0a08), gold = M(0xd8b060, { metalness: 0.85, roughness: 0.25 }), lens = new THREE.MeshStandardMaterial({ color: 0x1a2a3a, metalness: 0.6, roughness: 0.08 });
  const add = (m, x, y, z) => { m.position.set(x, y, z); n.add(m); return m; };
  // bouc + moustache fine + collier de barbe court
  // cheveux tres courts : calotte fine
  add(box(0.3, 0.06, 0.29, hairM), 0, 0.305, -0.005);
  add(box(0.3, 0.12, 0.03, hairM), 0, 0.25, -0.135);
  for (const s of [-1, 1]) add(box(0.015, 0.1, 0.18, hairM), s * 0.148, 0.24, -0.03);
  add(box(0.075, 0.05, 0.025, hairM), 0, 0.045, 0.145);
  add(box(0.12, 0.02, 0.025, hairM), 0, 0.025, 0.138);
  add(box(0.08, 0.012, 0.02, hairM), 0, 0.12, 0.152);
  for (const s of [-1, 1]) add(box(0.015, 0.06, 0.05, hairM), s * 0.135, 0.06, 0.1);
  // lunettes ovales dorees
  const gl = new THREE.Group(); add(gl, 0, 0.19, 0.158);
  for (const s of [-1, 1]) {
    const l = new THREE.Mesh(new THREE.CircleGeometry(0.055, 28), lens); l.scale.y = 0.74; l.position.x = s * 0.068; gl.add(l);
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.006, 6, 28), gold); r.scale.y = 0.74; r.position.x = s * 0.068; gl.add(r);
    const tp = box(0.012, 0.012, 0.2, gold); tp.position.set(s * 0.145, 0.005, -0.1); gl.add(tp);
    const hg = box(0.02, 0.03, 0.02, gold); hg.position.set(s * 0.12, 0, -0.005); gl.add(hg);
  }
  const br = box(0.035, 0.008, 0.008, gold); br.position.set(0, 0.012, 0); gl.add(br);
  h.eyes?.forEach(e => e.visible = false); h.brows?.forEach(b => b.position.z = 0.142);
  // col de polo + patte boutonnee
  const pol = h.mats.top;
  for (const s of [-1, 1]) { const c = box(0.13, 0.05, 0.1, pol); c.position.set(s * 0.07, 0.585, 0.06); c.rotation.z = s * -0.35; c.rotation.x = -0.3; h.spine.add(c); }
  const pk = box(0.06, 0.18, 0.01, M(0xa47a5a)); pk.position.set(0, 0.5, 0.123); h.spine.add(pk);
  for (let k = 0; k < 2; k++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 10), M(0xd8c0a0)); b.rotation.x = Math.PI / 2; b.position.set(0, 0.55 - k * 0.07, 0.13); h.spine.add(b); }
  return h;
}
