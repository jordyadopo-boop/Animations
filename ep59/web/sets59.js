// ================= episode 59 : versez les sept coupes (Apocalypse 16, 1-3) — nouveau format : Mr A et Claude racontent ensemble
const tag = (text, w = 1.0, border = '#ffd070', h) => card(text, { w, h: h ?? w * 0.18, border });
const BLUE = [0.1, 0.19, 0.31], BLUE_E = [0.02, 0.04, 0.09], BLOOD = [0.3, 0.012, 0.02], BLOOD_E = [0.07, 0.0, 0.0];
function bloodify(mat, k) { mat.color.setRGB(lerp(BLUE[0], BLOOD[0], k), lerp(BLUE[1], BLOOD[1], k), lerp(BLUE[2], BLOOD[2], k)); mat.emissive.setRGB(lerp(BLUE_E[0], BLOOD_E[0], k), lerp(BLUE_E[1], BLOOD_E[1], k), lerp(BLUE_E[2], BLOOD_E[2], k)); }

// ---------- le duo : Mr A (a gauche) et Claude (a droite, sur un rocher) ; ils se regardent quand l'autre parle
function lineAt(t) { for (const l of TL.lines) if (t >= l.start - 0.05 && t < l.end + 0.1) return l; return null; }
function talkK(t, spk) { let k = 0; for (const l of TL.lines) if (l.speaker === spk) k = Math.max(k, win(t, l.start - 0.25, l.end + 0.35, 0.35, 0.4)); return k; }
function duo(scene, x, z, ry = 0, o = {}) {
  const g = new THREE.Group(); g.position.set(x, o.y ?? 0, z); g.rotation.y = ry; scene.add(g);
  const a = mrA(); a.place(-0.33, 0, 0, 0.22); g.add(a.root);
  const PH = o.ph ?? 0.82;
  const pm = o.ped === 'gold' ? M(0xd8a840, { metalness: 0.6, roughness: 0.35, emissive: new THREE.Color(0x2a1804) }) : M(o.pedColor ?? 0x5a524c, { flatShading: true });
  const ped = new THREE.Mesh(o.ped === 'gold' ? new THREE.CylinderGeometry(0.27, 0.3, PH, 16) : new THREE.CylinderGeometry(0.25, 0.36, PH, 7), pm); ped.position.set(0.43, PH / 2, 0.05); g.add(ped);
  const c = L.makeClaude(); c.g.position.set(0.43, PH, 0.05); g.add(c.g);
  const fl = new THREE.PointLight(o.light ?? 0xfff0e0, o.lk ?? 2.2, 5, 1.2); fl.position.set(0.05, 1.8, 1.5); g.add(fl);
  return {
    g, a, c, update(t, m = {}) {
      const l = lineAt(t), sp = l?.speaker, tA = talkK(t, 'mra'), tC = talkK(t, 'claude');
      const am = env('mra', t), ac = env('claude', t), gs = 0.5 + 0.5 * Math.sin(t * 3.1);
      const look = m.look ?? 0;   // 1 = les deux regardent la scene (vers le fond)
      a.pose({ aR: [0.3 + tA * (0.55 + 0.35 * gs), 0.2 + 0.1 * tA], eR: 0.25 + tA * (1.0 + 0.3 * Math.sin(t * 4.3)), aL: [0.12 + 0.3 * tA * Math.max(0, Math.sin(t * 2.3 + 1)), 0.14], eL: 0.25 + 0.4 * tA, hy: 0.5 * tC * (1 - look) - 0.05 + (m.hy ?? 0), hp: 0.03 * am - 0.04 + (m.hp ?? 0), lean: 0.03 * tA, ...(m.poseA ?? {}) });
      a.face(am, sp === 'mra' ? l.expr : (m.expr ?? 'neutral'), t);
      c.g.rotation.y = -0.25 - 0.55 * tA * (1 - look) + (m.cy ?? 0);
      c.update(t, ac, m.mood ?? {});
    }
  };
}
// cadrage du duo (le duo est suppose non tourne, ou on donne ry)
function dk(t, d, o = {}) {
  const p = d.g.position, ry = d.g.rotation.y, dist = (o.dist ?? 2.7) + 0.9, side = o.side ?? 0.15;
  const fx = Math.sin(ry), fz = Math.cos(ry), rx = Math.cos(ry), rz = -Math.sin(ry);
  const cx = p.x + rx * (o.cx ?? 0.05), cz = p.z + rz * (o.cx ?? 0.05);
  return { t, p: [cx + fx * dist + rx * side, o.h ?? 1.5, cz + fz * dist + rz * side], l: [cx, o.ly ?? 1.3, cz], f: o.f ?? 50 };
}
const camFront = (cam, x, y, z = -3) => cam.position.clone().add(new THREE.Vector3(x, y, z).applyQuaternion(cam.quaternion));
function hud(scene, cam, g, k, x = 0, y = 0.25, s = 0.6, z = -3) { fade(g, k); g.position.copy(camFront(cam, x, y, z)); g.scale.setScalar(s); g.quaternion.copy(cam.quaternion); }

// ---------- fumee (sprites opaques, lisibles sur ciel clair)
let _smk; function smokeTex() { if (_smk) return _smk; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,0.85)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); _smk = canvasTex(c); return _smk; }
function smoke(parent, n, cx, cy, cz, R, H, col = 0xd8d0dc) {
  const ps = Array.from({ length: n }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex(), color: col, transparent: true, depthWrite: false, opacity: 0 })); parent.add(s); return s; });
  return (t, k) => ps.forEach((s, i) => { const ph = (t * 0.06 + hash(i)) % 1; s.position.set(cx + (hash(i * 3) - 0.5) * R * 2 + 0.6 * Math.sin(t * 0.3 + i), cy + ph * H, cz + (hash(i * 7) - 0.5) * R); s.scale.setScalar((1.5 + hash(i * 5) * 2.5) * (0.6 + ph)); s.material.opacity = k * 0.7 * Math.sin(Math.PI * ph); s.visible = k > 0.01; });
}

// ---------- le temple celeste
function temple(scene, z = -14, s = 1.2) {
  const g = new THREE.Group(); g.position.set(0, 0, z); g.scale.setScalar(s); scene.add(g);
  const marble = M(0xb8a488, { emissive: new THREE.Color(0x140e08) }), gold = M(0xe0b040, { metalness: 0.7, roughness: 0.3, emissive: new THREE.Color(0x2a1a04) });
  for (let k = 0; k < 3; k++) g.add(at(box(9 - k * 0.6, 0.3, 6 - k * 0.6, marble), 0, 0.15 + k * 0.3, 0));
  for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 4.2, 14), marble); c.position.set(-3.25 + i * 1.3, 3.0, 2.2); g.add(c); }
  g.add(at(box(6.5, 4.2, 3.4, marble), 0, 3.0, -0.6));
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.8), new THREE.MeshBasicMaterial({ color: 0xfff0c0, toneMapped: false })); door.position.set(0, 2.3, 1.11); g.add(door);
  g.add(at(box(8.6, 0.5, 5.4, gold), 0, 5.35, 0.1));
  const pg = new THREE.CylinderGeometry(1, 1, 5.4, 3); pg.rotateX(-Math.PI / 2); const pd = new THREE.Mesh(pg, marble); pd.scale.set(5, 1.1, 1); pd.position.set(0, 6.15, 0.1); g.add(pd);
  const glow = softGlow(7, 0xffe0a0); glow.position.set(0, 2.4, 1.6); g.add(glow);
  g.userData = { door, glow }; return g;
}
function heavenTemple(o = {}) {
  const B = base({ sky: [0x2a1a40, 0xffd890, 0x8a5a7a], hemi: [0xfff0e0, 0x6a4a3a, 0.95], sun: [0xfff0d0, 1.0, [3, 8, 6]], shadow: false, bloom: [0.4, 0.5, 0.88], exposure: o.exposure ?? 0.8, fog: [0xd8a890, 30, 110] });
  const { scene } = B;
  const floor = new THREE.Mesh(new THREE.CircleGeometry(70, 40), M(0xd8b070, { emissive: new THREE.Color(0x2a1a08) })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.02, -15); scene.add(floor);
  const cl = clouds(scene, 26, -0.6, 30, { em: 0x8a6a6a, op: 1 }); cl.forEach((c, i) => { c.position.z = -48 - hash(i * 11) * 14; c.position.x *= 2; c.scale.multiplyScalar(2.2); });
  const tp = temple(scene, -14, 1.2);
  const angels = Array.from({ length: 7 }, (_, i) => { const an = bowlAngel(i); an.root.scale.setScalar(1.25); an.place(-3.9 + i * 1.3, 0, -9.6 + Math.abs(i - 3) * -0.25, 0); scene.add(an.root); return an; });
  angelLight(scene, [0, 3, -7]).intensity = 4;
  const smk = smoke(scene, 26, 0, 3, -14.5, 5, 9);
  Object.assign(B, { tp, angels, smk }); return B;
}
function angelsPose(angels, t, raise, walk = 0) { angels.forEach((an, i) => { const r = raise; an.pose({ aL: [lerp(0.9, 2.5, r), 0.3], eL: lerp(0.9, 0.3, r), aR: [0.3, 0.2], ...(walk ? L.walkPose(t * 4 + i, 0.8 * walk, { aL: [lerp(0.9, 2.5, r), 0.3], eL: lerp(0.9, 0.3, r) }) : {}) }); an.face(0, 'serious', t); }); }

// ---------- la mer au crepuscule (devient comme le sang d'un mort)
function seaSet(o = {}) {
  const B = base({ sky: [0x1a0c2a, 0xc86a5a, 0x5a2a4a], hemi: [0xffd8c8, 0x2a1a2a, 0.95], sun: [0xffc8a0, 1.0, [-6, 8, 4]], shadow: false, bloom: [0.45, 0.5, 0.86], exposure: o.exposure ?? 1.0, fog: [0x8a4a5a, 25, 120] });
  const { scene } = B;
  B.water = L.makeWater(200, 90, 0x1a3050, { emissive: 0x050a18 }); B.water.mesh.position.set(0, -0.25, -99); scene.add(B.water.mesh);
  const sand = box(80, 0.4, 12, M(0x8a7458)); sand.position.set(0, -0.2, 5); scene.add(sand);
  for (let i = 0; i < 7; i++) rock(scene, (hash(i * 3) - 0.5) * 14, -0.05, 2 + hash(i * 7) * 4, 0.3 + hash(i) * 0.5);
  const sset = softGlow(26, 0xffa070); sset.position.set(-14, 7, -80); scene.add(sset);
  B.blood = (k) => bloodify(B.water.mesh.material, k);
  B.fish = Array.from({ length: 26 }, (_, i) => { const f = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), M(0xc8ccd0, { metalness: 0.4, roughness: 0.4 })); b.scale.set(1.6, 0.6, 0.5); f.add(b); const tl = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.18, 4), M(0xb0b4b8)); tl.rotation.z = Math.PI / 2; tl.position.x = -0.3; f.add(tl); f.position.set((hash(i * 3) - 0.5) * 12, 0, -1.8 - hash(i * 7) * 14); f.rotation.set(Math.PI, hash(i) * 6, 0); f.visible = false; scene.add(f); return f; });
  B.fishUpd = (t, k) => B.fish.forEach((f, i) => { f.visible = k > hash(i * 1.7); f.position.y = L.waveH(f.position.x, f.position.z, t, 0.18) - 0.2; });
  return B;
}
function pourStream(scene, col = 0x8a0a10) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 1.4, 10, 12), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6, depthWrite: false })); scene.add(s); return s; }
function aimStreamTo(an, stream, pour, to) { an.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); an.bowl.getWorldPosition(hp); const d = hp.clone().sub(to); const len = d.length(); stream.position.copy(to).addScaledVector(d, 0.5); stream.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); stream.scale.set(0.6, len / 10, 0.6); stream.visible = pour > 0.05; stream.material.opacity = 0.75 * pour; }
function duskLand(o = {}) {
  const B = base({ sky: [0x1a1030, 0xd8704a, 0x6a2a4a], hemi: [0xffd0c0, 0x2a1820, 0.9], sun: [0xffb890, 1.0, [-6, 8, 4]], shadow: false, bloom: [0.45, 0.5, 0.86], exposure: o.exposure ?? 1.0, fog: [0x8a4a50, 20, 90] });
  const { scene } = B; scene.add(L.groundPlane(160, 50, 0x6a5a40, 0.35, 3));
  for (let i = 0; i < 9; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(7 + hash(i) * 9, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0x4a4030)); d.scale.y = 0.4; d.position.set((hash(i * 3) - 0.5) * 90, -0.5, -32 - hash(i * 5) * 30); scene.add(d); }
  const sset = softGlow(26, 0xff9060); sset.position.set(12, 8, -70); scene.add(sset);
  return B;
}
function markRed() { return new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, 0.012), G(0xff2a1a, 1.6)); }
function sores(h, n, seed) { const sp = []; for (let k = 0; k < n; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 6), M(0x9a1a14, { emissive: new THREE.Color(0x5a0806) })); s.position.set((hash(seed * 5 + k) - 0.5) * 0.22, 0.06 + hash(seed + k * 3) * 0.32, k % 2 ? 0.125 : 0.142); (k % 2 ? h.spine : h.neck).add(s); s.visible = false; sp.push(s); } return sp; }
function pyramid(scene, x, z, s) { const p = new THREE.Mesh(new THREE.ConeGeometry(s, s * 1.15, 4), M(0xe0c088, { flatShading: true })); p.position.set(x, s * 0.57, z); p.rotation.y = Math.PI / 4; scene.add(p); return p; }
function moses() { const h = new Human({ skin: 0xa86c44, hair: 0xe8e4dc, beard: 'full', beardColor: 0xf0ece4, top: 0x8a6a4a, bottom: 0x6a4a2a, robe: 0x9a7a52, robeL: 0.85, seed: 5801 }); return h; }

// ---------- intro : la plage au crepuscule ; la mer devient rouge au loin ; Mr A et Claude se presentent
SETS.intro = () => {
  const B = seaSet(); const { scene, cam } = B;
  const d = duo(scene, 0, 1.6, 0);
  return {
    ...B, update(t) {
      B.water.update(t, 0.18); B.blood(0.25 + 0.5 * sstep(1.5, 6, t)); B.fishUpd(t, 0);
      d.update(t, { look: win(t, C.title - 0.2, 99, 0.5, 0.1), expr: 'neutral' });
      camKeys(cam, t, [{ t: 0, p: [0.0, 1.0, 3.2], l: [0, 1.0, -20], f: 56 }, { t: 2.5, p: [0.0, 1.2, 4.2], l: [0, 1.25, 1.6], f: 50 }, dk(C.serie, d), dk(C.avant, d, { dist: 2.3, side: -0.1 }), dk(C.title - 0.2, d, { dist: 2.2, side: -0.1 }), { t: C.title + 1.2, p: [0, 3.2, 8], l: [0, 1.2, -25], f: 58 }, { t: SC.temple.start, p: [0, 3.0, 7], l: [0, 1.2, -25], f: 58 }]);
    }
  };
};

// ---------- la voix sort du temple ; « qui ? » ; la fumee (Ap 15,8) ; pourquoi sept ?
SETS.temple = () => {
  const B = heavenTemple(); const { scene, cam } = B;
  const d = duo(scene, -0.6, 3.2, 0.1, { ped: 'gold', ph: 0.85 });
  const voiceRings = Array.from({ length: 4 }, (_, i) => { const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 6, 48), new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0, depthWrite: false })); r.position.set(0, 2.8 * 1.2, -14 + 1.6 * 1.2); scene.add(r); return r; });
  const sevens = new THREE.Group(); scene.add(sevens);
  const S7 = [['7 églises', '#9adfff'], ['7 sceaux', '#ffd070'], ['7 trompettes', '#ffb070'], ['7 coupes', '#ff5a3a']].map(([s, c], i) => { const tg = tag(s, 0.9, c, 0.2); tg.position.set(0, 0.42 - i * 0.26, 0); sevens.add(tg); return tg; });
  const bowls = new THREE.Group(); scene.add(bowls);
  for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(0xe0b040, { metalness: 0.7, roughness: 0.3, emissive: new THREE.Color(0x3a2008), side: THREE.DoubleSide })); b.position.set(-0.6 + i * 0.2, 0, 0); bowls.add(b); }
  const K = cardsMgr(scene, cam); refCard(K);
  K('Apocalypse 15, 8 : personne ne pouvait entrer dans le temple', { w: 1.6, h: 0.28, border: '#ffffff' }, t => win(t, C.fumee + 0.6, C.dieu, 0.3, 0.2), -0.6);
  K('Apocalypse 15, 1 : « sept fléaux, les derniers »', { w: 1.6, h: 0.24, border: '#ff5a3a' }, t => win(t, C.complet + 7.5, SC.ulcere.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.temple.start, go = sstep(T0 + 6.5, T0 + 8.0, t);
      angelsPose(B.angels, t, go);
      B.tp.userData.glow.material.opacity = 0.6 + 0.4 * Math.sin(t * 2) * 0.5 + 0.3 * win(t, T0 + 0.5, C.qui, 0.5, 0.5);
      voiceRings.forEach((r, i) => { const ph = ((t - T0) * 0.45 + i / 4) % 1; const on = win(t, T0 + 0.5, C.qui - 0.3, 0.5, 0.5); r.scale.setScalar(0.5 + ph * 4); r.material.opacity = on * 0.5 * (1 - ph); });
      B.smk(t, 0.25 + 0.75 * sstep(C.fumee, C.fumee + 3, t));
      d.update(t, { look: win(t, T0, C.qui - 0.2, 0.1, 0.3) });
      camKeys(cam, t, [{ t: T0, p: [0, 1.6, 2.2], l: [0, 4.5, -14], f: 60 }, { t: T0 + 6.0, p: [0, 1.4, 0.6], l: [0, 2.6, -12], f: 54 }, { t: C.qui - 0.42, p: [0, 1.3, -0.4], l: [0, 2.2, -10], f: 52 },
        dk(C.qui - 0.4, d), dk(C.fumee, d), { t: C.fumee + 1.2, p: [0.5, 2.0, 1.0], l: [0, 5.5, -14], f: 58 }, { t: C.fumee + 1.22, p: [0.5, 2.0, 1.0], l: [0, 5.5, -14], f: 58 }, { t: C.dieu - 0.42, p: [0.3, 2.2, 0.0], l: [0, 6.5, -14], f: 58 },
        dk(C.dieu - 0.4, d, { dist: 2.4 }), dk(C.complet + 0.6, d, { dist: 2.6 }), { t: C.complet + 0.62, p: [0, 1.7, 1.6], l: [0, 1.8, -10], f: 54 }, { t: SC.ulcere.start, p: [0, 1.8, 1.0], l: [0, 1.8, -10], f: 54 }]);
      const ck = C.complet + 0.8; hud(scene, cam, sevens, win(t, ck, C.complet + 7.4, 0.4, 0.3), 0, 0.1, 0.75);
      S7.forEach((tg, i) => fade(tg, sstep(ck + i * 1.1, ck + i * 1.1 + 0.3, t) * win(t, ck, C.complet + 7.4, 0.4, 0.3)));
      hud(scene, cam, bowls, win(t, C.complet + 7.4, SC.ulcere.start, 0.4, 0.2), 0, 0.35, 0.9);
      K.update(t);
    }
  };
};

// ---------- la 1re coupe : un ulcere malin sur ceux qui ont la marque ; la marque (Ap 13,16-17)
SETS.ulcere = () => {
  const B = duskLand(); const { scene, cam } = B;
  const an = bowlAngel(0); an.root.scale.setScalar(3); an.place(-3.5, 9, -22, 0.4); scene.add(an.root); angelLight(scene, [-3, 13, -18]).intensity = 4;
  const stream = pourStream(scene, 0x6a2a1a);
  const ppl = Array.from({ length: 6 }, (_, i) => { const h = citizen(i + 30); h.place(-1.9 + i * 0.75, 0, -2.2 - (i % 2) * 0.8, 0.15 - 0.06 * i); scene.add(h.root);
    const mk = markRed(); mk.position.set(0, 0.255, 0.142); h.neck.add(mk); const mh = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.04, 0.105), G(0xff2a1a, 1.6)); mh.position.set(0, 0.0, 0); h.hand.R.add(mh); h.sp = sores(h, 6, i + 3); return h; });
  const d = duo(scene, 2.4, 1.4, -0.35);
  const K = cardsMgr(scene, cam); refCard(K);
  const mk1 = tag('sur la main droite', 0.75, '#ff3a2a', 0.16), mk2 = tag('ou sur le front', 0.75, '#ff3a2a', 0.16); scene.add(mk1, mk2);
  K('Apocalypse 13, 16-17 : nul ne pouvait acheter ni vendre sans la marque', { w: 1.6, h: 0.3, border: '#ff5a3a' }, t => win(t, C.marque + 3.5, C.tranquille, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.ulcere.start, pour = win(t, T0 + 1, T0 + 7, 0.8, 0.8), hit = sstep(T0 + 4, T0 + 7, t);
      an.pose({ aL: [2.4, 0.3], eL: 0.4, aR: [0.4, 0.2] }); an.bowl.rotation.z = -1.6 * pour; an.face(0, 'serious', t); aimStreamTo(an, stream, pour, new THREE.Vector3(0, 0, -2.6));
      const p0 = ppl[2];
      ppl.forEach((h, i) => { const k = sstep(T0 + 4 + i * 0.25, T0 + 5 + i * 0.25, t); h.sp.forEach((s, j) => s.visible = k > j / 6);
        if (i === 2 && t > C.marque - 0.2 && t < C.tranquille) { h.pose({ aR: [0.9, -0.25], eR: 1.5, aL: [0.2, 0.15] }); h.face(0, 'sad', t); }
        else if (k > 0.3) { h.pose({ aL: [2.2, 0.6], aR: [2.2, 0.6], eL: 1.8, eR: 1.8, lean: 0.3 + 0.08 * Math.sin(t * 3 + i), hp: 0.3 }); h.face(0.3 * Math.max(0, Math.sin(t * 5 + i)), 'fear', t); }
        else { h.pose({ aL: [0.1, 0.1], aR: [0.1, 0.1], hp: -0.3 }); h.face(0, 'awe', t); } });
      d.update(t, { look: win(t, T0, C.seulement - 0.2, 0.1, 0.3) });
      p0.root.updateMatrixWorld(true); const fw = new THREE.Vector3(), hw = new THREE.Vector3(); p0.neck.getWorldPosition(fw); p0.hand.R.getWorldPosition(hw);
      camKeys(cam, t, [{ t: T0, p: [0, 2.4, 6.5], l: [-1.5, 5, -18], f: 58 }, { t: T0 + 3.5, p: [0, 2.0, 4.5], l: [0, 1.0, -3], f: 56 }, { t: C.seulement - 0.4, p: [0, 1.7, 2.4], l: [0, 1.3, -2.5], f: 52 },
        dk(C.seulement, d), dk(C.marque, d), { t: C.marque + 1.3, p: [fw.x + 0.1, fw.y + 0.1, fw.z + 1.6], l: [fw.x - 0.05, fw.y + 0.05, fw.z], f: 46 }, { t: C.tranquille - 0.3, p: [fw.x + 0.05, fw.y + 0.1, fw.z + 1.7], l: [fw.x - 0.05, fw.y + 0.05, fw.z], f: 46 },
        dk(C.tranquille, d, { dist: 2.5 }), dk(SC.egypte.start, d, { dist: 2.3 })]);
      fade(mk1, win(t, C.marque + 1.8, C.tranquille, 0.3, 0.2)); fade(mk2, win(t, C.marque + 2.5, C.tranquille, 0.3, 0.2));
      mk1.position.set(hw.x + 0.3, hw.y + 0.12, hw.z + 0.3); mk2.position.set(fw.x + 0.05, fw.y + 0.5, fw.z + 0.2); mk1.lookAt(cam.position); mk2.lookAt(cam.position); mk1.scale.setScalar(0.38); mk2.scale.setScalar(0.38);
      K.update(t);
    }
  };
};

// ---------- la 6e plaie d'Egypte : Moise lance la cendre ; les magiciens ; les plaies d'Egypte reprises
SETS.egypte = () => {
  const B = base({ sky: [0xd87a3a, 0xffe0a8, 0xffb878], hemi: [0xfff0d8, 0x7a5a3a, 1.0], sun: [0xffe0b8, 1.2, [6, 9, 4]], shadow: false, bloom: [0.35, 0.5, 0.9], exposure: 0.95, fog: [0xf0c090, 25, 110] });
  const { scene, cam } = B; scene.add(L.groundPlane(160, 50, 0xc8a070, 0.35, 6));
  pyramid(scene, -14, -48, 7); pyramid(scene, -4, -58, 9); pyramid(scene, 10, -52, 6);
  for (let i = 0; i < 8; i++) { const p = L.makePalm(3 + hash(i) * 1.5, i); p.position.set((i % 2 ? 1 : -1) * (5 + hash(i * 3) * 4), 0, -6 - i * 3.2); scene.add(p); }
  const mo = moses(); mo.place(-0.9, 0, 0.4, 0.5); scene.add(mo.root);
  const ph = new Human({ skin: 0x9a6a44, hair: 0x120c08, top: 0xf0e8d0, bottom: 0xf0e8d0, robe: 0xf0e8d0, robeL: 0.85, hat: 'crown', seed: 5902 }); ph.place(1.4, 0, -3.2, -0.4); scene.add(ph.root);
  const mags = [0, 1].map(i => { const h = new Human({ skin: 0x8a5a3a, hair: 0x120c08, hairStyle: 'bald', top: 0x2a2a3a, bottom: 0x2a2a3a, robe: 0x1a1a2a, robeL: 0.85, seed: 5903 + i }); h.place(0.4 + i * 0.9, 0, -1.6 - i * 0.4, -0.6); scene.add(h.root); h.sp = sores(h, 7, i + 11); return h; });
  const cows = [0, 1].map(i => { const c = L.makeAnimal('camel'); c.scale.setScalar(0.8); c.position.set(-3.4 - i * 1.2, 0, -4 - i * 1.5); c.rotation.y = 0.8; scene.add(c); return c; });
  const ash = Array.from({ length: 60 }, (_, i) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.025 + hash(i) * 0.03, 0), M(0x9a948c)); scene.add(m); return m; });
  const d = duo(scene, 3.2, 2.2, -0.3);
  const plg = new THREE.Group(); scene.add(plg);
  const rows = [['sang', '16, 3-4'], ['grenouilles', '16, 13'], ['ulcères', '16, 2'], ['ténèbres', '16, 10'], ['grêle', '16, 21']].map(([a, b], i) => { const tg = tag(`${a}  →  Ap ${b}`, 1.0, '#ffd070', 0.17); tg.position.set(0, 0.5 - i * 0.22, 0); plg.add(tg); return tg; });
  const hd = tag('PLAIES D\'ÉGYPTE → COUPES', 1.1, '#ff5a3a', 0.17); hd.position.set(0, 0.76, 0); plg.add(hd);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Exode 9, 8-11 : la sixième plaie, les ulcères', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, SC.egypte.start + 4.5, C.nil, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.egypte.start, Tt = T0 + 2.8, lift = sstep(T0 + 1.2, Tt, t), thr = sstep(Tt, Tt + 0.3, t);
      mo.pose({ aR: [lerp(0.6, 1.4, lift) + 1.6 * thr, 0.2], eR: lerp(1.6, 0.6, lift) * (1 - thr), aL: [lerp(0.6, 1.4, lift) + 1.4 * thr, 0.2], eL: lerp(1.6, 0.6, lift) * (1 - thr), hp: -0.2 * thr }); mo.face(0, 'serious', t);
      mo.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); mo.hand.R.getWorldPosition(hp);
      ash.forEach((m, i) => { const u = t - Tt - hash(i * 3) * 0.3; if (u < 0) { m.position.copy(hp); m.visible = t > T0 + 1.2; return; } m.visible = true; const vx = (hash(i * 5) - 0.5) * 1.6, vz = (hash(i * 7) - 0.5) * 1.2 - 0.5, vy = 3.2 + hash(i) * 1.5; const up = Math.min(u, 1.2); const fall = Math.max(0, u - 1.2); m.position.set(hp.x + vx * (up + fall * 0.6), hp.y + vy * up - 4.9 * up * up * 0.4 - fall * 0.25, hp.z + vz * (up + fall * 0.6)); m.scale.setScalar(1 + Math.min(u, 1) * 0.8); m.visible = u < 3.5; });
      const sk = sstep(Tt + 2.5, Tt + 5, t);
      mags.forEach((h, i) => { h.sp.forEach((s, j) => s.visible = sk > j / 7); const down = sstep(C.magiciens + 0.5 + i * 0.4, C.magiciens + 1.5 + i * 0.4, t); h.pose(down > 0.5 ? L.kneelPose({ lean: 0.5, aL: [1.4, 0.4], aR: [1.4, 0.4], eL: 1.6, eR: 1.6, hp: 0.4 }) : { aL: [0.3 + 1.5 * sk, 0.3], aR: [0.3 + 1.5 * sk, 0.3], eL: 1.6 * sk, eR: 1.6 * sk }); h.face(0.2 * sk, sk > 0.3 ? 'fear' : 'serious', t); });
      ph.pose({ aL: [0.4, 0.2], aR: [0.4, 0.2] }); ph.face(0, 'serious', t);
      d.update(t, { look: win(t, T0, C.nil - 0.3, 0.1, 0.3) });
      camKeys(cam, t, [{ t: T0, p: [-2.6, 1.4, 3.4], l: [-0.6, 1.4, -0.2], f: 52 }, { t: Tt - 0.3, p: [-2.6, 1.5, 3.6], l: [-0.6, 1.8, -0.6], f: 54 }, { t: Tt + 1.0, p: [-1.0, 1.4, 4.4], l: [-0.6, 3.2, -1.5], f: 58 }, { t: Tt + 2.6, p: [-0.4, 1.8, 4.6], l: [0.2, 1.2, -1.8], f: 54 }, { t: C.magiciens, p: [0.2, 1.6, 2.6], l: [0.8, 1.0, -1.8], f: 50 }, { t: C.nil - 0.3, p: [0.3, 1.5, 2.4], l: [0.8, 0.8, -1.8], f: 50 },
        dk(C.nil, d), dk(C.nil + 4, d, { dist: 2.5 }), dk(SC.mer.start, d, { dist: 2.6 })]);
      const L4 = TL.lines.filter(l => l.start > C.nil)[1]?.start ?? (C.nil + 4);
      hud(scene, cam, plg, win(t, L4 + 0.4, SC.mer.start, 0.4, 0.2), 0, 0.12, 0.62);
      rows.forEach((tg, i) => fade(tg, sstep(L4 + 0.8 + i * 0.5, L4 + 1.1 + i * 0.5, t) * win(t, L4 + 0.4, SC.mer.start, 0.4, 0.2)));
      K.update(t);
    }
  };
};

// ---------- la 2e coupe : la mer comme le sang d'un mort ; le sang d'un mort ; un tiers puis tout ; 71 %
SETS.mer = () => {
  const B = seaSet(); const { scene, cam } = B;
  const an = bowlAngel(1); an.root.scale.setScalar(3); an.place(-2.5, 8, -20, 0.3); scene.add(an.root); angelLight(scene, [-2, 12, -16]).intensity = 4;
  const stream = pourStream(scene);
  const d = duo(scene, 2.7, 1.8, -0.15);
  const drops = new THREE.Group(); scene.add(drops);
  const dv = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), G(0xff2020, 1.4)); dv.position.x = -0.55; drops.add(dv);
  const dm = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), M(0x3a0606, { roughness: 0.2, emissive: new THREE.Color(0x120000) })); dm.position.x = 0.55; dm.scale.y = 0.7; drops.add(dm);
  const dl1 = tag('vivant :\nrouge vif, il circule', 0.9, '#ff3a3a', 0.3); dl1.position.set(-0.55, -0.48, 0); drops.add(dl1);
  const dl2 = tag('mort :\nsombre, il s\'épaissit', 0.9, '#8a2a2a', 0.3); dl2.position.set(0.55, -0.48, 0); drops.add(dl2);
  const bars = new THREE.Group(); scene.add(bars);
  const mkBar = (y, frac, lab, col) => { const bg = box(1.6, 0.16, 0.02, M(0x1a3050, { emissive: new THREE.Color(0x0a1a30) })); bg.position.set(0, y, 0); bars.add(bg); const fg = box(1.6, 0.17, 0.03, G(col, 1.2)); fg.geometry.translate(0.8, 0, 0); fg.position.set(-0.8, y, 0.01); bars.add(fg); const lb = tag(lab, 1.6, '#ffd070', 0.17); lb.position.set(0, y + 0.2, 0); bars.add(lb); return { fg, frac }; };
  const b1 = mkBar(0.3, 1 / 3, 'Trompettes (Ap 8, 8-9) : un tiers', 0xc01818), b2 = mkBar(-0.3, 1, 'Coupes (Ap 16, 3) : TOUT', 0x8a0a10);
  const earth = new THREE.Group(); scene.add(earth);
  const sph = new THREE.Mesh(new THREE.SphereGeometry(0.45, 40, 24), M(0x2a5ab8, { emissive: new THREE.Color(0x0a1a3a) })); earth.add(sph);
  for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16 + hash(i) * 0.08, 1), M(0x6a7a3a, { flatShading: true })); const th = hash(i * 3) * Math.PI * 2, ph_ = (hash(i * 7) - 0.5) * 2.2; c.position.set(0.37 * Math.cos(ph_) * Math.cos(th), 0.37 * Math.sin(ph_), 0.37 * Math.cos(ph_) * Math.sin(th)); c.scale.set(1, 0.7, 0.4); c.lookAt(0, 0, 0); earth.add(c); }
  const el = tag('71 % de la surface de la Terre', 1.2, '#ff5a3a', 0.17); el.position.set(0, -0.62, 0); earth.add(el);
  const K = cardsMgr(scene, cam); refCard(K);
  return {
    ...B, update(t) {
      const T0 = SC.mer.start, pour = win(t, T0 + 1, C.mort - 0.5, 0.8, 0.6), r = sstep(T0 + 3, T0 + 7.5, t);
      B.water.update(t, 0.18 * (1 - 0.7 * r)); B.blood(r); B.fishUpd(t, sstep(T0 + 6, T0 + 9, t));
      an.pose({ aL: [2.4, 0.3], eL: 0.4, aR: [0.4, 0.2] }); an.bowl.rotation.z = -1.6 * pour; an.face(0, 'serious', t); aimStreamTo(an, stream, pour, new THREE.Vector3(-0.5, -0.2, -10));
      d.update(t, { look: win(t, T0, C.mort - 0.2, 0.1, 0.3) });
      camKeys(cam, t, [{ t: T0, p: [0, 2.6, 7], l: [-1.5, 5, -20], f: 58 }, { t: T0 + 4, p: [0, 2.2, 6.5], l: [0, 0.6, -12], f: 56 }, { t: C.mort - 0.5, p: [0.2, 1.4, 4.0], l: [0, 0.2, -6], f: 54 },
        dk(C.mort, d), dk(C.epais, d), { t: C.epais + 1.2, p: [-0.6, 1.0, 1.2], l: [-0.6, -0.1, -3.5], f: 50 }, { t: C.tiers - 0.3, p: [-0.6, 1.0, 0.9], l: [-0.6, -0.1, -3.5], f: 50 },
        dk(C.tiers, d), dk(C.trompette, d), { t: C.trompette + 1.2, p: [0, 2.0, 5.5], l: [0, 0.6, -12], f: 56 }, { t: C.surface - 0.3, p: [0, 2.0, 5.5], l: [0, 0.6, -12], f: 56 },
        { t: C.surface, p: [0, 2.0, 5.5], l: [0, 0.6, -12], f: 56 }, { t: SC.fin.start, p: [0, 2.2, 6.0], l: [0, 0.8, -12], f: 56 }]);
      hud(scene, cam, drops, win(t, C.epais + 1.6, C.tiers, 0.4, 0.3), 0, 0.2, 0.7);
      const bk = win(t, C.trompette + 1.4, C.surface, 0.4, 0.3); hud(scene, cam, bars, bk, 0, 0.2, 0.62);
      b1.fg.scale.x = Math.max(0.001, b1.frac * sstep(C.trompette + 2, C.trompette + 3.5, t)); b2.fg.scale.x = Math.max(0.001, sstep(C.trompette + 6, C.trompette + 7.5, t));
      hud(scene, cam, earth, win(t, C.surface + 0.3, SC.fin.start, 0.4, 0.2), 0, 0.1, 0.8); earth.rotation.y = 0; sph.rotation.y = t * 0.3; earth.children.forEach((c, i) => { if (i && c !== el) { const th = hash(i * 3) * Math.PI * 2 + t * 0.3, ph_ = (hash(i * 7) - 0.5) * 2.2; c.position.set(0.37 * Math.cos(ph_) * Math.cos(th), 0.37 * Math.sin(ph_), 0.37 * Math.cos(ph_) * Math.sin(th)); c.lookAt(earth.localToWorld(new THREE.Vector3())); } });
      bloodify(sph.material, sstep(C.surface + 1.2, C.surface + 2.6, t));
      K.update(t);
    }
  };
};

// ---------- fin : sept anges sortent du temple avec les coupes d'or ; la fumee (prochain episode : Ap 15)
SETS.fin = () => {
  const B = heavenTemple({ exposure: 0.88 }); const { scene, cam } = B;
  const d = duo(scene, 0, 2.2, 0, { ped: 'gold' });
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 15', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 4, TL.duration + 1, 0.4, 0.2), -0.22);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start, w = sstep(T0 + 2.5, T0 + 9, t);
      B.angels.forEach((an, i) => { an.root.position.z = -10.4 + Math.abs(i - 3) * -0.25 + 3.0 * w; });
      angelsPose(B.angels, t, 0.6, w < 0.99 && w > 0.01 ? 1 : 0);
      B.smk(t, sstep(T0 + 7, T0 + 11, t));
      d.update(t, { look: 0, hy: 0 });
      camKeys(cam, t, [dk(T0, d, { dist: 2.4 }), dk(T0 + 2.4, d, { dist: 2.6 }), { t: T0 + 4.5, p: [0.6, 1.8, 5.2], l: [0, 2.6, -12], f: 56 }, { t: TL.duration, p: [0.4, 3.0, 6.4], l: [0, 3.4, -14], f: 58 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : la mer de sang, l'ange verse sa coupe, Mr A et Claude regardent depuis la plage
SETS.cover = () => {
  const B = seaSet(); const { scene, cam } = B;
  const an = bowlAngel(1); an.root.scale.setScalar(3); an.place(-1.8, 7.5, -18, 0.3); scene.add(an.root); angelLight(scene, [-1, 11, -14]).intensity = 4;
  const stream = pourStream(scene);
  const tp = temple(scene, -55, 1.3); tp.position.set(5.5, 9, -55); const tg = softGlow(26, 0xffe0a0); tg.position.set(5.5, 12, -57); scene.add(tg);
  const cl = clouds(scene, 10, 8.6, 8, { em: 0x8a5a6a, op: 1 }); cl.forEach((c, i) => { c.position.set(5.5 + (hash(i * 3) - 0.5) * 16, 8.4 + hash(i) * 0.6, -52 - hash(i * 7) * 8); c.scale.multiplyScalar(1.8); });
  return { ...B, update() { const t = 3; B.water.update(t, 0.08); B.blood(1); B.fishUpd(t, 1); an.pose({ aL: [2.4, 0.3], eL: 0.4, aR: [0.4, 0.2] }); an.bowl.rotation.z = -1.6; an.face(0, 'serious', t); aimStreamTo(an, stream, 1, new THREE.Vector3(-0.5, -0.2, -9));
    cam.position.set(0.6, 1.3, 5.0); cam.fov = 64; cam.updateProjectionMatrix(); cam.lookAt(0.6, 4.2, -18); cam.userData.focus = 14; } };
};

const SHOTS = [['intro', 0, SC.temple.start], ['temple', SC.temple.start, SC.ulcere.start], ['ulcere', SC.ulcere.start, SC.egypte.start], ['egypte', SC.egypte.start, SC.mer.start], ['mer', SC.mer.start, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
