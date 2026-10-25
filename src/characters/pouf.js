// POUF — le petit poisson-globe héros. Rond, jaune tacheté, yeux immenses, se gonfle en boule à piquants.
// Orienté vers +z. Diamètre ~0.65 (×1.9 gonflé).
import * as THREE from 'three';
import { mat, sph, group, makeEye, poseEye } from './parts.js';
import { causticMaterial } from '../engine/ocean.js';

function skinTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#f4c430'); gr.addColorStop(0.5, '#ffd84a'); gr.addColorStop(0.62, '#fff2c9'); gr.addColorStop(1, '#fffaf0');
  g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
  let s = 4; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  g.fillStyle = 'rgba(150,90,20,0.55)';
  for (let i = 0; i < 60; i++) { const y = rnd() * 120; g.beginPath(); g.ellipse(rnd() * 512, y + 8, 6 + rnd() * 9, 5 + rnd() * 7, 0, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function fanFin(w, h, color, opacity = 0.9) {
  const shape = new THREE.Shape(); shape.moveTo(0, 0);
  for (let i = 0; i <= 10; i++) { const a = -0.9 + (i / 10) * 1.8, r = h * (1 + 0.12 * Math.sin(i * Math.PI)); shape.lineTo(Math.cos(a) * r * (w / h), Math.sin(a) * r); }
  shape.lineTo(0, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.01, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.01, bevelSegments: 2 });
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.4, transparent: true, opacity, side: THREE.DoubleSide }));
  m.castShadow = true; return m;
}

export function createPouf() {
  const skin = causticMaterial({ map: skinTexture(), roughness: 0.55 }, 0.35);
  const R = 0.32;
  const root = new THREE.Group(), inner = new THREE.Group(); root.add(inner); // inner = étirement/écrasement
  const body = sph(R, skin, [1, 0.95, 1.05], [0, 0, 0], 48); inner.add(body);
  body.rotation.y = Math.PI;

  // Piquants (sortent quand il se gonfle)
  const spikes = new THREE.Group(); inner.add(spikes);
  const spikeGeo = new THREE.ConeGeometry(0.035, 0.16, 8); spikeGeo.translate(0, 0.08, 0);
  const spikeMat = mat(0xfff1c2, 0.5);
  const N = 90, golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * golden;
    const d = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
    if (d.z > 0.75 && d.y > -0.3) continue; // dégage le visage
    const s = new THREE.Mesh(spikeGeo, spikeMat); s.position.copy(d.clone().multiplyScalar(R * 0.97));
    s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); s.castShadow = true; spikes.add(s);
  }

  // Visage : éléments repositionnés quand le corps grossit
  const feats = [];
  const feat = (obj, p) => { obj.position.set(...p); obj.userData.base = new THREE.Vector3(...p); inner.add(obj); feats.push(obj); return obj; };
  const eyes = [-1, 1].map((s) => {
    const e = makeEye(0.13, mat(0xf4c430, 0.55), 0x2f7fd6, mat(0x5a3a10, 0.8), s);
    e.rotation.y = s * 0.32; return feat(e, [s * 0.14, 0.12, 0.24]);
  });
  const mouth = feat(group([0, 0, 0]), [0, -0.08, 0.31]);
  const lips = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.024, 10, 24), mat(0xff8a70, 0.4)); mouth.add(lips);
  const mouthIn = sph(0.045, mat(0x5a1420, 0.8), [1, 1, 0.3], [0, 0, -0.005], 16); mouth.add(mouthIn);
  const cheeks = [-1, 1].map((s) => feat(sph(0.05, mat(0xff9aa0, 0.6, { transparent: true, opacity: 0.7 }), [1, 0.6, 0.3], [0, 0, 0], 12), [s * 0.2, -0.04, 0.24]));
  cheeks.forEach((c, i) => (c.rotation.y = (i ? 1 : -1) * 0.7));
  const fins = [-1, 1].map((s) => { const f = feat(group([0, 0, 0]), [s * 0.3, -0.04, 0.02]); const m = fanFin(0.16, 0.12, 0xffb84a); m.rotation.set(0, s > 0 ? 0 : Math.PI, 0); f.add(m); return f; });
  const tail = feat(group([0, 0, 0]), [0, 0.0, -0.32]); { const m = fanFin(0.2, 0.15, 0xffb84a); m.rotation.set(0, Math.PI / 2, 0); tail.add(m); }
  const dorsal = feat(group([0, 0, 0]), [0, 0.28, -0.12]); { const m = fanFin(0.12, 0.09, 0xffb84a); m.rotation.set(0, Math.PI / 2, Math.PI / 2); dorsal.add(m); }

  const P0 = { inflate: 0, stretch: 1, swim: 0, flap: 0, tilt: 0, eyeScale: 1, lookX: 0, lookY: 0, lid: 0, lidLow: 0, brow: 0, browAng: 0, cross: 0, wink: 0,
    mouth: 0, mouthW: 1, pucker: 0, blush: 0.6, finSpread: 0 };
  function pose(p = {}) {
    p = { ...P0, ...p };
    const s = 1 + p.inflate * 0.95;
    const st = p.stretch; inner.scale.set(1 / Math.sqrt(st), 1 / Math.sqrt(st), st);
    body.scale.set(s, s * (0.95 + p.inflate * 0.05), s * 1.05);
    spikes.scale.setScalar(s); spikes.children.forEach((k) => k.scale.setScalar(Math.max(0.001, (p.inflate - 0.25) / 0.75)));
    feats.forEach((f) => f.position.copy(f.userData.base).multiplyScalar(s * (1 + (f === tail ? 0.02 : 0))));
    eyes.forEach((e, i) => poseEye(e, { lookX: p.lookX + (i ? -1 : 1) * p.cross, lookY: p.lookY, lid: i ? Math.max(p.lid, p.wink) : p.lid, lidLow: p.lidLow, browY: p.brow, browAng: p.browAng, scale: p.eyeScale * (1 + p.inflate * 0.25) }));
    mouth.scale.set(p.mouthW * (1 - p.pucker * 0.4), (0.6 + p.mouth * 1.6) * (1 - p.pucker * 0.3), 1);
    mouthIn.visible = p.pucker < 0.8;
    cheeks.forEach((c) => (c.visible = p.blush > 0.1));
    const fl = Math.sin(p.swim * 2 * Math.PI) * (0.5 + p.flap * 0.6);
    fins.forEach((f, i) => { f.rotation.set(0, (i ? 1 : -1) * (0.5 + fl * 0.7 + p.finSpread), (i ? -1 : 1) * (0.2 + p.inflate * 0.4)); });
    tail.rotation.y = Math.sin(p.swim * 2 * Math.PI + 1.2) * (0.35 + p.flap * 0.4);
    dorsal.rotation.z = Math.sin(p.swim * 2 * Math.PI) * 0.15;
    inner.rotation.z = p.tilt;
  }
  pose();
  return { root, pose };
}
