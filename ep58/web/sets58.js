// ================= episode 58 : les fleuves deviennent du sang (Apocalypse 16, 4-7)
function duskValley(o = {}) {
  const B = base({ sky: [0x2a1640, 0xff9a70, 0x9a4a6a], hemi: [0xffd8c8, 0x3a2030, 1.0], sun: [0xffc8a0, 1.1, [-6, 8, 4]], shadow: false, bloom: [0.45, 0.5, 0.86], exposure: o.exposure ?? 1.0, fog: [0xb06a78, 22, 100] });
  const { scene } = B; scene.add(L.groundPlane(160, 50, 0x6a7a48, 0.4, 4));
  for (let i = 0; i < 9; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(7 + hash(i) * 9, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0x5a6a40)); d.scale.y = 0.4; d.position.set((hash(i * 3) - 0.5) * 90, -0.5, -32 - hash(i * 5) * 30); scene.add(d); }
  const sunset = softGlow(26, 0xffa070); sunset.position.set(-14, 9, -70); scene.add(sunset);
  return B;
}
const BLUE = [0.16, 0.42, 0.66], BLUE_E = [0.04, 0.16, 0.29], RED = [0.33, 0.015, 0.025], RED_E = [0.09, 0.0, 0.0];
function redden(mat, k) { mat.color.setRGB(lerp(BLUE[0], RED[0], k), lerp(BLUE[1], RED[1], k), lerp(BLUE[2], RED[2], k)); if (mat.emissive) mat.emissive.setRGB(lerp(BLUE_E[0], RED_E[0], k), lerp(BLUE_E[1], RED_E[1], k), lerp(BLUE_E[2], RED_E[2], k)); }
const waterMat = () => new THREE.MeshStandardMaterial({ color: 0x2a6aa8, emissive: new THREE.Color(0x0a2a4a), roughness: 0.12, metalness: 0.25 });
function river58(scene, w = 2.4, z = -25, x = 0, split = -14) {
  const g = new THREE.Group(); g.position.set(x, 0, 0); scene.add(g);
  const bed = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.8, 130), M(0x5a4430)); bed.rotation.x = -Math.PI / 2; bed.position.set(0, 0.3, -25); g.add(bed);
  const mats = [waterMat(), waterMat()];
  const nl = 40 - split, fl = split + 90;
  const near = new THREE.Mesh(new THREE.PlaneGeometry(w, nl), mats[0]); near.rotation.x = -Math.PI / 2; near.position.set(0, 0.34, (40 + split) / 2); g.add(near);
  const far = new THREE.Mesh(new THREE.PlaneGeometry(w, fl), mats[1]); far.rotation.x = -Math.PI / 2; far.position.set(0, 0.34, (split - 90) / 2); g.add(far);
  const ripples = []; for (let i = 0; i < 30; i++) { const r = box(0.4 + hash(i) * 0.6, 0.01, 0.04, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })); r.position.set((hash(i * 3) - 0.5) * (w - 0.5), 0.36, 0); g.add(r); ripples.push(r); }
  return { g, mats, set(kNear, kFar = kNear, t = 0) { redden(mats[0], kNear); redden(mats[1], kFar); ripples.forEach((r, i) => { r.position.z = 8 - (((hash(i * 5) * 50) + t * 0.8) % 50); r.material.opacity = 0.3 * (1 - 0.8 * Math.max(kNear, kFar)); }); } };
}
const tag = (text, w = 1.0, border = '#ffd070', h) => card(text, { w, h: h ?? w * 0.18, border });
function spring(scene, x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); scene.add(g);
  const r = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 1), M(0x7a6a5a, { flatShading: true })); r.scale.set(1.2, 1.1, 0.9); r.position.y = 0.9; g.add(r);
  const m1 = waterMat(), m2 = waterMat();
  const fall = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 1.4, 10), m1); fall.position.set(0, 0.95, 1.15); fall.rotation.x = 0.15; g.add(fall);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1.1, 24), m2); pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.06, 1.7); g.add(pool);
  return { g, set(k) { redden(m1, k); redden(m2, k); } };
}
function villagers(scene, n, z = 0, x0 = -1.6) { return Array.from({ length: n }, (_, i) => { const h = citizen(i + 90); h.place(x0 + i * 0.75, 0, z - (i % 2) * 0.6, 0.3 - 0.15 * i); scene.add(h.root); return h; }); }
function drinkPose(h, k, t, i) { h.pose(L.kneelPose({ lean: 0.55 * k, aL: [1.0 * k, 0.15], aR: [1.0 * k, 0.15], eL: 0.9, eR: 0.9 })); h.face(0, 'neutral', t); }
function recoil(h, t, i) { h.pose({ aL: [1.6, 0.6], aR: [1.6, 0.6], eL: 1.5, eR: 1.5, lean: -0.2, hp: -0.15 }); h.face(0.2 * Math.max(0, Math.sin(t * 4 + i)), 'fear', t); }
function pourStream(scene) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 1.4, 10, 12), new THREE.MeshBasicMaterial({ color: 0xb01414, transparent: true, opacity: 0.6, depthWrite: false })); scene.add(s); return s; }
function aimStream(an, stream, pour, show = true) { an.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); an.bowl.getWorldPosition(hp); const to = new THREE.Vector3(0, 0.4, hp.z + 3); const d = hp.clone().sub(to); const len = d.length(); stream.position.copy(to).addScaledVector(d, 0.5); stream.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); stream.scale.set(0.6, len / 10, 0.6); stream.visible = show && pour > 0.05; stream.material.opacity = 0.75 * pour; }
function pyramid(scene, x, z, s) { const p = new THREE.Mesh(new THREE.ConeGeometry(s, s * 1.15, 4), M(0xe0c088, { flatShading: true })); p.position.set(x, s * 0.57, z); p.rotation.y = Math.PI / 4; scene.add(p); return p; }
function moses() { const h = new Human({ skin: 0xa86c44, hair: 0xe8e4dc, beard: 'full', beardColor: 0xf0ece4, top: 0x8a6a4a, bottom: 0x6a4a2a, robe: 0x9a7a52, robeL: 0.85, seed: 5801 }); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 1.7, 8), M(0x6a4a28)); st.position.set(0, -0.2, 0.05); h.hand.R.add(st); h.staff = st; return h; }
function deadFish(scene, n, w, z0, z1) { return Array.from({ length: n }, (_, i) => { const f = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), M(0xc8ccd0, { metalness: 0.4, roughness: 0.4 })); b.scale.set(1.6, 0.6, 0.5); f.add(b); const tl = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.18, 4), M(0xb0b4b8)); tl.rotation.z = Math.PI / 2; tl.position.x = -0.3; f.add(tl); f.position.set((hash(i * 3) - 0.5) * (w - 0.6), 0.4, lerp(z0, z1, hash(i * 7))); f.rotation.set(Math.PI, hash(i) * 6, 0); scene.add(f); return f; }); }

// ---------- intro
SETS.intro = () => {
  const B = duskValley(); const { scene, cam } = B; const rv = river58(scene, 2.4);
  const sp = spring(scene, -4.2, -7, 1.0);
  const ppl = villagers(scene, 3, -0.6, -2.9);
  rock(scene, 2.2, -0.2, 1.8, 1.1);
  const rig = claudeRig(scene, [2.3, 0.2, 1.8], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [2.1, 0.9, 3.2], 1.0);
  const back = card('◀ une scène avant', { w: 0.8, h: 0.13, border: '#ffd070' }); rig.holoG.add(back);
  const sun = card('SOLEIL DE FEU', { w: 0.6, h: 0.13, border: '#ff8a3a' }); rig.holoG.add(sun);
  const K = cardsMgr(scene, cam);
  K('toutes les sources, partout', { w: 1.6, h: 0.24, border: '#ff3a3a' }, t => win(t, 4.0, C.serie - 0.3, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const r = sstep(2.5, 5.5, t); rv.set(r, r, t); sp.set(sstep(3.5, 6, t));
      ppl.forEach((h, i) => { if (t < 3 + i * 0.3) drinkPose(h, 1, t, i); else recoil(h, t, i); });
      const bk = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, bk, t); fade(back, bk); fade(sun, bk); back.position.y = 0.45; sun.position.y = 0.2; back.lookAt(cam.position); sun.lookAt(cam.position); rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [-0.4, 1.5, 4.4], l: [-1.8, 0.5, -1.2], f: 54 }, { t: C.serie, p: [0, 2.4, 6.5], l: [-1, 0.5, -10], f: 58 }, { t: C.serie + 0.9, p: [1.9, 1.15, 4.9], l: [2.0, 0.7, 1.0], f: 48 }, { t: C.title - 0.3, p: [1.9, 1.15, 4.9], l: [2.0, 0.7, 1.0], f: 48 }, { t: C.title + 0.8, p: [0, 3.0, 7.5], l: [0, 1, -20], f: 58 }, { t: SC.fleuves.start, p: [0, 3.0, 7.5], l: [0, 1, -20], f: 58 }]);
      K.update(t);
    }
  };
};

// ---------- la coupe dans les fleuves et les sources ; la mer avant ; l'eau douce
SETS.fleuves = () => {
  const B = duskValley(); const { scene, cam } = B; const rv = river58(scene, 2.4);
  const sp = spring(scene, -4.2, -7, 1.0); const sp2 = spring(scene, 5, -16, 1.3);
  const an = bowlAngel(3); an.root.scale.setScalar(3); an.place(-4, 12, -26, 0.4); scene.add(an.root); angelLight(scene, [-3, 16, -22]).intensity = 4;
  const stream = pourStream(scene);
  const icons = new THREE.Group(); scene.add(icons);
  const sea = new THREE.Mesh(new THREE.CircleGeometry(0.6, 32), G(0x8a1010, 1.2)); sea.position.x = -0.8; icons.add(sea);
  const riv = new THREE.Group(); riv.position.x = 0.8; icons.add(riv); const dropB = new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 16), G(0x3a8ad8, 1.3)); dropB.position.y = -0.1; riv.add(dropB); const dropT = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.55, 24), G(0x3a8ad8, 1.3)); dropT.position.y = 0.38; riv.add(dropT);
  const l1 = tag('2e coupe :\nla mer', 1.3, '#ff5a3a', 0.42); l1.position.set(-0.8, -0.9, 0); icons.add(l1);
  const l2 = tag('3e coupe :\nl\'eau qu\'on boit', 1.3, '#3a8ad8', 0.42); l2.position.set(0.8, -0.9, 0); icons.add(l2);
  const bars = new THREE.Group(); scene.add(bars);
  const salt = box(0.5, 1.45, 0.1, G(0x1a4a8a, 1.2)); salt.position.set(-0.4, 0, 0); bars.add(salt);
  const fresh = box(0.5, 0.06, 0.1, G(0x8ad8ff, 1.6)); fresh.position.set(0.4, -0.7, 0); bars.add(fresh);
  const bl1 = tag('salée\n97 %', 0.75, '#1a4a8a', 0.4); bl1.position.set(-0.45, -1.0, 0); bars.add(bl1);
  const bl2 = tag('douce\n3 %', 0.75, '#8ad8ff', 0.4); bl2.position.set(0.45, -1.0, 0); bars.add(bl2);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Apocalypse 16, 3 : avant, la mer', { w: 1.6, h: 0.24, border: '#ff5a3a' }, t => win(t, C.mer + 0.3, C.douce, 0.3, 0.2), -0.6);
  K('quelques jours seulement sans boire', { w: 1.6, h: 0.24, border: '#8ad8ff' }, t => win(t, C.douce + 6, SC.egypte.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fleuves.start, pour = win(t, T0 + 1, C.mer, 0.8, 0.5), r = sstep(T0 + 3, T0 + 6.5, t);
      rv.set(r * sstep(T0 + 4, T0 + 6.5, t), r, t); sp.set(sstep(T0 + 4, T0 + 6, t)); sp2.set(sstep(T0 + 3.5, T0 + 5.5, t));
      an.pose({ aL: [2.4, 0.3], eL: 0.4, aR: [0.4, 0.2] }); an.bowl.rotation.z = -1.6 * pour; an.face(0, 'serious', t); aimStream(an, stream, pour);
      camKeys(cam, t, [{ t: T0, p: [0, 3.5, 6], l: [-1.5, 7, -24], f: 58 }, { t: T0 + 3.5, p: [0, 3.0, 7.5], l: [0, 1, -20], f: 58 }, { t: C.mer, p: [0, 2.6, 6.5], l: [0, 1.4, -14], f: 58 }, { t: SC.egypte.start, p: [0, 2.6, 6.0], l: [0, 1.4, -14], f: 58 }]);
      const f = (x, y, z = -3) => cam.position.clone().add(new THREE.Vector3(x, y, z).applyQuaternion(cam.quaternion));
      fade(icons, win(t, C.mer + 0.3, C.douce, 0.5, 0.3)); icons.position.copy(f(0, 0.25)); icons.scale.setScalar(0.6); icons.quaternion.copy(cam.quaternion);
      const bk = win(t, C.douce + 0.3, SC.egypte.start, 0.5, 0.3); fade(bars, bk); bars.position.copy(f(0, 0.3)); bars.scale.setScalar(0.6); bars.quaternion.copy(cam.quaternion);
      K.update(t);
    }
  };
};

// ---------- la premiere plaie d'Egypte : Moise frappe le Nil ; les poissons ; Hapy ; Cana
SETS.egypte = () => {
  const B = base({ sky: [0xd87a3a, 0xffe0a8, 0xffb878], hemi: [0xfff0d8, 0x7a5a3a, 1.0], sun: [0xffe0b8, 1.2, [6, 9, 4]], shadow: false, bloom: [0.35, 0.5, 0.9], exposure: 0.95, fog: [0xf0c090, 25, 110] });
  const { scene, cam } = B; scene.add(L.groundPlane(160, 50, 0xc8a070, 0.35, 6));
  const rv = river58(scene, 3.0, -25, 1.3, -6);
  pyramid(scene, -14, -48, 7); pyramid(scene, -4, -58, 9); pyramid(scene, 10, -52, 6);
  for (let i = 0; i < 10; i++) { const p = L.makePalm(3 + hash(i) * 1.5, i); p.position.set(1.3 + (i % 2 ? 1 : -1) * (3.4 + hash(i * 3) * 3), 0, -4 - i * 3.2); scene.add(p); }
  const mo = moses(); mo.place(-0.9, 0, 0.6, 1.2); scene.add(mo.root);
  const aaron = citizen(3); aaron.place(-1.7, 0, -0.2, 0.9); scene.add(aaron.root);
  const fish = deadFish(scene, 16, 3, -14, 2); fish.forEach(f => f.position.x += 1.3);
  const diggers = [0, 1, 2].map(i => { const h = citizen(i + 20, {}); h.place(3.6 + (i % 2) * 0.5, 0, -1 - i * 1.4, -1.2); scene.add(h.root); const hole = new THREE.Mesh(new THREE.CircleGeometry(0.3, 14), M(0x3a2414)); hole.rotation.x = -Math.PI / 2; hole.position.set(3.2 + (i % 2) * 0.5, 0.05, -0.8 - i * 1.4); scene.add(hole); return h; });
  const hapy = new Human({ holo: 0x6ac8ff, robeL: 0.6, seed: 5802 }); hapy.root.scale.setScalar(2.2); scene.add(hapy.root); const hl = tag('HÂPY · dieu de la crue du Nil', 5.5, '#6ac8ff'); scene.add(hl);
  const jars = new THREE.Group(); scene.add(jars); const j1 = jar(0xb01010), j2 = jar(0x6a1040); j1.position.x = -0.32; j2.position.x = 0.32; jars.add(j1, j2);
  const jl1 = tag('Moïse\neau → sang', 0.55, '#ff3a3a', 0.24); jl1.position.set(-0.32, -0.2, 0); jars.add(jl1);
  const jl2 = tag('Jésus à Cana\neau → vin', 0.55, '#ffd070', 0.24); jl2.position.set(0.32, -0.2, 0); jars.add(jl2);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Exode 7, 20 : toutes les eaux du fleuve furent changées en sang', { w: 1.6, h: 0.32, border: '#ff3a3a' }, t => win(t, SC.egypte.start + 5, C.poissons, 0.3, 0.2), -0.6);
  K('Exode 7, 21-24 : on creuse autour du fleuve pour boire', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.poissons + 0.5, C.nil, 0.3, 0.2), -0.6);
  K('Jean 2, 1-11 : le premier miracle de Jésus', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.cana + 0.4, SC.ange.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.egypte.start, lift = sstep(T0 + 1.5, T0 + 3.0, t), strike = sstep(T0 + 3.0, T0 + 3.5, t), r = sstep(T0 + 3.6, T0 + 7, t);
      rv.set(r, sstep(T0 + 4.5, T0 + 8, t), t);
      mo.pose({ aR: [lerp(0.4, 2.8, lift) - 1.6 * strike, 0.2], eR: 0.3, aL: [0.3, 0.2], lean: 0.15 * strike }); mo.face(0, 'serious', t);
      aaron.pose({ aL: [0.6, 0.2], aR: [0.6, 0.2] }); aaron.face(0, 'awe', t);
      fish.forEach((f, i) => { f.visible = t > C.poissons - 1 + hash(i) * 1.2; f.position.y = 0.38 + 0.02 * Math.sin(t * 2 + i); });
      diggers.forEach((h, i) => { const dg = Math.sin(t * 4 + i * 1.7); h.pose({ lean: 0.6 + 0.15 * dg, aL: [1.2 + 0.4 * dg, 0.2], aR: [1.2 + 0.4 * dg, 0.2], eL: 0.6, eR: 0.6 }); h.face(0, 'sad', t); h.root.visible = t > C.poissons + 1; });
      camKeys(cam, t, [{ t: T0, p: [-1.9, 1.5, 3.4], l: [-0.4, 1.2, -0.4], f: 54 }, { t: T0 + 3.4, p: [-1.9, 1.6, 3.6], l: [0.0, 0.9, -1.2], f: 54 }, { t: T0 + 5, p: [0.6, 2.8, 5.5], l: [1.3, 0.5, -7], f: 56 }, { t: C.poissons, p: [1.6, 2.2, 4.6], l: [2.2, 0.4, -4], f: 54 }, { t: C.nil, p: [1.6, 2.2, 4.6], l: [2.2, 0.4, -4], f: 54 }, { t: C.nil + 1, p: [1.3, 3.2, 8], l: [1.3, 3, -20], f: 58 }, { t: C.cana, p: [1.3, 3.2, 8], l: [1.3, 3, -20], f: 58 }, { t: C.cana + 0.8, p: [1.3, 1.9, 4.2], l: [1.3, 1.2, -2], f: 54 }, { t: SC.ange.start, p: [1.3, 1.9, 4.0], l: [1.3, 1.2, -2], f: 54 }]);
      const hk = win(t, C.nil + 0.6, C.cana, 0.6, 0.4); fade(hapy.root, hk); fade(hl, hk); hapy.place(1.3, 0.4, -10, 0); hapy.pose({ aL: [1.4, 0.6], aR: [1.4, 0.6], eL: 0.8, eR: 0.8 }); hl.position.set(1.3, 5.2, -10); hl.lookAt(cam.position);
      const f = (x, y, z = -2.2) => cam.position.clone().add(new THREE.Vector3(x, y, z).applyQuaternion(cam.quaternion));
      fade(jars, win(t, C.cana + 0.8, SC.ange.start, 0.5, 0.3)); jars.position.copy(f(0, -0.05)); jars.quaternion.copy(cam.quaternion); jars.scale.setScalar(0.75);
      K.update(t);
    }
  };
};

// ---------- l'ange des eaux ; les anges des vents et du feu ; « qui es et qui etais » ; du sang a boire
SETS.ange = () => {
  const B = duskValley({ exposure: 0.95 }); const { scene, cam } = B; const rv = river58(scene, 2.4); rv.set(1, 1, 0);
  const sp = spring(scene, -4.2, -7, 1.0); sp.set(1);
  const an = angel(); an.root.scale.setScalar(2.2); an.place(0, 0.36, -6, 0); scene.add(an.root); angelLight(scene, [0, 4, -3]).intensity = 5;
  const halo = softGlow(6, 0x9adfff); halo.position.set(0, 2.8, -6.3); scene.add(halo);
  const els = new THREE.Group(); scene.add(els);
  const wind = new THREE.Group(); wind.position.x = -0.7; els.add(wind); for (let k = 0; k < 3; k++) { const tr = new THREE.Mesh(new THREE.TorusGeometry(0.18 + k * 0.1, 0.015, 6, 30, 4.5), G(0xd8f0ff, 1.4)); tr.rotation.z = k; wind.add(tr); }
  const wat = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 14), G(0x5ab8ff, 1.3)); els.add(wat);
  const fire = L.makeFire(); fire.position.set(0.7, -0.25, 0); fire.scale.setScalar(0.6); els.add(fire);
  const el1 = tag('vents\nAp 7, 1', 0.5, '#ffffff', 0.22); el1.position.set(-0.7, -0.55, 0); els.add(el1);
  const el2 = tag('eaux\nAp 16, 5', 0.5, '#5ab8ff', 0.22); el2.position.set(0, -0.55, 0); els.add(el2);
  const el3 = tag('feu\nAp 14, 18', 0.5, '#ffb070', 0.22); el3.position.set(0.7, -0.55, 0); els.add(el3);
  const words = new THREE.Group(); scene.add(words);
  const w1 = tag('QUI ES', 0.8, '#ffffff', 0.2); w1.position.set(0, 0.36, 0); words.add(w1);
  const w2 = tag('QUI ÉTAIS', 0.8, '#ffffff', 0.2); w2.position.set(0, 0.12, 0); words.add(w2);
  const w3 = tag('QUI VIENS', 0.8, '#ffd070', 0.2); w3.position.set(0, -0.12, 0); words.add(w3);
  const strike = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.025), new THREE.MeshBasicMaterial({ color: 0xff3a3a, depthTest: false, transparent: true })); strike.renderOrder = 10; strike.position.set(0, -0.12, 0.01); words.add(strike);
  const ppl = villagers(scene, 4, 1.2, -1.2); const cups = ppl.map(h => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.035, 0.1, 10), M(0x9a6a3a)); c.position.set(0, -0.08, 0.05); h.hand.R.add(c); const l = new THREE.Mesh(new THREE.CircleGeometry(0.045, 12), new THREE.MeshBasicMaterial({ color: 0x8a0a0a })); l.rotation.x = -Math.PI / 2; l.position.y = 0.045; c.add(l); return c; });
  const K = cardsMgr(scene, cam); refCard(K);
  K('Apocalypse 1, 8 : « qui est, qui était, et qui vient »', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.viens + 0.3, C.verset6, 0.3, 0.2), -0.6);
  K('Ils ont versé le sang → ils boivent du sang', { w: 1.6, h: 0.24, border: '#ff3a3a' }, t => win(t, C.mesure + 0.2, SC.autel.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.ange.start; rv.set(1, 1, t);
      an.pose({ aL: [1.2, 0.9], aR: [1.2, 0.9], eL: 0.3, eR: 0.3, hp: -0.1 }); an.face(t < C.elements ? env('voix', t) * 0 : 0, 'serious', t); an.root.position.y = 0.36 + 0.06 * Math.sin(t * 1.2); halo.material.opacity = 0.7 + 0.2 * Math.sin(t * 2);
      const pk = t > C.verset6 - 0.2;
      ppl.forEach((h, i) => { h.root.visible = pk; h.pose({ aR: [1.6, 0.2], eR: 1.6, aL: [0.4, 0.2], hp: 0.1 }); h.face(0, 'sad', t); });
      camKeys(cam, t, [{ t: T0, p: [0, 1.4, 1.5], l: [0, 2.8, -6], f: 56 }, { t: C.elements, p: [0, 2.0, 2.0], l: [0, 3.0, -6], f: 56 }, { t: C.verset6 - 0.3, p: [0, 2.0, 2.4], l: [0, 3.0, -6], f: 56 }, { t: C.verset6, p: [0.2, 1.5, 4.4], l: [0, 1.2, 0.6], f: 52 }, { t: SC.autel.start, p: [0.2, 1.6, 4.8], l: [0, 1.2, 0.6], f: 52 }]);
      const f = (x, y, z = -2.4) => cam.position.clone().add(new THREE.Vector3(x, y, z).applyQuaternion(cam.quaternion));
      fade(els, win(t, C.elements + 0.3, C.viens, 0.5, 0.3)); els.position.copy(f(0, -0.5)); els.scale.setScalar(0.8); els.quaternion.copy(cam.quaternion); wind.rotation.z = t * 2;
      const wk = win(t, C.viens + 0.3, C.verset6, 0.4, 0.3); fade(words, wk); words.position.copy(f(0, -0.45)); words.quaternion.copy(cam.quaternion); strike.scale.x = Math.max(0.01, sstep(C.viens + 5.5, C.viens + 6.3, t)); w3.material.opacity = wk * (1 - 0.6 * sstep(C.viens + 5.5, C.viens + 6.3, t));
      K.update(t);
    }
  };
};

// ---------- l'autel parle ; les ames sous l'autel ; la reponse
SETS.autel = () => {
  const B = goldHeaven(); const { scene, cam } = B;
  const altar = new THREE.Group(); altar.position.set(0, 0, -4); scene.add(altar);
  const gold = M(0xe0b040, { metalness: 0.75, roughness: 0.3 });
  altar.add(at(box(2.0, 1.2, 1.4, gold), 0, 0.6, 0)); altar.add(at(box(2.2, 0.12, 1.6, gold), 0, 1.26, 0)); altar.add(at(box(2.2, 0.12, 1.6, gold), 0, 0.06, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const h = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 8), gold); h.position.set(sx * 0.98, 1.48, sz * 0.68); altar.add(h); }
  const fireG = softGlow(2.4, 0xffc070); fireG.position.set(0, 1.7, 0); altar.add(fireG);
  const souls = Array.from({ length: 6 }, (_, i) => { const h = new Human({ holo: 0xffffff, robeL: 0.85, seed: 5810 + i }); h.root.scale.setScalar(0.55); h.place(-1.25 + i * 0.5, 0, -2.9 + (i % 2) * 0.25, 0); h.pose(L.kneelPose({ aL: [2.6, 0.3], aR: [2.6, 0.3] })); scene.add(h.root); return h; });
  const rays = softGlow(14, 0xfff0c0); rays.position.set(0, 4, -6); scene.add(rays);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Apocalypse 6, 9-11 : « Jusques à quand ? »', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.ames + 0.4, C.reponse, 0.3, 0.2), -0.6);
  K('Apocalypse 16, 7 : « tes jugements sont véritables et justes »', { w: 1.6, h: 0.32, border: '#ffd070' }, t => win(t, C.reponse + 0.4, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.autel.start, sk = win(t, C.ames + 0.3, SC.fin.start + 1, 0.8, 0.3), rk = sstep(C.reponse, C.reponse + 2, t);
      souls.forEach((h, i) => { fade(h.root, sk); h.pose(rk > 0.5 ? { aL: [2.9, 0.4], aR: [2.9, 0.4] } : L.kneelPose({ aL: [2.6, 0.3], aR: [2.6, 0.3], lean: 0.1 * Math.sin(t * 2 + i) })); });
      rays.material.opacity = 0.25 + 0.6 * rk; fireG.material.opacity = 0.7 + 0.25 * Math.sin(t * 5);
      camKeys(cam, t, [{ t: T0, p: [0, 2.6, 4.5], l: [0, 1.2, -4], f: 54 }, { t: C.ames, p: [0, 1.8, 2.8], l: [0, 0.9, -3.4], f: 54 }, { t: C.reponse, p: [0, 1.8, 2.6], l: [0, 1.0, -3.4], f: 54 }, { t: SC.fin.start, p: [0, 2.4, 4.0], l: [0, 2.0, -5], f: 56 }]);
      K.update(t);
    }
  };
};

// ---------- fin : la mer comme le sang d'un mort (prochain episode)
SETS.fin = () => {
  const B = base({ sky: [0x1a0c2a, 0xc86a5a, 0x5a2a4a], hemi: [0xffd8c8, 0x2a1a2a, 0.9], sun: [0xffc8a0, 1.0, [-6, 8, 4]], shadow: false, bloom: [0.45, 0.5, 0.86], exposure: 1.0, fog: [0x8a4a5a, 25, 120] }); const { scene, cam } = B; B.water = L.makeWater(200, 90, 0x1a3050, { emissive: 0x050a18 }); B.water.mesh.position.set(0, -0.2, -30); scene.add(B.water.mesh); const sset = softGlow(26, 0xffa070); sset.position.set(-14, 7, -80); scene.add(sset);
  const an = bowlAngel(2); an.root.scale.setScalar(2.6); an.place(-2, 8, -18, 0.3); scene.add(an.root); angelLight(scene, [-1, 12, -14]).intensity = 4;
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 16, 3', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 7.5, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start, r = sstep(T0 + 3, T0 + 7, t); B.water.update(t, 0.25);
      B.water.mesh.material.color.setRGB(lerp(0.1, 0.42, r), lerp(0.19, 0.03, r), lerp(0.31, 0.04, r)); B.water.mesh.material.emissive.setRGB(lerp(0.02, 0.12, r), lerp(0.04, 0, r), lerp(0.09, 0, r));
      an.pose({ aL: [lerp(1.3, 2.4, sstep(T0 + 1, T0 + 3, t)), 0.3], eL: 0.4 }); an.bowl.rotation.z = 1.4 * sstep(T0 + 1, T0 + 3, t); an.face(0, 'serious', t);
      camKeys(cam, t, [{ t: T0, p: [0, 3.0, 7], l: [0, 2, -20], f: 56 }, { t: TL.duration, p: [0, 2.6, 7.5], l: [0, 0.8, -12], f: 56 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : l'ange renverse sa coupe ; le fleuve moitie bleu, moitie rouge sang ; une source rouge jaillit du rocher
SETS.cover = () => {
  const B = duskValley({ exposure: 1.0 }); const { scene, cam } = B; const rv = river58(scene, 2.4, -25, 0, -18);
  const sp = spring(scene, -3.2, -7, 1.1);
  const an = bowlAngel(3); an.root.scale.setScalar(3); an.place(-4, 11, -26, 0.4); scene.add(an.root); angelLight(scene, [-3, 15, -22]).intensity = 4;
  const stream = pourStream(scene);
  return { ...B, update() { rv.set(0, 1, 0); sp.set(1); an.pose({ aL: [2.4, 0.3], eL: 0.4, aR: [0.4, 0.2] }); an.bowl.rotation.z = -1.6; an.face(0, 'serious', 2); aimStream(an, stream, 1); cam.position.set(0.5, 5.0, 6.5); cam.fov = 64; cam.updateProjectionMatrix(); cam.lookAt(-0.8, 3.2, -24); cam.userData.focus = 14; } };
};

const SHOTS = [['intro', 0, SC.fleuves.start], ['fleuves', SC.fleuves.start, SC.egypte.start], ['egypte', SC.egypte.start, SC.ange.start], ['ange', SC.ange.start, SC.autel.start], ['autel', SC.autel.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
