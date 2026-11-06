
// ================= episode 57 : un soleil de feu (Apocalypse 16, 8-9)
function hotDay(o = {}) {
  const B = base({ sky: [0xc84a1a, 0xffd080, 0xff9a3a], hemi: [0xffe0b0, 0x6a3a1a, 1.0], sun: [0xffd0a0, 1.3, [0, 10, -6]], shadow: false, bloom: [0.4, 0.5, 0.88], exposure: o.exposure ?? 0.95, fog: [0xffb070, 25, 110] });
  const { scene } = B; scene.add(L.groundPlane(160, 50, 0xb8885a, 0.4, 3));
  const sunG = new THREE.Group(); sunG.position.set(0, 16, -55); scene.add(sunG);
  const halo = softGlow(40, 0xffa020); halo.material.opacity = 0.8; sunG.add(halo);
  const core = new THREE.Mesh(new THREE.SphereGeometry(4, 32, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0b0).multiplyScalar(1.3) })); sunG.add(core);
  const flares = []; for (let i = 0; i < 10; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.8, 4 + hash(i) * 4, 8), new THREE.MeshBasicMaterial({ color: 0xffb030, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })); const a = i / 10 * Math.PI * 2; f.position.set(Math.cos(a) * 6, Math.sin(a) * 6, 0); f.rotation.z = a - Math.PI / 2; sunG.add(f); flares.push(f); }
  B.sunG = sunG; B.setSun = (k, t) => { sunG.scale.setScalar(1 + 0.45 * k); halo.material.opacity = 0.45 + 0.2 * k; flares.forEach((f, i) => f.scale.y = (0.6 + 0.8 * k) * (1 + 0.25 * Math.sin(t * 3 + i))); B.hemi.intensity = 0.9 + 0.8 * k; };
  return B;
}
function town(scene, z = -12) { const g = new THREE.Group(); g.position.set(0, 0, z); scene.add(g); for (let i = 0; i < 18; i++) { const h = 1 + hash(i * 3) * 2.5, w = 1.2 + hash(i) * 1; g.add(at(box(w, h, w, M(0xd8b888)), (hash(i * 5) - 0.5) * 22, h / 2, (hash(i * 7) - 0.5) * 8)); } return g; }
function scorched(scene, n, z = 0) { return Array.from({ length: n }, (_, i) => { const h = citizen(i + 80); h.place(-((n - 1) * 0.36) + i * 0.72, 0, z - (i % 2) * 0.7, 0); scene.add(h.root); return h; }); }
function suffer(h, t, i, k = 1) { h.pose({ aL: [2.4 * k, 0.5], aR: [2.4 * k, 0.5], eL: 1.7 * k, eR: 1.7 * k, hp: 0.25 * k, lean: 0.2 * k + 0.05 * Math.sin(t * 3 + i) }); h.face(0.2 * Math.max(0, Math.sin(t * 4 + i)), 'fear', t); }

// ---------- intro
SETS.intro = () => {
  const B = hotDay(); const { scene, cam } = B; town(scene, -18);
  const an = bowlAngel(3); an.root.scale.setScalar(3); an.place(-5, 12, -34, 0.4); scene.add(an.root); angelLight(scene, [-4, 16, -30]).intensity = 4;
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.9, 10, 10), new THREE.MeshBasicMaterial({ color: 0xff6a20, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(stream);
  const ppl = scorched(scene, 5, -2);
  rock(scene, 1.0, -0.2, 1.8, 1.1);
  const rig = claudeRig(scene, [1.1, 0.2, 1.8], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [0.9, 0.9, 3.2], 1.0);
  const back = card('◀ une scène avant', { w: 0.8, h: 0.13, border: '#ffd070' }); rig.holoG.add(back);
  const dark = card('TÉNÈBRES', { w: 0.6, h: 0.13, border: '#8a6aff', bg: 'rgba(10,6,20,0.9)' }); rig.holoG.add(dark);
  const K = cardsMgr(scene, cam);
  K('le soleil qui fait vivre… se met à brûler', { w: 1.6, h: 0.24, border: '#ff8a3a' }, t => win(t, 1.0, C.serie - 0.3, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const pour = sstep(1, 3, t), k = sstep(3, 8, t); B.setSun(k, t);
      an.pose({ aL: [2.4, 0.3], eL: 0.4, aR: [0.4, 0.2] }); an.bowl.rotation.z = -1.4 * pour; an.face(0, 'serious', t);
      an.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); an.bowl.getWorldPosition(hp); stream.position.set(hp.x + 2.5, hp.y + 2.5, hp.z - 5); stream.rotation.set(-0.6, 0, -1.1); stream.visible = pour > 0.05 && t < C.serie; stream.material.opacity = 0.55 * pour;
      ppl.forEach((h, i) => suffer(h, t, i, k));
      const bk = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, bk, t); fade(back, bk); fade(dark, bk); back.position.y = 0.45; dark.position.y = 0.2; back.lookAt(cam.position); dark.lookAt(cam.position); rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [0, 1.8, 6.5], l: [0, 8, -40], f: 60 }, { t: C.serie, p: [0.4, 1.8, 6.0], l: [0, 6, -40], f: 60 }, { t: C.serie + 0.9, p: [0.9, 0.95, 4.6], l: [0.6, 0.6, 0.4], f: 48 }, { t: C.title - 0.3, p: [0.9, 0.95, 4.6], l: [0.6, 0.6, 0.4], f: 48 }, { t: C.title + 0.8, p: [0, 1.8, 6.5], l: [0, 8, -40], f: 60 }, { t: SC.coupe.start, p: [0, 1.8, 6.5], l: [0, 8, -40], f: 60 }]);
      K.update(t);
    }
  };
};

// ---------- la coupe sur le soleil ; la 4e trompette ; le 4e jour ; les chiffres du soleil
SETS.coupe = () => {
  const B = hotDay(); const { scene, cam } = B; town(scene, -18);
  const an = bowlAngel(3); an.root.scale.setScalar(3); an.place(-5, 12, -34, 0.4); scene.add(an.root); angelLight(scene, [-4, 16, -30]).intensity = 4;
  const holoSun = new THREE.Group(); scene.add(holoSun);
  const hsB = new THREE.Mesh(new THREE.CircleGeometry(0.7, 40), G(0xffd070, 1.3)); holoSun.add(hsB);
  const third = new THREE.Mesh(new THREE.CircleGeometry(0.72, 40, 0, Math.PI * 2 / 3), new THREE.MeshBasicMaterial({ color: 0x1a1020 })); third.position.z = 0.01; holoSun.add(third);
  const hs2 = new THREE.Mesh(new THREE.CircleGeometry(0.7, 40), G(0xffa020, 1.8)); hs2.position.set(1.8, 0, 0); holoSun.add(hs2); const hg2 = softGlow(3.2, 0xff8a20); hg2.position.set(1.8, 0, 0.02); holoSun.add(hg2);
  const l1 = label('4e trompette', { w: 1.0, h: 0.16, color: '#ffffff', font: 'bold 80px Inter' }); l1.position.set(0, -0.95, 0); holoSun.add(l1);
  const l2 = label('4e coupe', { w: 1.0, h: 0.16, color: '#ffd070', font: 'bold 80px Inter' }); l2.position.set(1.8, -0.95, 0); holoSun.add(l2);
  const four = goldWord('4E JOUR', 1.6, 0.4); scene.add(four);
  const temps = [card('surface : 5 500 °C', { w: 0.9, h: 0.15, border: '#ffa020' }), card('cœur : 15 millions °C', { w: 0.9, h: 0.15, border: '#ff5a20' })]; temps.forEach(c => scene.add(c));
  const cut = new THREE.Group(); scene.add(cut); cut.add(new THREE.Mesh(new THREE.SphereGeometry(0.8, 28, 18, 0, Math.PI * 1.5), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb030).multiplyScalar(1.3), side: THREE.DoubleSide }))); cut.add(new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 12), G(0xffffff, 1.6)));
  const K = cardsMgr(scene, cam); refCard(K);
  K('Apocalypse 8, 12 : un tiers du soleil s\'obscurcissait', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.trompette + 0.3, C.genese, 0.3, 0.2), -0.6);
  K('Genèse 1, 16 : le soleil, créé le 4e jour', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.genese + 0.3, C.chiffres, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.coupe.start, pour = win(t, T0 + 1, C.trompette, 0.8, 0.5); B.setSun(sstep(T0 + 2, T0 + 6, t), t);
      an.pose({ aL: [2.4, 0.3], eL: 0.4 }); an.bowl.rotation.z = -1.4 * pour; an.face(0, 'serious', t);
      camKeys(cam, t, [{ t: T0, p: [-2, 4, 2], l: [-3, 13, -34], f: 56 }, { t: C.trompette, p: [0, 1.8, 6.0], l: [0, 6, -40], f: 60 }, { t: SC.culte.start, p: [0, 1.8, 6.0], l: [0, 6, -40], f: 60 }]);
      const f = (x, y, z = -3) => cam.position.clone().add(new THREE.Vector3(x, y, z).applyQuaternion(cam.quaternion));
      const hk = win(t, C.trompette + 0.3, C.genese, 0.5, 0.3); fade(holoSun, hk); holoSun.position.copy(f(-0.45, 0.3)); holoSun.scale.setScalar(0.5); holoSun.quaternion.copy(cam.quaternion);
      fade(four, win(t, C.genese + 0.3, C.chiffres, 0.3, 0.3)); four.position.copy(f(0, -0.05)); four.quaternion.copy(cam.quaternion);
      const ck = win(t, C.chiffres + 0.3, SC.culte.start, 0.5, 0.3); fade(cut, ck); cut.position.copy(f(0, 0.3)); cut.scale.setScalar(0.55); cut.rotation.y = t * 0.5;
      temps.forEach((c, i) => { fade(c, ck * sstep(C.chiffres + 1 + i * 2, C.chiffres + 1.4 + i * 2, t)); camCard(cam, c, 0.4, -0.1 - i * 0.14); });
      K.update(t);
    }
  };
};

// ---------- le soleil adore : Ra, Akhenaton et Aton, le Colosse de Neron, le Colisee, Sol Invictus
SETS.culte = () => {
  const B = hotDay({ exposure: 0.9 }); const { scene, cam } = B;
  const ra = new THREE.Group(); ra.position.set(0, 2.4, -2); scene.add(ra); const disk = new THREE.Mesh(new THREE.CircleGeometry(0.9, 40), G(0xffb020, 1.4)); ra.add(disk); const rl = label('RÂ', { w: 0.8, h: 0.3, color: '#ffffff', font: 'bold 160px Inter' }); rl.position.set(0, -1.2, 0); ra.add(rl);
  const aton = new THREE.Group(); aton.position.set(0, 2.6, -2); scene.add(aton); aton.add(new THREE.Mesh(new THREE.CircleGeometry(0.6, 40), G(0xffd070, 1.4))); for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * 0.22; const r = L.beam([Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0], [Math.cos(a) * 2.0, Math.sin(a) * 2.0, 0], 0.03, holoMat(0xffd070, 0.8)); aton.add(r); const hnd = box(0.08, 0.1, 0.03, G(0xffd070, 1.3)); hnd.position.set(Math.cos(a) * 2.05, Math.sin(a) * 2.05, 0); aton.add(hnd); } const al_ = label('ATON (Akhenaton)', { w: 1.4, h: 0.22, color: '#ffffff', font: 'bold 100px Inter' }); al_.position.set(0, 0.8, 0); aton.add(al_);
  const colo = new THREE.Group(); colo.position.set(4, 0, -16); scene.add(colo);
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 4.5, 40, 1, true), M(0xd8c098, { side: THREE.DoubleSide })); ring.position.y = 2.25; colo.add(ring);
  for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; for (let r = 0; r < 3; r++) { const arch = box(0.5, 0.8, 0.12, M(0x3a2a1a)); arch.position.set(Math.cos(a) * 5.02, 0.7 + r * 1.4, Math.sin(a) * 5.02); arch.rotation.y = -a + Math.PI / 2; colo.add(arch); } }
  const statue = new Human({ skin: 0xc89a4a, hair: 0xb88a3a, top: 0xc89a4a, bottom: 0xb88a3a, robe: 0xc89a4a, robeL: 0.6, seed: 5700 }); statue.root.traverse(m => { if (m.isMesh && m.material && m.material.color) { m.material = m.material.clone(); m.material.metalness = 0.6; m.material.roughness = 0.35; } }); statue.root.scale.setScalar(7); statue.place(-3.5, 1.2, -14, 0.3); scene.add(statue.root);
  for (let k = 0; k < 7; k++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.16, 5), M(0xffcc55, { metalness: 0.7, roughness: 0.3 })); const a = Math.PI * (0.15 + 0.7 * k / 6); sp.position.set(Math.cos(a) * 0.17, 0.25 + Math.sin(a) * 0.12, -0.02); sp.rotation.z = a - Math.PI / 2; statue.neck.add(sp); }
  const ped = box(2.2, 1.2, 2.2, M(0xc8b090)); ped.position.set(-3.5, 0.6, -14); scene.add(ped);
  const K = cardsMgr(scene, cam); refCard(K);
  K('le Colosse de Néron : plus de 30 mètres, en dieu-soleil', { w: 1.6, h: 0.28, border: '#ffb020' }, t => win(t, SC.culte.start + 9, C.akhenaton, 0.3, 0.2), -0.6);
  K('le Colisée doit son nom au Colosse', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.colisee + 0.3, C.colisee + 6, 0.3, 0.2), -0.6);
  K('an 274 : Aurélien impose le Soleil invaincu (Sol Invictus)', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.colisee + 6.2, SC.chaleur.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.culte.start; B.setSun(0.3, t); statue.pose({ aR: [2.6, 0.2], aL: [0.3, 0.2] }); statue.face(0, 'serious', t);
      fade(ra, win(t, T0 + 0.5, T0 + 8.5, 0.5, 0.4)); fade(aton, win(t, C.akhenaton + 0.3, C.colisee, 0.5, 0.4)); [rl, al_].forEach(l => l.lookAt(cam.position));
      camKeys(cam, t, [{ t: T0, p: [0, 2.2, 3.5], l: [0, 2.2, -2], f: 54 }, { t: T0 + 8.5, p: [0, 3.0, 4], l: [-3.5, 8, -14], f: 58 }, { t: C.akhenaton, p: [0, 3.0, 4], l: [-3.5, 8, -14], f: 58 }, { t: C.akhenaton + 0.5, p: [0, 2.2, 3.5], l: [0, 2.4, -2], f: 54 }, { t: C.colisee, p: [0, 2.2, 3.5], l: [0, 2.4, -2], f: 54 }, { t: C.colisee + 0.8, p: [-1, 5, 8], l: [1, 4, -15], f: 58 }, { t: SC.chaleur.start, p: [-1, 5, 8], l: [1, 4, -15], f: 58 }]);
      K.update(t);
    }
  };
};

// ---------- la chaleur : les hommes brules ; le record ; Matthieu 5, 45 ; ils maudissent ; la promesse
SETS.chaleur = () => {
  const B = hotDay({ exposure: 1.0 }); const { scene, cam } = B; town(scene, -14); B.setSun(1, 0);
  const ppl = scorched(scene, 6, 0);
  const thermo = new THREE.Group(); scene.add(thermo); thermo.add(holo(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 12), 0xffffff, 0.3)); const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.0, 12), G(0xff3a2a, 1.4)); thermo.add(fill); thermo.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), G(0xff3a2a, 1.4)), 0, -0.62, 0)); const tl = label('56,7 °C · Vallée de la Mort', { w: 1.3, h: 0.16, color: '#ffffff', font: 'bold 80px Inter' }); tl.position.set(0, 0.8, 0); thermo.add(tl);
  const faithful = Array.from({ length: 4 }, (_, i) => { const h = new Human({ skin: [0x8a5a3a, 0xe0b890, 0xa86c44, 0x5a3420][i], hair: 0x1a1210, top: 0xffffff, bottom: 0xf0f0f0, robe: 0xffffff, robeL: 0.8, seed: 5800 + i }); h.place(-1.2 + i * 0.8, 0, 0, 0); scene.add(h.root); h.root.visible = false; return h; });
  const shade = new THREE.Mesh(new THREE.SphereGeometry(4, 20, 10), new THREE.MeshBasicMaterial({ color: 0x8ac8ff, transparent: true, opacity: 0.25, side: THREE.BackSide, depthWrite: false })); shade.position.set(0, 0, 0); scene.add(shade);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Matthieu 5, 45 : son soleil se lève sur les méchants et sur les bons', { w: 1.6, h: 0.32, border: '#ffd070' }, t => win(t, C.matthieu + 0.3, C.gloire, 0.3, 0.2), -0.6);
  K('ils connaissent Dieu… et le maudissent (Apocalypse 11, 13 : l\'inverse)', { w: 1.6, h: 0.32, border: '#ff5a3a' }, t => win(t, C.gloire + 0.3, C.promesse, 0.3, 0.2), -0.6);
  K('Apocalypse 7, 16 · Psaume 121, 6 : « le soleil ne te frappera point »', { w: 1.6, h: 0.32, border: '#8ac8ff' }, t => win(t, C.promesse + 0.3, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.chaleur.start, pk = sstep(C.promesse, C.promesse + 1, t) * (1 - sstep(SC.fin.start - 0.3, SC.fin.start, t));
      const curse = sstep(T0 + 7, T0 + 8, t);
      ppl.forEach((h, i) => { h.root.visible = pk < 0.5; if (curse > 0.5 && i % 2 && t > C.gloire - 2) { h.pose({ aR: [2.8, 0.2], aL: [0.3, 0.2] }); h.face(0, 'angry', t); } else suffer(h, t, i); });
      faithful.forEach((h, i) => { h.root.visible = pk >= 0.5; h.pose({ aL: [0.3, 0.1], aR: [0.3, 0.1], hp: -0.15 }); h.face(0, 'happy', t); });
      shade.visible = false; B.hemi.color.setRGB(lerp(1, 0.75, pk), lerp(0.88, 0.85, pk), lerp(0.69, 1.0, pk)); B.setSun(1 - 0.8 * pk, t);
      camKeys(cam, t, [{ t: T0, p: [0, 1.6, 3.6], l: [0, 1.3, -1], f: 52 }, { t: C.record, p: [0, 1.7, 4.0], l: [0, 1.4, -1], f: 52 }, { t: C.promesse, p: [0, 1.7, 4.0], l: [0, 1.4, -1], f: 52 }, { t: SC.fin.start, p: [0, 1.9, 4.6], l: [0, 1.4, -1], f: 52 }]);
      const tk = win(t, C.record + 0.3, C.matthieu, 0.4, 0.3); fade(thermo, tk); thermo.position.copy(cam.position.clone().add(new THREE.Vector3(0.25, 0.25, -2.4).applyQuaternion(cam.quaternion))); thermo.quaternion.copy(cam.quaternion); fill.scale.y = 0.2 + 0.8 * sstep(C.record + 0.5, C.record + 3, t); fill.position.y = -0.5 + 0.5 * fill.scale.y;
      K.update(t);
    }
  };
};

// ---------- fin : les fleuves changes en sang (prochain episode)
SETS.fin = () => {
  const B = desert({ exposure: 1.1 }); const { scene, cam } = B; const rv = riverBed(scene, -25);
  const an = bowlAngel(2); an.root.scale.setScalar(2.6); an.place(-2, 8, -18, 0.3); scene.add(an.root); angelLight(scene, [-1, 12, -14]).intensity = 4;
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 16, 4-7', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 7.5, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start, r = sstep(T0 + 3, T0 + 7, t); rv.set(0); rv.water.material.color.setRGB(lerp(0.16, 0.6, r), lerp(0.42, 0.04, r), lerp(0.66, 0.06, r)); rv.water.material.emissive.setRGB(lerp(0.04, 0.2, r), lerp(0.16, 0.0, r), lerp(0.29, 0.0, r));
      an.pose({ aL: [lerp(1.3, 2.4, sstep(T0 + 1, T0 + 3, t)), 0.3], eL: 0.4 }); an.bowl.rotation.z = 1.4 * sstep(T0 + 1, T0 + 3, t); an.face(0, 'serious', t);
      camKeys(cam, t, [{ t: T0, p: [0, 3.0, 7], l: [0, 2, -20], f: 56 }, { t: TL.duration, p: [0, 2.6, 7.5], l: [0, 0.8, -12], f: 56 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : soleil enorme et aveuglant, ville ecrasee de chaleur, hommes qui se protegent, l'ange verse sa coupe dans le soleil
SETS.cover = () => {
  const B = hotDay(); const { scene, cam } = B; town(scene, -18);
  const an = bowlAngel(3); an.root.scale.setScalar(3); an.place(-6, 13, -36, 0.4); scene.add(an.root); angelLight(scene, [-5, 17, -32]).intensity = 4;
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.9, 10, 10), new THREE.MeshBasicMaterial({ color: 0xff6a20, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(stream);
  const ppl = scorched(scene, 5, -1);
  return { ...B, update() { B.setSun(1, 2); an.pose({ aL: [2.4, 0.3], eL: 0.4, aR: [0.4, 0.2] }); an.bowl.rotation.z = -1.4; an.face(0, 'serious', 2); an.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); an.bowl.getWorldPosition(hp); stream.position.set(hp.x + 2.5, hp.y + 2.5, hp.z - 5); stream.rotation.set(-0.6, 0, -1.1); ppl.forEach((h, i) => suffer(h, 2, i)); cam.position.set(0, 1.4, 5.5); cam.fov = 62; cam.updateProjectionMatrix(); cam.lookAt(0, 6.0, -40); cam.userData.focus = 6; } };
};

const SHOTS = [['intro', 0, SC.coupe.start], ['coupe', SC.coupe.start, SC.culte.start], ['culte', SC.culte.start, SC.chaleur.start], ['chaleur', SC.chaleur.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
