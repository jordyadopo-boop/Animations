
// ================= episode 51 (version 3D) : Elle est tombee, Babylone la grande (Apocalypse 18, 1-8)
function holoify(obj, color, op = 0.45) { obj.traverse(m => { if (m.isMesh) m.material = holoMat(color, op); }); return obj; }
function bigWord(text, w, h, color = '#ff5a3a') {
  const c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * h / w); const g = c.getContext('2d'); g.textAlign = 'center'; g.textBaseline = 'middle';
  let fs = 170; g.font = `900 ${fs}px Inter`; const mw = g.measureText(text).width; if (mw > 960) { fs = fs * 960 / mw; g.font = `900 ${fs}px Inter`; }
  g.lineWidth = 18 * fs / 170; g.strokeStyle = '#1a1010'; g.strokeText(text, 512, c.height / 2); g.fillStyle = color; g.fillText(text, 512, c.height / 2);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: canvasTex(c), transparent: true, depthWrite: false, depthTest: false, toneMapped: false, fog: false, color: new THREE.Color(0.85, 0.85, 0.85) })); m.renderOrder = 16; return m;
}
// l'ange de lumiere qui descend et eclaire la terre
function lightAngel(scene, s = 5) { const an = angel(); an.root.scale.setScalar(s); scene.add(an.root); const halo = glowStar(5.2 * s, 0xfff4d0); scene.add(halo); return { an, halo }; }

// ---------- intro
SETS.intro = () => {
  const B = nightSea({ cityX: 0 }); const { scene, cam } = B; B.city.position.set(0, 0, -40);
  const A = lightAngel(scene, 4);
  rock(scene, 1.0, -0.2, 1.4, 1.1);
  const rig = claudeRig(scene, [1.1, 0.2, 1.4], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [0.9, 0.9, 2.8], 1.2);
  const back = label('◀ une scène avant', { w: 0.8, h: 0.12, color: '#ffd070', font: 'bold 80px Inter' }); rig.holoG.add(back);
  const hg = hourglass(); hg.scale.setScalar(0.22); rig.holoG.add(hg);
  const K = cardsMgr(scene, cam);
  K('un ange… et une ville qui va tomber', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, 1.0, C.serie - 0.3, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      B.water.update(t, 0.3); B.cityLight(1);
      const d = sstep(0, 8, t); A.an.place(0, lerp(30, 9, d), -30, 0); A.an.pose({ aL: [2.2, 0.6], aR: [2.2, 0.6] }); A.an.face(0, 'serious', t); A.halo.position.set(0, lerp(33, 13, d), -31);
      B.hemi.intensity = 0.75 + 0.5 * d;
      const bk = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, bk, t); fade(back, bk); fade(hg, bk); back.position.y = 0.42; back.lookAt(cam.position); hg.position.y = 0.15; hg.userData.set(0.6); hg.rotation.y = t; rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [0, 2.6, 8], l: [0, 10, -30], f: 58 }, { t: C.serie, p: [0.6, 2.4, 7.0], l: [0, 8, -30], f: 58 }, { t: C.serie + 0.9, p: [0.9, 0.95, 4.2], l: [0.6, 0.6, 0], f: 48 }, { t: C.title - 0.3, p: [0.9, 0.95, 4.2], l: [0.6, 0.6, 0], f: 48 }, { t: C.title + 0.8, p: [0, 2.6, 8.5], l: [0, 9, -30], f: 58 }, { t: SC.ange.start, p: [0, 2.6, 8.5], l: [0, 9, -30], f: 58 }]);
      K.update(t);
    }
  };
};

// ---------- l'ange : la terre eclairee de sa gloire
SETS.ange = () => {
  const B = nightSea({ cityX: 0, exposure: 1.1 }); const { scene, cam } = B; B.city.position.set(0, 0, -40);
  const A = lightAngel(scene, 5);
  const sun = glowStar(6, 0xffd24a); sun.position.set(-16, 26, -60); scene.add(sun);
  const K = cardsMgr(scene, cam); refCard(K);
  K('« la terre fut éclairée de sa gloire »', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, SC.ange.start + 0.6, C.gloire, 0.3, 0.2), -0.6);
  K('comme un second soleil', { w: 1.6, h: 0.24, border: '#ffd24a', color: '#ffe8a0' }, t => win(t, C.gloire + 0.5, SC.cri.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.ange.start, d = sstep(T0, T0 + 6, t); B.water.update(t, 0.3); B.cityLight(1);
      A.an.place(0, lerp(26, 3, d), -24, 0); A.an.pose({ aL: [lerp(0.4, 2.2, d), 0.6], aR: [lerp(0.4, 2.2, d), 0.6] }); A.an.face(0, 'serious', t);
      A.halo.position.set(0, lerp(29, 7, d), -25); A.halo.scale.setScalar(26 * (0.6 + 0.4 * d));
      B.hemi.intensity = 0.75 + 1.4 * d; B.sun.intensity = 0.8 + 1.2 * d; B.water.mesh.material.emissive.setRGB(0.02 + 0.2 * d, 0.04 + 0.18 * d, 0.08 + 0.12 * d);
      fade(sun, win(t, C.gloire + 0.5, SC.cri.start, 0.6, 0.3));
      camKeys(cam, t, [{ t: T0, p: [0, 2.4, 8], l: [0, 14, -24], f: 58 }, { t: SC.cri.start, p: [0, 2.0, 9], l: [0, 8, -24], f: 58 }]);
      K.update(t);
    }
  };
};

// ---------- le cri : « Elle est tombee ! » ; Isaie 21 ; Cyrus (539 av. J.-C.)
SETS.cri = () => {
  const B = nightSea({ cityX: 0, exposure: 1.1 }); const { scene, cam } = B; B.city.position.set(0, 0, -30);
  const A = lightAngel(scene, 4.5);
  const towers = B.city.children.filter(c => c.isMesh && c.geometry.type === 'BoxGeometry'); towers.forEach((c, i) => { c.userData.r0 = c.rotation.clone(); c.userData.p0 = c.position.clone(); });
  const w1 = bigWord('ELLE EST TOMBÉE,', 3.2, 0.7), w2 = bigWord('ELLE EST TOMBÉE !', 3.2, 0.7); scene.add(w1); scene.add(w2);
  // Isaie 21 : la sentinelle sur sa tour, le cavalier qui arrive (hologrammes)
  const isa = new THREE.Group(); isa.position.set(0, 0.2, 1.0); scene.add(isa); rock(scene, 0, -0.2, 1.0, 1.8);
  const tower = holo(new THREE.BoxGeometry(0.5, 1.6, 0.5), 0xffd070, 0.25); tower.position.set(-0.9, 0.8, 0); isa.add(tower);
  const watch = holoify(new Human({ holo: 0xffd070 }).root, 0xffd070); watch.scale.setScalar(0.5); watch.position.set(-0.9, 1.6, 0); isa.add(watch);
  const rider = holoify(smallRider(2), 0x9adfff, 0.4); rider.scale.setScalar(0.45); rider.rotation.y = -Math.PI / 2; isa.add(rider);
  // Cyrus : la muraille, le fleuve, les soldats
  const cyr = new THREE.Group(); cyr.position.set(0, 0.2, 1.0); scene.add(cyr);
  for (const s of [-1, 1]) { const w = holo(new THREE.BoxGeometry(1.2, 0.8, 0.3), 0xc8a070, 0.25); w.position.set(s * 0.95, 0.4, -0.4); cyr.add(w); }
  const river = holo(new THREE.BoxGeometry(0.7, 0.02, 2.4), 0x5ac8ff, 0.4); river.position.set(0, 0.01, 0); cyr.add(river);
  const sold = [0, 1, 2, 3].map(i => { const h = new Human({ holo: 0xff9a5a }); h.root.scale.setScalar(0.28); cyr.add(h.root); return h; });
  const party = [0, 1, 2].map(i => { const h = new Human({ holo: 0xffd070 }); h.root.scale.setScalar(0.22); h.place(-1.3 + i * 0.35 + (i > 1 ? 1.6 : 0), 0.8, -0.4, 0); h.root.scale.setScalar(0.22); cyr.add(h.root); return h; });
  const K = cardsMgr(scene, cam); refCard(K);
  K('Isaïe 21, 9 : « Elle est tombée, elle est tombée, Babylone ! »', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.isaie + 0.3, C.cyrus, 0.3, 0.2), -0.6);
  K('539 av. J.-C. : Cyrus entre par le lit du fleuve (Hérodote)', { w: 1.6, h: 0.28, border: '#ff9a5a' }, t => win(t, C.cyrus + 0.3, SC.oiseaux.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.cri.start, hit = T0 + 2.6; B.water.update(t, 0.3); B.cityLight(1 - sstep(hit, hit + 3, t) * 0.8);
      A.an.place(0, 4, -20, 0); A.an.pose({ aL: [2.8, 0.4], aR: [2.8, 0.4], hp: -0.2 }); A.an.face(0.8, 'awe', t); A.halo.position.set(0, 8, -21); A.halo.scale.setScalar(20);
      const fall = sstep(hit, hit + 4, t); towers.forEach((c, i) => { const s = (hash(i * 3) - 0.5) > 0 ? 1 : -1, f = clamp(fall * 1.5 - hash(i * 7) * 0.5, 0, 1); c.rotation.z = c.userData.r0.z + s * f * 1.3; c.position.y = c.userData.p0.y - f * 2; });
      const ik = win(t, C.isaie + 0.3, C.cyrus, 0.5, 0.4); fade(isa, ik); const u = sstep(C.isaie + 0.5, C.isaie + 7, t); rider.position.set(lerp(1.6, 0, u), 0, 0.2); rider.userData.gallop(t * 6, 0.6); watch.children.length;
      const ck = win(t, C.cyrus + 0.3, SC.oiseaux.start, 0.5, 0.4); fade(cyr, ck);
      sold.forEach((h, i) => { const ph = ((t - C.cyrus) * 0.15 + i / 4) % 1; h.place(0.12 * (i % 2 ? 1 : -1), 0.02, 1.1 - ph * 2.2, Math.PI); h.pose(L.walkPose(t * 7 + i)); });
      party.forEach((h, i) => h.pose({ aL: [2.6, 0.3], aR: [2.6 + 0.3 * Math.sin(t * 8 + i), 0.3] }));
      camKeys(cam, t, [{ t: T0, p: [0, 2.6, 8], l: [0, 5, -24], f: 58 }, { t: C.isaie, p: [0, 2.6, 8], l: [0, 5, -24], f: 58 }, { t: C.isaie + 0.8, p: [0.2, 2.2, 5.8], l: [0, 0.9, 0.8], f: 52 }, { t: SC.oiseaux.start, p: [0.2, 2.3, 5.6], l: [0, 0.8, 0.8], f: 52 }]);
      [w1, w2].forEach((w, i) => { const k = sstep(hit + i * 0.9, hit + i * 0.9 + 0.25, t) * (1 - sstep(C.isaie - 0.4, C.isaie, t)); fade(w, k); camCard(cam, w, 0.9, -0.05 - i * 0.2); w.scale.setScalar(1 + 0.6 * (1 - sstep(hit + i * 0.9, hit + i * 0.9 + 0.25, t))); });
      K.update(t);
    }
  };
};

// ---------- les ruines : demons, oiseaux impurs ; Isaie 13 (hiboux et chacals)
SETS.oiseaux = () => {
  const B = nightSea({ cityX: 0, exposure: 1.05 }); const { scene, cam } = B; B.city.position.set(0, 0, -14); B.cityLight(0);
  B.city.children.forEach((c, i) => { if (c.isMesh && c.geometry.type === 'BoxGeometry') { c.rotation.z = (hash(i) - 0.5) * 1.6; c.position.y *= 0.4; } });
  const ground_ = box(40, 0.4, 30, M(0x2a2420)); ground_.position.set(0, -0.1, -10); scene.add(ground_);
  const birds = []; for (let i = 0; i < 16; i++) { const b = L.makeBird(0x1a161e, 1.4); scene.add(b); birds.push(b); }
  const shades = []; for (let i = 0; i < 5; i++) { const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), M(0x0a080c)); body.scale.y = 1.6; g.add(body); for (const s of [-1, 1]) g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), G(0xffd040, 2)), s * 0.17, 0.35, 0.42)); g.position.set(-4 + i * 2, 0.8, -8 - (i % 2) * 2); scene.add(g); shades.push(g); }
  const owls = [0, 1, 2].map(i => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), M(0x7a5a3a))); for (const s of [-1, 1]) { g.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.12, 14), M(0xfff4de)), s * 0.13, 0.12, 0.33)); g.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.05, 10), M(0x111111)), s * 0.13, 0.12, 0.34)); } g.position.set(-2.5 + i * 2.5, 1.8 + (i % 2) * 0.8, -6); scene.add(g); return g; });
  const jackals = [0, 1].map(i => { const a = L.makeAnimal('lion'); a.traverse(m => { if (m.isMesh) m.material = M(0x8a7a5a); }); a.scale.setScalar(0.9); a.position.set(-1.6 + i * 3, 0.1, -3 - i); a.rotation.y = i ? -0.6 : 0.6; scene.add(a); return a; });
  const K = cardsMgr(scene, cam); refCard(K);
  K('« un repaire de tout esprit impur, et de tout oiseau impur »', { w: 1.6, h: 0.28, border: '#9a8aff' }, t => win(t, SC.oiseaux.start + 0.6, C.ruines, 0.3, 0.2), -0.6);
  K('Isaïe 13, 21-22 : hiboux dans les maisons, chacals dans les palais', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.ruines + 0.3, SC.sortez.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.oiseaux.start; B.water.update(t, 0.3);
      birds.forEach((b, i) => { const a = t * 0.6 + i / 16 * Math.PI * 2; b.position.set(Math.cos(a) * (3 + i % 4), 3 + (i % 5) * 0.6, -8 + Math.sin(a) * 3); b.rotation.y = -a; b.userData.flap(t, 1); });
      shades.forEach((g, i) => { fade(g, sstep(T0 + 0.5 + i * 0.4, T0 + 1.3 + i * 0.4, t)); g.position.y = 0.8 + 0.1 * Math.sin(t * 2 + i); });
      const ok = sstep(C.ruines, C.ruines + 0.8, t); owls.forEach((o, i) => { fade(o, ok); o.rotation.y = 0.4 * Math.sin(t + i); }); jackals.forEach((j, i) => { fade(j, ok); j.userData.walk(t * 3 + i); });
      camKeys(cam, t, [{ t: T0, p: [0, 3.0, 6], l: [0, 2, -10], f: 56 }, { t: SC.sortez.start, p: [0.5, 2.2, 3.5], l: [0, 1.4, -6], f: 54 }]);
      K.update(t);
    }
  };
};

// ---------- « Sortez du milieu d'elle, mon peuple » ; Jeremie 51 ; Babel
SETS.sortez = () => {
  const B = nightSea({ cityX: 0, exposure: 1.1 }); const { scene, cam } = B; B.city.position.set(0, 0, -22); B.cityLight(0.8);
  const ground_ = box(40, 0.4, 40, M(0x4a3a2a)); ground_.position.set(0, -0.1, -8); scene.add(ground_);
  const gate = new THREE.Group(); gate.position.set(0, 0, -10); scene.add(gate);
  for (const s of [-1, 1]) gate.add(at(box(3, 4, 1.2, M(0x9a6a3e)), s * 2.4, 2, 0)); gate.add(at(box(7.8, 1.2, 1.2, M(0x9a6a3e)), 0, 4.6, 0));
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(4, 40), new THREE.MeshBasicMaterial({ color: 0xffe8a0, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); beam.position.set(0, 20, -5); scene.add(beam);
  const ppl = Array.from({ length: 12 }, (_, i) => { const h = citizen(i + 20); scene.add(h.root); return h; });
  const babel = new THREE.Group(); babel.position.set(0, 0.2, 1.4); scene.add(babel); rock(scene, 0, -0.2, 1.4, 1.6);
  const levels = []; for (let i = 0; i < 9; i++) { const l = holo(new THREE.CylinderGeometry(0.55 - i * 0.05, 0.6 - i * 0.05, 0.26, 12), 0xffd070, 0.25); l.position.y = 0.13 + i * 0.27; babel.add(l); levels.push(l); }
  const K = cardsMgr(scene, cam); refCard(K);
  K('« Sortez du milieu d\'elle, mon peuple ! »', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, SC.sortez.start + 1, C.jeremie, 0.3, 0.2), -0.6);
  K('Jérémie 51, 45 : l\'appel aux Juifs exilés à Babylone', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.jeremie + 0.3, C.babel, 0.3, 0.2), -0.6);
  K('Genèse 11 : la tour de Babel, « dont le sommet touche au ciel »', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.babel + 0.5, SC.reine.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.sortez.start;
      ppl.forEach((h, i) => { const ph = ((t - T0) * 0.07 + hash(i * 3)) % 1; h.place((hash(i * 5) - 0.5) * 3.2 + (hash(i) - 0.5) * ph * 3, 0.1, -10 + ph * 13, 0); h.pose(L.walkPose(t * 8 + i, 1.2, { lean: 0.15 })); h.face(0, 'fear', t); });
      const bk = win(t, C.babel + 0.2, SC.reine.start, 0.4, 0.3); fade(babel, bk); levels.forEach((l, i) => l.visible = bk > 0.01 && sstep(C.babel + 0.3 + i * 0.35, C.babel + 0.5 + i * 0.35, t) > 0.5);
      camKeys(cam, t, [{ t: T0, p: [0, 1.8, 5.5], l: [0, 1.6, -10], f: 56 }, { t: C.babel, p: [0, 1.9, 5.0], l: [0, 1.6, -10], f: 56 }, { t: C.babel + 0.8, p: [0, 2.0, 5.6], l: [0, 1.6, 1.4], f: 52 }, { t: SC.reine.start, p: [0, 2.2, 5.8], l: [0, 1.8, 1.4], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- la reine : « Je suis assise en reine » ; la mort, le deuil, la famine ; le feu
SETS.reine = () => {
  const B = nightSea({ cityX: 0 }); const { scene, cam } = B; const burn = burningCity(B, { z: -30 });
  const hall = box(10, 0.3, 8, M(0x3a2030)); hall.position.set(0, -0.1, -1); scene.add(hall);
  const th = new THREE.Group(); th.position.set(0, 0, -1.6); scene.add(th);
  th.add(at(box(1.4, 0.5, 1.0, M(0x8a2a3a)), 0, 0.45, 0)); th.add(at(box(1.4, 2.0, 0.25, M(0x8a2a3a)), 0, 1.4, -0.45)); th.add(at(box(1.6, 0.12, 1.1, G(0xffcc55, 1.1)), 0, 0.72, 0));
  const q = new Human({ skin: 0xe0b890, hair: 0x1a1210, hairStyle: 'long', top: 0x6a1a3a, bottom: 0x5a1a2a, robe: 0x6a1a3a, robeL: 0.85, hat: 'crown', seed: 5100 }); q.place(0, 0.3, -1.4, 0); scene.add(q.root);
  faceLight(scene, [0.4, 2.2, 1.2], 2.4, 0xffd0a0);
  const words = ['LA MORT', 'LE DEUIL', 'LA FAMINE'].map((w, i) => { const m = bigWord(w, 2.4, 0.5, i === 1 ? '#ffffff' : '#ff5a3a'); scene.add(m); return m; });
  const K = cardsMgr(scene, cam); refCard(K);
  K('« Je suis assise en reine, je ne suis point veuve ! »', { w: 1.6, h: 0.28, border: '#ffcc55' }, t => win(t, SC.reine.start + 3, C.orgueil - 4.6, 0.3, 0.2), -0.6);
  K('« en un même jour » : le feu de l\'épisode 50', { w: 1.6, h: 0.24, border: '#ff6a2a' }, t => win(t, C.orgueil + 6, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.reine.start, fire = sstep(C.orgueil + 5.5, C.orgueil + 7, t); B.water.update(t, 0.3); burn(t, fire);
      q.pose(L.sitPose(0.62, { aL: [0.5, 0.3], aR: [0.9, 0.3], hp: fire > 0.3 ? 0.1 : -0.25 })); q.face(env('voix', t), fire > 0.3 ? 'fear' : 'happy', t);
      camKeys(cam, t, [{ t: T0, p: [0, 1.6, 3.6], l: [0, 1.3, -1.4], f: 50 }, { t: C.orgueil, p: [0, 1.7, 4.2], l: [0, 1.4, -1.4], f: 52 }, { t: C.orgueil + 5.5, p: [0, 2.4, 6.5], l: [0, 3, -30], f: 56 }, { t: SC.fin.start, p: [0, 2.6, 7.0], l: [0, 3.5, -30], f: 56 }]);
      words.forEach((w, i) => { const k = sstep(C.orgueil - 4.5 + i * 0.7, C.orgueil - 4.25 + i * 0.7, t) * (1 - sstep(C.orgueil + 5, C.orgueil + 5.3, t)); fade(w, k); camCard(cam, w, 0.62, -0.18 - i * 0.17); });
      K.update(t);
    }
  };
};

// ---------- fin : la femme sur la bete aux sept tetes (prochain episode)
SETS.fin = () => {
  const B = nightSet({ exposure: 1.1 }); const { scene, cam } = B;
  const dr = dragon(); dr.scale.setScalar(1.3); dr.position.set(0, 0, -1.5); scene.add(dr);
  const w = new Human({ skin: 0xe0b890, hair: 0x1a1210, hairStyle: 'long', top: 0x7a1a4a, bottom: 0x6a1a3a, robe: 0x7a1a4a, robeL: 0.7, hat: 'crown', seed: 5200 }); w.place(0, 2.05, -1.2, 0); w.pose(L.sitPose(0.3, { lL: 1.2, lR: 1.2, kL: 1.2, kR: 1.2, lsL: 0.5, lsR: 0.5 })); scene.add(w.root);
  faceLight(scene, [0, 3.2, 1.0], 2.6, 0xffd0a0);
  const an = angel(); an.place(-1.3, 0, 2.4, 0.6); scene.add(an.root); const j = john(); j.place(-0.6, 0, 2.8, 0.4); scene.add(j.root); faceLight(scene, [-1.2, 1.6, 3.2], 1.4);
  const q = bigWord('?', 0.6, 0.6, '#f2b84b'); q.position.set(1.4, 3.2, -1); scene.add(q);
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 17, 7-18', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 7, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start; dr.userData.tick(t); w.face(0, 'happy', t); an.pose({ aR: [1.6, 0.2] }); an.face(0, 'serious', t); j.pose({ hp: -0.2 }); j.face(0, 'awe', t);
      fade(q, sstep(T0 + 4, T0 + 4.4, t)); q.lookAt(cam.position);
      camKeys(cam, t, [{ t: T0, p: [0.6, 3.0, 8.5], l: [0, 2.4, -1.5], f: 54 }, { t: TL.duration, p: [0.2, 3.2, 9.5], l: [0, 2.6, -1.5], f: 54 }]);
      K.update(t);
    }
  };
};

// ---------- couverture
SETS.cover = () => {
  const B = nightSea({ cityX: 0, exposure: 1.1 }); const { scene, cam } = B; B.city.position.set(0, 0, -30);
  const A = lightAngel(scene, 4.5);
  return { ...B, update() { B.water.update(3, 0.3); B.cityLight(1); A.an.place(0, 4, -20, 0); A.an.pose({ aL: [2.8, 0.4], aR: [2.8, 0.4], hp: -0.2 }); A.an.face(0.8, 'awe', 3); A.halo.position.set(0, 8, -21); A.halo.scale.setScalar(20); B.hemi.intensity = 1.6; cam.position.set(0, 1.2, 6); cam.fov = 62; cam.updateProjectionMatrix(); cam.lookAt(0, 6.5, -20); } };
};

const SHOTS = [['intro', 0, SC.ange.start], ['ange', SC.ange.start, SC.cri.start], ['cri', SC.cri.start, SC.oiseaux.start], ['oiseaux', SC.oiseaux.start, SC.sortez.start], ['sortez', SC.sortez.start, SC.reine.start], ['reine', SC.reine.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
