// « L'INSTANT » — court-métrage de sensibilisation contre la violence (≈ 2 min 32, 16:9, sans dialogue).
// Un homme lève la main sur sa femme ; le temps se fige une seconde avant le coup. Dans cette seconde,
// il voit ce que ce geste va lui coûter (visions à l'encre). Puis il ouvre la main.
// 3D sculptée = le présent figé ; 2D encre = les visions. Image et son partagent la même horloge (CUES).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { track, range, lerp, ease, clamp, shake, noise1 } from '../engine/anim.js';
import { ROOM } from '../engine/room.js';
import { createHuman } from '../characters/human.js';
import { createGlass, createSpill, createShards, createWatch, createDoudou } from '../characters/instant_props.js';
import { drawVision, VISIONS } from './instant_ink.js';

export const world = 'room', fps = 24, duration = 152;
export const title = 'L’INSTANT';

// ---- chronologie (secondes) ----
export const T = {
  hook: 2.0, freeze: 6.2, v1: 27, r1: 55, v2: 60, r2: 92, v3: 95, r3: 118, open: 122, restart: 131.2, impact: 131.75, black: 138.5, text: 140, end: 152,
};

// ---- sons (lus par render/audio_instant.js) ----
export const CUES = [
  ['heart', 0.2, { until: 6.2, from: 70, to: 150 }],
  ['drone', 2.0, { until: 6.2, rise: true }],
  ['clench', 2.15], ['gasp', 3.0], ['shout', 3.4, { dur: 2.8 }], ['tick', 2.0, { until: 6.2 }],
  ['tip', 4.4], ['swing', 5.4, { dur: 0.8 }],
  ['freeze', 6.2], ['ring', 6.2, { dur: 5 }], ['room', 6.2, { until: 27 }], ['heart', 8.5, { until: 26.5, from: 46, to: 46, soft: true }],
  ['piano', 12.0, { theme: 'instant', until: 26.5 }],
  ['dive', 25.6], // plongée dans la goutte
  // vision 1 : partir
  ['paper', 27.0, { until: 55 }], ['piano', 27.2, { theme: 'partir', until: 54.5 }],
  ['zip', 28.3], ['wheels', 30.0, { dur: 2.6 }], ['doorClose', 32.9], ['clockFast', 34, { dur: 3.5 }],
  ['phone', 38.2, { dur: 5.4 }], ['voicemail', 43.6], ['rain', 46, { until: 55 }],
  ['undive', 55.0], ['room', 55.0, { until: 60 }], ['heart', 55.5, { until: 59.5, from: 54, to: 64, soft: true }], ['dive', 58.6],
  // vision 2 : l'irréparable
  ['paper', 60.0, { until: 92 }], ['swing', 60.6, { dur: 0.6 }], ['thud', 61.3], ['silence', 61.35, { dur: 2.5 }],
  ['glassRoll', 62.2, { dur: 1.6 }], ['flatline', 64.2, { dur: 3.6 }], ['siren', 67.5, { dur: 7.5 }],
  ['cuffs', 75.2], ['steps', 76.5, { dur: 3 }], ['cellDoor', 80.4], ['piano', 81.0, { theme: 'cellule', until: 91.5 }],
  ['undive', 92.0], ['room', 92.0, { until: 95 }], ['heart', 92.2, { until: 95, from: 70, to: 70, soft: true }], ['dive', 94.4],
  // vision 3 : l'héritage
  ['paper', 95.0, { until: 118 }], ['piano', 95.2, { theme: 'heritage', until: 117.8 }], ['argue', 99.0, { dur: 5 }], ['clench', 107.0], ['heart', 108, { until: 118, from: 80, to: 140 }],
  // retour, la main s'ouvre
  ['undive', 117.9], ['room', 118.0, { until: 131.2 }], ['heart', 118.0, { until: 131, from: 120, to: 50, soft: false }], ['breath', 124.5, { dur: 4 }],
  ['unfreeze', 131.2], ['shatter', 131.75], ['piano', 133.0, { theme: 'fin', until: 151.5 }],
];

// ---- texte sobre (police Cormorant) en surimpression ----
const HAS_DOM = typeof document !== 'undefined'; // le moteur de rendu lit aussi ce module dans Node (durée, fps)
const style = HAS_DOM ? document.createElement('style') : {};
style.textContent = `
@font-face { font-family: 'Cormorant'; font-weight: 500; src: url('/node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2') format('woff2'); }
@font-face { font-family: 'Cormorant'; font-weight: 500; font-style: italic; src: url('/node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2') format('woff2'); }
@font-face { font-family: 'Cormorant'; font-weight: 600; src: url('/node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2') format('woff2'); }
#cap { position:absolute; inset:0; pointer-events:none; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
#cap div { font-family:'Cormorant',Georgia,serif; color:#f4efe6; text-shadow:0 2px 18px rgba(0,0,0,.85); letter-spacing:.02em; white-space:nowrap; }
#veil { position:absolute; inset:0; background:#000; opacity:0; pointer-events:none; }
#tint { position:absolute; inset:0; pointer-events:none; opacity:0; mix-blend-mode:multiply; }
`;
if (HAS_DOM) document.head.appendChild(style);
if (HAS_DOM) await Promise.all([document.fonts.load("500 80px 'Cormorant'"), document.fonts.load("italic 500 80px 'Cormorant'"), document.fonts.load("600 80px 'Cormorant'")]).catch(() => {});

const PI = Math.PI;
const V3 = (...a) => new THREE.Vector3(...a);
const mix = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], k)) : lerp(a, b, k));
function blendPose(A, B, k) { const o = {}; for (const key of new Set([...Object.keys(A), ...Object.keys(B)])) { const a = A[key] ?? B[key], b = B[key] ?? A[key]; o[key] = typeof a === 'number' || Array.isArray(a) ? mix(a, b, k) : b; } return o; }

// ---- poses ----
const MAN_CALM = { lean: 0.1, armR: [0.15, 0.15, 0.35], armL: [0.35, 0.15, 0.6], fistR: 0.25, fistL: 0.35, browAng: -0.6, brow: -0.3, lid: 0.35, tilt: 0.4, mouth: 0.0, legL: [0.15, 0.06, 0.1], legR: [-0.1, 0.06, 0.1] };
const MAN_TENSE = { ...MAN_CALM, lean: 0.18, chestTwist: -0.15, fistR: 1, thumbR: 1, armR: [0.25, 0.25, 0.5], browAng: -1, brow: -0.6, lid: 0.45, tilt: 0.9, mouth: 0.25, mouthW: 0.4, sneer: 0.6, pupil: 0.75 };
const MAN_STRIKE = {
  hipsY: -0.025, lean: 0.28, chestTwist: -0.55, twist: -0.1, headTurn: 0.25, headNod: -0.05,
  armR: [3.0, 0.55, 1.55], armTwistR: 0.2, wristR: [0.2, 0], fistR: 1, thumbR: 1,
  armL: [0.95, 0.25, 0.55], fistL: 0.55, thumbL: 0.4, wristL: [0.2, 0.2],
  legL: [0.5, 0.08, 0.45], legR: [-0.38, 0.08, 0.15], footL: 0.1,
  browAng: -1.1, brow: -0.7, lid: 0.42, lidLow: 0.2, tilt: 1, pupil: 0.65, mouth: 0.9, mouthW: 0.7, sneer: 1,
};
const WOM_CALM = { lean: 0.02, armR: [0.3, 0.12, 0.9], armL: [0.3, 0.12, 0.9], fistR: 0.3, fistL: 0.3, browAng: 0.6, brow: 0.6, lid: 0.25, mouth: 0.1, legL: [0.05, 0.05, 0.05], legR: [-0.05, 0.05, 0.05] };
const WOM_FEAR = { ...WOM_CALM, lid: 0, lidLow: 0, eyeScale: 1.05, browAng: 1, brow: 1, mouth: 0.4, armR: [1.0, 0.1, 1.6], armL: [0.8, 0.1, 1.5], lean: -0.1 };
const WOM_RECOIL = {
  hipsY: -0.05, lean: -0.32, leanSide: 0.12, chestTwist: 0.35, headTurn: 0.85, headTilt: -0.25, headNod: 0.25,
  armR: [1.05, -0.15, 2.25], armL: [2.25, -0.2, 1.75], armTwistR: -0.2, armTwistL: 0.5, wristR: [0.4, 0.3], wristL: [0.5, 0.2], fistR: 0.45, fistL: 0.2,
  legR: [-0.32, 0.06, 0.35], legL: [0.22, 0.06, 0.12], footR: 0.2,
  lid: 0.92, lidLow: 0.35, browAng: 1.1, brow: 0.8, mouth: 0.45, mouthW: 0.3,
};
const KID = { armR: [0.15, 0.08, 0.25], armL: [1.1, -0.25, 2.3], wristL: [0.4, 0], fistL: 0.6, fistR: 0.85, thumbR: 0.9, headNod: 0.05, browAng: 1, brow: 1, lid: 0, lidLow: 0, eyeScale: 1.05, mouth: 0.25, legL: [0.02, 0.05, 0.05], legR: [-0.02, 0.05, 0.05] };

// ---- personnages ----
const MAN_POS = V3(-0.13, 0, 0.14), WOM_POS = V3(0.33, 0, 0.1), KID_POS = V3(ROOM.door.x - 0.02, 0, ROOM.back + 0.06);
const GLASS_TABLE = V3(-0.31, ROOM.table.h + 0.015, 0.47);          // posé sur la table
const GLASS_FROZEN = V3(-0.19, 0.27, 0.5);                            // en l'air au moment du gel

export function build({ scene, camera, renderer, setCamera, dof, fx, ink, inkCanvas, set3D, room, lights, W, H }) {
  const man = createHuman('man', { skin: 0x6e4430, skinDark: 0x55321f, shirt: 0x39424f, pants: 0x2b3446, shoes: 0x1a1614 });
  const wom = createHuman('woman', { skin: 0x8a5638, skinDark: 0x6e422a, shirt: 0xb8662e, skirt: 0x7a2f26, pants: 0x8a5638, shoes: 0x3a2018, hair: 0x120c0a, lips: 0x6a3028, band: 0xd9a531 });
  const kid = createHuman('child', { skin: 0x7e4e34, skinDark: 0x603a26, shirt: 0x7fa6c4, pants: 0x7fa6c4, shoes: 0xe0d8c8, longSleeves: true });
  man.root.position.copy(MAN_POS); man.root.rotation.y = PI / 2 - 0.12;
  wom.root.position.copy(WOM_POS); wom.root.rotation.y = -PI / 2 + 0.25;
  kid.root.position.copy(KID_POS); kid.root.rotation.y = -0.35;
  scene.add(man.root, wom.root, kid.root);
  // montre au poignet droit (le poing qui frappe)
  const watch = createWatch(0.024, -1); watch.root.position.y = 0.016; watch.root.children.slice(1).forEach((c) => c.scale.setScalar(0.72)); man.parts.hands[0].add(watch.root);
  // doudou tenu par l'oreille dans la main droite de l'enfant
  const dou = createDoudou(); dou.root.position.set(0, -0.04, 0.005); dou.root.rotation.set(0, 0.6, 0.15); kid.parts.hands[0].add(dou.root);
  // verre, eau figée, éclats
  const glass = createGlass(); scene.add(glass.root);
  const spill = createSpill([0, 0, 0], [0.16, -0.11, 0.05], [0.02, 0.07, 0.0], 30, 3); scene.add(spill.root);
  const env = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const waterLook = { color: new THREE.Color(0x9fbfe0), metalness: 0.55, roughness: 0.04, opacity: 0.38, envMapIntensity: 0.9, emissiveIntensity: 0.15 };
  const glassLook = { color: new THREE.Color(0xdfeaf5), metalness: 0.25, roughness: 0.03, opacity: 0.22, envMapIntensity: 0.7 };
  [glass.root, spill.root].forEach((o) => o.traverse((m) => { if (m.material && m.material.isMeshPhysicalMaterial) { m.material.envMap = env; Object.assign(m.material, m.material.opacity > 0.4 || o === spill.root || m === glass.water ? waterLook : glassLook); m.material.needsUpdate = true; } }));
  const shards = createShards(46, 9);
  shards.root.traverse((m) => { if (m.material) { m.material.envMap = env; m.material.envMapIntensity = 0.6; m.material.metalness = 0.3; m.material.opacity = m.geometry.type === 'CircleGeometry' ? 0.2 : 0.4; } });
  shards.root.children.forEach((m) => m.isMesh && m.geometry.type === 'TetrahedronGeometry' && m.scale.multiplyScalar(0.55));
  // petite lumière d'appoint pour les gros plans du poing (sinon contre-jour noir)
  const fistLight = new THREE.PointLight(0xffd2a0, 0, 0.9, 1.5); scene.add(fistLight); shards.root.position.set(GLASS_FROZEN.x + 0.06, 0, GLASS_FROZEN.z + 0.03); scene.add(shards.root);
  // poussières en suspension dans le faisceau de la lampe (immobiles quand le temps est figé)
  const motes = new THREE.Group(); { let s = 4; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280); const m = new THREE.MeshBasicMaterial({ color: 0xffe2b0, transparent: true, opacity: 0.45, depthWrite: false });
    for (let i = 0; i < 70; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.0006 + rnd() * 0.0008, 6, 4), m); d.position.set(-0.95 + rnd() * 0.7, 0.3 + rnd() * 0.8, 0.05 + rnd() * 0.55); d.userData.v = [rnd() - 0.5, rnd() - 0.3, rnd() - 0.5]; motes.add(d); } }
  scene.add(motes); const motes0 = motes.children.map((d) => d.position.clone());

  // couches HTML : voile noir, teinte, texte
  const stage = document.getElementById('stage');
  const veil = Object.assign(document.createElement('div'), { id: 'veil' }); const tint = Object.assign(document.createElement('div'), { id: 'tint' });
  const cap = Object.assign(document.createElement('div'), { id: 'cap' });
  stage.appendChild(tint); stage.appendChild(veil); stage.appendChild(cap);
  const canvas3D = document.getElementById('c');
  const caption = (lines) => {
    const html = lines.map(([txt, size = 76, a = 1, o = {}]) => `<div style="font-size:${size}px;opacity:${a};${o.dark ? 'color:#151311;text-shadow:0 0 14px rgba(243,236,223,.9);' : ''}font-style:${o.italic ? 'italic' : 'normal'};font-weight:${o.w || 500};margin:${o.m ?? 12}px 0;transform:translateY(${o.dy || 0}px);letter-spacing:${o.ls ?? 0.02}em">${txt}</div>`).join('');
    if (cap.dataset.h !== html) { cap.innerHTML = html; cap.dataset.h = html; }
  };
  const fade = (t, a, b, c, d) => clamp(Math.min(range(t, a, b), 1 - range(t, c, d)));
  const V = new THREE.Vector3();
  const toScreen = (p) => { V.copy(p).project(camera); return [(V.x + 1) / 2 * W, (1 - V.y) / 2 * H]; };
  const head = (c, dy = 0) => c.parts.head.getWorldPosition(new THREE.Vector3()).add(V3(0, dy, 0));
  // centre du poing droit et repère « devant le poing » (côté du dos de la main, face caméra)
  const fist = (d = 0) => man.parts.hands[0].localToWorld(V3(-d * 0.6, -0.045, d * 0.8));
  // plan « par-dessus le poing » : la caméra est derrière le poing, la femme floue au fond
  const overFist = (d, side = 0.06) => { const f = fist(), w = head(wom, -0.02), dir = f.clone().sub(w).normalize(); const sideV = V3(0, 1, 0).cross(dir).normalize(); return f.clone().add(dir.multiplyScalar(d)).add(sideV.multiplyScalar(side)).add(V3(0, 0.035, 0)); };
  const lightFist = () => { const f = fist(), c = overFist(0.2, 0.12); fistLight.position.copy(f.clone().lerp(c, 0.6)).add(V3(0, 0.05, 0)); fistLight.intensity = 0.4; };
  const kidEye = (d = 0) => kid.parts.head.localToWorld(V3(0.0255 + d * 0.05, 0.01, 0.058 + d));
  const cam = (pos, target, fov = 35, focus = 0, roll = 0) => { setCamera({ pos, target, fov, roll }); dof(focus ? V3(...pos).distanceTo(V3(...target)) : 1, focus); };
  const dolly = (t, t0, t1, A, B, e = 'inOut') => { const k = ease[e](range(t, t0, t1)); return { pos: mix(A.pos, B.pos, k), target: mix(A.target, B.target, k), fov: lerp(A.fov ?? 35, B.fov ?? 35, k) }; };
  const shot = (s, focus = 0.6) => cam(s.pos, s.target, s.fov, focus);

  // pose de l'homme pendant le retour final (le poing s'ouvre)
  function manFinal(t) {
    const kOpen = ease.inOut(range(t, T.open + 1.5, T.restart - 0.8));
    const kFace = ease.inOut(range(t, T.open, T.restart - 1));
    let p = blendPose(MAN_STRIKE, { ...MAN_STRIKE, browAng: 0.9, brow: 0.6, lid: 0.15, tilt: 0, mouth: 0.15, mouthW: 0, sneer: 0, pupil: 1 }, kFace);
    p.fistR = lerp(1, 0.05, kOpen); p.thumbR = lerp(1, 0.15, kOpen);
    p.fistL = lerp(0.55, 0.15, kOpen);
    // le temps repart : le bras retombe, le corps se redresse
    const kDrop = ease.out(range(t, T.restart, T.restart + 1.1));
    if (kDrop > 0) p = blendPose(p, { ...p, armR: [0.55, 0.2, 0.9], armL: [0.45, 0.15, 0.6], wristR: [-0.3, 0], lean: 0.12, chestTwist: -0.1, twist: 0, headNod: 0.35, headTurn: -0.1, hipsY: -0.01, legL: [0.3, 0.06, 0.2], legR: [-0.2, 0.06, 0.1] }, kDrop);
    const kLook = ease.inOut(range(t, T.restart + 1.4, T.restart + 3));
    if (kLook > 0) p = blendPose(p, { ...p, armR: [1.05, 0.05, 1.35], wristR: [-0.6, 0.3], headNod: 0.55, lookY: -0.6, lid: 0.35 }, kLook);
    return p;
  }

  // pré-gel : mouvements réels (2 s → 6,2 s)
  function preFreeze(t) {
    const kM = ease.inOut(range(t, 2.0, 3.2)), kS = ease.in(range(t, 5.15, T.freeze));
    let m = blendPose(MAN_CALM, MAN_TENSE, kM);
    m = blendPose(m, MAN_STRIKE, kS);
    if (t < 3.0) { m.fistR = lerp(0.2, 1, ease.inOut(range(t, 2.1, 2.85))); m.thumbR = lerp(0.3, 1, ease.inOut(range(t, 2.4, 2.95))); }
    const kW = ease.out(range(t, 3.05, 3.4)), kR = ease.in(range(t, 5.25, T.freeze));
    let w = blendPose(WOM_CALM, WOM_FEAR, kW); w = blendPose(w, WOM_RECOIL, kR);
    return { m, w };
  }

  // le verre : posé → bousculé → tombe → figé → finit sa chute
  function glassAt(t) {
    const tFall0 = 4.55;
    if (t < tFall0) { const wob = t > 4.35 ? Math.sin((t - 4.35) * 40) * 0.08 * range(t, 4.35, 4.45) : 0; return { p: GLASS_TABLE.clone(), r: [0, 0, -wob - (t > 4.4 ? range(t, 4.4, tFall0) * 0.6 : 0)], spill: 0 }; }
    const tt = Math.min(t, T.freeze) - tFall0, T0 = T.freeze - tFall0;
    const k = tt / T0; // 0 → 1 au gel
    let p = GLASS_TABLE.clone().lerp(GLASS_FROZEN, k); p.y = lerp(GLASS_TABLE.y, GLASS_FROZEN.y, k * k);
    let rz = -0.6 - k * 1.4;
    if (t > T.restart) { const d = t - T.restart; p.y = Math.max(0.02, GLASS_FROZEN.y - 0.25 * d - 0.45 * d * d); p.x += d * 0.08; rz -= d * 2.5; }
    return { p, r: [0.15, 0.3, rz], spill: clamp(k * 1.4) };
  }

  let tLast = -1;
  return (t) => {
    const frozen = t >= T.freeze && t < T.restart;
    const inVision = (t >= T.v1 && t < T.r1) || (t >= T.v2 && t < T.r2) || (t >= T.v3 && t < T.r3);
    // ---------- poses ----------
    let pm, pw;
    if (t < T.freeze) ({ m: pm, w: pw } = preFreeze(t));
    else if (t < T.r3) {
      pm = { ...MAN_STRIKE }; pw = WOM_RECOIL;
      // le visage de l'homme change à chaque retour de vision (la colère se fissure)
      if (t >= T.r1) pm = blendPose(pm, { ...pm, browAng: -0.55, brow: -0.2, lid: 0.3, tilt: 0.5, mouth: 0.75, sneer: 0.5, pupil: 0.9 }, 1);
      if (t >= T.r2) pm = blendPose(pm, { ...pm, browAng: 0.7, brow: 0.6, lid: 0.0, lidLow: 0, tilt: 0, mouth: 0.55, mouthW: 0.1, sneer: 0, pupil: 0.6, eyeScale: 1.08 }, 1);
    } else { pm = manFinal(t); pw = WOM_RECOIL;
      const kw = ease.inOut(range(t, T.restart + 1.6, T.restart + 4.2));
      if (kw > 0) pw = blendPose(WOM_RECOIL, { ...WOM_RECOIL, lid: 0.1, lidLow: 0.1, headTurn: 0.2, headNod: 0.1, armR: [1.2, -0.1, 1.7], armL: [1.3, -0.15, 1.8], lean: -0.2, mouth: 0.2 }, kw);
    }
    if (!inVision) {
      man.pose(pm); wom.pose(pw);
      const kk = t > T.restart ? ease.inOut(range(t, T.restart + 2.2, T.restart + 4.5)) : 0;
      kid.pose(kk ? blendPose(KID, { ...KID, armL: [0.3, 0.1, 0.5], fistL: 0.3, mouth: 0.1, browAng: 0.9, lid: 0.15 }, kk) : KID);
    }
    // ---------- objets ----------
    const g = glassAt(t);
    glass.root.position.copy(g.p); glass.root.rotation.set(...g.r);
    glass.root.visible = t < T.impact;
    spill.root.position.copy(g.p).add(V3(0.0, 0.07, 0)); spill.root.visible = g.spill > 0 && t < T.impact;
    spill.drops.forEach((d, i) => (d.visible = i / spill.drops.length < g.spill));
    if (t > T.restart) spill.root.position.y -= (t - T.restart) * 0.35;
    shards.at(t - T.impact);
    // horloge et montre : la trotteuse s'arrête au gel
    const secs = 17 + Math.min(t, T.freeze) + Math.max(0, t - T.restart);
    room.clock.sec.rotation.z = -(Math.floor(secs) / 60) * PI * 2; watch.setSeconds(secs);
    // poussières : dérivent lentement, sauf quand le temps est figé
    const mt = Math.min(t, T.freeze) + Math.max(0, t - T.restart);
    motes.children.forEach((d, i) => { const v = d.userData.v; d.position.set(motes0[i].x + Math.sin(mt * 0.3 + i) * 0.02 * v[0], motes0[i].y + Math.sin(mt * 0.2 + i * 1.3) * 0.015, motes0[i].z + Math.cos(mt * 0.25 + i) * 0.02 * v[2]); });
    // la lampe se balance un peu quand le temps repart (le coup de bras l'a frôlée)
    room.lamp.rotation.z = t > T.restart ? Math.sin((t - T.restart) * 3.2) * 0.05 * Math.exp(-(t - T.restart) * 0.5) : 0;
    // teinte du gel : désaturé, bleuté
    const kFz = frozen ? clamp(range(t, T.freeze, T.freeze + 0.5)) * (1 - clamp(range(t, T.restart - 0.05, T.restart + 0.3))) : 0;
    canvas3D.style.filter = kFz > 0 ? `saturate(${1 - 0.5 * kFz}) contrast(${1 + 0.06 * kFz})` : 'none';
    tint.style.background = '#9db4d6'; tint.style.opacity = 0.35 * kFz;
    veil.style.opacity = 0; caption([]); inkCanvas.style.opacity = 1;
    inkCanvas.style.display = 'none'; inkCanvas.style.clipPath = 'none'; set3D(true); fistLight.intensity = 0;
    fx.flash(0);

    // ---------- plans ----------
    const M = head(man), Wh = head(wom), K = head(kid);
    if (t < T.hook) { veil.style.opacity = 1; cam([0, 0.6, 2], [0, 0.6, 0]); set3D(false); }
    else if (t < 3.0) { // le poing qui se serre (très gros plan)
      const f = fist(), c = fist(0.2 - (t - 2) * 0.02);
      cam([c.x, c.y + 0.03, c.z], f.toArray(), 30, 0.9);
      veil.style.opacity = 1 - range(t, 2.0, 2.25);
    } else if (t < 3.6) { // ses yeux à elle
      cam([Wh.x - 0.12, Wh.y + 0.012, Wh.z + 0.16], [Wh.x, Wh.y + 0.01, Wh.z], 30, 0.8);
    } else if (t < 4.3) { // l'enfant dans l'encadrement
      cam([K.x - 0.15 + (t - 3.6) * 0.05, K.y + 0.02, K.z + 0.6], [K.x, K.y - 0.12, K.z], 32, 0.6);
    } else if (t < 5.15) { // le verre bousculé
      const p = GLASS_TABLE; cam([p.x + 0.25, p.y + 0.06, p.z + 0.32], [p.x + 0.04, p.y - 0.02, p.z], 34, 0.7);
    } else if (t < T.freeze) { // plan large, le bras se lève
      const [sx, sy] = shake(t, 0.004 * range(t, 5.4, 6.1), 30);
      cam([0.08 + sx, 0.62 + sy, 1.75 - (t - 5.15) * 0.08], [0.1, 0.62, 0.1], 38, 0.3);
    } else if (t < 10.5) { // GEL : plan large qui glisse lentement
      const s = dolly(t, T.freeze, 10.5, { pos: [0.12, 0.62, 1.67], target: [0.1, 0.62, 0.1], fov: 38 }, { pos: [-0.2, 0.55, 1.35], target: [0.08, 0.58, 0.1], fov: 36 }, 'out');
      shot(s, 0.25);
      fx.flash(0.85 * (1 - range(t, T.freeze, T.freeze + 0.25)), '#eaf2ff');
    } else if (t < 14.0) { // son visage à elle : peur figée
      const s = dolly(t, 10.5, 14, { pos: [Wh.x - 0.2, Wh.y - 0.08, Wh.z + 0.4], target: [Wh.x, Wh.y - 0.01, Wh.z], fov: 30 }, { pos: [Wh.x - 0.14, Wh.y - 0.07, Wh.z + 0.3], target: [Wh.x, Wh.y - 0.01, Wh.z], fov: 30 });
      shot(s, 0.8);
    } else if (t < 17.5) { // l'enfant et son doudou
      const s = dolly(t, 14, 17.5, { pos: [K.x - 0.32, K.y - 0.05, K.z + 0.95], target: [K.x, K.y - 0.12, K.z], fov: 34 }, { pos: [K.x - 0.2, K.y - 0.02, K.z + 0.6], target: [K.x, K.y - 0.06, K.z], fov: 32 });
      shot(s, 0.7);
    } else if (t < 21.0) { // le visage de l'homme, puis le poing et la montre arrêtée
      const h = fist(), hc = overFist(0.24);
      const k = ease.inOut(range(t, 18.8, 20.6)); if (k > 0) lightFist();
      const A = { pos: [M.x + 0.32, M.y - 0.01, M.z + 0.3], target: [M.x, M.y - 0.01, M.z] }, B = { pos: [hc.x, hc.y, hc.z], target: [h.x, h.y - 0.01, h.z] };
      const tt = ease.inOut(range(t, 17.5, 18.8)) * 0.04;
      cam(mix(A.pos, B.pos, k).map((v, i) => v - (i === 0 ? tt : 0)), mix(A.target, B.target, k), 30, 0.8);
    } else if (t < 24.6) { // plongée lente au-dessus de la scène + texte
      const a = lerp(-0.4, -0.15, ease.inOut(range(t, 21, 24.6)));
      cam([0.08 + Math.sin(a) * 1.1, 1.38, 0.15 + Math.cos(a) * 1.1], [0.08, 0.45, 0.1], 40, 0.2);
      caption([['Il reste une seconde.', 92, fade(t, 21.4, 22.2, 23.9, 24.5), { italic: true }]]);
    } else if (t < T.v1) { // approche d'une goutte d'eau suspendue → vision 1
      diveIn(t, 24.6, T.v1, spill.drops[6], 0);
    } else if (t < T.r1) { vision(t, 0); if (t > T.r1 - 1.6) diveOut(t, T.r1 - 1.6, T.r1, spill.drops[6], 0); }
    else if (t < T.v2) { // retour : son visage à lui, la colère se fissure ; puis une autre goutte
      if (t < 58.0) { const s = dolly(t, T.r1, 58, { pos: [M.x + 0.26, M.y + 0.01, M.z + 0.26], target: [M.x, M.y - 0.01, M.z], fov: 30 }, { pos: [M.x + 0.2, M.y + 0.0, M.z + 0.2], target: [M.x, M.y - 0.01, M.z], fov: 30 }); shot(s, 0.8); }
      else diveIn(t, 58.0, T.v2, spill.drops[14], 1);
    } else if (t < T.r2) { vision(t, 1); if (t > T.r2 - 1.6) diveOut(t, T.r2 - 1.6, T.r2, spill.drops[14], 1); }
    else if (t < T.v3) { // retour : l'horreur sur son visage, puis l'œil de l'enfant
      if (t < 93.8) { const s = dolly(t, T.r2, 93.8, { pos: [M.x + 0.22, M.y + 0.0, M.z + 0.2], target: [M.x, M.y - 0.005, M.z], fov: 30 }, { pos: [M.x + 0.17, M.y, M.z + 0.15], target: [M.x, M.y - 0.005, M.z], fov: 30 }); shot(s, 0.85); }
      else eyeIn(t, 93.8, T.v3);
    } else if (t < T.r3) { vision(t, 2); if (t > T.r3 - 0.9) matchFist(t); }
    else if (t < T.restart) { // le poing en très gros plan, qui s'ouvre lentement ; on recule
      const h = fist(), hc = overFist(0.24); lightFist(); fistLight.intensity = 0.4 * (1 - range(t, T.open + 4, T.restart - 1));
      const kb = ease.inOut(range(t, T.open + 3, T.restart - 0.3));
      const A = { pos: [hc.x, hc.y, hc.z], target: [h.x, h.y - 0.01, h.z] }, B = { pos: [M.x + 0.55, M.y - 0.02, M.z + 0.62], target: [lerp(M.x, h.x, 0.5), lerp(M.y, h.y, 0.5) - 0.02, M.z] };
      cam(mix(A.pos, B.pos, kb), mix(A.target, B.target, kb), lerp(30, 34, kb), lerp(0.9, 0.5, kb));
    } else if (t < T.restart + 1.6) { // le temps repart : le verre tombe et se brise (plan au ras du sol)
      const p = GLASS_FROZEN, [sx, sy] = shake(t, 0.004 * (t > T.impact ? Math.exp(-(t - T.impact) * 5) : 0), 40);
      const gy = glassAt(t).p.y; cam([p.x + 0.42 + sx, 0.07 + sy + gy * 0.25, p.z + 0.38], [p.x + 0.04, 0.04 + gy * 0.6, p.z], 34, 0.6);
    } else if (t < T.black) { // plan large : il regarde sa main ouverte
      const k = ease.out(range(t, T.restart, T.black));
      const [sx, sy] = shake(t, 0.006 * Math.exp(-Math.max(0, t - T.impact) * 4) * (t > T.impact ? 1 : 0), 35);
      cam([0.05 + sx - k * 0.1, 0.6 + sy, 1.55 + k * 0.35], [0.08, 0.5, 0.15], 38, 0.25);
      veil.style.opacity = range(t, T.black - 1.6, T.black);
    } else { // texte final
      set3D(false); veil.style.opacity = 1;
      caption([
        ['Un seul geste peut tout te prendre.', 78, fade(t, 140.3, 141.6, 147.6, 148.6)],
        ['Arrête-toi avant.', 92, fade(t, 143.2, 144.6, 147.6, 148.6), { italic: true, m: 30 }],
      ]);
      if (t > 148.6) caption([['L’INSTANT', 150, fade(t, 148.9, 149.8, 151.2, 151.9), { w: 600, ls: 0.3 }]]);
    }

    // ---------- outils de transition ----------
    function diveIn(t, t0, t1, drop, vi) {
      const k = ease.in(range(t, t0, t1));
      const p = drop.getWorldPosition(V3());
      const away = V3(0.35, 0.12, 0.45).normalize();
      const dist = lerp(0.5, 0.02, k);
      cam([p.x + away.x * dist, p.y + away.y * dist, p.z + away.z * dist], [p.x, p.y, p.z], lerp(32, 24, k), 0.9);
      // la vision apparaît dans la goutte puis envahit l'écran
      const kv = range(t, t1 - 1.0, t1);
      if (kv > 0) { const [x, y] = toScreen(p); inkCanvas.style.display = 'block'; inkCanvas.style.clipPath = `circle(${(ease.in(kv) * 1.25 * W).toFixed(1)}px at ${x.toFixed(0)}px ${y.toFixed(0)}px)`; vision(VISIONS[vi].t0 + 0.001, vi, true); inkCanvas.style.opacity = Math.min(1, kv * 3); }
    }
    function diveOut(t, t0, t1, drop, vi) {
      const kv = 1 - ease.out(range(t, t0, t1));
      const p = drop.getWorldPosition(V3()); const away = V3(0.35, 0.12, 0.45).normalize(); const dist = lerp(0.02, 0.35, 1 - kv);
      man.pose(pm); wom.pose(pw); kid.pose(KID);
      cam([p.x + away.x * dist, p.y + away.y * dist, p.z + away.z * dist], [p.x, p.y, p.z], 26, 0.9);
      const [x, y] = toScreen(p); set3D(true); inkCanvas.style.display = 'block';
      inkCanvas.style.clipPath = `circle(${(kv * 1.25 * W).toFixed(1)}px at ${x.toFixed(0)}px ${y.toFixed(0)}px)`;
    }
    function eyeIn(t, t0, t1) {
      const k = ease.in(range(t, t0, t1));
      const e = kidEye(), c = kidEye(lerp(0.45, 0.012, k));
      cam(c.toArray(), e.toArray(), lerp(32, 20, k), 0.9);
      const kv = range(t, t1 - 0.7, t1);
      if (kv > 0) { const [x, y] = toScreen(e); inkCanvas.style.display = 'block'; inkCanvas.style.clipPath = `circle(${(ease.in(kv) * 1.25 * W).toFixed(1)}px at ${x.toFixed(0)}px ${y.toFixed(0)}px)`; vision(VISIONS[2].t0 + 0.001, 2, true); }
    }
    function matchFist(t) { // fondu enchaîné : le poing du fils (encre) devient le poing du père (3D)
      const k = range(t, T.r3 - 0.9, T.r3);
      man.pose(MAN_STRIKE); set3D(true);
      const h = fist(), c = overFist(0.24); lightFist();
      cam(c.toArray(), [h.x, h.y - 0.01, h.z], 30, 0.9);
      inkCanvas.style.display = 'block'; inkCanvas.style.opacity = 1 - ease.inOut(k);
    }
    function vision(t, vi, keepStyle) {
      inkCanvas.style.display = 'block'; if (!keepStyle) { inkCanvas.style.clipPath = 'none'; inkCanvas.style.opacity = 1; set3D(false); canvas3D.style.filter = 'none'; tint.style.opacity = 0; }
      const out = drawVision(ink, vi, t, { fx, W, H });
      if (out && out.caption && !keepStyle) caption(out.caption);
    }
    tLast = t;
  };
}
