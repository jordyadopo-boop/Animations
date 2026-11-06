
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

// ---------- intro : la capitale illuminee, l'ange verse sa coupe, les lumieres s'eteignent
SETS.intro = () => {
  const B = nightSea({ cityX: 0 }); const { scene, cam } = B; B.city.position.set(0, 0, -30);
  const an = bowlAngel(4); an.root.scale.setScalar(3.2); an.place(-3, 13, -26, 0.3); scene.add(an.root); const al = angelLight(scene, [-2, 18, -22]); al.intensity = 5;
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 1.2, 14, 10), new THREE.MeshBasicMaterial({ color: 0x6a4aff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(stream);
  rock(scene, 1.0, -0.2, 1.4, 1.1);
  const rig = claudeRig(scene, [1.1, 0.2, 1.4], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [0.9, 0.9, 2.8], 1.2);
  const back = label('◀ une scène avant', { w: 0.8, h: 0.12, color: '#ffd070', font: 'bold 80px Inter' }); rig.holoG.add(back);
  const frog = frogSpirit(); frog.scale.setScalar(0.25); rig.holoG.add(frog);
  const K = cardsMgr(scene, cam);
  K('une coupe sur un trône… et tout un royaume dans le noir', { w: 1.6, h: 0.28, border: '#8a6aff' }, t => win(t, 1.0, C.serie - 0.3, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const pour = sstep(1, 3, t), dk = sstep(3, 7, t); B.water.update(t, 0.3); B.cityLight(1 - dk); B.hemi.intensity = 0.75 * (1 - 0.6 * dk);
      an.pose({ aL: [lerp(1.3, 2.4, pour), 0.3], eL: 0.4 }); an.bowl.rotation.z = 1.4 * pour; an.face(0, 'serious', t);
      an.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); an.bowl.getWorldPosition(hp); stream.position.set(hp.x + 1, hp.y - 7, hp.z); stream.rotation.z = 0.15; stream.visible = pour > 0.05 && t < C.serie; stream.material.opacity = 0.55 * pour;
      const bk = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, bk, t); fade(back, bk); fade(frog, bk); back.position.y = 0.45; frog.position.y = 0.15; back.lookAt(cam.position); rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [0, 2.6, 8], l: [-1, 7, -28], f: 58 }, { t: C.serie, p: [0.4, 2.6, 7.5], l: [0, 4, -28], f: 58 }, { t: C.serie + 0.9, p: [0.9, 0.95, 4.2], l: [0.6, 0.6, 0], f: 48 }, { t: C.title - 0.3, p: [0.9, 0.95, 4.2], l: [0.6, 0.6, 0], f: 48 }, { t: C.title + 0.8, p: [0, 2.6, 8.5], l: [0, 4, -28], f: 58 }, { t: SC.coupe.start, p: [0, 2.6, 8.5], l: [0, 4, -28], f: 58 }]);
      K.update(t);
    }
  };
};

// ---------- la salle du trone : la coupe, les tenebres ; Pergame ; un royaume aveugle
SETS.coupe = () => {
  const B = throneHall(); const { scene, cam } = B;
  const an = bowlAngel(4); an.root.scale.setScalar(1.4); an.place(-1.5, 2.4, -6, 0.3); scene.add(an.root); const al = angelLight(scene, [-1.1, 4.2, -4]); al.intensity = 3;
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.5, 4, 10), new THREE.MeshBasicMaterial({ color: 0x6a4aff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(stream);
  const courtiers = [0, 1, 2, 3].map(i => { const h = citizen(i + 50, { top: [0x8a1a3a, 0x5a2a8a, 0x1a5a6a, 0x6a4a1a][i], robe: [0x8a1a3a, 0x5a2a8a, 0x1a5a6a, 0x6a4a1a][i] }); h.place((i % 2 ? 1 : -1) * (1.2 + Math.floor(i / 2) * 0.6), 0, -5 + Math.floor(i / 2) * 1.6, (i % 2 ? -1 : 1) * 0.9); scene.add(h.root); return h; });
  const altar = new THREE.Group(); scene.add(altar);
  altar.add(at(holo(new THREE.BoxGeometry(2.6, 0.5, 1.6), 0xffd070, 0.2), 0, 0.25, 0)); for (let k = 0; k < 7; k++) altar.add(at(holo(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8), 0xffd070, 0.35), -1.2 + k * 0.4, 0.85, -0.6)); altar.add(at(holo(new THREE.BoxGeometry(2.6, 0.08, 0.3), 0xffd070, 0.3), 0, 1.24, -0.6));
  for (let k = 0; k < 6; k++) altar.add(at(holo(new THREE.BoxGeometry(0.9, 0.06, 0.18), 0xffd070, 0.25), 0, 0.03 + k * 0.08, 0.95 - k * 0.12));
  const altL = label('AUTEL DE PERGAME (Berlin)', { w: 1.6, h: 0.2, color: '#ffd070', font: 'bold 80px Inter' }); altar.add(altL); altL.position.set(0, 1.7, 0);
  const K = cardsMgr(scene, cam); refCard(K);
  K('la cible : le trône, le cœur du pouvoir', { w: 1.6, h: 0.24, border: '#8a6aff' }, t => win(t, C.cible + 0.3, C.pergame, 0.3, 0.2), -0.6);
  K('Apocalypse 2, 13 : Pergame, « là où est le trône de Satan »', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.pergame + 0.3, C.aveugle, 0.3, 0.2), -0.6);
  K('le pouvoir qui éblouissait le monde ne voit plus rien', { w: 1.6, h: 0.24, border: '#8a6aff' }, t => win(t, C.aveugle + 0.3, SC.egypte.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.coupe.start, pour = win(t, T0 + 1, T0 + 6, 0.8, 0.5), dk = sstep(T0 + 3, T0 + 7, t) * (1 - 0.6 * win(t, C.pergame, C.aveugle, 0.5, 0.5));
      B.dark(dk, t); B.bt.userData.tick(t); al.intensity = 3;
      an.pose({ aL: [lerp(1.3, 2.4, pour), 0.3], eL: 0.4 }); an.bowl.rotation.z = 1.4 * pour; an.face(0, 'serious', t);
      an.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); an.bowl.getWorldPosition(hp); stream.position.set(hp.x + 0.4, hp.y - 2, hp.z - 1.4); stream.rotation.x = 0.6; stream.visible = pour > 0.05; stream.material.opacity = 0.55 * pour;
      courtiers.forEach((h, i) => { h.pose(dk > 0.5 ? { aL: [1.4, 0.3], aR: [1.4, 0.3], eL: 0.6, eR: 0.6 } : { aL: [0.3, 0.2], aR: [0.4, 0.2] }); h.face(0, dk > 0.5 ? 'fear' : 'neutral', t); });
      camKeys(cam, t, [{ t: T0, p: [0, 2.2, 4.5], l: [0, 2.0, -9], f: 54 }, { t: C.pergame, p: [0, 2.0, 3.5], l: [0, 1.4, -2], f: 52 }, { t: C.aveugle, p: [0, 2.0, 3.5], l: [0, 1.4, -2], f: 52 }, { t: C.aveugle + 0.8, p: [0, 3.2, 5.5], l: [0, 1.6, -9], f: 56 }, { t: SC.egypte.start, p: [0, 3.2, 5.5], l: [0, 1.6, -9], f: 56 }]);
      const ak = win(t, C.pergame + 0.3, C.aveugle, 0.5, 0.4); fade(altar, ak); altar.position.set(0, 0.2, -1.5); altar.scale.setScalar(0.78); altar.rotation.y = 0.25 * Math.sin(t * 0.5); altL.lookAt(cam.position);
      K.update(t);
    }
  };
};

// ---------- l'Egypte dans le noir ; la lumiere chez les Israelites ; les tenebres de la croix
SETS.egypte = () => {
  const B = desert({ exposure: 0.9 }); const { scene, cam } = B; B.hemi.intensity = 0.25; if (B.sun) B.sun.intensity = 0.2;
  const pyr = [[-6, -22, 6], [2, -28, 8], [9, -20, 5]].map(([x, z, s]) => { const p = new THREE.Mesh(new THREE.ConeGeometry(s, s, 4), M(0x6a5a40)); p.position.set(x, s / 2, z); p.rotation.y = Math.PI / 4; scene.add(p); return p; });
  const goshen = new THREE.Group(); goshen.position.set(-2.2, 0, -4); scene.add(goshen);
  for (let i = 0; i < 6; i++) { const h = box(0.8, 0.6, 0.8, M(0xd8b888)); h.position.set((i % 3) * 1.0, 0.3, Math.floor(i / 3) * 1.1); goshen.add(h); }
  const gl = new THREE.PointLight(0xffd8a0, 0, 9, 1.3); gl.position.set(1, 2.5, 0.5); goshen.add(gl); const gglow = softGlow(7, 0xffe0a0); gglow.position.set(1, 1, 0.5); goshen.add(gglow);
  const gLab = label('chez les Israélites : la lumière', { w: 1.8, h: 0.2, color: '#ffe0a0', font: 'bold 80px Inter' }); gLab.position.set(1, 1.7, 0.5); goshen.add(gLab);
  const cross = new THREE.Group(); scene.add(cross); cross.add(at(holo(new THREE.BoxGeometry(0.12, 1.6, 0.12), 0xffffff, 0.35), 0, 0.8, 0)); cross.add(at(holo(new THREE.BoxGeometry(0.9, 0.12, 0.12), 0xffffff, 0.35), 0, 1.15, 0));
  const hill = holo(new THREE.ConeGeometry(1.2, 0.6, 12), 0x9a8a7a, 0.2); hill.position.y = -0.3; cross.add(hill);
  const sunDim = softGlow(1.6, 0x6a2a1a); scene.add(sunDim);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Exode 10, 21 : la 9e plaie, des ténèbres « qu\'on pouvait toucher »', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, SC.egypte.start + 3, C.goshen, 0.3, 0.2), -0.6);
  K('Exode 10, 23 : « il y avait de la lumière » chez les Israélites', { w: 1.6, h: 0.28, border: '#ffe0a0' }, t => win(t, C.goshen + 0.3, C.croix, 0.3, 0.2), -0.6);
  K('Matthieu 27, 45 : ténèbres de midi à trois heures', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.croix + 0.3, SC.douleur.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.egypte.start, gk = win(t, C.goshen + 0.3, C.croix, 1.0, 0.5); gl.intensity = 6 * gk; gglow.material.opacity = 0.6 * gk; fade(gLab, gk); gLab.lookAt(cam.position);
      const ck = win(t, C.croix + 0.3, SC.douleur.start, 0.6, 0.3); fade(cross, ck); fade(sunDim, ck);
      camKeys(cam, t, [{ t: T0, p: [0, 3.0, 8], l: [0, 2.5, -22], f: 56 }, { t: C.goshen, p: [1.5, 2.2, 3.5], l: [-1, 0.8, -3.5], f: 52 }, { t: C.croix, p: [1.5, 2.2, 3.5], l: [-1, 0.8, -3.5], f: 52 }, { t: C.croix + 0.6, p: [0, 2.0, 4.5], l: [0, 1.6, 0], f: 52 }, { t: SC.douleur.start, p: [0, 2.0, 4.5], l: [0, 1.6, 0], f: 52 }]);
      cross.position.set(0, 0.6, 0.8); sunDim.position.set(0.9, 3.0, -0.5);
      K.update(t);
    }
  };
};

// ---------- la douleur dans le noir : ulceres, langues mordues, blasphemes ; le refrain ; le pharaon
SETS.douleur = () => {
  const B = throneHall(); const { scene, cam } = B; B.dark(0.85, 0);
  const ppl = Array.from({ length: 6 }, (_, i) => { const h = citizen(i + 60); h.place(-1.8 + i * 0.72, 0, -1.6 - (i % 2) * 0.9, 0); scene.add(h.root); const sp = []; for (let k = 0; k < 4; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), G(0xff3a2a, 1.4)); s.position.set((hash(i * 5 + k) - 0.5) * 0.2, 0.1 + hash(i + k) * 0.3, 0.13); (k % 2 ? h.spine : h.neck).add(s); sp.push(s); } h.sores = sp; return h; });
  const dimL = new THREE.PointLight(0x8a6aff, 2, 8, 1.5); dimL.position.set(0, 3, 1); scene.add(dimL);
  const stamps = [0, 1, 2].map(i => { const c = card('« ils ne se repentirent pas »', { w: 1.3, h: 0.17, border: '#ff5a3a', color: '#ffb0a0' }); scene.add(c); return c; });
  const ph = new Human({ holo: 0xffd070 }); const crown = holo(new THREE.CylinderGeometry(0.1, 0.16, 0.3, 10), 0xffd070, 0.4); crown.position.y = 0.45; ph.neck.add(crown); ph.root.scale.setScalar(1.2); scene.add(ph.root);
  const K = cardsMgr(scene, cam); refCard(K);
  K('les ulcères de la 1re coupe : les fléaux s\'additionnent', { w: 1.6, h: 0.28, border: '#ff5a3a' }, t => win(t, C.ulceres + 0.3, C.refrain, 0.3, 0.2), -0.6);
  K('Exode 7-11 : le pharaon endurcit son cœur', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.pharaon + 0.3, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.douleur.start; B.bt.userData.tick(t);
      const curse = sstep(T0 + 7, T0 + 8, t);
      ppl.forEach((h, i) => { h.pose(curse > 0.5 && i % 2 ? { aR: [2.8, 0.2], aL: [0.3, 0.2] } : { aL: [2.3, 0.6], aR: [2.3, 0.6], eL: 1.8, eR: 1.8, lean: 0.3 + 0.08 * Math.sin(t * 3 + i), hp: 0.3 }); h.face(0.3 * Math.max(0, Math.sin(t * 5 + i)), curse > 0.5 && i % 2 ? 'angry' : 'fear', t); h.sores.forEach(s => s.visible = t > C.ulceres); });
      camKeys(cam, t, [{ t: T0, p: [0, 1.8, 3.2], l: [0, 1.3, -2], f: 52 }, { t: C.refrain, p: [0, 2.2, 4.4], l: [0, 1.6, -3], f: 54 }, { t: SC.fin.start, p: [0, 2.2, 4.4], l: [0, 1.6, -3], f: 54 }]);
      stamps.forEach((c, i) => { fade(c, win(t, C.refrain + 3 + i * 1.5, C.pharaon, 0.25, 0.3)); camCard(cam, c, 0.62, 0.24 - i * 0.16); c.rotation.z = (i - 1) * 0.06; });
      const pk = win(t, C.pharaon + 0.3, SC.fin.start, 0.5, 0.3); fade(ph.root, pk); ph.place(0, 0, -3.2, 0); ph.pose({ aL: [0.3, 0.1], aR: [0.3, 0.1] });
      K.update(t);
    }
  };
};

// ---------- fin : le soleil qui brule (prochain episode)
SETS.fin = () => {
  const B = desert({ exposure: 1.2 }); const { scene, cam } = B;
  const sun = softGlow(10, 0xffc040); sun.position.set(0, 9, -30); scene.add(sun); const core = glowStar(6, 0xfff0a0); core.position.copy(sun.position); scene.add(core);
  const ppl = [0, 1, 2].map(i => { const h = citizen(i + 70); h.place(-1 + i, 0.3, 0, Math.PI); scene.add(h.root); return h; });
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 16, 8-9', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 8, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start, k = sstep(T0 + 2, T0 + 9, t);
      sun.scale.setScalar(10 + 30 * k); core.scale.setScalar(6 + 14 * k); B.hemi.intensity = 0.8 + 1.4 * k; if (B.sun) { B.sun.color.setRGB(1, 0.8 - 0.3 * k, 0.5 - 0.3 * k); B.sun.intensity = 0.9 + 1.5 * k; }
      ppl.forEach((h, i) => { h.pose({ aL: [2.4 * k, 0.5], aR: [2.4 * k, 0.5], eL: 1.6 * k, eR: 1.6 * k, hp: 0.3 * k }); });
      camKeys(cam, t, [{ t: T0, p: [0, 1.6, 4.5], l: [0, 4, -30], f: 58 }, { t: TL.duration, p: [0, 1.8, 5.5], l: [0, 5, -30], f: 58 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : le trone de la bete englouti par les tenebres
SETS.cover = () => {
  const B = throneHall(); const { scene, cam } = B; B.dark(0.3, 0);
  const an = bowlAngel(4); an.root.scale.setScalar(1.4); an.place(-1.6, 3.6, -6.5, 0.3); scene.add(an.root); const al = angelLight(scene, [-1.2, 5.5, -4.5]); al.intensity = 4;
  const fogs = []; for (let i = 0; i < 18; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(1.2 + hash(i) * 1.4, 14, 10), new THREE.MeshBasicMaterial({ color: 0x05030a, transparent: true, opacity: 0.6, depthWrite: false })); const a = i / 18 * Math.PI * 2; f.position.set(Math.cos(a) * 6.5, 0.6 + hash(i * 3) * 3.5, -9 + Math.sin(a) * 4); scene.add(f); fogs.push(f); }
  const glowEyes = softGlow(6, 0xff3a2a); glowEyes.material.opacity = 0.3; glowEyes.position.set(0, 3.5, -11); scene.add(glowEyes);
  return { ...B, update() { B.bt.userData.tick(2); an.pose({ aL: [2.4, 0.3], eL: 0.4 }); an.bowl.rotation.z = 1.4; an.face(0, 'serious', 2); cam.position.set(0, 2.6, 3.5); cam.fov = 58; cam.updateProjectionMatrix(); cam.lookAt(0, 1.6, -9); cam.userData.focus = 12; } };
};

const SHOTS = [['intro', 0, SC.coupe.start], ['coupe', SC.coupe.start, SC.egypte.start], ['egypte', SC.egypte.start, SC.douleur.start], ['douleur', SC.douleur.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
