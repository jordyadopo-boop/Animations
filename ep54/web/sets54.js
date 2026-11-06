
// ================= episode 54 : une ville immense fendue par un tremblement de terre (Apocalypse 16, 17-21)
function stormCity(o = {}) {
  const B = nightSea({ cityX: 0, exposure: o.exposure ?? 1.1 }); const { scene } = B; B.city.position.set(0, 0, o.z ?? -30);
  const parts = [new THREE.Group(), new THREE.Group(), new THREE.Group()]; parts.forEach(p => scene.add(p));
  B.city.children.slice().forEach(c => { if (c.position.x < -6) parts[0].attach(c); else if (c.position.x > 6) parts[2].attach(c); else parts[1].attach(c); });
  parts.forEach(p => p.children.forEach(c => { c.userData.r0 = c.rotation.z; c.userData.y0 = c.position.y; }));
  B.cityGlow.visible = false; B.cityGlow.scale.setScalar(0.001); const cg = softGlow(30, 0xffb060); cg.material.opacity = 0.22; cg.position.set(0, 6, (o.z ?? -30) - 3); scene.add(cg);
  const cracks = [-6, 6].map(x => { const g = new THREE.Group(); g.position.set(x, 0, o.z ?? -30); scene.add(g); for (let k = 0; k < 4; k++) { const f = softGlow(3, 0xff6a20); f.position.set(0, 0.3, (k - 1.5) * 2); g.add(f); } const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 8), new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); pl.rotation.x = -Math.PI / 2; pl.position.y = 0.05; g.add(pl); g.visible = false; return g; });
  const clouds_ = []; for (let i = 0; i < 16; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(4 + hash(i) * 4, 1), M(0x1a1826, { emissive: new THREE.Color(0x0a0a12) })); c.scale.y = 0.4; c.position.set((hash(i * 3) - 0.5) * 80, 26 + hash(i * 5) * 6, -40 - hash(i * 7) * 20); scene.add(c); clouds_.push(c); }
  const bolts = [0, 1, 2, 3].map(k => { const b = L.makeBolt(k * 13 + 7, [(k - 1.5) * 12, 30, -40], [(k - 1.5) * 7, 2, o.z ?? -30], G(0xffffff, 2.6)); scene.add(b); return b; });
  B.split = (u, t) => { cracks.forEach(g => { g.visible = u > 0.02; g.scale.x = 0.3 + 3 * u; g.children.forEach(c => { if (c.material) c.material.opacity = (c.isSprite ? 0.7 : 0.9) * Math.min(1, u * 3); }); }); parts[0].position.x = -4 * u; parts[0].rotation.z = 0.14 * u; parts[2].position.x = 4 * u; parts[2].rotation.z = -0.14 * u; parts[1].position.y = -2 * u;
    parts.forEach((p, pi) => p.children.forEach((c, i) => { const f = clamp(u * 1.6 - hash(i * 3 + pi) * 0.6, 0, 1); c.rotation.z = c.userData.r0 + (hash(i + pi) - 0.5) * 1.2 * f; })); };
  B.storm = (t, times, k = 1) => { const fk = L.flashK(t, times); bolts.forEach((b, i) => b.visible = fk > 0.3 && (i === Math.floor(t * 6) % 4 || fk > 0.85)); B.hemi.intensity = 0.75 + 1.6 * fk * k; return fk; };
  B.parts = parts; return B;
}
function hailstones(scene, n = 60, R = 14, cz = -10) {
  const arr = []; for (let i = 0; i < n; i++) { const h = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25 + hash(i) * 0.35, 0), M(0xe8f0ff, { emissive: new THREE.Color(0x5a6a8a) })); scene.add(h); arr.push(h); }
  arr.update = (t, on = 1) => arr.forEach((h, i) => { const ph = (t * (0.35 + hash(i * 3) * 0.2) + hash(i)) % 1; h.visible = on > 0.02; h.position.set((hash(i * 5) - 0.5) * R * 2, 30 - ph * 31, cz + (hash(i * 7) - 0.5) * R); h.rotation.set(t * 2 + i, t + i, 0); });
  return arr;
}
function shake(cam, t, t0, amp = 0.15, dec = 0.6) { if (t < t0) return; const s = amp * Math.exp(-(t - t0) * dec); cam.position.x += s * Math.sin(t * 53); cam.position.y += s * Math.cos(t * 47); }

// ---------- intro
SETS.intro = () => {
  const B = stormCity(); const { scene, cam } = B;
  const an = bowlAngel(6); an.root.scale.setScalar(3.5); an.place(-3, 15, -26, 0.3); scene.add(an.root); angelLight(scene, [0, 15, -20]).intensity = 5;
  const hail = hailstones(scene, 40, 14, -24);
  rock(scene, 1.0, -0.2, 1.4, 1.1);
  const rig = claudeRig(scene, [1.1, 0.2, 1.4], -0.5, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [0.9, 0.9, 2.8], 1.2);
  const back = label('◀ une scène avant', { w: 0.8, h: 0.12, color: '#ffd070', font: 'bold 80px Inter' }); rig.holoG.add(back);
  const myst = label('MYSTÈRE', { w: 0.6, h: 0.15, color: '#ffd070', font: 'bold 110px Inter' }); rig.holoG.add(myst);
  const K = cardsMgr(scene, cam);
  K('le plus grand séisme… et des grêlons de 40 kg', { w: 1.6, h: 0.24, border: '#9adfff' }, t => win(t, 1.0, C.serie - 0.3, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      B.water.update(t, 0.5); B.cityLight(1 - 0.4 * sstep(3, 6, t)); B.split(sstep(3, 7, t), t); B.storm(t, [2.5, 4.2, 6.0]); hail.update(t, sstep(5, 6, t) * (1 - sstep(C.serie, C.serie + 0.5, t)));
      an.pose({ aL: [2.2, 0.3], eL: 0.4 }); an.bowl.rotation.z = 1.4; an.face(0, 'serious', t);
      const bk = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, bk, t); fade(back, bk); fade(myst, bk); back.position.y = 0.45; myst.position.y = 0.22; back.lookAt(cam.position); myst.lookAt(cam.position); rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [0, 2.6, 8], l: [-1, 8, -28], f: 60 }, { t: C.serie, p: [0.4, 2.6, 7.5], l: [-1, 8, -28], f: 60 }, { t: C.serie + 0.9, p: [0.9, 0.95, 4.2], l: [0.6, 0.6, 0], f: 48 }, { t: C.title - 0.3, p: [0.9, 0.95, 4.2], l: [0.6, 0.6, 0], f: 48 }, { t: C.title + 0.8, p: [0, 2.6, 8.5], l: [0, 6, -28], f: 58 }, { t: SC.coupe.start, p: [0, 2.6, 8.5], l: [0, 6, -28], f: 58 }]);
      shake(cam, t, 3.5, 0.12, 0.5);
      K.update(t);
    }
  };
};

// ---------- la septieme coupe : « C'en est fait ! » ; les six coupes precedentes
SETS.coupe = () => {
  const B = stormCity(); const { scene, cam } = B;
  const an = bowlAngel(6); an.root.scale.setScalar(3.5); an.place(-2.5, 12, -24, 0.3); scene.add(an.root); angelLight(scene, [0, 12, -16]).intensity = 5;
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 1.2, 20, 12), new THREE.MeshBasicMaterial({ color: 0xff8a3a, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(stream);
  const word = goldWord('« C\'EN EST FAIT ! »', 3.0, 0.6); scene.add(word);
  const bowls = ['1 · plaies sur les hommes', '2 · la mer en sang', '3 · les fleuves en sang', '4 · un soleil brûlant', '5 · les ténèbres', '6 · l\'Euphrate asséché', '7 · dans l\'air : « C\'en est fait ! »'].map((n, i) => { const c = card(n, { w: 0.9, h: 0.12, border: i === 6 ? '#ffd070' : '#ff8a3a', color: i === 6 ? '#ffe8a0' : '#ffffff' }); scene.add(c); return c; });
  const K = cardsMgr(scene, cam); refCard(K);
  K('Jean 19, 30 : « Tout est accompli »', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.fait + 4, C.fait + 7.5, 0.3, 0.2), -0.6);
  K('Apocalypse 21, 6 : « C\'est fait ! » (épisode 43)', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.fait + 7.7, C.sept, 0.3, 0.2), -0.6);
  K('7 coupes, 7 fléaux (Apocalypse 16)', { w: 1.6, h: 0.24, border: '#ff8a3a' }, t => win(t, C.sept + 0.3, SC.seisme.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.coupe.start, pour = sstep(T0 + 1.5, T0 + 3.5, t) * (1 - sstep(C.sept - 0.5, C.sept, t)); B.water.update(t, 0.4); B.cityLight(0.8); B.storm(t, [T0 + 6.5, T0 + 7.6]);
      an.pose({ aL: [lerp(1.3, 2.4, pour), 0.3], eL: 0.4 }); an.bowl.rotation.z = 1.4 * pour; an.face(0, 'serious', t);
      an.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); an.bowl.getWorldPosition(hp); stream.position.set(hp.x, hp.y - 10, hp.z); stream.rotation.z = 0; stream.visible = pour > 0.05; stream.material.opacity = 0.5 * pour;
      camKeys(cam, t, [{ t: T0, p: [0, 2.6, 6], l: [-1.5, 11, -24], f: 58 }, { t: C.sept, p: [0, 2.4, 6.5], l: [0, 6, -24], f: 58 }, { t: SC.seisme.start, p: [0, 2.4, 6.5], l: [0, 6, -24], f: 58 }]);
      fade(word, win(t, T0 + 6.5, C.fait + 4, 0.3, 0.4)); camCard(cam, word, 0.9, 0.1); word.scale.setScalar(1 + 0.4 * (1 - sstep(T0 + 6.5, T0 + 6.8, t)));
      bowls.forEach((c, i) => { fade(c, win(t, C.sept + 0.6 + i * 1.3, SC.seisme.start, 0.3, 0.3)); camCard(cam, c, 0.5, 0.3 - i * 0.1); });
      K.update(t);
    }
  };
};
function pulseK(t, t0) { return t < t0 ? 0 : Math.exp(-(t - t0) * 3); }

// ---------- le seisme : eclairs, la ville tremble ; l'Asie Mineure (an 17) ; Laodicee (an 60)
SETS.seisme = () => {
  const B = stormCity(); const { scene, cam } = B;
  const map = new THREE.Group(); scene.add(map);
  map.add(holo(new THREE.PlaneGeometry(2.4, 1.4), 0x9adfff, 0.08));
  const coast = holo(new THREE.ShapeGeometry(new THREE.Shape([[-1.1, -0.5], [-0.9, 0.2], [-0.5, 0.45], [0.3, 0.5], [1.1, 0.4], [1.15, -0.2], [0.6, -0.45], [-0.2, -0.5]].map(p => new THREE.Vector2(...p)))), 0xc8a070, 0.25); map.add(coast);
  const cities = []; for (let i = 0; i < 12; i++) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.045, 10), G(0xffd070, 1.4)); d.position.set(-0.85 + hash(i * 3) * 0.9, -0.3 + hash(i * 5) * 0.6, 0.01); map.add(d); cities.push(d); }
  const t1 = label('ASIE MINEURE (Turquie)', { w: 1.2, h: 0.14, color: '#ffffff', font: 'bold 80px Inter' }); t1.position.set(0, 0.6, 0.02); map.add(t1);
  const lao = new THREE.Group(); scene.add(lao); const lb = []; for (let i = 0; i < 9; i++) { const h = 0.2 + hash(i * 3) * 0.5; const b = holo(new THREE.BoxGeometry(0.2, h, 0.2), 0xffd070, 0.25); b.userData.h = h; b.position.set(-0.6 + (i % 3) * 0.6, 0, -0.3 + Math.floor(i / 3) * 0.3); lao.add(b); lb.push(b); }
  const ll = label('LAODICÉE', { w: 0.8, h: 0.16, color: '#ffd070', font: 'bold 90px Inter' }); ll.position.set(0, 0.9, 0); lao.add(ll);
  const K = cardsMgr(scene, cam); refCard(K);
  K('« tel qu\'il n\'y en avait jamais eu »', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, SC.seisme.start + 4, C.asie, 0.3, 0.2), -0.6);
  K('an 17 : 12 villes détruites en une nuit, dont Sardes (Tacite)', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.asie + 0.3, C.laodicee, 0.3, 0.2), -0.6);
  K('an 60 : Laodicée se reconstruit seule, sans Rome (Tacite)', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.laodicee + 0.3, SC.ville.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.seisme.start; B.water.update(t, 0.6); B.cityLight(0.7); B.storm(t, [T0 + 1, T0 + 3.2, T0 + 5.4]); B.split(0.15 * sstep(T0 + 5, T0 + 8, t), t);
      camKeys(cam, t, [{ t: T0, p: [0, 2.6, 8], l: [0, 6, -28], f: 58 }, { t: C.asie, p: [0, 2.2, 6.0], l: [0, 2.0, -28], f: 56 }, { t: SC.ville.start, p: [0, 2.2, 6.0], l: [0, 2.0, -28], f: 56 }]);
      shake(cam, t, T0 + 5, 0.15, 0.25);
      const mk = win(t, C.asie + 0.3, C.laodicee, 0.5, 0.4); fade(map, mk); map.position.copy(cam.position).add(new THREE.Vector3(0, 0.2, -3).applyQuaternion(cam.quaternion)); map.quaternion.copy(cam.quaternion);
      cities.forEach((d, i) => { d.material.color.setHex(t > C.asie + 1.5 + i * 0.4 ? 0xff3a2a : 0xffd070); });
      const lk = win(t, C.laodicee + 0.3, SC.ville.start, 0.5, 0.4); fade(lao, lk); lao.position.copy(cam.position).add(new THREE.Vector3(0, -0.4, -3).applyQuaternion(cam.quaternion)); lao.quaternion.copy(cam.quaternion); lao.rotateX(0.5);
      const re = sstep(C.laodicee + 2, C.laodicee + 7, t), fall = sstep(C.laodicee + 0.5, C.laodicee + 1.5, t); lb.forEach((b, i) => { const h = b.userData.h * Math.max(0.05, (1 - fall) + re); b.scale.y = h / b.userData.h; b.position.y = h / 2; });
      K.update(t);
    }
  };
};

// ---------- la ville se brise en trois ; les iles s'enfuient (Patmos)
SETS.ville = () => {
  const B = stormCity({ z: -22 }); const { scene, cam } = B;
  const cup = new THREE.Group(); scene.add(cup); cup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.08, 0.3, 14), G(0xffc040, 1.3))); cup.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), G(0xffc040, 1.2)), 0, -0.25, 0));
  const isle = new THREE.Group(); scene.add(isle); const rk_ = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 1), M(0xa89070, { emissive: new THREE.Color(0x2a2010) })); rk_.scale.set(1.6, 0.5, 1.0); isle.add(rk_); const pl = label('PATMOS', { w: 1.2, h: 0.3, color: '#ffffff', font: 'bold 110px Inter' }); pl.position.y = 1.2; isle.add(pl);
  const K = cardsMgr(scene, cam); refCard(K);
  K('« la grande ville fut divisée en trois parties »', { w: 1.6, h: 0.24, border: '#ff8a3a' }, t => win(t, SC.ville.start + 3, C.coupes, 0.3, 0.2), -0.6);
  K('elle faisait boire le monde… elle reçoit la coupe', { w: 1.6, h: 0.24, border: '#ffc040' }, t => win(t, C.coupes + 0.3, C.patmos, 0.3, 0.2), -0.6);
  K('Jean écrit exilé sur l\'île de Patmos (Apocalypse 1, 9)', { w: 1.6, h: 0.28, border: '#9adfff' }, t => win(t, C.patmos + 0.3, SC.grele.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.ville.start, sp = sstep(T0 + 2.5, T0 + 6, t); B.water.update(t, 0.6); B.cityLight(1 - 0.6 * sp); B.split(sp, t); B.storm(t, [T0 + 2.3, T0 + 4.0, T0 + 9]);
      camKeys(cam, t, [{ t: T0, p: [0, 3.0, 7], l: [0, 4, -22], f: 58 }, { t: C.coupes, p: [0, 2.6, 6], l: [0, 3, -22], f: 58 }, { t: C.patmos, p: [0, 2.6, 6], l: [0, 1.5, -10], f: 58 }, { t: SC.grele.start, p: [0, 2.6, 6], l: [0, 1.5, -10], f: 58 }]);
      shake(cam, t, T0 + 2.5, 0.2, 0.3);
      const ck = win(t, C.coupes + 0.3, C.patmos, 0.4, 0.3); cup.visible = ck > 0.02; cup.scale.setScalar(ck * 1.3); cup.position.copy(cam.position).add(new THREE.Vector3(0, 0.3, -3).applyQuaternion(cam.quaternion)); cup.rotation.set(0, t, lerp(0, 1.2, sstep(C.coupes + 1.5, C.coupes + 3, t)));
      const ik = win(t, C.patmos + 0.2, SC.grele.start, 0.5, 0.3); fade(isle, ik); isle.position.set(lerp(0, -9, sstep(C.patmos + 1.5, SC.grele.start, t)), 0, -12); pl.lookAt(cam.position);
      K.update(t);
    }
  };
};

// ---------- la grele : grelons d'un talent ; record ~1 kg ; la 7e plaie d'Egypte
SETS.grele = () => {
  const B = stormCity({ z: -22 }); const { scene, cam } = B; B.split(1, 0); B.cityLight(0.3);
  const hail = hailstones(scene, 90, 10, -6);
  const ppl = Array.from({ length: 6 }, (_, i) => { const h = citizen(i + 30); h.place(-1.6 + i * 0.65, 0.2, 0.6 - (i % 2) * 0.8, 0); scene.add(h.root); return h; });
  const quay = box(8, 0.4, 4, M(0x4a3a2a)); quay.position.set(0, 0, 0); scene.add(quay);
  const big = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), M(0xe8f0ff, { emissive: new THREE.Color(0x5a6a8a) })); scene.add(big);
  const small = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 1), M(0xe8f0ff, { emissive: new THREE.Color(0x5a6a8a) })); scene.add(small);
  const lBig = label('1 talent ≈ 25 à 40 kg', { w: 0.7, h: 0.11, color: '#ffffff', font: 'bold 80px Inter' }); scene.add(lBig);
  const lSmall = label('record mesuré ≈ 1 kg', { w: 0.7, h: 0.11, color: '#9adfff', font: 'bold 80px Inter' }); scene.add(lSmall);
  const pyr = holo(new THREE.ConeGeometry(0.45, 0.45, 4), 0xffd070, 0.25); scene.add(pyr);
  const K = cardsMgr(scene, cam); refCard(K);
  K('« et les hommes blasphémèrent Dieu »', { w: 1.6, h: 0.24, border: '#ff5a3a' }, t => win(t, SC.grele.start + 6, C.talent, 0.3, 0.2), -0.6);
  K('Exode 9 : la 7e plaie d\'Égypte, c\'était déjà la grêle', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.egypte + 0.3, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.grele.start; B.water.update(t, 0.5); B.storm(t, [T0 + 2, T0 + 9, C.egypte + 3]);
      hail.update(t, t > C.talent && t < C.egypte ? 0 : 1);
      const curse = sstep(T0 + 6, T0 + 7, t); ppl.forEach((h, i) => { h.pose(curse > 0.5 ? { aR: [2.8, 0.2], aL: [0.3, 0.2], eR: 0.3 } : { aL: [2.6, 0.5], aR: [2.6, 0.5], eL: 1.6, eR: 1.6, lean: 0.4 }); h.face(0, curse > 0.5 ? 'angry' : 'fear', t); });
      camKeys(cam, t, [{ t: T0, p: [0, 2.2, 5.2], l: [0, 1.4, 0], f: 54 }, { t: C.talent, p: [0, 1.9, 4.0], l: [0, 1.6, 0.6], f: 52 }, { t: C.egypte, p: [0, 1.9, 4.0], l: [0, 1.6, 0.6], f: 52 }, { t: C.egypte + 1, p: [0, 2.4, 5.5], l: [0, 1.6, -2], f: 54 }, { t: SC.fin.start, p: [0, 2.4, 5.5], l: [0, 1.6, -2], f: 54 }]);
      const tk = win(t, C.talent + 0.3, C.egypte, 0.4, 0.3); [big, small, lBig, lSmall].forEach(o => fade(o, tk));
      const f = (x, y) => cam.position.clone().add(new THREE.Vector3(x, y, -3.2).applyQuaternion(cam.quaternion));
      big.position.copy(f(0, 0.55)); small.position.copy(f(0, 0.05)); lBig.position.copy(f(0, 0.18)); lSmall.position.copy(f(0, -0.12)); [lBig, lSmall].forEach(l => l.quaternion.copy(cam.quaternion)); big.rotation.y = t; small.rotation.y = t;
      const pk = win(t, C.egypte + 0.3, SC.fin.start, 0.5, 0.3); fade(pyr, pk); pyr.position.copy(f(0, 0.45)); pyr.rotation.y = t * 0.5;
      K.update(t);
    }
  };
};

// ---------- fin : l'Euphrate s'asseche ; trois grenouilles ; Harmaguedon (prochain episode)
SETS.fin = () => {
  const B = desert(); const { scene, cam } = B;
  const river = new THREE.Mesh(new THREE.PlaneGeometry(6, 80), new THREE.MeshLambertMaterial({ color: 0x2a6aa8, emissive: new THREE.Color(0x0a2a4a), transparent: true })); river.rotation.x = -Math.PI / 2; river.position.set(0, 0.35, -30); scene.add(river);
  const frogs = [0, 1, 2].map(i => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 8), holoMat(0x5aff5a, 0.5)); b.scale.set(1.2, 0.7, 1); g.add(b); for (const s of [-1, 1]) g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), G(0xffff60, 2)), s * 0.18, 0.22, 0.25)); scene.add(g); return g; });
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 16, 12-16', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 9.5, TL.duration + 1, 0.4, 0.2), -0.6);
  K('HARMAGUÉDON', { w: 1.2, h: 0.26, border: '#ff5a3a', color: '#ffb0a0' }, t => win(t, SC.fin.start + 7, SC.fin.start + 9.3, 0.3, 0.2), -0.2);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start, dry = sstep(T0 + 1, T0 + 5, t); river.material.opacity = 1 - 0.85 * dry; river.scale.x = 1 - 0.7 * dry;
      frogs.forEach((g, i) => { const u = sstep(T0 + 4 + i * 0.6, T0 + 8 + i * 0.6, t); fade(g, sstep(0, 0.1, u)); g.position.set((i - 1) * 1.6, 0.4 + Math.abs(Math.sin(u * Math.PI * 4)) * 0.8, lerp(-14, 0, u)); });
      camKeys(cam, t, [{ t: T0, p: [0, 3.2, 7], l: [0, 0.6, -20], f: 56 }, { t: TL.duration, p: [0, 2.8, 7.5], l: [0, 0.8, -8], f: 56 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : la ville fendue en trois sous l'orage, eclairs, grele ; l'ange verse sa coupe
SETS.cover = () => {
  const B = stormCity({ z: -24 }); const { scene, cam } = B;
  const an = bowlAngel(6); an.root.scale.setScalar(3.2); an.place(-3, 15, -28, 0.3); scene.add(an.root); angelLight(scene, [0, 16, -22]).intensity = 6;
  const hail = hailstones(scene, 50, 14, -18);
  return { ...B, update() { B.water.update(4, 0.7); B.cityLight(0.5); B.split(0.85, 3); B.storm(0.05, [0]); an.pose({ aL: [2.3, 0.3], eL: 0.4 }); an.bowl.rotation.z = 1.4; an.face(0, 'serious', 3); hail.update(3.3, 1); cam.position.set(0, 6.5, 9); cam.fov = 62; cam.updateProjectionMatrix(); cam.lookAt(-0.5, 3.0, -24); } };
};

const SHOTS = [['intro', 0, SC.coupe.start], ['coupe', SC.coupe.start, SC.seisme.start], ['seisme', SC.seisme.start, SC.ville.start], ['ville', SC.ville.start, SC.grele.start], ['grele', SC.grele.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
