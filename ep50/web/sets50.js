
// ================= episode 50 : tout perdu en une seule heure (Apocalypse 18, 9-20)
// ---------- la ville en feu au loin (fumee, flammes)
function softGlow(size, color) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const col = new THREE.Color(color); const rgb = `${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)}`;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, `rgba(${rgb},0.9)`); gr.addColorStop(0.35, `rgba(${rgb},0.35)`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false })); s.scale.setScalar(size); return s;
}
function burningCity(B, o = {}) {
  const { scene } = B;
  B.city.position.set(o.x ?? 0, 0, o.z ?? -40); B.cityGlow.visible = false; B.cityGlow.scale.setScalar(0.001);
  const cg = softGlow(34, 0xff5010); cg.material.opacity = 0.45; cg.position.set(o.x ?? 0, 4, (o.z ?? -40) - 2); scene.add(cg);
  const smoke = []; for (let i = 0; i < 30; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), M(0x3a3038, { transparent: true, opacity: 0.5, emissive: new THREE.Color(0x3a1a10) })); scene.add(s); smoke.push(s); }
  const fires = []; for (let i = 0; i < 14; i++) { const f = softGlow(5 + hash(i) * 4, 0xff7020); f.material.opacity = 0.6; f.position.set((o.x ?? 0) + (hash(i * 3) - 0.5) * 30, 2 + hash(i * 5) * 5, (o.z ?? -40) + 2); scene.add(f); fires.push(f); }
  return (t, k = 1) => {
    B.cityLight(0.6 + 0.12 * Math.sin(t * 9));
    smoke.forEach((s, i) => { const ph = (t * 0.06 + hash(i)) % 1; s.position.set((o.x ?? 0) + (hash(i * 3) - 0.5) * 30 + ph * 6, 3 + ph * 24, (o.z ?? -40)); s.scale.setScalar(1 + ph * 3.2); s.material.opacity = 0.55 * (1 - ph); });
    fires.forEach((f, i) => f.scale.setScalar((5 + hash(i) * 4) * k * (1 + 0.15 * Math.sin(t * 7 + i))));
  };
}
function mourners(scene, n = 4, z = 0.6) {
  return Array.from({ length: n }, (_, i) => { const h = i % 2 ? citizen(i + 9, { top: [0x8a1a3a, 0x1a5a6a, 0x6a4a1a][i % 3], robe: [0x5a2a3a, 0x1a3a4a, 0x4a3a1a][i % 3] }) : king(i); h.place(-1.5 + i * 1.0, 0.2, z, Math.PI); scene.add(h.root); return h; });
}
function hourglass() {
  const g = new THREE.Group(); const gl = holo(new THREE.ConeGeometry(0.4, 0.6, 16, 1, true), 0x9adfff, 0.2); gl.position.y = 0.3; gl.rotation.x = Math.PI; g.add(gl);
  const gl2 = holo(new THREE.ConeGeometry(0.4, 0.6, 16, 1, true), 0x9adfff, 0.2); gl2.position.y = -0.3; g.add(gl2);
  for (const y of [-0.62, 0.62]) g.add(at(holo(new THREE.CylinderGeometry(0.46, 0.46, 0.05, 16), 0xffd070, 0.4), 0, y, 0));
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.4, 16), G(0xffd070, 1.2)); top.rotation.x = Math.PI; g.add(top);
  const bot = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.4, 16), G(0xffd070, 1.2)); g.add(bot);
  g.userData.set = (u) => { top.scale.set(1 - u * 0.95, 1 - u * 0.95, 1 - u * 0.95); top.position.y = 0.3 + 0.15 * u; bot.scale.set(Math.max(0.05, u), Math.max(0.05, u), Math.max(0.05, u)); bot.position.y = -0.58 + 0.2 * u; };
  return g;
}
function ship(sc_ = 1, sail = 0xe8dcc0) {
  const g = new THREE.Group(); const w = M(0x5a3a22);
  const hull = box(0.8, 0.35, 2.6, w); hull.position.y = 0.1; g.add(hull);
  g.add(at(box(0.9, 0.12, 0.5, w), 0, 0.35, 1.2)); g.add(at(box(0.9, 0.12, 0.5, w), 0, 0.35, -1.2));
  g.add(at(box(0.06, 2.2, 0.06, w), 0, 1.3, 0));
  const s = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.3), M(sail, { side: THREE.DoubleSide })); s.position.set(0, 1.5, 0.04); g.add(s);
  g.scale.setScalar(sc_); return g;
}
function crate(c) { const g = new THREE.Group(); g.add(box(0.4, 0.3, 0.3, M(0x7a5a32))); const lid = box(0.42, 0.04, 0.32, M(0x5a3a22)); lid.position.y = 0.16; g.add(lid); const st = glowStar(0.35, c); st.position.y = 0.25; g.add(st); return g; }

// ---------- intro : la ville brule au loin ; Claude rappelle la meule
SETS.intro = () => {
  const B = nightSea({ cityX: 0 }); const { scene, cam } = B; const burn = burningCity(B);
  const hill = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 1, 12), M(0x2a2420)); hill.position.set(0, -0.3, 1.0); scene.add(hill);
  const ws = mourners(scene);
  const rig = claudeRig(scene, [1.6, 0.25, 3.0], -0.6, [-0.45, 0, 0.1], 0xffd070, 0.45, 0.28); faceLight(scene, [1.4, 1.0, 4.4], 1.4);
  const back = label('◀ une scène avant', { w: 0.8, h: 0.12, color: '#ffd070', font: 'bold 80px Inter' }); rig.holoG.add(back);
  const ms = millstone(0.07); rig.holoG.add(ms); ms.traverse(m => { if (m.isMesh) m.material = holoMat(0xffd070, 0.5); });
  const K = cardsMgr(scene, cam);
  K('des rois, des marchands, des marins… et une ville qui brûle', { w: 1.6, h: 0.28, border: '#ff8a4a' }, t => win(t, 1.0, C.serie - 0.4, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      B.water.update(t, 0.3); burn(t);
      ws.forEach((h, i) => { h.pose({ aL: [i % 2 ? 2.4 : 0.3, 0.3], aR: [i % 2 ? 2.4 : 0.6, 0.3], hp: 0.2 }); h.face(0, 'sad', t); });
      const bk = win(t, C.serie + 0.3, C.title, 0.3, 0.3); beamOn(rig, bk, t); fade(back, bk); fade(ms, bk); back.position.y = 0.45; back.lookAt(cam.position); ms.rotation.set(1.2, t, 0); ms.position.y = 0.12; rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: 0, p: [0, 2.6, 7.5], l: [0, 3, -40], f: 54 }, { t: C.serie, p: [0.3, 2.4, 6.8], l: [0, 3, -40], f: 54 }, { t: C.serie + 0.9, p: [1.4, 1.1, 5.6], l: [1.2, 0.8, 1.5], f: 48 }, { t: C.title - 0.3, p: [1.4, 1.1, 5.6], l: [1.2, 0.8, 1.5], f: 48 }, { t: C.title + 0.8, p: [0, 2.6, 8.0], l: [0, 4, -40], f: 56 }, { t: SC.rois.start, p: [0, 2.6, 8.0], l: [0, 4, -40], f: 56 }]);
      K.update(t);
    }
  };
};

// ---------- les rois : de loin ; « en une seule heure » ; Neron
SETS.rois = () => {
  const B = nightSea({ cityX: 0 }); const { scene, cam } = B; const burn = burningCity(B);
  const hill = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 1, 12), M(0x2a2420)); hill.position.set(0, -0.3, 1.0); scene.add(hill);
  const ks = [0, 1, 2].map(i => { const h = king(i + 2); h.place(-1.1 + i * 1.1, 0.2, 0.6, Math.PI + (i - 1) * 0.15); scene.add(h.root); return h; });
  faceLight(scene, [0, 1.8, -1.2], 1.6, 0xffa060);
  const hg = hourglass(); hg.position.set(0, 3.1, -1.0); scene.add(hg);
  const counts = [10, 17, 19].map((v, i) => { const c = card(`« en une seule heure » · v. ${v}`, { w: 1.0, h: 0.18, border: '#ffd070', color: '#ffe8a0' }); scene.add(c); return c; });
  const K = cardsMgr(scene, cam); refCard(K);
  K('« Malheur ! malheur ! »… mais de loin', { w: 1.6, h: 0.24, border: '#ff8a4a' }, t => win(t, C.loin + 0.3, C.heure, 0.3, 0.2), -0.6);
  K('Rome, an 64 : le grand incendie, sous Néron (6 jours)', { w: 1.6, h: 0.28, border: '#ff6a2a' }, t => win(t, C.neron + 0.3, SC.marchands.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.rois.start; B.water.update(t, 0.3); burn(t, 1 + 0.4 * win(t, C.neron, SC.marchands.start, 1, 0.5));
      ks.forEach((h, i) => { const cry = sstep(T0 + 2 + i * 0.4, T0 + 3 + i * 0.4, t); h.pose({ aL: [lerp(0.3, 2.5, cry), 0.35], aR: [lerp(0.3, 2.5, cry), 0.35], eL: 1.4 * cry, eR: 1.4 * cry, hp: 0.2 + 0.1 * Math.sin(t * 3 + i) * cry, lean: 0.15 * cry }); h.face(0, 'sad', t); });
      const hk = win(t, C.heure + 0.2, C.neron, 0.4, 0.4); fade(hg, hk); hg.userData.set(sstep(C.heure + 0.5, C.heure + 5.5, t)); hg.rotation.y = t * 0.4;
      camKeys(cam, t, [{ t: T0, p: [0, 1.9, -4.6], l: [0, 1.4, 1.0], f: 52 }, { t: C.loin - 3, p: [0, 1.9, -4.4], l: [0, 1.4, 1.0], f: 52 }, { t: C.loin, p: [0, 2.6, 4.8], l: [0, 3, -40], f: 54 }, { t: C.heure, p: [0, 2.4, 3.2], l: [0, 2.5, -1], f: 52 }, { t: C.neron, p: [0, 2.4, 3.2], l: [0, 2.5, -1], f: 52 }, { t: C.neron + 1, p: [0.5, 2.6, 6.0], l: [0, 5, -40], f: 54 }, { t: SC.marchands.start, p: [0.5, 2.8, 6.6], l: [0, 5, -40], f: 54 }]);
      counts.forEach((c, i) => { fade(c, win(t, C.heure + 0.4 + i * 0.5, C.neron, 0.3, 0.3)); camCard(cam, c, 0.5, -0.12 - i * 0.13); });
      K.update(t);
    }
  };
};

// ---------- les marchands : la cargaison, la route de la soie, « corps et ames d'hommes »
SETS.marchands = () => {
  const B = nightSea({ cityX: 0 }); const { scene, cam } = B; const burn = burningCity(B);
  const quay = box(8, 0.4, 3, M(0x4a3a2a)); quay.position.set(0, 0, 0.5); scene.add(quay);
  const mer = [0, 1].map(i => { const h = citizen(i + 6, { top: [0x8a1a3a, 0x1a5a6a][i], robe: [0x8a1a3a, 0x1a5a6a][i] }); h.place(-0.9 + i * 1.8, 0.2, 0.8, Math.PI * 0.9 + i * 0.2); scene.add(h.root); return h; });
  faceLight(scene, [0, 1.8, 3.4], 1.2);
  const goods = [['OR', 0xffcc44], ['ARGENT', 0xe0e0f0], ['PERLES', 0xf8f0ff], ['SOIE', 0xff6aa0], ['POURPRE', 0xa03aff], ['IVOIRE', 0xfff0d8], ['MARBRE', 0xd8d8d8], ['CANNELLE', 0xc87a3a], ['ENCENS', 0xffe0a0], ['VIN', 0xc81a3a], ['BLÉ', 0xf0c860], ['CHEVAUX', 0x9adfff]];
  const crates = goods.map(([n, c], i) => { const g = crate(c); g.position.set(-0.62 + (i % 3) * 0.62, 0.35 + Math.floor(i / 3) * 0.34, 1.6); scene.add(g); const l = card(n, { w: 0.5, h: 0.11, border: '#' + c.toString(16).padStart(6, '0') }); l.position.set(0, 0.3, 0.2); g.add(l); g.userData.l = l; return g; });
  // carte de la route de la soie
  const map = new THREE.Group(); scene.add(map);
  const pts = { ROME: [-0.9, 0.35], CHINE: [1.0, 0.2], INDE: [0.55, -0.15], AFRIQUE: [-0.7, -0.4] };
  map.add(holo(new THREE.PlaneGeometry(2.4, 1.3), 0x9adfff, 0.08));
  const routes = []; for (const k of ['CHINE', 'INDE', 'AFRIQUE']) { const a = pts[k], b = pts.ROME; const ln = L.beam([a[0], a[1], 0.01], [b[0], b[1], 0.01], 0.02, holoMat(0xffd070, 0.8)); map.add(ln); routes.push(ln); }
  Object.entries(pts).forEach(([k, p]) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.05, 12), G(k === 'ROME' ? 0xff6a2a : 0xffd070, 1.4)); d.position.set(p[0], p[1], 0.02); map.add(d); const l = label(k, { w: 0.9, h: 0.22, color: '#ffffff', font: 'bold 90px Inter' }); l.position.set(p[0], p[1] + 0.16, 0.03); map.add(l); });
  // « corps et ames d'hommes »
  const slaves = [0, 1, 2, 3, 4].map(i => { const h = new Human({ holo: 0xff5a4a }); h.place(-1.2 + i * 0.6, 0.2, 0.2, 0); h.pose({ aL: [0.3, -0.1], aR: [0.3, -0.1], hp: 0.35 }); scene.add(h.root); return h; });
  const chain = chainLinks(scene, 26);
  const K = cardsMgr(scene, cam); refCard(K);
  K('près de 30 marchandises (v. 12-13)', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.liste + 0.3, C.soie, 0.3, 0.2), -0.6);
  K('« des corps et des âmes d\'hommes » : des esclaves', { w: 1.6, h: 0.24, border: '#ff5a4a' }, t => win(t, C.ames + 3, SC.marins.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.marchands.start; B.water.update(t, 0.3); burn(t);
      mer.forEach((h, i) => { h.pose({ aL: [0.5, 0.2], aR: [0.5 + 1.8 * sstep(T0 + 3, T0 + 4, t), 0.3], eR: 1.3, hp: 0.25 }); h.face(0, 'sad', t); });
      const ck = 1 - sstep(C.soie - 0.5, C.soie, t);
      crates.forEach((g, i) => { const a = i < 8 ? T0 + 4 + i * 0.9 : C.liste + 0.4 + (i - 8) * 1.3; const k = sstep(a, a + 0.3, t) * ck; fade(g, k); g.scale.setScalar(0.4 + 0.6 * k); g.userData.l.lookAt(cam.position); });
      camKeys(cam, t, [{ t: T0, p: [0, 1.9, 5.6], l: [0, 1.1, 0.8], f: 52 }, { t: C.soie - 0.6, p: [0, 1.8, 5.2], l: [0, 1.1, 1.4], f: 52 }, { t: C.soie, p: [0, 2.2, 6.0], l: [0, 2.2, 0], f: 52 }, { t: C.ames, p: [0, 2.2, 6.0], l: [0, 2.2, 0], f: 52 }, { t: C.ames + 0.8, p: [0, 1.4, 4.4], l: [0, 1.0, 0.2], f: 50 }, { t: SC.marins.start, p: [0, 1.5, 4.8], l: [0, 1.0, 0.2], f: 50 }]);
      map.position.set(0, 2.1, 2.8); map.scale.setScalar(0.62); map.lookAt(cam.position); const mk = win(t, C.soie + 0.2, C.ames, 0.5, 0.4); fade(map, mk); routes.forEach((r, i) => r.scale.z = sstep(C.soie + 1 + i * 1.5, C.soie + 2.5 + i * 1.5, t));
      const sk = win(t, C.ames + 0.3, SC.marins.start, 0.6, 0.3); slaves.forEach(h => fade(h.root, sk)); fade(chain, sk);
      chain.userData.span(new THREE.Vector3(-1.5, 0.75, 0.25), new THREE.Vector3(1.5, 0.75, 0.25), 0.1);
      K.update(t);
    }
  };
};

// ---------- les marins : navires au loin, poussiere sur la tete ; Ezechiel 27
SETS.marins = () => {
  const B = nightSea({ cityX: 0 }); const { scene, cam } = B; const burn = burningCity(B);
  const ships = [[-3, -6, 0.3], [2.5, -9, -0.2], [0.2, -3, 0.1], [5, -14, 0.4]].map(([x, z, r], i) => { const s = ship(1, [0xe8dcc0, 0xc8a080, 0xe0d0b0, 0xd0b890][i]); if (i === 2) s.children.filter(c => c.geometry && c.geometry.type === 'PlaneGeometry').forEach(c => c.visible = false); s.position.set(x, -0.1, z); s.rotation.y = r; scene.add(s); return s; });
  const sailors = [0, 1, 2].map(i => { const h = citizen(i + 12, { top: 0x6a5a40, robe: 0x5a4a30 }); h.root.scale.setScalar(0.9); h.place(-0.35 + i * 0.35, 0.25, -3 - 0.5 + i * 0.5, Math.PI); ships[2].add(h.root); h.root.position.set(-0.2 + i * 0.2, 0.25, -0.8 + i * 0.8); return h; });
  faceLight(scene, [2.2, 1.8, -1.4], 2.5, 0xffc090);
  const dust = []; for (let i = 0; i < 24; i++) { const d = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), M(0xc8a878)); scene.add(d); dust.push(d); }
  const K = cardsMgr(scene, cam); refCard(K);
  K('« Quelle ville était semblable à la grande ville ? »', { w: 1.6, h: 0.28, border: '#9adfff' }, t => win(t, SC.marins.start + 6, C.tyr, 0.3, 0.2), -0.6);
  K('Ézéchiel 27, 32 : « Qui était comme Tyr ? »', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.tyr + 0.3, SC.ciel.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.marins.start; B.water.update(t, 0.4); burn(t);
      ships.forEach((s, i) => { s.position.y = -0.1 + 0.08 * Math.sin(t * 1.3 + i); s.rotation.z = 0.04 * Math.sin(t * 1.1 + i); });
      const throwK = Math.max(0, Math.sin((t - T0) * 2.2));
      sailors.forEach((h, i) => { h.pose({ aL: [2.6 - 0.6 * throwK, 0.2], aR: [2.6 - 0.6 * throwK, 0.2], hp: 0.25 }); h.face(0, 'sad', t); });
      ships[2].updateMatrixWorld(true); const hp = new THREE.Vector3();
      dust.forEach((d, i) => { const h = sailors[i % 3]; h.head.getWorldPosition(hp); const ph = ((t * 0.8 + hash(i)) % 1); d.position.set(hp.x + (hash(i * 3) - 0.5) * 0.3, hp.y + 0.35 - ph * 0.9, hp.z + (hash(i * 5) - 0.5) * 0.3); d.visible = t > T0 + 9; });
      camKeys(cam, t, [{ t: T0, p: [0, 3.0, 6.5], l: [0, 2, -30], f: 54 }, { t: T0 + 8, p: [3.2, 1.6, -1.6], l: [0.2, 1.0, -3.2], f: 50 }, { t: C.tyr, p: [3.2, 1.6, -1.6], l: [0.2, 1.0, -3.2], f: 50 }, { t: C.tyr + 1, p: [0, 2.6, 6.0], l: [0, 3, -30], f: 54 }, { t: SC.ciel.start, p: [0, 2.8, 6.4], l: [0, 3.5, -30], f: 54 }]);
      K.update(t);
    }
  };
};

// ---------- « Ciel, rejouis-toi » : la lumiere d'or au-dessus de la fumee
SETS.ciel = () => {
  const B = nightSea({ cityX: 0 }); const { scene, cam } = B; const burn = burningCity(B);
  const gold = glowStar(70, 0xffe8a0); gold.position.set(0, 60, -60); scene.add(gold);
  const beams = []; for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 90), new THREE.MeshBasicMaterial({ color: 0xffe8a0, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); b.position.set((i - 4) * 7, 50, -62); b.rotation.z = (i - 4) * 0.08; scene.add(b); beams.push(b); }
  const word = goldWord('RÉJOUIS-TOI !', 14, 3.5); word.position.set(0, 16, -28); scene.add(word);
  const al = goldWord('ALLÉLUIA !', 14, 3.5); al.position.set(0, 16, -28); scene.add(al);
  const K = cardsMgr(scene, cam); refCard(K);
  K('sur la terre : on pleure ce qu\'on a perdu', { w: 1.6, h: 0.24, border: '#ff8a4a' }, t => win(t, C.contraste + 0.2, C.contraste + 3.2, 0.3, 0.2), -0.6);
  K('dans le ciel : on se réjouit de la justice', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffe8a0' }, t => win(t, C.contraste + 3.4, C.contraste + 6.5, 0.3, 0.2), -0.6);
  K('→ le grand Alléluia (épisode 48)', { w: 1.6, h: 0.24, border: '#ffcf5a', color: '#ffe8a0' }, t => win(t, C.contraste + 6.7, SC.fin.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.ciel.start; B.water.update(t, 0.3); burn(t);
      const g = sstep(T0 + 0.3, T0 + 3, t); gold.material.opacity = g; beams.forEach((b, i) => b.material.opacity = 0.12 * g * (0.7 + 0.3 * Math.sin(t * 1.5 + i)));
      B.hemi.intensity = 0.75 + 0.6 * g; fade(word, win(t, T0 + 2, C.contraste + 6.5, 0.6, 0.4)); fade(al, win(t, C.contraste + 6.7, SC.fin.start + 0.5, 0.6, 0.3));
      camKeys(cam, t, [{ t: T0, p: [0, 2.8, 6.4], l: [0, 3.5, -30], f: 54 }, { t: T0 + 4, p: [0, 2.4, 6.0], l: [0, 22, -50], f: 60 }, { t: C.contraste, p: [0, 2.4, 6.0], l: [0, 22, -50], f: 60 }, { t: C.contraste + 0.6, p: [0, 2.6, 6.6], l: [0, 6, -40], f: 56 }, { t: C.contraste + 3.4, p: [0, 2.6, 6.6], l: [0, 6, -40], f: 56 }, { t: C.contraste + 4.4, p: [0, 2.4, 6.0], l: [0, 22, -50], f: 60 }, { t: SC.fin.start, p: [0, 2.4, 6.0], l: [0, 22, -50], f: 60 }]);
      K.update(t);
    }
  };
};

// ---------- fin : un ange de lumiere descend, la terre s'eclaire (prochain episode)
SETS.fin = () => {
  const B = nightSea({ cityX: 0, exposure: 1.1 }); const { scene, cam } = B;
  const an = angel(); an.root.scale.setScalar(5); scene.add(an.root);
  const halo = glowStar(26, 0xfff4d0); scene.add(halo);
  const K = cardsMgr(scene, cam);
  K('« Elle est tombée, Babylone la grande ! »', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, SC.fin.start + 6.5, SC.fin.start + 9.5, 0.3, 0.2), -0.45);
  K('PROCHAIN ÉPISODE · Apocalypse 18, 1-8', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 9.7, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start, d = sstep(T0, T0 + 6, t); B.water.update(t, 0.3); B.cityLight(0.5);
      an.place(0, lerp(28, 3, d), -24, 0); an.pose({ aL: [lerp(0.4, 2.2, d), 0.6], aR: [lerp(0.4, 2.2, d), 0.6] }); an.face(0, d > 0.9 ? 'awe' : 'serious', t);
      halo.position.set(0, lerp(31, 7, d), -25); halo.scale.setScalar(26 * (0.6 + 0.4 * d));
      B.hemi.intensity = 0.75 + 1.4 * d; B.sun.intensity = 0.8 + 1.2 * d; B.water.mesh.material.emissive.setRGB(0.02 + 0.2 * d, 0.04 + 0.18 * d, 0.08 + 0.12 * d);
      camKeys(cam, t, [{ t: T0, p: [0, 2.4, 8], l: [0, 14, -24], f: 58 }, { t: TL.duration, p: [0, 2.0, 9], l: [0, 8, -24], f: 58 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : rois et marchands de dos sur la colline, la ville en flammes, un coffre renverse
SETS.cover = () => {
  const B = nightSea({ cityX: 0 }); const { scene, cam } = B; const burn = burningCity(B);
  const hill = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 1, 12), M(0x2a2420)); hill.position.set(0, -0.3, 1.0); scene.add(hill);
  const ws = mourners(scene, 4, 0.3);
  const chest = new THREE.Group(); chest.position.set(0.5, 0.2, 2.4); chest.rotation.set(0, 0.5, 0.25); scene.add(chest);
  chest.add(box(0.7, 0.4, 0.45, M(0x6a3a1a))); const lid = box(0.72, 0.08, 0.47, M(0x8a5a2a)); lid.position.set(0, 0.32, -0.25); lid.rotation.x = -1.0; chest.add(lid);
  for (let i = 0; i < 40; i++) { const pearl = i % 3 === 0; const m = pearl ? new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), M(0xf8f4ff, { emissive: new THREE.Color(0x4a4650) })) : new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 10), G(0xffc040, 1.2)); m.position.set(0.3 + hash(i * 3) * 0.9, 0.22 + hash(i * 7) * 0.05, 2.5 + (hash(i * 5) - 0.3) * 0.7); m.rotation.set(hash(i) * 3, 0, hash(i * 2) * 3); scene.add(m); }
  faceLight(scene, [0.8, 1.2, 3.6], 1.6, 0xffc080);
  return { ...B, update() { B.water.update(4, 0.3); burn(4, 1.2); ws.forEach((h, i) => { h.pose({ aL: [i % 2 ? 2.4 : 0.3, 0.3], aR: [i % 2 ? 2.4 : 0.6, 0.3], hp: 0.2 }); }); cam.position.set(0.3, 2.4, 6.8); cam.fov = 58; cam.updateProjectionMatrix(); cam.lookAt(0, 0.6, -20); } };
};

const SHOTS = [['intro', 0, SC.rois.start], ['rois', SC.rois.start, SC.marchands.start], ['marchands', SC.marchands.start, SC.marins.start], ['marins', SC.marins.start, SC.ciel.start], ['ciel', SC.ciel.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
