// L'APPARTEMENT — monde 3D intérieur de nuit pour le court-métrage « L'INSTANT ».
// Lumières : suspension chaude au-dessus de la table, lune bleue par la fenêtre, couloir chaud derrière la porte.
// Par-dessus la 3D, une toile 2D « encre » (ink) sert aux visions ; l'épisode la découpe (clip-path) pour les transitions.
// Unités : un adulte mesure ~1.0 ; sol en y = 0 ; on filme surtout vers -z.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createWorld as createInk } from './ink.js';

export const mat = (color, roughness = 0.85, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });

// repères du décor (partagés avec l'épisode)
export const ROOM = { W: 4.2, D: 3.2, H: 1.5, back: -1.6, door: { x: 1.15, w: 0.5, h: 1.12 }, win: { x: -1.25, y: 0.82, w: 0.85, h: 0.75 },
  table: { x: -0.62, z: 0.32, w: 0.75, d: 0.5, h: 0.42 }, photo: { x: 0.25, y: 0.92 } };

let seed = 3;
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

// texture de parquet (lames + veinage) et de papier peint (rayures douces)
function canvasTex(w, h, draw, rep = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t;
}
const floorTex = () => canvasTex(1024, 1024, (g, w, h) => {
  const n = 8;
  for (let i = 0; i < n; i++) for (let j = 0; j < 3; j++) {
    const y0 = (i / n) * h, off = ((i * 0.37) % 1) * w, l = rnd() * 0.12;
    g.fillStyle = `hsl(${24 + rnd() * 6},${38 + rnd() * 10}%,${30 + l * 100}%)`;
    g.fillRect((off + (j * w) / 1.5) % w - w / 1.5, y0, w / 1.5, h / n); g.fillRect((off + (j * w) / 1.5) % w + w / 3, y0, w / 1.5, h / n);
    g.strokeStyle = 'rgba(30,15,5,0.25)'; for (let k = 0; k < 6; k++) { g.beginPath(); const yy = y0 + rnd() * h / n; g.moveTo(0, yy); g.bezierCurveTo(w * 0.3, yy + 4, w * 0.6, yy - 4, w, yy + 2); g.lineWidth = 1 + rnd() * 2; g.stroke(); }
  }
  g.fillStyle = 'rgba(20,10,4,0.8)'; for (let i = 0; i <= n; i++) g.fillRect(0, (i / n) * h - 2, w, 4);
}, [2, 2]);
const wallTex = () => canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#c9b89a'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? 'rgba(255,248,230,0.10)' : 'rgba(120,90,60,0.06)'; g.fillRect((i / 8) * w, 0, w / 8, h); }
  for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(80,60,40,${rnd() * 0.05})`; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
}, [6, 2]);

function box(w, h, d, m, p = [0, 0, 0], r = [0, 0, 0]) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(...p); b.rotation.set(...r); b.castShadow = b.receiveShadow = true; return b;
}
function cyl(rt, rb, h, m, p = [0, 0, 0], seg = 24) { const c = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); c.position.set(...p); c.castShadow = c.receiveShadow = true; return c; }

// mur percé de trous rectangulaires (porte, fenêtre) : construit en bandes
function wallWithHoles(len, H, holes, m) {
  const g = new THREE.Group(), xs = [-len / 2];
  holes.forEach((h) => xs.push(h.x - h.w / 2, h.x + h.w / 2)); xs.push(len / 2);
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i], b = xs[i + 1]; if (b - a < 1e-3) continue;
    const hole = i % 2 === 1 ? holes[(i - 1) / 2] : null;
    if (!hole) { g.add(box(b - a, H, 0.06, m, [(a + b) / 2, H / 2, 0])); continue; }
    if (hole.y0 > 0) g.add(box(b - a, hole.y0, 0.06, m, [(a + b) / 2, hole.y0 / 2, 0]));
    const top = hole.y0 + hole.h; g.add(box(b - a, H - top, 0.06, m, [(a + b) / 2, (H + top) / 2, 0]));
  }
  return g;
}

function buildRoom(scene) {
  const R = ROOM, wallM = new THREE.MeshStandardMaterial({ map: wallTex(), roughness: 0.95 }), wood = mat(0x6b4128, 0.6), woodDark = mat(0x3d2416, 0.65), white = mat(0xe8e0d0, 0.7);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(R.W, R.D + 2), new THREE.MeshStandardMaterial({ map: floorTex(), roughness: 0.55 }));
  floor.rotation.x = -Math.PI / 2; floor.position.z = R.back + (R.D + 2) / 2; floor.receiveShadow = true; scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(R.W, R.D + 2), mat(0xd8cdb8, 1)); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, R.H, R.back + (R.D + 2) / 2); scene.add(ceil);
  // mur du fond : fenêtre à gauche, porte du couloir à droite
  const back = wallWithHoles(R.W, R.H, [{ x: R.win.x, w: R.win.w, y0: R.win.y - R.win.h / 2, h: R.win.h }, { x: R.door.x, w: R.door.w, y0: 0, h: R.door.h }], wallM);
  back.position.z = R.back; scene.add(back);
  [-1, 1].forEach((s) => { const side = box(0.06, R.H, R.D + 2, wallM, [s * R.W / 2, R.H / 2, R.back + (R.D + 2) / 2]); scene.add(side); });
  // plinthes
  scene.add(box(R.W, 0.05, 0.015, white, [0, 0.025, R.back + 0.035]));
  // fenêtre : cadre, croisillon, ville de nuit au loin, rideaux
  const W0 = R.win; const fr = new THREE.Group(); fr.position.set(W0.x, W0.y, R.back);
  [[W0.w + 0.06, 0.04, 0, W0.h / 2], [W0.w + 0.06, 0.04, 0, -W0.h / 2], [0.04, W0.h, -W0.w / 2, 0], [0.04, W0.h, W0.w / 2, 0], [0.025, W0.h, 0, 0], [W0.w, 0.025, 0, 0.05]].forEach(([w, h, x, y]) => fr.add(box(w, h, 0.07, white, [x, y, 0])));
  fr.add(box(W0.w + 0.14, 0.03, 0.12, white, [0, -W0.h / 2 - 0.02, 0.05]));
  scene.add(fr);
  const city = canvasTex(1024, 512, (g, w, h) => {
    const sk = g.createLinearGradient(0, 0, 0, h); sk.addColorStop(0, '#08142e'); sk.addColorStop(1, '#2a3d6b'); g.fillStyle = sk; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f3f0e0'; g.beginPath(); g.arc(w * 0.72, h * 0.22, 26, 0, 7); g.fill();
    for (let i = 0; i < 40; i++) { const bw = 30 + rnd() * 70, bh = h * (0.25 + rnd() * 0.45), x = rnd() * w; g.fillStyle = `hsl(225,30%,${8 + rnd() * 8}%)`; g.fillRect(x, h - bh, bw, bh);
      for (let yy = h - bh + 8; yy < h - 6; yy += 14) for (let xx = x + 5; xx < x + bw - 6; xx += 11) if (rnd() < 0.22) { g.fillStyle = rnd() < 0.7 ? '#ffcf7a' : '#bfe0ff'; g.fillRect(xx, yy, 5, 7); } }
  });
  const cityM = new THREE.Mesh(new THREE.PlaneGeometry(W0.w * 2.6, W0.h * 1.6), new THREE.MeshBasicMaterial({ map: city, toneMapped: false, color: 0x9aa6c4 }));
  cityM.position.set(W0.x, W0.y - 0.05, R.back - 0.9); scene.add(cityM);
  const curtainM = mat(0x5a2f38, 0.95, { side: THREE.DoubleSide });
  [-1, 1].forEach((s) => { const g = new THREE.PlaneGeometry(0.28, W0.h + 0.3, 12, 1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 60) * 0.018); g.computeVertexNormals(); const c = new THREE.Mesh(g, curtainM); c.position.set(W0.x + s * (W0.w / 2 + 0.08), W0.y - 0.05, R.back + 0.07); c.castShadow = true; scene.add(c); });
  // porte du couloir : chambranle, battant entrouvert, couloir éclairé
  const D0 = R.door;
  [[0.04, D0.h, D0.x - D0.w / 2 - 0.02, D0.h / 2], [0.04, D0.h, D0.x + D0.w / 2 + 0.02, D0.h / 2], [D0.w + 0.08, 0.04, D0.x, D0.h + 0.02]].forEach(([w, h, x, y]) => scene.add(box(w, h, 0.08, white, [x, y, R.back])));
  const leaf = new THREE.Group(); leaf.position.set(D0.x + D0.w / 2, 0, R.back - 0.03); leaf.add(box(D0.w, D0.h, 0.03, white, [-D0.w / 2, D0.h / 2, 0])); leaf.add(cyl(0.012, 0.012, 0.02, mat(0xc9a64a, 0.3, { metalness: 0.8 }), [-D0.w + 0.05, 0.5, 0.03])); leaf.rotation.y = -1.9; scene.add(leaf);
  const hall = new THREE.Group(); hall.position.set(D0.x, 0, R.back);
  hall.add(box(1.4, 0.02, 1.2, mat(0x5a3a26, 0.7), [0, 0.0, -0.6]));
  hall.add(box(1.4, R.H, 0.05, mat(0xd9b88a, 0.95), [0, R.H / 2, -1.1]));
  [-1, 1].forEach((s) => hall.add(box(0.05, R.H, 1.2, mat(0xd9b88a, 0.95), [s * 0.55, R.H / 2, -0.6])));
  hall.add(box(1.4, 0.05, 1.2, mat(0xd9b88a, 0.95), [0, R.H, -0.6]));
  scene.add(hall);
  // table + nappe, chaises
  const T = R.table, tg = new THREE.Group(); tg.position.set(T.x, 0, T.z);
  tg.add(box(T.w, 0.03, T.d, wood, [0, T.h, 0]));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => tg.add(box(0.035, T.h, 0.035, woodDark, [a * (T.w / 2 - 0.05), T.h / 2, b * (T.d / 2 - 0.05)])));
  const plate = cyl(0.07, 0.06, 0.008, white, [-0.15, T.h + 0.02, 0.05], 32); tg.add(plate);
  const bottle = new THREE.Group(); bottle.add(cyl(0.025, 0.028, 0.14, mat(0x1e4a2a, 0.15, { transparent: true, opacity: 0.85 }), [0, 0.07, 0])); bottle.add(cyl(0.008, 0.02, 0.06, mat(0x1e4a2a, 0.15), [0, 0.17, 0])); bottle.position.set(-0.25, T.h + 0.015, -0.12); tg.add(bottle);
  scene.add(tg);
  const chair = (x, z, ry) => { const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; c.add(box(0.22, 0.025, 0.22, wood, [0, 0.25, 0])); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => c.add(box(0.025, 0.25, 0.025, woodDark, [a * 0.09, 0.125, b * 0.09]))); c.add(box(0.22, 0.26, 0.025, wood, [0, 0.39, -0.1])); return c; };
  const chairA = chair(T.x - 0.32, T.z - 0.32, 0.6); scene.add(chairA);
  const chairB = chair(T.x + 0.1, T.z - 0.42, 0.15); chairB.rotation.z = 0; scene.add(chairB);
  // canapé au fond, buffet, cadre photo de mariage, horloge
  const sofa = new THREE.Group(); sofa.position.set(-0.15, 0, R.back + 0.3);
  const sofaM = mat(0x2f4a5a, 0.95);
  sofa.add(box(1.0, 0.18, 0.4, sofaM, [0, 0.14, 0])); sofa.add(box(1.0, 0.3, 0.12, sofaM, [0, 0.33, -0.15])); [-1, 1].forEach((s) => sofa.add(box(0.1, 0.25, 0.4, sofaM, [s * 0.5, 0.2, 0])));
  [-0.25, 0.25].forEach((x, i) => { const cu = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), mat(i ? 0xc98a3a : 0x8a3a3a, 0.95)); cu.scale.set(1, 0.8, 0.45); cu.position.set(x, 0.33, -0.06); cu.castShadow = true; sofa.add(cu); });
  scene.add(sofa);
  // cadre de la photo de mariage (texture peinte : deux silhouettes souriantes)
  const photoTex = canvasTex(256, 320, (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#e8d6b0'); bg.addColorStop(1, '#b89a6a'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a2416'; g.beginPath(); g.arc(95, 120, 34, 0, 7); g.fill(); g.fillRect(55, 150, 80, 170); // lui
    g.fillStyle = '#5a3a26'; g.beginPath(); g.arc(165, 130, 30, 0, 7); g.fill();
    g.fillStyle = '#fbf7ee'; g.beginPath(); g.moveTo(130, 160); g.lineTo(205, 160); g.lineTo(235, 320); g.lineTo(105, 320); g.fill(); // robe
    g.fillStyle = '#fbf7ee'; g.beginPath(); g.ellipse(165, 98, 40, 16, 0, 0, 7); g.fill(); // voile
    g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(95, 125, 16, 0.2, 2.9); g.stroke(); g.beginPath(); g.arc(165, 135, 14, 0.2, 2.9); g.stroke();
  });
  const photo = new THREE.Group(); photo.position.set(R.photo.x, R.photo.y, R.back + 0.035);
  photo.add(box(0.24, 0.3, 0.02, mat(0xb08a3a, 0.35, { metalness: 0.4 })));
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.26), new THREE.MeshStandardMaterial({ map: photoTex, roughness: 0.4 })); pic.position.z = 0.011; photo.add(pic);
  photo.rotation.z = 0.03; scene.add(photo);
  const clock = new THREE.Group(); clock.position.set(-0.45, 1.12, R.back + 0.04);
  clock.add(cyl(0.085, 0.085, 0.025, white, [0, 0, 0], 40)); clock.children[0].rotation.x = Math.PI / 2;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.087, 0.01, 8, 40), mat(0x222222, 0.4)); clock.add(ring);
  const handM = mat(0x111111, 0.4); const hh = box(0.008, 0.05, 0.004, handM, [0, 0.022, 0.016]); const mh = box(0.006, 0.07, 0.004, handM, [0, 0.032, 0.018]);
  const hG = new THREE.Group(); hG.add(hh); const mG = new THREE.Group(); mG.add(mh); const sG = new THREE.Group(); sG.add(box(0.003, 0.075, 0.003, mat(0xb02020, 0.4), [0, 0.03, 0.02]));
  hG.rotation.z = -0.6; mG.rotation.z = 2.1; clock.add(hG, mG, sG); scene.add(clock);
  // jouet d'enfant oublié au sol, tapis
  const rug = new THREE.Mesh(new THREE.CircleGeometry(0.6, 48), mat(0x7a5a3a, 1)); rug.rotation.x = -Math.PI / 2; rug.scale.set(1.4, 1, 1); rug.position.set(0.25, 0.003, -0.05); rug.receiveShadow = true; scene.add(rug);
  const car = new THREE.Group(); car.add(box(0.08, 0.03, 0.04, mat(0xc0302a, 0.4), [0, 0.025, 0])); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const w = cyl(0.012, 0.012, 0.01, mat(0x111111), [a * 0.028, 0.012, b * 0.022], 12); w.rotation.x = Math.PI / 2; car.add(w); });
  car.position.set(0.85, 0, 0.45); car.rotation.y = 0.7; scene.add(car);
  // suspension au-dessus de la table
  const lampG = new THREE.Group(); lampG.position.set(T.x + 0.05, R.H, T.z);
  lampG.add(cyl(0.003, 0.003, 0.5, mat(0x111111), [0, -0.25, 0], 6));
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.1, 32, 1, true), mat(0x2a2a2a, 0.5, { side: THREE.DoubleSide })); shade.position.y = -0.52; lampG.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff1c8 })); bulb.position.y = -0.56; lampG.add(bulb);
  scene.add(lampG);
  return { lamp: lampG, clock: { sec: sG, min: mG, hour: hG }, door: leaf, photo, chairs: [chairA, chairB] };
}

export function createWorld(canvas, width, height) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05060a);
  const room = buildRoom(scene);
  const R = ROOM;
  // lumières
  const hemi = new THREE.HemisphereLight(0x5a6a99, 0x2a1a10, 0.8); scene.add(hemi);
  const lamp = new THREE.SpotLight(0xffc98a, 2.2, 4, 1.05, 0.6, 1.6);
  lamp.position.set(R.table.x + 0.05, R.H - 0.56, R.table.z); lamp.target.position.set(R.table.x + 0.3, 0, R.table.z - 0.1);
  lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); lamp.shadow.bias = -0.0004; lamp.shadow.normalBias = 0.02; lamp.shadow.radius = 5;
  scene.add(lamp, lamp.target);
  const fill = new THREE.PointLight(0xffb070, 1.2, 3, 1.5); fill.position.set(R.table.x + 0.4, 0.95, R.table.z + 0.8); scene.add(fill);
  const moon = new THREE.DirectionalLight(0x7f9fe0, 1.1); moon.position.set(R.win.x - 0.6, 1.6, R.back - 2.5); moon.target.position.set(0.2, 0, 0.3);
  moon.castShadow = true; moon.shadow.mapSize.set(1024, 1024); Object.assign(moon.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 8 }); moon.shadow.bias = -0.0008; moon.shadow.radius = 3;
  scene.add(moon, moon.target);
  const hallL = new THREE.PointLight(0xffd9a0, 3.2, 2.4, 1.4); hallL.position.set(R.door.x, 1.2, R.back - 0.6); hallL.castShadow = true; hallL.shadow.mapSize.set(512, 512); scene.add(hallL);
  const rim = new THREE.SpotLight(0xbcd0ff, 2.5, 5, 0.7, 0.6, 1); rim.position.set(1.4, 1.3, -1.2); rim.target.position.set(0, 0.7, 0.2); scene.add(rim, rim.target);
  // contre-champ doux pour l'enfant dans l'encadrement (sinon simple silhouette) et clé froide de face
  const kidFill = new THREE.SpotLight(0xd8c8b0, 2.2, 3.5, 0.35, 0.8, 1.2); kidFill.position.set(0.5, 0.9, 0.9); kidFill.target.position.set(R.door.x, 0.4, R.back + 0.1); scene.add(kidFill, kidFill.target);
  const key = new THREE.DirectionalLight(0x9fb4e0, 0.55); key.position.set(0.6, 1.4, 2.5); key.target.position.set(0, 0.6, 0); scene.add(key, key.target);
  const lights = { hemi, lamp, fill, moon, hall: hallL, rim, kidFill, key };

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 60);
  const look = new THREE.Vector3();
  const setCamera = ({ pos, target, fov = 40, roll = 0 }) => {
    camera.fov = fov; camera.updateProjectionMatrix();
    camera.position.set(...pos); look.set(...target); camera.up.set(Math.sin(roll), Math.cos(roll), 0); camera.lookAt(look);
  };
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(1); composer.setSize(width, height);
  composer.addPass(new RenderPass(scene, camera));
  const ao = new GTAOPass(scene, camera, width, height);
  ao.updateGtaoMaterial({ radius: 0.12, distanceExponent: 1.5, thickness: 0.4, scale: 1.2, samples: 6 });
  ao.blendIntensity = 0.9; composer.addPass(ao); ao.enabled = false; // trop coûteux en rendu logiciel pour un gain à peine visible dans cette scène sombre
  const bokeh = new BokehPass(scene, camera, { focus: 1, aperture: 0.004, maxblur: 0.008 }); bokeh.enabled = false; composer.addPass(bokeh);
  composer.addPass(new OutputPass());
  const dof = (focus, amount = 0) => { bokeh.enabled = amount > 0; bokeh.uniforms.focus.value = focus; bokeh.uniforms.aperture.value = 0.006 * amount; bokeh.uniforms.maxblur.value = 0.012 * amount; };

  // toile « encre » par-dessus (visions)
  const inkCanvas = document.createElement('canvas'); inkCanvas.id = 'ink';
  Object.assign(inkCanvas.style, { position: 'absolute', left: '0', top: '0', width: `${width}px`, height: `${height}px`, display: 'none' });
  canvas.after(inkCanvas);
  const ink = createInk(inkCanvas, width, height);
  let show3D = true;
  const render = () => { if (show3D) composer.render(); };
  const animated = [];
  return { THREE, renderer, scene, camera, setCamera, update: (t) => animated.forEach((f) => f(t)), animated, render, dof, ao, lights, room, ink, inkCanvas, set3D: (v) => (show3D = v), focusShadow: () => {} };
}
