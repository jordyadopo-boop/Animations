// ================= episode 60 : sept coupes d or (Apocalypse 15, 5-8) — format dialogue Mr A + Claude
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


// ================= episode 60
const GOLD = () => M(0xe0b040, { metalness: 0.7, roughness: 0.3, emissive: new THREE.Color(0x3a2008) });
function addDoors(tp) { const ds = [-1, 1].map(s => { const h = new THREE.Group(); h.position.set(s * 0.8, 2.3, 1.13); tp.add(h); const p = box(0.8, 2.8, 0.06, GOLD()); p.position.x = -s * 0.4; h.add(p); return [h, s]; }); return k => ds.forEach(([h, s]) => h.rotation.y = s * 1.6 * k); }
function priestly(an) { const b = box(0.42, 0.07, 0.26, GOLD()); b.position.y = 0.44; an.spine.add(b); an.bowl.visible = false; return an; }
function heaven60(o = {}) {
  const B = heavenTemple({ exposure: 0.72, ...o }); B.angels.forEach(priestly); B.doors = addDoors(B.tp);
  B.light = new THREE.PointLight(0xffe0a0, 0, 30, 1.2); B.light.position.set(0, 3, -10); B.scene.add(B.light);
  B.open = (k) => { B.doors(k); B.tp.userData.door.visible = k > 0.02; B.tp.userData.glow.scale.setScalar(6 + 4 * k); B.tp.userData.glow.material.opacity = 0.55 * k; B.light.intensity = 2.0 * k; };
  return B;
}
// les anges sortent : u = 0 (dans le temple) .. 1 (en bas des marches)
function procession(B, t, u) { B.angels.forEach((an, i) => { const ui = clamp(u * 1.6 - i * 0.1, 0, 1); const xf = -3.9 + i * 1.3, zf = -9.6 + Math.abs(i - 3) * -0.25; an.root.position.set(lerp(0, xf, sstep(0.3, 1, ui)), lerp(0.9 * 1.2, 0, sstep(0.4, 0.9, ui)), lerp(-13.5, zf, sstep(0, 0.6, ui))); an.root.visible = ui > 0.001; const w = ui > 0 && ui < 1; an.pose(w ? L.walkPose(t * 4 + i, 0.7) : { aL: [0.3, 0.15], aR: [0.3, 0.15] }); an.face(0, 'serious', t); }); }
function wingedLion() { const g = new THREE.Group(); const l = L.makeAnimal('lion'); l.scale.setScalar(1.5); g.add(l); for (const s of [-1, 1]) { const w = new THREE.Group(); w.position.set(s * 0.3, 1.25, -0.1); g.add(w); for (let k = 0; k < 4; k++) { const f = box(0.06, 0.9 - k * 0.15, 0.2, M(0xfff4e0, { emissive: new THREE.Color(0x4a4030) })); f.position.set(s * (0.25 + k * 0.17), 0.3 - k * 0.08, -0.05 * k); f.rotation.z = s * (0.5 + k * 0.25); w.add(f); } } return g; }
function goldBowl(s = 1) { return new THREE.Mesh(new THREE.SphereGeometry(0.075 * s, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(0xe0b040, { metalness: 0.7, roughness: 0.3, emissive: new THREE.Color(0x3a2008), side: THREE.DoubleSide })); }
function stoneTablets() { const g = new THREE.Group(); const st = M(0x9a9088); for (const s of [-1, 1]) { const t = new THREE.Group(); t.position.x = s * 0.17; g.add(t); t.add(at(box(0.3, 0.32, 0.05, st), 0, 0, 0)); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 20, 1, false, 0, Math.PI), st); c.rotation.x = Math.PI / 2; c.rotation.y = 0; c.position.y = 0.16; c.rotation.z = Math.PI / 2 * 0; t.add(c); for (let k = 0; k < 5; k++) t.add(at(box(0.2, 0.012, 0.01, M(0x4a4440)), 0, 0.12 - k * 0.055, 0.03)); } return g; }
function ark() { const g = new THREE.Group(); const gd = GOLD(); g.add(at(box(0.9, 0.5, 0.55, gd), 0, 0.45, 0)); g.add(at(box(0.96, 0.05, 0.6, gd), 0, 0.72, 0)); for (const s of [-1, 1]) { const ch = new THREE.Group(); ch.position.set(s * 0.3, 0.75, 0); g.add(ch); ch.add(at(box(0.12, 0.25, 0.12, gd), 0, 0.12, 0)); const w = box(0.04, 0.3, 0.35, gd); w.position.set(-s * 0.08, 0.3, 0); w.rotation.z = s * 0.9; ch.add(w); } for (const s of [-1, 1]) g.add(at(box(1.5, 0.04, 0.04, M(0x8a6a3a)), 0, 0.3, s * 0.2)); return g; }
function tabernacle(scene) {
  const g = new THREE.Group(); scene.add(g);
  const linen = M(0xf4f0e4, { emissive: new THREE.Color(0x2a2a24) }), bronze = M(0xa0703a, { metalness: 0.5, roughness: 0.4 });
  const W = 10, D = 5;
  for (let i = 0; i <= 20; i++) { const x = -W / 2 + i * W / 20; for (const z of [-D / 2 - 3, D / 2 - 3]) g.add(at(box(0.06, 1.2, 0.06, bronze), x, 0.6, z)); }
  for (const z of [-D / 2 - 3, D / 2 - 3]) { const f = box(W, 1.0, 0.03, linen); f.position.set(0, 0.65, z); if (z > -3) { f.scale.x = 0.35; f.position.x = -W * 0.33; const f2 = f.clone(); f2.position.x = W * 0.33; g.add(f2); } g.add(f); }
  for (const x of [-W / 2, W / 2]) g.add(at(box(0.03, 1.0, D, linen), x, 0.65, -3));
  const tent = new THREE.Group(); tent.position.set(-2.2, 0, -3.6); g.add(tent);
  tent.add(at(box(3.2, 1.9, 1.6, M(0x5a3a2a)), 0, 0.95, 0)); tent.add(at(box(3.3, 0.1, 1.7, M(0x3a2418)), 0, 1.95, 0));
  const vl = box(0.9, 1.6, 0.02, M(0x3a3a8a)); vl.position.set(1.0, 0.8, 0.81); tent.add(vl);
  g.add(at(box(0.9, 0.6, 0.9, bronze), 1.5, 0.3, -3.2));
  const fire = softGlow(1.4, 0xffa040); fire.position.set(1.5, 0.8, -3.2); g.add(fire);
  g.userData = { tent, fire }; return g;
}

// ---------- intro : devant le temple ferme ; Mr A pose la question
SETS.intro = () => {
  const B = heaven60(); const { scene, cam } = B; procession(B, 0, 0); B.open(0);
  const d = duo(scene, -0.6, 3.2, 0.1, { ped: 'gold', ph: 0.85 });
  return {
    ...B, update(t) {
      B.smk(t, 0.15); d.update(t, { look: win(t, C.title - 0.2, 99, 0.5, 0.1) });
      camKeys(cam, t, [{ t: 0, p: [0, 1.4, 1.0], l: [0, 3.5, -14], f: 58 }, { t: 2.2, p: [0, 1.4, 1.0], l: [0, 3.5, -14], f: 58 }, dk(2.22, d), dk(C.serie, d), dk(C.title - 0.2, d, { dist: 2.4 }), { t: C.title - 0.18, ...dk(0, d, { dist: 2.4 }), t: C.title - 0.18 }, { t: C.title - 0.16, p: [0, 2.0, 1.8], l: [0, 4.0, -14], f: 58 }, { t: SC.temple.start, p: [0, 1.8, 1.4], l: [0, 3.6, -14], f: 58 }]);
    }
  };
};

// ---------- le temple du tabernacle du temoignage s'ouvre
SETS.temple = () => {
  const B = heaven60(); const { scene, cam } = B; procession(B, 0, 0);
  const d = duo(scene, -0.6, 3.2, 0.1, { ped: 'gold', ph: 0.85 });
  const K = cardsMgr(scene, cam); refCard(K);
  return {
    ...B, update(t) {
      const T0 = SC.temple.start; B.open(sstep(T0 + 3.5, T0 + 6, t)); B.smk(t, 0.15);
      d.update(t, { look: win(t, T0, C.tabernacle - 0.2, 0.1, 0.3) });
      camKeys(cam, t, [{ t: T0, p: [0, 1.6, 2.2], l: [0, 3.6, -14], f: 58 }, { t: C.tabernacle - 0.42, p: [0, 1.5, -1.0], l: [0, 3.0, -14], f: 52 }, dk(C.tabernacle - 0.4, d), dk(C.tente, d)]);
      K.update(t);
    }
  };
};

// ---------- le tabernacle dans le desert ; l'arche et les tables ; le modele montre sur la montagne
SETS.tente = () => {
  const B = desert({ exposure: 1.1 }); const { scene, cam } = B;
  const tb = tabernacle(scene);
  const mo = new Human({ skin: 0xa86c44, hair: 0xe8e4dc, beard: 'full', beardColor: 0xf0ece4, top: 0x8a6a4a, bottom: 0x6a4a2a, robe: 0x9a7a52, robeL: 0.85, seed: 6001 }); mo.place(1.2, 0, 0.4, -0.3); scene.add(mo.root); faceLight(scene, [1.2, 1.8, 2.0], 1.4);
  const inset = new THREE.Group(); scene.add(inset); const ak = ark(); inset.add(ak); const tabs = stoneTablets(); tabs.position.set(0, 1.25, 0.2); inset.add(tabs);
  const il = tag('l\'arche et les tables du « témoignage »', 1.6, '#ffd070', 0.2); il.position.set(0, -0.15, 0.3); inset.add(il);
  const ht = temple(scene, -30, 0.9); ht.position.set(-2.2, 7.5, -30); holoify(ht, 0xffd070, 0.35);
  const cloud = smoke(scene, 30, -2.2, 0.5, -3.6, 2.2, 4, 0xf0ece4);
  const K = cardsMgr(scene, cam); refCard(K);
  K('Exode 25, 16 : « le témoignage », les tables de la loi', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.tente + 4.5, C.modele, 0.3, 0.2), -0.6);
  K('Exode 25, 40 · Hébreux 8, 5 : d\'après le modèle', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.modele + 0.4, SC.anges.start, 0.3, 0.2), -0.6);
  K('Exode 40, 34-35 : Moïse ne peut pas entrer', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.moise + 4, C.salomon, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      tb.userData.fire.material.opacity = 0.7 + 0.25 * Math.sin(t * 7);
      const inMoise = t > C.moise - 0.5;
      cloud(t, inMoise ? sstep(C.moise + 2, C.moise + 4, t) : 0);
      mo.pose(inMoise && t > C.moise + 4 ? { aL: [0.8, 0.3], aR: [0.8, 0.3], eL: 1.0, eR: 1.0, lean: -0.1 } : { aL: [0.3, 0.2], aR: [0.5, 0.2], eR: 0.6 }); mo.face(0, inMoise ? 'awe' : 'serious', t);
      fade(ht, win(t, C.modele + 0.3, SC.anges.start, 0.8, 0.3));
      if (!inMoise) camKeys(cam, t, [{ t: C.tente, p: [2.5, 2.4, 6.0], l: [-0.8, 0.8, -3.4], f: 54 }, { t: C.tente + 3.5, p: [2.0, 2.2, 5.2], l: [-0.8, 0.9, -3.4], f: 54 }, { t: C.modele, p: [1.5, 1.6, 5.5], l: [-1.2, 3.0, -8], f: 58 }, { t: SC.anges.start, p: [1.5, 1.4, 6.0], l: [-1.6, 4.0, -15], f: 60 }]);
      else camKeys(cam, t, [{ t: C.moise, p: [2.8, 1.8, 5.0], l: [-0.6, 1.0, -3.0], f: 54 }, { t: C.salomon, p: [2.4, 1.6, 4.4], l: [-0.6, 1.4, -3.0], f: 56 }]);
      hud(scene, cam, inset, win(t, C.tente + 4.2, C.modele, 0.4, 0.3), 0, 0.2, 0.55); inset.rotation.y += 0; ak.rotation.y = 0.4 * Math.sin(t * 0.5);
      K.update(t);
    }
  };
};

// ---------- les sept anges sortent : lin pur, ceintures d'or ; des pretres
SETS.anges = () => {
  const B = heaven60(); const { scene, cam } = B; B.open(1);
  const d = duo(scene, -0.6, 3.2, 0.1, { ped: 'gold', ph: 0.85 });
  const K = cardsMgr(scene, cam); refCard(K);
  K('Lévitique 16, 4 : le grand prêtre vêtu de lin', { w: 1.6, h: 0.24, border: '#ffffff' }, t => win(t, C.lin + 1.0, C.lin + 6.5, 0.3, 0.2), -0.6);
  K('Apocalypse 1, 13 : « une ceinture d\'or sur la poitrine »', { w: 1.6, h: 0.28, border: '#ffd070' }, t => win(t, C.lin + 6.8, SC.coupes.start, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.anges.start; procession(B, t, sstep(T0 + 0.5, C.pretres, t)); B.smk(t, 0.2);
      d.update(t, { look: win(t, T0, C.pretres - 0.2, 0.1, 0.3) });
      const a3 = B.angels[3].root.position;
      camKeys(cam, t, [{ t: T0, p: [0, 1.6, -4.0], l: [0, 2.0, -14], f: 54 }, { t: C.pretres - 2.5, p: [0.6, 1.5, -5.5], l: [0, 1.3, -9.8], f: 52 }, { t: C.pretres - 0.42, p: [0.6, 1.5, -6.0], l: [0, 1.4, -9.8], f: 50 },
        dk(C.pretres - 0.4, d), dk(C.lin + 0.6, d), { t: C.lin + 0.62, p: [0.4, 1.6, -6.6], l: [0, 1.45, -9.9], f: 48 }, { t: SC.coupes.start, p: [0.35, 1.6, -6.9], l: [0, 1.45, -9.9], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- l'un des quatre etres vivants donne les sept coupes ; les quatre etres ; les prieres puis la colere
SETS.coupes = () => {
  const B = heaven60(); const { scene, cam } = B; B.open(1);
  const lion = wingedLion(); scene.add(lion);
  const d = duo(scene, -0.6, 3.2, 0.1, { ped: 'gold', ph: 0.85 });
  const four = new THREE.Group(); scene.add(four);
  const cr = creatures(four); cr.forEach((g, i) => { g.position.set(-1.65 + i * 1.1, 0, 0); g.userData.l.position.y = 1.9; g.userData.l.scale.setScalar(1.3); });
  const incense = B.angels.map(an => { const s = softGlow(0.9, 0xffe0a0); an.bowl.add(s); s.position.y = 0.1; s.scale.setScalar(0.25); return s; });
  const K = cardsMgr(scene, cam); refCard(K);
  K('Apocalypse 4, 6-7 : lion, veau, homme, aigle', { w: 1.6, h: 0.24, border: '#ffd070' }, t => win(t, C.lion + 1, C.prieres, 0.3, 0.2), -0.6);
  K('Apocalypse 5, 8 : « des coupes d\'or remplies de parfums, qui sont les prières des saints »', { w: 1.6, h: 0.34, border: '#ffd070' }, t => win(t, C.prieres + 0.4, C.colere, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.coupes.start; procession(B, t, 1); B.smk(t, 0.25);
      const g = sstep(T0 + 2, T0 + 8, t);   // le lion passe devant les anges
      lion.position.set(lerp(-5.5, 4.5, g), 0, -8.4); lion.rotation.y = Math.PI / 2;
      B.angels.forEach((an, i) => { const xf = -3.9 + i * 1.3; const has = lion.position.x > xf - 0.3 || t > C.etres; an.bowl.visible = has; an.pose(has ? { aL: [1.2, 0.2], eL: 1.2, aR: [0.3, 0.15] } : { aL: [0.3, 0.15], aR: [0.3, 0.15] }); });
      const pr = win(t, C.prieres, C.colere + 0.3, 0.4, 0.3), co = sstep(C.colere, C.colere + 1.5, t);
      incense.forEach(s => { s.material.color.setRGB(1, lerp(0.88, 0.15, co), lerp(0.63, 0.08, co)); s.material.opacity = Math.max(pr, co); s.scale.setScalar(0.25 + 0.1 * Math.sin(t * 3)); });
      d.update(t, { look: win(t, T0, C.etres - 0.2, 0.1, 0.3) });
      camKeys(cam, t, [{ t: T0, p: [0, 1.7, -4.5], l: [0, 1.4, -9.5], f: 56 }, { t: T0 + 8, p: [0.5, 1.7, -4.8], l: [0.5, 1.4, -9.5], f: 56 }, { t: C.etres - 0.42, p: [0.5, 1.7, -4.8], l: [0.5, 1.4, -9.5], f: 56 }, dk(C.etres - 0.4, d), dk(C.lion + 0.6, d),
        { t: C.lion + 0.62, p: [0, 1.6, 1.9], l: [0, 1.0, -4.4], f: 58 }, { t: C.prieres - 0.02, p: [0, 1.6, 1.7], l: [0, 1.0, -4.4], f: 58 }, { t: C.prieres, p: [0.6, 1.6, -6.6], l: [0.2, 1.4, -9.6], f: 50 }, { t: C.colere - 0.42, p: [0.6, 1.6, -6.9], l: [0.2, 1.4, -9.6], f: 50 }, dk(C.colere - 0.4, d), dk(SC.fumee.start, d, { dist: 2.4 })]);
      fade(four, win(t, C.lion + 0.6, C.prieres, 0.3, 0.1)); four.position.set(0, 0, -4.4); cr.forEach(g => g.userData.l.lookAt(cam.position));
      K.update(t);
    }
  };
};

// ---------- le temple rempli de fumee ; personne ne peut entrer
SETS.fumee = () => {
  const B = heaven60(); const { scene, cam } = B; B.open(1);
  const big = smoke(scene, 40, 0, 1.5, -12, 7, 12, 0xf0e8f0);
  const d = duo(scene, -0.6, 3.2, 0.1, { ped: 'gold', ph: 0.85 });
  const K = cardsMgr(scene, cam); refCard(K);
  return {
    ...B, update(t) {
      const T0 = SC.fumee.start; procession(B, t, 1); B.angels.forEach(an => { an.bowl.visible = true; an.pose({ aL: [1.2, 0.2], eL: 1.2, aR: [0.3, 0.15] }); });
      const k = sstep(T0 + 1, T0 + 6, t); B.smk(t, 0.3 + 0.7 * k); big(t, k); B.open(1 - 0.0 * k);
      d.update(t, { look: win(t, T0, C.personne - 0.2, 0.1, 0.3) });
      camKeys(cam, t, [{ t: T0, p: [0, 1.6, 1.0], l: [0, 3.0, -14], f: 56 }, { t: C.personne - 0.42, p: [0, 2.2, -1.5], l: [0, 4.5, -14], f: 60 }, dk(C.personne - 0.4, d), dk(C.moise, d)]);
      K.update(t);
    }
  };
};
SETS.gloire = () => {
  const B = heaven60(); const { scene, cam } = B; B.open(1);
  const big = smoke(scene, 40, 0, 1.5, -12, 7, 12, 0xf0e8f0);
  const d = duo(scene, -0.6, 3.2, 0.1, { ped: 'gold', ph: 0.85 });
  return {
    ...B, update(t) {
      procession(B, t, 1); B.angels.forEach(an => { an.bowl.visible = true; an.pose({ aL: [1.2, 0.2], eL: 1.2, aR: [0.3, 0.15] }); });
      B.smk(t, 1); big(t, 1); d.update(t, {});
      camKeys(cam, t, [dk(C.gloire, d, { dist: 2.6 }), dk(SC.fin.start, d, { dist: 2.3 })]);
    }
  };
};

// ---------- le temple de Salomon : la nuee remplit la maison
SETS.salomon = () => {
  const B = base({ sky: [0x3a6ab8, 0xf0e0c0, 0x9ab8d8], hemi: [0xfff4e0, 0x6a5a40, 1.0], sun: [0xfff0d0, 1.1, [5, 9, 4]], shadow: false, bloom: [0.35, 0.5, 0.9], exposure: 0.9, fog: [0xd8d0c0, 30, 110] });
  const { scene, cam } = B; scene.add(L.groundPlane(160, 50, 0xb8a080, 0.25, 4));
  const tp = temple(scene, -12, 1.0); tp.traverse(m => { if (m.isMesh && m.material.color && !m.material.map) { if (m.material.metalness > 0.5) return; } });
  const cloud = smoke(scene, 40, 0, 1, -12, 5, 8, 0xffffff);
  const pr = Array.from({ length: 5 }, (_, i) => { const h = new Human({ skin: [0xc68a5a, 0xa86c44, 0xd09a70][i % 3], hair: 0x2a1a10, beard: 'full', top: 0xf4f0e4, bottom: 0xf4f0e4, robe: 0xf4f0e4, robeL: 0.85, seed: 6010 + i }); h.place(-2 + i, 0, -5.5 - (i % 2) * 0.6, Math.PI); scene.add(h.root); return h; });
  const K = cardsMgr(scene, cam); refCard(K);
  K('1 Rois 8, 10-11 : la nuée remplit la maison de l\'Éternel', { w: 1.6, h: 0.28, border: '#ffffff' }, t => win(t, C.salomon + 1, C.gloire, 0.3, 0.2), -0.6);
  return {
    ...B, update(t) {
      const k = sstep(C.salomon + 0.5, C.salomon + 3, t); cloud(t, k);
      pr.forEach((h, i) => { const kn = sstep(C.salomon + 2 + i * 0.2, C.salomon + 3 + i * 0.2, t); h.pose(kn > 0.5 ? L.kneelPose({ lean: 0.6, aL: [1.2, 0.3], aR: [1.2, 0.3], hp: 0.3 }) : { aL: [0.3, 0.2], aR: [0.3, 0.2] }); h.face(0, 'awe', t); });
      camKeys(cam, t, [{ t: C.salomon, p: [1.5, 1.6, 0.5], l: [0, 2.2, -10], f: 56 }, { t: C.gloire, p: [0.8, 1.8, -0.5], l: [0, 2.8, -10], f: 58 }]);
      K.update(t);
    }
  };
};

// ---------- fin : la mer de verre melee de feu ; les vainqueurs et leurs harpes (prochain episode)
SETS.fin = () => {
  const B = base({ sky: [0x1a1040, 0xffb070, 0x6a3a7a], hemi: [0xfff0e0, 0x3a2a3a, 0.9], sun: [0xfff0d0, 1.0, [3, 8, 6]], shadow: false, bloom: [0.5, 0.5, 0.82], exposure: 0.95, fog: [0x9a6a8a, 30, 110] });
  const { scene, cam } = B;
  const glass = new THREE.Mesh(new THREE.CircleGeometry(80, 48), new THREE.MeshStandardMaterial({ color: 0x9adfff, metalness: 0.9, roughness: 0.05, emissive: new THREE.Color(0x1a3a4a) })); glass.rotation.x = -Math.PI / 2; glass.position.z = -20; scene.add(glass);
  const fires = Array.from({ length: 40 }, (_, i) => { const f = softGlow(2 + hash(i) * 3, 0xff7a2a); f.position.set((hash(i * 3) - 0.5) * 40, 0.05, -2 - hash(i * 7) * 40); scene.add(f); return f; });
  const ppl = Array.from({ length: 9 }, (_, i) => { const h = citizen(i + 40, { top: 0xffffff, bottom: 0xf0f0f0, robe: 0xffffff }); scene.add(h.root); h.root.position.set(-3.2 + i * 0.8, 0, -6 - (i % 2) * 0.8); const hp = harp(); hp.scale.setScalar(0.6); hp.position.set(0, -0.2, 0.12); h.hand.L.add(hp); return h; });
  const tp = temple(scene, -45, 1.0); tp.position.y = 0;
  const K = cardsMgr(scene, cam);
  K('PROCHAIN ÉPISODE · Apocalypse 15, 1-4', { w: 1.6, h: 0.24, border: '#ffd070', color: '#ffd070' }, t => win(t, SC.fin.start + 4, TL.duration + 1, 0.4, 0.2), -0.6);
  return {
    ...B, update(t) {
      const T0 = SC.fin.start; fires.forEach((f, i) => f.material.opacity = 0.5 + 0.4 * Math.sin(t * 2 + i));
      ppl.forEach((h, i) => { h.pose({ aL: [1.1, 0.3], eL: 1.2, aR: [1.0 + 0.2 * Math.sin(t * 6 + i), -0.2], eR: 1.3 }); h.face(0, 'joy', t); });
      camKeys(cam, t, [{ t: T0, p: [0, 1.6, 2.5], l: [0, 1.2, -8], f: 56 }, { t: TL.duration, p: [0, 2.6, 4.0], l: [0, 1.6, -10], f: 58 }]);
      K.update(t);
    }
  };
};

// ---------- couverture : temple ouvert, fumee doree, les sept anges, l'etre vivant tend une coupe d'or (sans Mr A ni Claude)
SETS.cover = () => {
  const B = heaven60({ exposure: 0.85 }); const { scene, cam } = B; B.open(1);
  const lion = wingedLion(); scene.add(lion); lion.position.set(0.9, 0, -7.2); lion.rotation.y = -Math.PI / 2 + 0.7;
  const big = smoke(scene, 40, 0, 2.5, -13, 7, 12, 0xfff0d8);
  const hb = goldBowl(2.6); hb.position.set(-0.05, 2.05, -7.5); scene.add(hb); const hg = softGlow(2.2, 0xffd070); hg.position.copy(hb.position); hg.position.y += 0.15; scene.add(hg);
  return { ...B, update() { const t = 4; procession(B, t, 1); B.angels.forEach((an, i) => { an.bowl.visible = i !== 3; an.pose({ aL: [1.2, 0.2], eL: 1.2, aR: [0.3, 0.15] }); if (i === 3) { an.pose({ aL: [1.3, 0.1], eL: 0.5, aR: [1.3, -0.1], eR: 0.5 }); an.root.position.z += 1.2; an.root.position.x += 0.3; } }); B.smk(t, 1); big(t, 0.8);
    cam.position.set(-0.4, 0.45, -2.2); cam.fov = 70; cam.updateProjectionMatrix(); cam.lookAt(0.2, 1.9, -12); cam.userData.focus = 6; } };
};

const SHOTS = [['intro', 0, SC.temple.start], ['temple', SC.temple.start, C.tente], ['tente', C.tente, SC.anges.start], ['anges', SC.anges.start, SC.coupes.start], ['coupes', SC.coupes.start, SC.fumee.start], ['fumee', SC.fumee.start, C.moise], ['tente', C.moise, C.salomon], ['salomon', C.salomon, C.gloire], ['gloire', C.gloire, SC.fin.start], ['fin', SC.fin.start, 1000], ['cover', 1000, 1e9]];
