
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

// ---------- intro
SETS.intro = () => {
  const B = desert(); const { scene, cam } = B; const rv = riverBed(scene, -25);
  const T = trio(scene, -6); faceLight(scene, [0, 3.5, -2], 2.6, 0xc0ffc0);
  const fr = [0, 1, 2].map(() => { const f = frogSpirit(); scene.add(f); return f; });
  rock(scene, 1.4, -0.3, 3.2, 1.0);
  const rig = claudeRig(scene, [1.5, 0.15, 3.2], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [1.3, 0.9, 4.6], 1.2);
  const back = label('◀ une scène avant', { w: 0.8, h: 0.12, color: '#ffd070', font: 'bold 80px Inter' }); rig.holoG.add(back);
  const three = label('VILLE EN 3 MORCEAUX', { w: 0.9, h: 0.12, color: '#ff8a5a', font: 'bold 80px Inter' }); rig.holoG.add(three);
  const K = cardsMgr(scene, cam);
  K('un fleuve à sec… trois esprits… Harmaguédon', { w: 1.6, h: 0.24, border: '#5aff6a' }, t => win(t, 1.0, C.serie - 0.3, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      rv.set(sstep(0.5, 5, t)); T.dr.userData.tick(t); T.bt.userData.tick(t + 1); T.fp.face(0, 'serious', t); T.fp.pose({ aL: [0.6, 0.3], aR: [0.6, 0.3] });
      const src = [mouthOf(T.dr, 'd'), mouthOf(T.fp.root.parent ? T.fp : T.fp, 'fp'), mouthOf(T.bt, 'b')];
      fr.forEach((f, i) => { const u = sstep(3 + i * 0.5, 8 + i * 0.5, t); f.visible = u > 0.01; f.position.lerpVectors(src[i], new THREE.Vector3((i - 1) * 1.4, 0.5, 1.2), u); f.position.y += Math.abs(Math.sin(u * Math.PI * 3)) * 0.7 * (1 - u * 0.5); f.scale.setScalar(0.4 + 0.6 * u); });
      const bk = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, bk, t); fade(back, bk); fade(three, bk); back.position.y = 0.45; three.position.y = 0.25; back.lookAt(cam.position); three.lookAt(cam.position); rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [0, 3.0, 9], l: [0, 1.8, -6], f: 56 }, { t: C.serie, p: [0.4, 2.6, 7.5], l: [0, 1.6, -4], f: 56 }, { t: C.serie + 0.9, p: [1.3, 0.95, 6.0], l: [1.1, 0.6, 1.6], f: 48 }, { t: C.title - 0.3, p: [1.3, 0.95, 6.0], l: [1.1, 0.6, 1.6], f: 48 }, { t: C.title + 0.8, p: [0, 3.0, 9.5], l: [0, 1.8, -6], f: 56 }, { t: SC.fleuve.start, p: [0, 3.0, 9.5], l: [0, 1.8, -6], f: 56 }]);
      K.update(t);
    }
  };
};

// ---------- l'Euphrate tarit ; les Parthes ; Cyrus
SETS.fleuve = () => {
  const B = desert(); const { scene, cam } = B; const rv = riverBed(scene, -25);
  const an = bowlAngel(5); an.root.scale.setScalar(3); an.place(-2, 9, -22, 0.3); scene.add(an.root); angelLight(scene, [-1, 14, -18]).intensity = 5;
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.9, 16, 10), new THREE.MeshBasicMaterial({ color: 0xff8a3a, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(stream);
  const riders = Array.from({ length: 8 }, (_, i) => { const r = holoify(smallRider(i), 0xffb05a, 0.45); r.scale.setScalar(0.9); r.rotation.y = Math.PI / 2; scene.add(r); return r; });
  const lR = label('EMPIRE ROMAIN', { w: 2.2, h: 0.36, color: '#ff8a8a', font: 'bold 110px Inter' }); lR.position.set(-2.6, 2.2, -9); scene.add(lR);
  const lP = label('PARTHES', { w: 2.0, h: 0.4, color: '#ffd070', font: 'bold 110px Inter' }); lP.position.set(2.6, 2.2, -9); scene.add(lP);
  const sold = Array.from({ length: 6 }, () => { const h = new Human({ holo: 0x9adfff }); h.root.scale.setScalar(0.9); scene.add(h.root); return h; });
  const K = cardsMgr(scene, cam); refCard(K);
  K('l\'Euphrate : la frontière de l\'Empire romain', { w: 1.6, h: 0.24, border: '#ff8a8a' }, t => win(t, C.parthes + 0.3, C.parthes + 5, 0.3, 0.2), -0.6);
  K('au-delà : les Parthes, cavaliers redoutés', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.parthes + 5.2, C.cyrus, 0.3, 0.2), -0.6);
  K('Cyrus prend Babylone par le lit du fleuve (épisode 51)', { w: 1.6, h: 0.28, border: '#9adfff' }, t => win(t, C.cyrus + 0.3, SC.grenouilles.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fleuve.start, pour = win(t, T0 + 1, C.parthes, 0.8, 0.5); rv.set(sstep(T0 + 3, T0 + 9, t));
      an.pose({ aL: [lerp(1.3, 2.4, pour), 0.3], eL: 0.4 }); an.bowl.rotation.z = 1.4 * pour; an.face(0, 'serious', t);
      an.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); an.bowl.getWorldPosition(hp); stream.position.set(hp.x + 1, hp.y - 7.5, hp.z); stream.rotation.z = 0.15; stream.visible = pour > 0.05; stream.material.opacity = 0.55 * pour;
      const pk = win(t, C.parthes + 4, C.cyrus, 0.6, 0.4); riders.forEach((r, i) => { fade(r, pk); r.position.set(lerp(8, -3, sstep(C.parthes + 4.5, C.cyrus, t)) + (i % 4) * 0.9, 0.35, -10 - Math.floor(i / 4) * 2); r.userData.gallop(t * 7 + i, 0.6); });
      fade(lR, win(t, C.parthes + 0.3, C.cyrus, 0.5, 0.4)); fade(lP, win(t, C.parthes + 2, C.cyrus, 0.5, 0.4)); [lR, lP].forEach(l => l.lookAt(cam.position));
      const ck = win(t, C.cyrus + 0.5, SC.grenouilles.start, 0.5, 0.3); sold.forEach((h, i) => { fade(h.root, ck); const ph = ((t - C.cyrus) * 0.12 + i / 6) % 1; h.place((i % 2 ? 0.8 : -0.8), 0.35, -20 + ph * 16, 0); h.pose(L.walkPose(t * 7 + i)); });
      camKeys(cam, t, [{ t: T0, p: [0, 3.0, 8], l: [-1, 6, -22], f: 58 }, { t: C.parthes, p: [0, 5.5, 8], l: [0, 0.5, -14], f: 58 }, { t: SC.grenouilles.start, p: [0, 5.5, 8], l: [0, 0.5, -14], f: 58 }]);
      K.update(t);
    }
  };
};

// ---------- les trois esprits-grenouilles sortent des trois bouches ; Exode 8
SETS.grenouilles = () => {
  const B = desert(); const { scene, cam } = B; const rv = riverBed(scene, -25); rv.set(1);
  const T = trio(scene, -4); faceLight(scene, [0, 3.2, 0], 2.8, 0xc0ffc0);
  const fr = [0, 1, 2].map(() => { const f = frogSpirit(); scene.add(f); return f; });
  const names = ['DU DRAGON', 'DU FAUX PROPHÈTE', 'DE LA BÊTE'].map(n => { const l = card(n, { w: 0.9, h: 0.15, border: '#5aff6a', color: '#c8ffc8' }); scene.add(l); return l; });
  const small = []; for (let i = 0; i < 30; i++) { const f = frogSpirit(); f.scale.setScalar(0.35); scene.add(f); small.push(f); }
  const pyr = holo(new THREE.ConeGeometry(2.2, 2.2, 4), 0xffd070, 0.18); pyr.position.set(0, 1.4, -8); scene.add(pyr);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Exode 8 : la 2e plaie d\'Égypte, des grenouilles partout', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.egypte + 0.3, C.egypte + 7, 0.3, 0.2), -0.6);
  K('des paroles trompeuses qui entraînent les rois à la guerre', { w: 1.6, h: 0.28, border: '#5aff6a' }, t => win(t, C.egypte + 7.2, SC.voleur.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.grenouilles.start; T.dr.userData.tick(t); T.bt.userData.tick(t + 1); T.fp.face(0.4 * Math.max(0, Math.sin(t * 7)), 'serious', t); T.fp.pose({ aL: [1.0, 0.4], aR: [1.0, 0.4], eL: 0.5, eR: 0.5 });
      const src = [mouthOf(T.dr, 'd'), mouthOf(T.fp, 'fp'), mouthOf(T.bt, 'b')];
      const ek = 1 - win(t, C.egypte, SC.voleur.start, 0.4, 0.4) * 0.0;
      fr.forEach((f, i) => { const a = T0 + 4 + i * 2.2, u = sstep(a, a + 3, t); f.visible = u > 0.01; f.position.lerpVectors(src[i], new THREE.Vector3((i - 1) * 1.3, 0.55, 2.0), u); f.position.y += Math.abs(Math.sin(u * Math.PI * 3)) * 0.6; f.scale.setScalar(0.35 + 0.65 * u); f.rotation.y = Math.sin(t * 2 + i) * 0.3; });
      camKeys(cam, t, [{ t: T0, p: [0, 3.0, 9], l: [0, 2.0, -4], f: 56 }, { t: T0 + 4, p: [0, 2.4, 7.0], l: [0, 1.8, -2], f: 54 }, { t: C.egypte, p: [0, 3.2, 9.5], l: [0, 1.6, -4], f: 56 }, { t: SC.voleur.start, p: [0, 3.2, 9.5], l: [0, 1.6, -4], f: 56 }]);
      names.forEach((l, i) => { const a = T0 + 4 + i * 2.2; fade(l, win(t, a + 0.3, C.egypte, 0.3, 0.3)); camCard(cam, l, 0.36, 0.22 - i * 0.11); l.position.addScaledVector(new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), (i - 1) * 0.55); });
      const sk = win(t, C.egypte + 0.5, C.egypte + 7, 0.5, 0.4); fade(pyr, sk);
      small.forEach((f, i) => { f.visible = sk > 0.02; const ph = (t * 0.4 + hash(i)) % 1; f.position.set((hash(i * 3) - 0.5) * 10, 0.3 + Math.abs(Math.sin(ph * Math.PI * 2)) * 0.5, -6 + ph * 8); });
      K.update(t);
    }
  };
};

// ---------- « Je viens comme un voleur » ; Sardes prise par surprise
SETS.voleur = () => {
  const B = nightSet({ exposure: 1.1 }); const { scene, cam } = B;
  const hill = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 3.2, 1.6, 12), M(0x6a5a48)); hill.position.set(0, 0.8, -3); scene.add(hill);
  const wall = new THREE.Group(); wall.position.set(0, 1.6, -3); scene.add(wall); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; wall.add(at(box(0.9, 0.7, 0.3, M(0xb8a080)), Math.cos(a) * 1.8, 0.35, Math.sin(a) * 1.8)).children.at(-1).rotation.y = -a + Math.PI / 2; }
  wall.add(at(box(0.6, 1.4, 0.6, M(0xc8b090)), 0, 0.7, 0));
  const guard = new Human({ skin: 0xd09a70, hair: 0x2a1a10, top: 0x8a3a2a, bottom: 0x5a2a1a, robe: 0x8a3a2a, robeL: 0.7, hat: 'cap', hatColor: 0x8a8a90, seed: 5600 }); guard.place(0.8, 1.6, -1.4, 0.2); scene.add(guard.root);
  const climbers = [0, 1, 2].map(i => { const h = new Human({ skin: 0xc8946a, hair: 0x1a1210, top: 0x2a2a3a, bottom: 0x1a1a24, seed: 5610 + i }); scene.add(h.root); return h; });
  const flash = new THREE.PointLight(0xffffff, 0, 30, 1); flash.position.set(0, 6, 3); scene.add(flash);
  const K = cardsMgr(scene, cam); refCard(K);
  K('« Heureux celui qui veille »', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, SC.voleur.start + 4, C.sardes, 0.3, 0.2), -0.6);
  K('Matthieu 24, 43 · Apocalypse 3, 3 : « comme un voleur »', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.sardes + 0.3, C.sardes + 6, 0.3, 0.2), -0.6);
  K('Sardes, réputée imprenable, prise par surprise en 547 et en 214 av. J.-C.', { w: 1.6, h: 0.32, border: '#ff8a5a' }, t => win(t, C.sardes + 6.2, SC.harmaguedon.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.voleur.start; flash.intensity = 40 * L.flashK(t, [T0 + 0.4]);
      guard.pose(L.sitPose(0.46, { hp: 0.6, aL: [0.3, 0.3], aR: [0.3, 0.3] })); guard.face(0, 'neutral', t); guard.eyes.forEach(e => e.scale.y = 0.15);
      climbers.forEach((h, i) => { const u = sstep(C.sardes + 6 + i * 0.8, C.sardes + 12 + i * 0.8, t); h.place(-1.2 + i * 0.5, lerp(0, 1.6, u), lerp(-0.2, -1.4, u), Math.PI * 0.9 + 0.2); h.pose(u < 1 ? { aL: [2.6, 0.2], aR: [2.2, 0.2], lL: 0.6 * Math.sin(t * 6 + i), lR: -0.6 * Math.sin(t * 6 + i) } : {}); h.root.visible = t > C.sardes + 5; });
      camKeys(cam, t, [{ t: T0, p: [0, 2.6, 5.5], l: [0, 1.8, -2], f: 54 }, { t: C.sardes, p: [2.2, 2.4, 3.2], l: [0.4, 1.9, -1.4], f: 52 }, { t: C.sardes + 6, p: [-1.6, 2.2, 3.6], l: [-0.4, 1.4, -1.4], f: 54 }, { t: SC.harmaguedon.start, p: [-1.6, 2.4, 4.0], l: [-0.2, 1.6, -1.6], f: 54 }]);
      K.update(t);
    }
  };
};

// ---------- Harmaguedon : la colline de Meguiddo ; ses batailles
SETS.harmaguedon = () => {
  const B = desert(); const { scene, cam } = B;
  const tel = new THREE.Mesh(new THREE.CylinderGeometry(4, 7, 3, 16), M(0x8a7050)); tel.position.set(0, 1.0, -14); scene.add(tel);
  for (let i = 0; i < 6; i++) scene.add(at(box(1.2, 0.6, 1.2, M(0xb8a080)), (hash(i) - 0.5) * 5, 2.8, -14 + (hash(i * 3) - 0.5) * 4));
  const lab = label('HAR MEGUIDDO', { w: 3.2, h: 0.6, color: '#ffd070', font: 'bold 120px Inter' }); lab.position.set(0, 5.2, -14); scene.add(lab);
  const hosts = []; for (let k = 0; k < 4; k++) { const a = army(scene, 60, 0.2, 2.2, 0, 0, [0x3a2a2a, 0x2a3a4a, 0x4a3a2a, 0x2a2a3a][k]); hosts.push(a); }
  const eras = [['vers 1457 av. J.-C.', 'le pharaon Thoutmôsis III'], ['609 av. J.-C.', 'le roi Josias y meurt'], ['1918', 'un général britannique']].map(([a, b]) => { const c = card(a + '\n' + b, { w: 0.9, h: 0.26, border: '#ffd070', small: true }); scene.add(c); return c; });
  const K = cardsMgr(scene, cam); refCard(K);
  K('Har Meguiddo : « la montagne de Meguiddo », au nord d\'Israël', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.meguiddo + 0.3, C.batailles, 0.3, 0.2), -0.6);
  K('Armageddon : la bataille de la fin du monde', { w: 1.6, h: 0.24, border: '#ff5a3a' }, t => win(t, C.batailles + 10, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.harmaguedon.start, u = sstep(T0 + 0.5, SC.fin.start, t);
      hosts.forEach((a, k) => { const ang = k / 4 * Math.PI * 2 + 0.4, R = lerp(26, 9, u); a.forEach((g, i) => { g.position.set(Math.cos(ang) * R + Math.cos(g.userData.a) * g.userData.r * 2, 0.2, -14 + Math.sin(ang) * R * 0.7 + Math.sin(g.userData.a) * g.userData.r * 2); g.rotation.y = -ang - Math.PI / 2; }); });
      fade(lab, win(t, C.meguiddo, SC.fin.start, 0.5, 0.3)); lab.lookAt(cam.position);
      camKeys(cam, t, [{ t: T0, p: [0, 9, 14], l: [0, 1, -14], f: 56 }, { t: SC.fin.start, p: [0, 7, 10], l: [0, 2, -14], f: 56 }]);
      eras.forEach((c, i) => { fade(c, win(t, C.batailles + 0.5 + i * 3, C.batailles + 10, 0.3, 0.3)); camCard(cam, c, 0.5, 0.25 - i * 0.18); });
      K.update(t);
    }
  };
};

// ---------- fin : la cinquieme coupe, les tenebres sur le trone de la bete (prochain episode)
SETS.fin = () => {
  const B = nightSet({ exposure: 1.1 }); const { scene, cam } = B;
  const th = whiteThrone(0.9); th.traverse(m => { if (m.isMesh && m.material) { m.material = M(0x2a1a2a, { emissive: new THREE.Color(0x0a040a) }); } }); th.userData.glow.visible = false; th.position.set(0, 0, -3); scene.add(th);
  const bt = beast13(); bt.scale.setScalar(0.8); bt.position.set(0, 0.4, -4.5); scene.add(bt);
  const an = bowlAngel(4); an.root.scale.setScalar(2.2); an.place(-1.6, 2.6, -7, 0.3); scene.add(an.root); const al = angelLight(scene, [-1, 9, -3]); al.intensity = 4;
  const ppl = [0, 1, 2, 3].map(i => { const h = citizen(i + 40); h.place(-1.5 + i, 0, 0.6, 0); scene.add(h.root); return h; });
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 16, 10-11', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 9, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start, dark = sstep(T0 + 3, T0 + 7, t); bt.userData.tick(t);
      an.pose({ aL: [lerp(1.3, 2.4, sstep(T0 + 1, T0 + 3, t)), 0.3], eL: 0.4 }); an.bowl.rotation.z = 1.4 * sstep(T0 + 1, T0 + 3, t); an.face(0, 'serious', t);
      B.hemi.intensity = 0.6 * (1 - 0.85 * dark); if (B.sun) B.sun.intensity = 0.8 * (1 - 0.85 * dark); al.intensity = 4 * (1 - dark);
      ppl.forEach((h, i) => { h.pose(dark > 0.5 ? { aL: [2.4, 0.4], aR: [2.4, 0.4], eL: 1.8, eR: 1.8, lean: 0.4 } : {}); h.face(0, dark > 0.5 ? 'fear' : 'neutral', t); });
      camKeys(cam, t, [{ t: T0, p: [0, 2.2, 6], l: [0, 2.2, -3], f: 54 }, { t: TL.duration, p: [0, 2.0, 6.8], l: [0, 1.6, -3], f: 54 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : le lit asseche, les trois esprits-grenouilles sortent des trois bouches ; les armees au loin
SETS.cover = () => {
  const B = desert(); const { scene, cam } = B; const rv = riverBed(scene, -25); rv.set(1);
  const T = trio(scene, -4); faceLight(scene, [0, 3.2, 0], 3.0, 0xc0ffc0);
  const fr = [0, 1, 2].map(() => { const f = frogSpirit(); scene.add(f); return f; });
  const host = army(scene, 160, 2, 7, 0, -30, 0x2a2430);
  return { ...B, update() { T.dr.userData.tick(1.5); T.bt.userData.tick(2.5); T.fp.face(0.6, 'serious', 1); T.fp.pose({ aL: [1.0, 0.4], aR: [1.0, 0.4] }); const src = [mouthOf(T.dr, 'd'), mouthOf(T.fp, 'fp'), mouthOf(T.bt, 'b')]; fr.forEach((f, i) => { f.position.copy(src[i]).add(new THREE.Vector3(i === 1 ? 0.75 : (i - 1) * -0.3, i === 1 ? -0.9 : -0.3, 1.6)); f.scale.setScalar(0.75); }); cam.position.set(0, 2.6, 7.5); cam.fov = 60; cam.updateProjectionMatrix(); cam.lookAt(0, 2.6, -4); cam.userData.focus = 7; } };
};

const SHOTS = [['intro', 0, SC.fleuve.start], ['fleuve', SC.fleuve.start, SC.grenouilles.start], ['grenouilles', SC.grenouilles.start, SC.voleur.start], ['voleur', SC.voleur.start, SC.harmaguedon.start], ['harmaguedon', SC.harmaguedon.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
