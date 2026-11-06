
// ================= episode 53 : un nom ecrit sur son front : Mystere (Apocalypse 17, 1-6)
function foreheadName(w, text = 'MYSTÈRE', sz = 0.5) { const l = label(text, { w: sz, h: sz * 0.24, color: '#ffd070', font: 'bold 110px Inter' }); w.neck.add(l); l.position.set(0, 0.24, 0.17); return l; }
function bowlAngel(i) { const a = angel(); const b = angelBowl(a); b.scale.setScalar(1.6); a.bowl = b; return a; }
function nameCard(text, color = '#ff5a3a') { return card(text, { w: 0.8, h: 0.15, border: color, color: '#ffd0c0' }); }

// ---------- intro
SETS.intro = () => {
  const B = desert(); const { scene, cam } = B;
  const bw = beastWithWoman(scene); bw.position.set(0, 0, -2.5); faceLight(scene, [0, 3.6, 0.5], 2.8, 0xffd0a0);
  const myst = foreheadName(bw.userData.w);
  rock(scene, 1.4, -0.3, 3.2, 1.0);
  const rig = claudeRig(scene, [1.5, 0.15, 3.2], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [1.3, 0.9, 4.6], 1.2);
  const back = label('◀ une scène avant', { w: 0.8, h: 0.12, color: '#ffd070', font: 'bold 80px Inter' }); rig.holoG.add(back);
  const q = label('« Pourquoi t\'étonnes-tu ? »', { w: 0.9, h: 0.12, color: '#ffffff', font: 'bold 70px Inter' }); rig.holoG.add(q);
  const K = cardsMgr(scene, cam);
  K('une femme couverte d\'or… et un mot sur son front', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, 1.0, C.serie - 0.3, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      bw.userData.dr.userData.tick(t); bw.userData.w.face(0, 'happy', t); bw.userData.w.pose(L.sitPose(0.3, { lL: 1.2, lR: 1.2, kL: 1.2, kR: 1.2, lsL: 0.5, lsR: 0.5, aR: [2.2, 0.2], eR: 0.4 }));
      fade(myst, sstep(4.5, 5.5, t));
      const bk = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, bk, t); fade(back, bk); fade(q, bk); back.position.y = 0.45; q.position.y = 0.25; back.lookAt(cam.position); q.lookAt(cam.position); rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [0, 2.8, 7.5], l: [0, 2.0, -2.5], f: 54 }, { t: 4, p: [0.3, 3.9, 1.6], l: [0, 3.2, -2.2], f: 48 }, { t: C.serie, p: [0.3, 3.9, 1.8], l: [0, 3.2, -2.2], f: 48 }, { t: C.serie + 0.9, p: [1.3, 0.95, 6.0], l: [1.1, 0.6, 1.6], f: 48 }, { t: C.title - 0.3, p: [1.3, 0.95, 6.0], l: [1.1, 0.6, 1.6], f: 48 }, { t: C.title + 0.8, p: [0, 3.0, 8.5], l: [0, 2.2, -2.5], f: 56 }, { t: SC.appel.start, p: [0, 3.0, 8.5], l: [0, 2.2, -2.5], f: 56 }]);
      K.update(t);
    }
  };
};

// ---------- l'appel : un des sept anges aux coupes
SETS.appel = () => {
  const B = nightSet({ exposure: 1.1 }); const { scene, cam } = B;
  const glow = glowStar(14, 0xfff0c8); glow.position.set(0, 6, -10); scene.add(glow);
  const ans = Array.from({ length: 7 }, (_, i) => { const a = bowlAngel(i); const x = (i - 3) * 1.3; a.place(x, 1.2 + Math.abs(i - 3) * 0.25, -4 - Math.abs(i - 3) * 0.4, -x * 0.08); scene.add(a.root); return a; });
  angelLight(scene, [0, 3, -1]);
  const j = john(); j.place(0.6, 0, 1.4, Math.PI * 0.9); scene.add(j.root); faceLight(scene, [0.6, 1.7, -0.4], 1.2);
  const streams = ans.map(a => { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.08, 1.6, 8), new THREE.MeshBasicMaterial({ color: 0xff8a3a, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(s); return s; });
  const K = cardsMgr(scene, cam); refCard(K);
  K('l\'un des sept anges aux sept coupes (Apocalypse 16)', { w: 1.6, h: 0.24, border: '#ff8a3a' }, t => win(t, C.coupes + 0.3, SC.desert.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.appel.start, step = sstep(T0 + 1, T0 + 4, t), hp = new THREE.Vector3();
      ans.forEach((a, i) => { a.pose({ aL: [1.3, 0.3], eL: 0.5, aR: i === 3 ? [1.4 * step, 0.3] : [0.3, 0.2] }); a.face(i === 3 ? env('voix', t) * 0.5 : 0, 'serious', t); if (i === 3) a.root.position.z = -4 + 2.4 * step; });
      const pour = win(t, C.coupes + 0.5, SC.desert.start, 0.6, 0.4);
      ans.forEach((a, i) => { a.root.updateMatrixWorld(true); a.bowl.getWorldPosition(hp); const s = streams[i]; s.position.set(hp.x, hp.y - 0.85, hp.z); s.visible = pour > 0.02; s.material.opacity = 0.8 * pour; a.bowl.rotation.z = 1.2 * pour; });
      j.pose({ hp: -0.25 }); j.face(0, 'awe', t);
      camKeys(cam, t, [{ t: T0, p: [0, 1.8, 5.0], l: [0, 2.0, -3], f: 56 }, { t: SC.desert.start, p: [0, 2.2, 5.6], l: [0, 2.2, -3], f: 56 }]);
      K.update(t);
    }
  };
};

// ---------- le desert : la bete ecarlate, noms de blaspheme ; les deux femmes
SETS.desert = () => {
  const B = desert(); const { scene, cam } = B;
  const bw = beastWithWoman(scene); bw.position.set(0, 0, -3); faceLight(scene, [0, 3.6, 0], 2.8, 0xffd0a0);
  const an = angel(); an.place(-1.2, 0, 2.0, 0.4); scene.add(an.root); const j = john(); j.place(-0.5, 0, 2.3, 0.1); scene.add(j.root); faceLight(scene, [-0.8, 1.7, 4.0], 1.2);
  const names = ['« DIVIN »', '« FILS DE DIEU »', '« SEIGNEUR ET DIEU »'].map(s => { const c = nameCard(s); scene.add(c); return c; });
  const br = bride(); br.place(2.2, 0, -1.5, -0.5); scene.add(br.root); faceLight(scene, [2.0, 1.8, 0.5], 1.4);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Domitien : « notre seigneur et notre dieu » (Suétone)', { w: 1.6, h: 0.28, border: '#ff5a3a' }, t => win(t, C.blaspheme + 6, C.femmes, 0.3, 0.2), -0.6);
  K('deux femmes : la prostituée… et l\'épouse (épisode 48)', { w: 1.6, h: 0.28, border: '#ffffff' }, t => win(t, C.femmes + 0.3, SC.parure.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.desert.start; bw.userData.dr.userData.tick(t); bw.userData.w.face(0, 'happy', t); bw.userData.w.pose(L.sitPose(0.3, { lL: 1.2, lR: 1.2, kL: 1.2, kR: 1.2, lsL: 0.5, lsR: 0.5, aR: [1.6, 0.2], eR: 0.4 }));
      const app = sstep(T0 + 1, T0 + 4, t); fade(bw, app);
      an.pose({ aR: [1.5, 0.2] }); an.face(0, 'serious', t); j.pose({ hp: -0.15 }); j.face(0, 'awe', t);
      fade(br.root, win(t, C.femmes + 2.5, SC.parure.start, 0.8, 0.3)); br.pose({ aL: [0.3, 0.1], aR: [0.3, 0.1] }); br.face(0, 'happy', t);
      camKeys(cam, t, [{ t: T0, p: [0, 2.0, 6.5], l: [0, 1.6, -1], f: 56 }, { t: C.femmes, p: [0.6, 2.6, 7.5], l: [0.4, 2.0, -2], f: 56 }, { t: SC.parure.start, p: [0.6, 2.6, 7.5], l: [0.4, 2.0, -2], f: 56 }]);
      names.forEach((c, i) => { const k = win(t, C.blaspheme + 0.5 + i * 1.5, C.femmes, 0.3, 0.3); fade(c, k); camCard(cam, c, 0.46, 0.3 - i * 0.12); });
      K.update(t);
    }
  };
};

// ---------- la parure : pourpre (murex), perles (Cleopatre), la coupe d'or (Jeremie 51, 7)
SETS.parure = () => {
  const B = desert(); const { scene, cam } = B;
  const bw = beastWithWoman(scene); bw.position.set(0, 0, -2.5); faceLight(scene, [0.3, 3.8, 0.3], 3.0, 0xffd0a0);
  const jewels = []; for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), i % 3 ? G(0xffc040, 1.4) : M(0xf8f4ff, { emissive: new THREE.Color(0x6a6670) })); const a = i / 14 * Math.PI * 2; m.position.set(Math.cos(a) * 0.17, 0.48 + Math.sin(a * 2) * 0.02, Math.sin(a) * 0.12 + 0.05); bw.userData.w.spine.add(m); jewels.push(m); }
  const shells = new THREE.Group(); shells.position.set(-0.9, 2.2, 0.4); scene.add(shells);
  for (let i = 0; i < 40; i++) { const s = holo(new THREE.ConeGeometry(0.05, 0.14, 7), 0xb04aff, 0.35); s.position.set((hash(i * 3) - 0.5) * 0.8, (hash(i * 5)) * 0.25, (hash(i * 7) - 0.5) * 0.4); s.rotation.z = hash(i) * 3; shells.add(s); }
  const big = holo(new THREE.ConeGeometry(0.16, 0.45, 9), 0xd070ff, 0.4); big.position.set(0, 0.45, 0); shells.add(big);
  const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 12), M(0xf8f4ff, { emissive: new THREE.Color(0x8a8690) })); pearl.position.set(0.9, 2.5, 0.5); scene.add(pearl);
  const glass = holo(new THREE.CylinderGeometry(0.16, 0.12, 0.3, 14, 1, true), 0x9adfff, 0.25); glass.position.set(0.9, 2.2, 0.5); scene.add(glass);
  const cup = new THREE.Group(); scene.add(cup); cup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.08, 0.3, 14), G(0xffc040, 1.3))); cup.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), G(0xffc040, 1.2)), 0, -0.25, 0)); cup.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 12), G(0xffc040, 1.2)), 0, -0.36, 0));
  const cupGlow = glowStar(1.4, 0xffd070); cup.add(cupGlow);
  const K = cardsMgr(scene, cam); refCard(K);
  K('la pourpre : des milliers de coquillages (murex) pour un manteau', { w: 1.6, h: 0.28, border: '#b04aff' }, t => win(t, C.murex + 0.3, C.perle, 0.3, 0.2), -0.6);
  K('Pline l\'Ancien : Cléopâtre dissout une perle dans du vinaigre', { w: 1.6, h: 0.28, border: '#ffffff' }, t => win(t, C.perle + 0.3, C.coupe, 0.3, 0.2), -0.6);
  K('Jérémie 51, 7 : « une coupe d\'or, qui enivrait toute la terre »', { w: 1.6, h: 0.28, border: '#ffc040' }, t => win(t, C.coupe + 0.3, SC.front.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.parure.start; bw.userData.dr.userData.tick(t); bw.userData.w.face(0, 'happy', t); bw.userData.w.pose(L.sitPose(0.3, { lL: 1.2, lR: 1.2, kL: 1.2, kR: 1.2, lsL: 0.5, lsR: 0.5, aR: [2.0, 0.2], eR: 0.4 }));
      fade(shells, win(t, C.murex + 0.3, C.perle, 0.5, 0.4)); shells.rotation.y = t * 0.3;
      const pk = win(t, C.perle + 0.3, C.coupe, 0.5, 0.4); fade(glass, pk); pearl.visible = pk > 0.02; const dis = sstep(C.perle + 2.5, C.perle + 6, t); pearl.position.y = lerp(2.5, 2.15, sstep(C.perle + 1, C.perle + 2.5, t)); pearl.scale.setScalar(Math.max(0.01, 1 - dis));
      const ck = win(t, C.coupe + 0.2, SC.front.start, 0.5, 0.3); cup.visible = ck > 0.02; cup.scale.setScalar(ck * 1.4); cup.position.set(0, 2.5, 0.6); cup.rotation.y = t;
      camKeys(cam, t, [{ t: T0, p: [0.3, 3.4, 2.4], l: [0, 3.0, -2.2], f: 50 }, { t: C.murex, p: [0, 2.8, 4.4], l: [0, 2.6, -0.5], f: 52 }, { t: SC.front.start, p: [0, 2.8, 4.4], l: [0, 2.6, -0.5], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- le nom sur le front ; Seneque ; le nom de Dieu sur le front des fideles
SETS.front = () => {
  const B = desert(); const { scene, cam } = B;
  const bw = beastWithWoman(scene); bw.position.set(0, 0, -2.5); faceLight(scene, [0.2, 3.8, 0.0], 3.0, 0xffd0a0);
  const myst = foreheadName(bw.userData.w, 'MYSTÈRE', 0.55);
  const full = card('MYSTÈRE · BABYLONE LA GRANDE\nla mère des impudiques et des abominations de la terre', { w: 1.6, h: 0.32, border: '#ffd070', color: '#ffe8a0', small: true }); scene.add(full);
  const cr = crowd(scene, crowdPts(160, 1.5, -8, 2, 7, { face: [0, 8] }), { em: 0x5a5440 }); const marks = [];
  const K = cardsMgr(scene, cam); refCard(K);
  K('Sénèque : les prostituées de Rome portaient leur nom sur le front', { w: 1.6, h: 0.28, border: '#ff8a5a' }, t => win(t, C.seneque + 0.3, C.fideles, 0.3, 0.2), -0.6);
  K('Apocalypse 22, 4 : « son nom sera sur leurs fronts »', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.fideles + 0.3, SC.ivre.start, 0.3, 0.2), -0.6);
  const gold = []; return {
    ...B, update(t) {
      const T0 = SC.front.start; bw.userData.dr.userData.tick(t); bw.userData.w.face(0, 'happy', t); bw.userData.w.pose(L.sitPose(0.3, { lL: 1.2, lR: 1.2, kL: 1.2, kR: 1.2, lsL: 0.5, lsR: 0.5, aR: [2.0, 0.2], eR: 0.4 }));
      fade(myst, sstep(T0 + 1, T0 + 2.5, t)); const ck = win(t, T0 + 3, C.seneque, 0.4, 0.3); fade(full, ck);
      const fk = win(t, C.fideles, SC.ivre.start, 0.6, 0.4); cr.upd(t, 0.6, fk); bw.visible = fk < 0.5;
      camKeys(cam, t, [{ t: T0, p: [0.2, 3.6, 2.6], l: [0, 3.2, -2.2], f: 46 }, { t: T0 + 2.5, p: [0.1, 3.4, 0.9], l: [0, 3.3, -2.2], f: 44 }, { t: C.seneque, p: [0.1, 3.4, 1.0], l: [0, 3.3, -2.2], f: 44 }, { t: C.fideles, p: [0, 2.8, 7.5], l: [0, 1.4, -4], f: 56 }, { t: SC.ivre.start, p: [0, 2.8, 7.5], l: [0, 1.4, -4], f: 56 }]);
      camCard(cam, full, 0.86, -0.2);
      K.update(t);
    }
  };
};

// ---------- ivre du sang des saints ; l'etonnement de Jean
SETS.ivre = () => {
  const B = desert(); const { scene, cam } = B;
  const bw = beastWithWoman(scene); bw.position.set(0.4, 0, -3); faceLight(scene, [0.4, 3.6, 0], 2.8, 0xff8a6a);
  const cupGlow = glowStar(0.9, 0xff3a2a); bw.userData.w.hand.R.add(cupGlow); cupGlow.position.set(0, -0.02, 0.06);
  const an = angel(); an.place(-1.3, 0, 1.8, 0.5); scene.add(an.root); const j = john(); j.place(-0.5, 0, 2.1, 0.1); scene.add(j.root); faceLight(scene, [-0.6, 1.7, 3.8], 1.4);
  const K = cardsMgr(scene, cam); refCard(K);
  K('« je fus saisi d\'un grand étonnement »', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, SC.ivre.start + 6, C.etonne, 0.3, 0.2), -0.6);
  K('→ « Pourquoi t\'étonnes-tu ? » (épisode 52)', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.etonne + 2.5, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.ivre.start; bw.userData.dr.userData.tick(t); bw.userData.w.face(0.4 * Math.max(0, Math.sin(t * 6)), 'joy', t); bw.userData.w.pose(L.sitPose(0.3, { lL: 1.2, lR: 1.2, kL: 1.2, kR: 1.2, lsL: 0.5, lsR: 0.5, aR: [2.6, 0.2], eR: 0.2, lean: -0.15 + 0.05 * Math.sin(t * 3) }));
      const st = sstep(T0 + 5, T0 + 6, t); j.pose({ hp: -0.3, lean: -0.15 * st, aL: [0.8 * st, 0.3], aR: [0.8 * st, 0.3] }); j.face(0, st > 0.5 ? 'fear' : 'awe', t);
      an.pose({ aR: [lerp(0.4, 1.3, sstep(C.etonne, C.etonne + 1, t)), 0.3] }); an.face(0, 'serious', t);
      camKeys(cam, t, [{ t: T0, p: [0.6, 3.2, 3.0], l: [0.4, 3.0, -2.7], f: 48 }, { t: T0 + 5, p: [-1.2, 1.9, 4.8], l: [-0.4, 1.5, 1.6], f: 50 }, { t: C.etonne, p: [-0.4, 2.4, 6.6], l: [0, 1.8, -1], f: 54 }, { t: SC.fin.start, p: [-0.4, 2.4, 6.6], l: [0, 1.8, -1], f: 54 }]);
      K.update(t);
    }
  };
};

// ---------- fin : la septieme coupe ; « C'en est fait ! » ; la ville se brise en trois
SETS.fin = () => {
  const B = nightSea({ cityX: 0, exposure: 1.1 }); const { scene, cam } = B; B.city.position.set(0, 0, -30);
  const parts = [new THREE.Group(), new THREE.Group(), new THREE.Group()]; parts.forEach(p => scene.add(p));
  B.city.children.slice().forEach(c => { if (c.position.x < -6) parts[0].attach(c); else if (c.position.x > 6) parts[2].attach(c); else parts[1].attach(c); });
  const an = bowlAngel(6); an.root.scale.setScalar(3.5); an.place(0, 8, -22, 0); scene.add(an.root); angelLight(scene, [0, 14, -18]).intensity = 5;
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.6, 14, 10), new THREE.MeshBasicMaterial({ color: 0xff8a3a, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(stream);
  const bolts = [0, 1, 2].map(k => { const b = L.makeBolt(k * 11 + 5, [(k - 1) * 10, 30, -40], [(k - 1) * 6, 2, -30], G(0xffffff, 2.5)); scene.add(b); return b; });
  const word = goldWord('« C\'EN EST FAIT ! »', 14, 3); word.position.set(0, 18, -26); scene.add(word);
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 16, 17-21', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 10, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start, pour = sstep(T0 + 2, T0 + 3.5, t), quake = T0 + 7.0, sp = sstep(quake, quake + 2.5, t);
      B.water.update(t, 0.3 + 0.6 * sp); B.cityLight(1 - 0.5 * sp);
      an.pose({ aL: [lerp(1.3, 2.4, pour), 0.3], eL: 0.4 }); an.face(0, 'serious', t); an.bowl.rotation.z = 1.4 * pour;
      an.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); an.bowl.getWorldPosition(hp); stream.position.set(hp.x, hp.y - 7, hp.z); stream.visible = pour > 0.05; stream.material.opacity = 0.7 * pour;
      parts[0].position.x = -3 * sp; parts[0].rotation.z = 0.12 * sp; parts[2].position.x = 3 * sp; parts[2].rotation.z = -0.12 * sp; parts[1].position.y = -1.5 * sp;
      const fk = L.flashK(t, [quake - 0.3, quake + 0.9, quake + 2.2]); bolts.forEach((b, k) => b.visible = fk > 0.3 && (k === Math.floor(t * 5) % 3 || fk > 0.8)); B.hemi.intensity = 0.75 + 1.6 * fk;
      fade(word, win(t, T0 + 4, T0 + 9, 0.4, 0.5));
      const sh = 0.12 * Math.exp(-Math.max(0, t - quake) * 0.8) * (t > quake ? 1 : 0);
      camKeys(cam, t, [{ t: T0, p: [0, 2.6, 8], l: [0, 9, -28], f: 58 }, { t: TL.duration, p: [0, 2.4, 9.5], l: [0, 6, -28], f: 58 }]);
      cam.position.x += sh * Math.sin(t * 50); cam.position.y += sh * Math.cos(t * 43);
      K.update(t);
    }
  };
};

// ---------- couverture : la femme en pourpre leve sa coupe d'or, « MYSTERE » sur le front ; Jean et l'ange de dos
SETS.cover = () => {
  const B = desert(); const { scene, cam } = B;
  const bw = beastWithWoman(scene); bw.position.set(0, 0, -2.5); faceLight(scene, [0.2, 3.9, 0.4], 3.2, 0xffd0a0);
  const myst = foreheadName(bw.userData.w, 'MYSTÈRE', 0.55);
  const cg = glowStar(1.0, 0xffd070); bw.userData.w.hand.R.add(cg); cg.position.set(0, -0.02, 0.06);
  return { ...B, update() { bw.userData.dr.userData.tick(2); bw.userData.w.face(0, 'happy', 2); bw.userData.w.pose(L.sitPose(0.3, { lL: 1.2, lR: 1.2, kL: 1.2, kR: 1.2, lsL: 0.5, lsR: 0.5, aR: [2.7, 0.2], eR: 0.1 })); cam.position.set(0.25, 3.5, 2.6); cam.fov = 54; cam.updateProjectionMatrix(); cam.lookAt(0, 2.75, -2.3); } };
};

const SHOTS = [['intro', 0, SC.appel.start], ['appel', SC.appel.start, SC.desert.start], ['desert', SC.desert.start, SC.parure.start], ['parure', SC.parure.start, SC.front.start], ['front', SC.front.start, SC.ivre.start], ['ivre', SC.ivre.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
