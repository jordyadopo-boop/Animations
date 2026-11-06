
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

// ---------- intro : la reine sur la bete, dix rois a son service
SETS.intro = () => {
  const B = desert(); const { scene, cam } = B;
  const bw = beastWithWoman(scene); bw.position.set(0, 0, -2);
  const ks = ringKings(scene, 10, 3.6, 0, -2); faceLight(scene, [0, 3.4, 1.5], 2.6, 0xffd0a0);
  rock(scene, 1.4, -0.3, 3.2, 1.0);
  const rig = claudeRig(scene, [1.5, 0.15, 3.2], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [1.3, 0.9, 4.6], 1.2);
  const back = label('◀ une scène avant', { w: 0.8, h: 0.12, color: '#ffd070', font: 'bold 80px Inter' }); rig.holoG.add(back);
  const fallen = label('ELLE EST TOMBÉE !', { w: 0.8, h: 0.14, color: '#ff8a5a', font: 'bold 90px Inter' }); rig.holoG.add(fallen);
  const K = cardsMgr(scene, cam);
  K('dix rois la servent… puis la détruisent', { w: 1.6, h: 0.24, border: '#ff6a4a' }, t => win(t, 1.0, C.serie - 0.3, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      bw.userData.dr.userData.tick(t); bw.userData.w.face(0, 'happy', t);
      ks.forEach((k, i) => { k.pose(L.kneelPose({ lean: 0.3, aR: [0.3, 0.2] })); k.face(0, 'neutral', t); });
      const bk = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, bk, t); fade(back, bk); fade(fallen, bk); back.position.y = 0.45; fallen.position.y = 0.22; back.lookAt(cam.position); fallen.lookAt(cam.position); rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [0, 3.2, 8.5], l: [0, 1.8, -2], f: 56 }, { t: C.serie, p: [0.6, 3.0, 7.5], l: [0, 1.8, -2], f: 56 }, { t: C.serie + 0.9, p: [1.3, 0.95, 6.0], l: [1.1, 0.6, 1.6], f: 48 }, { t: C.title - 0.3, p: [1.3, 0.95, 6.0], l: [1.1, 0.6, 1.6], f: 48 }, { t: C.title + 0.8, p: [0, 3.4, 9.0], l: [0, 2.0, -2], f: 56 }, { t: SC.mystere.start, p: [0, 3.4, 9.0], l: [0, 2.0, -2], f: 56 }]);
      K.update(t);
    }
  };
};

// ---------- le mystere : l'ange et Jean ; « etait, n'est plus, reparaitra »
SETS.mystere = () => {
  const B = desert(); const { scene, cam } = B;
  const bw = beastWithWoman(scene); bw.position.set(0.6, 0, -5); faceLight(scene, [0.6, 3.6, -2.4], 2.4, 0xffd0a0);
  const an = angel(); an.place(-1.0, 0, 1.2, 0.5); scene.add(an.root); angelLight(scene, [-0.6, 2.4, 2.6]);
  const j = john(); j.place(-0.1, 0, 1.6, -0.3); scene.add(j.root); faceLight(scene, [0.2, 1.7, 3.6], 1.3);
  const god = ['QUI EST', 'QUI ÉTAIT', 'QUI VIENT'].map(s => { const c = card(s, { w: 0.62, h: 0.15, border: '#ffd070', color: '#ffe8a0' }); scene.add(c); return c; });
  const bst = ['ÉTAIT', 'N\'EST PLUS', 'REPARAÎTRA'].map(s => { const c = card(s, { w: 0.62, h: 0.15, border: '#ff5a3a', color: '#ffb0a0' }); scene.add(c); return c; });
  const K = cardsMgr(scene, cam); refCard(K);
  K('Dieu (Apocalypse 1, 8)', { w: 0.7, h: 0.12, border: '#ffd070', color: '#ffe8a0' }, t => win(t, C.parodie + 3.5, SC.tetes.start, 0.3, 0.2), 0.42, 0.35);
  K('la bête : une imitation', { w: 0.7, h: 0.12, border: '#ff5a3a', color: '#ffb0a0' }, t => win(t, C.parodie + 6.5, SC.tetes.start, 0.3, 0.2), -0.02, 0.35);
  return {
    ...B, update(t) {
      const T0 = SC.mystere.start; bw.userData.dr.userData.tick(t); bw.userData.w.face(0, 'happy', t);
      an.pose({ aR: [1.5, 0.2], eR: 0.1 }); an.face(env('voix', t) * 0.5, 'serious', t); j.pose({ hp: -0.15 }); j.face(0, 'awe', t);
      camKeys(cam, t, [{ t: T0, p: [1.2, 1.9, 5.0], l: [-0.4, 1.4, 0.8], f: 52 }, { t: C.parodie, p: [0.8, 2.2, 6.0], l: [0.2, 1.8, -2], f: 54 }, { t: SC.tetes.start, p: [0.8, 2.2, 6.0], l: [0.2, 1.8, -2], f: 54 }]);
      god.forEach((c, i) => { fade(c, win(t, C.parodie + 3.5 + i * 0.4, SC.tetes.start, 0.3, 0.3)); camCard(cam, c, 0.32, 0.3 - i * 0.1); c.position.addScaledVector(new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), -0.6); });
      bst.forEach((c, i) => { fade(c, win(t, C.parodie + 6.5 + i * 0.4, SC.tetes.start, 0.3, 0.3)); camCard(cam, c, 0.32, -0.12 - i * 0.1); c.position.addScaledVector(new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), -0.6); });
      K.update(t);
    }
  };
};

// ---------- les sept tetes : sept collines, sept empereurs ; Neron qui doit revenir
SETS.tetes = () => {
  const B = desert(); const { scene, cam } = B;
  const bw = beastWithWoman(scene); bw.position.set(0, 0, -5); faceLight(scene, [0, 4, -2], 2.4, 0xffd0a0);
  const hills = new THREE.Group(); hills.position.set(0, 0.2, 2.0); scene.add(hills); rock(scene, 0, -0.25, 2.0, 1.9);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const h = holo(new THREE.ConeGeometry(0.42, 0.5 + hash(i) * 0.3, 8), 0xff6a4a, 0.22); h.position.set(Math.cos(a) * 1.0, 0.3, Math.sin(a) * 0.6); hills.add(h); const n = label(String(i + 1), { w: 0.2, h: 0.2, color: '#ffd0c0', font: 'bold 160px Inter' }); n.position.set(Math.cos(a) * 1.0, 0.85, Math.sin(a) * 0.6); hills.add(n); }
  const busts = new THREE.Group(); busts.position.set(0, 0.2, 2.0); scene.add(busts);
  const emp = Array.from({ length: 7 }, (_, i) => { const col = i < 5 ? 0x8a8a9a : i === 5 ? 0xffd070 : 0x9adfff; const h = new Human({ holo: col }); h.root.scale.setScalar(0.42); h.place(-1.2 + i * 0.4, 0, 0, 0); busts.add(h.root); const cr = holo(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 10, 1, true), 0xffd070, 0.4); cr.position.y = 0.32; h.neck.add(cr); return h; });
  const lab = [card('5 sont tombés', { w: 0.62, h: 0.12, border: '#8a8a9a' }), card('1 existe', { w: 0.4, h: 0.12, border: '#ffd070' }), card('1 à venir', { w: 0.42, h: 0.12, border: '#9adfff' })]; lab.forEach(c => scene.add(c));
  const nero = new Human({ holo: 0xff5a3a }); nero.root.scale.setScalar(0.8); nero.place(0, 0.2, 2.0, 0); scene.add(nero.root);
  const nLab = card('NÉRON (mort en 68)… va-t-il revenir ?', { w: 1.1, h: 0.14, border: '#ff5a3a' }); scene.add(nLab);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Apocalypse 17, 9 : « sept montagnes »… Rome, la ville aux sept collines', { w: 1.6, h: 0.28, border: '#ff6a4a' }, t => win(t, SC.tetes.start + 1, C.empereurs + 4, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.tetes.start; bw.userData.dr.userData.tick(t); bw.userData.w.face(0, 'happy', t);
      fade(hills, win(t, T0 + 0.8, C.empereurs + 4, 0.5, 0.4)); hills.rotation.y = 0.2 * Math.sin(t * 0.4);
      const ek = win(t, C.empereurs + 4, C.neron, 0.5, 0.4); fade(busts, ek);
      emp.forEach((h, i) => { h.pose({ aL: [0.2, 0.1], aR: [0.2, 0.1] }); if (i < 5) h.root.rotation.z = 0.5 * sstep(C.empereurs + 5 + i * 0.3, C.empereurs + 5.5 + i * 0.3, t); });
      const nk = win(t, C.neron + 0.3, SC.cornes.start, 0.6, 0.4); fade(nero.root, nk * (0.6 + 0.4 * Math.sin(t * 4))); nero.pose({ aL: [0.3, 0.2], aR: [1.8, 0.2] }); nero.root.rotation.y = Math.sin(t * 0.8) * 0.4;
      camKeys(cam, t, [{ t: T0, p: [0, 2.6, 6.5], l: [0, 2.6, -5], f: 54 }, { t: T0 + 1.5, p: [0, 2.8, 7.4], l: [0, 1.0, 1.4], f: 52 }, { t: SC.cornes.start, p: [0, 2.8, 7.4], l: [0, 1.0, 1.4], f: 52 }]);
      lab.forEach((c, i) => { fade(c, ek * sstep(C.empereurs + 5 + i * 1.2, C.empereurs + 5.4 + i * 1.2, t)); camCard(cam, c, [0.3, 0.2, 0.21][i], 0.12); c.position.addScaledVector(new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), [-0.4, 0.15, 0.55][i]); });
      fade(nLab, nk); camCard(cam, nLab, 0.7, 0.25);
      K.update(t);
    }
  };
};

// ---------- les dix cornes : dix rois pour une heure ; Daniel 7 ; l'Agneau Roi des rois
SETS.cornes = () => {
  const B = desert(); const { scene, cam } = B;
  const bw = beastWithWoman(scene); bw.position.set(0, 0, -2); faceLight(scene, [0, 3.4, 1.5], 2.6, 0xffd0a0);
  const ks = ringKings(scene, 10, 3.6, 0, -2);
  const hg = hourglass(); hg.scale.setScalar(0.6); scene.add(hg);
  const rk = goldWord('ROI DES ROIS', 2.4, 0.5); scene.add(rk);
  const lamb_ = lamb(); lamb_.position.set(1.6, 0, 0.6); lamb_.scale.setScalar(0.9); scene.add(lamb_);
  const K = cardsMgr(scene, cam); refCard(K);
  K('10 cornes = 10 rois, pour « une heure »', { w: 1.6, h: 0.24, border: '#ff6a4a' }, t => win(t, SC.cornes.start + 1, C.daniel, 0.3, 0.2), -0.6);
  K('Daniel 7, 7 : une bête terrible avec dix cornes', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.daniel + 0.3, C.daniel + 6, 0.3, 0.2), -0.6);
  K('« Roi des rois » : le cavalier blanc (épisode 47)', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.daniel + 6.2, SC.eaux.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.cornes.start; bw.userData.dr.userData.tick(t); bw.userData.w.face(0, 'happy', t);
      ks.forEach((k, i) => { const up = sstep(T0 + 1 + i * 0.35, T0 + 1.4 + i * 0.35, t); k.pose({ aR: [lerp(0.3, 2.6, up), 0.2], eR: 0.1 }); k.face(0, 'serious', t); });
      camKeys(cam, t, [{ t: T0, p: [0, 3.4, 9.0], l: [0, 2.0, -2], f: 56 }, { t: C.daniel, p: [2.4, 2.4, 6.5], l: [0, 1.6, -1], f: 54 }, { t: SC.eaux.start, p: [2.4, 2.4, 6.5], l: [0, 1.6, -1], f: 54 }]);
      fade(hg, win(t, T0 + 5, C.daniel, 0.4, 0.4)); hg.userData.set(sstep(T0 + 5, C.daniel, t)); hg.position.copy(cam.position).add(new THREE.Vector3(0, 0, -3).applyQuaternion(cam.quaternion)).add(new THREE.Vector3(0, 0.9, 0)); hg.quaternion.copy(cam.quaternion);
      fade(rk, win(t, C.daniel + 6.2, SC.eaux.start, 0.4, 0.3)); camCard(cam, rk, 0.8, 0.3);
      fade(lamb_, win(t, C.daniel + 6.2, SC.eaux.start, 0.5, 0.3));
      K.update(t);
    }
  };
};

// ---------- les eaux : des peuples, des foules, des nations, des langues
SETS.eaux = () => {
  const B = desert(); const { scene, cam } = B;
  const water = L.makeWater(80, 50, 0x1a3a5a, { emissive: 0x081828 }); water.mesh.position.set(0, 0.15, -6); scene.add(water.mesh);
  const bw = beastWithWoman(scene); bw.position.set(0, 0.1, -3); faceLight(scene, [0, 3.4, 0.5], 2.6, 0xffd0a0);
  const cr = crowd(scene, crowdPts(260, 0, -16, 4, 14, { face: [0, -3], y: 0.15 }));
  const words = ['PEUPLES', 'FOULES', 'NATIONS', 'LANGUES'].map((w, i) => { const c = card(w, { w: 0.6, h: 0.14, border: ['#9adfff', '#ffd070', '#ff8a5a', '#b08aff'][i] }); scene.add(c); return c; });
  const K = cardsMgr(scene, cam); refCard(K);
  K('assise sur les peuples : elle domine le monde', { w: 1.6, h: 0.24, border: '#9adfff' }, t => win(t, C.peuples + 0.3, SC.trahison.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.eaux.start; water.update(t, 0.15); bw.userData.dr.userData.tick(t); bw.userData.w.face(0, 'happy', t);
      cr.upd(t, 0.3, 1);
      camKeys(cam, t, [{ t: T0, p: [0, 4.5, 9.5], l: [0, 1.0, -4], f: 58 }, { t: SC.trahison.start, p: [0, 5.0, 10.5], l: [0, 1.0, -4], f: 58 }]);
      words.forEach((c, i) => { fade(c, win(t, T0 + 3 + i * 1.1, SC.trahison.start, 0.3, 0.3)); camCard(cam, c, 0.3, 0.2 - i * 0.12); c.position.addScaledVector(new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), (i % 2 ? 0.5 : -0.5)); });
      K.update(t);
    }
  };
};

// ---------- la trahison : les rois tournent leurs epees contre elle ; le feu
SETS.trahison = () => {
  const B = desert(); const { scene, cam } = B;
  const bw = beastWithWoman(scene); bw.position.set(0, 0, -2); faceLight(scene, [0, 3.4, 1.5], 2.6, 0xffd0a0);
  const ks = ringKings(scene, 10, 3.6, 0, -2);
  const fires = []; for (let i = 0; i < 12; i++) { const f = softGlow(3 + hash(i) * 3, 0xff6a20); f.material.opacity = 0.7; scene.add(f); fires.push(f); }
  const flames = []; for (let i = 0; i < 16; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.2, 6), G(i % 2 ? 0xffa030 : 0xff5a20, 1.6)); scene.add(f); flames.push(f); }
  const K = cardsMgr(scene, cam); refCard(K);
  K('ses propres alliés la détruisent', { w: 1.6, h: 0.24, border: '#ff5a3a' }, t => win(t, C.retour + 0.3, C.retour + 6, 0.3, 0.2), -0.6);
  K('le feu de l\'épisode 50', { w: 1.6, h: 0.24, border: '#ff8a3a' }, t => win(t, C.retour + 6.2, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.trahison.start, turn = sstep(T0 + 1.5, T0 + 3.5, t), burn = sstep(T0 + 8, T0 + 10, t) * (1 - sstep(SC.fin.start - 0.5, SC.fin.start, t));
      bw.userData.dr.userData.tick(t, 1 + burn); bw.userData.w.face(0, turn > 0.5 ? 'fear' : 'happy', t); bw.userData.w.pose(L.sitPose(0.3, { lL: 1.2, lR: 1.2, kL: 1.2, kR: 1.2, lsL: 0.5, lsR: 0.5, aL: [lerp(0.3, 2.4, turn), 0.5], aR: [lerp(1.4, 2.4, turn), 0.5] }));
      ks.forEach((k, i) => { k.pose({ aR: [lerp(0.6, 1.7, turn), 0.2], eR: 0.05, lean: 0.15 * turn }); k.face(0, turn > 0.5 ? 'angry' : 'neutral', t); });
      fires.forEach((f, i) => { f.visible = burn > 0.01; f.position.set((hash(i * 3) - 0.5) * 3, 1 + hash(i * 5) * 2.5, -2 + (hash(i * 7) - 0.5) * 2); f.scale.setScalar((3 + hash(i) * 3) * burn * (1 + 0.2 * Math.sin(t * 8 + i))); });
      flames.forEach((f, i) => { f.visible = burn > 0.01; const a = i / 16 * Math.PI * 2; f.position.set(Math.cos(a) * 1.4, 0.5 * burn + 0.2 * Math.sin(t * 9 + i), -2 + Math.sin(a) * 1.1); f.scale.set(burn, burn * (1 + 0.3 * Math.sin(t * 11 + i)), burn); });
      camKeys(cam, t, [{ t: T0, p: [0, 3.0, 8.0], l: [0, 1.8, -2], f: 56 }, { t: T0 + 4, p: [1.8, 1.4, 4.8], l: [0, 2.2, -2], f: 54 }, { t: C.retour, p: [0, 3.2, 8.5], l: [0, 2.0, -2], f: 56 }, { t: SC.fin.start, p: [0, 3.4, 9.0], l: [0, 2.0, -2], f: 56 }]);
      K.update(t);
    }
  };
};

// ---------- fin : le desert, la femme en pourpre, « MYSTERE » (prochain episode)
SETS.fin = () => {
  const B = desert(); const { scene, cam } = B;
  const bw = beastWithWoman(scene); bw.position.set(0.4, 0, -3); faceLight(scene, [0.4, 3.6, 0], 2.8, 0xffd0a0);
  const myst = label('MYSTÈRE', { w: 0.5, h: 0.12, color: '#ffd070', font: 'bold 110px Inter' }); bw.userData.w.neck.add(myst); myst.position.set(0, 0.24, 0.17);
  const an = angel(); an.place(-1.3, 0, 1.6, 0.5); scene.add(an.root); const j = john(); j.place(-0.5, 0, 2.0, 0.1); scene.add(j.root); faceLight(scene, [-0.8, 1.7, 3.8], 1.3);
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 17, 1-6', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 9, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start; bw.userData.dr.userData.tick(t); bw.userData.w.face(0, 'happy', t); bw.userData.w.pose(L.sitPose(0.3, { lL: 1.2, lR: 1.2, kL: 1.2, kR: 1.2, lsL: 0.5, lsR: 0.5, aR: [2.2, 0.2], eR: 0.4 }));
      an.pose({ aR: [1.6, 0.2] }); an.face(0, 'serious', t); j.pose({ hp: -0.2 }); j.face(0, 'awe', t); fade(myst, sstep(T0 + 7, T0 + 8, t));
      camKeys(cam, t, [{ t: T0, p: [0, 2.6, 7.5], l: [0, 1.8, -1], f: 54 }, { t: T0 + 7, p: [0.5, 4.3, 0.6], l: [0.4, 2.8, -2.7], f: 50 }, { t: TL.duration, p: [0.5, 4.4, 1.0], l: [0.4, 2.8, -2.7], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : la bete, la femme en pourpre, dix rois qui tournent leurs epees vers elle
SETS.cover = () => {
  const B = desert(); const { scene, cam } = B;
  const bw = beastWithWoman(scene); bw.position.set(0, 0, -2); faceLight(scene, [0, 3.4, 1.5], 2.8, 0xffd0a0);
  const ks = ringKings(scene, 10, 3.0, 0, -2);
  return { ...B, update() { bw.userData.dr.userData.tick(2); bw.userData.w.face(0, 'fear', 2); bw.userData.w.pose(L.sitPose(0.3, { lL: 1.2, lR: 1.2, kL: 1.2, kR: 1.2, lsL: 0.5, lsR: 0.5, aL: [2.4, 0.5], aR: [2.4, 0.5] })); ks.forEach(k => { k.pose({ aR: [1.9, 0.2], eR: 0.05, lean: 0.15 }); k.face(0, 'angry', 2); }); cam.position.set(0, 2.2, 7.2); cam.fov = 60; cam.updateProjectionMatrix(); cam.lookAt(0, 1.0, -2); } };
};

const SHOTS = [['intro', 0, SC.mystere.start], ['mystere', SC.mystere.start, SC.tetes.start], ['tetes', SC.tetes.start, SC.cornes.start], ['cornes', SC.cornes.start, SC.eaux.start], ['eaux', SC.eaux.start, SC.trahison.start], ['trahison', SC.trahison.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
