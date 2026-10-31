// Accessoires de « L'INSTANT » : le verre (et son eau figée en l'air), les éclats, la montre, le doudou.
import * as THREE from 'three';
import { Sculpture } from '../engine/sculpt.js';
import { group } from './parts.js';

const PI = Math.PI;
const glassMat = () => new THREE.MeshPhysicalMaterial({ color: 0xeaf4ff, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.32, clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1, side: THREE.DoubleSide, depthWrite: false });
const waterMat = () => new THREE.MeshPhysicalMaterial({ color: 0xd6ecff, roughness: 0.0, metalness: 0.1, transparent: true, opacity: 0.3, clearcoat: 1, clearcoatRoughness: 0.0, specularIntensity: 1, emissive: 0x16283a, emissiveIntensity: 0.4, depthWrite: false });

// Verre à eau : orienté +y ; origine au fond du verre
export function createGlass() {
  const root = new THREE.Group();
  const prof = [[0, 0], [0.026, 0], [0.028, 0.006], [0.03, 0.05], [0.033, 0.095], [0.031, 0.095], [0.028, 0.05], [0.025, 0.007], [0, 0.007]].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), glassMat()); g.renderOrder = 3; root.add(g);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.0012, 6, 40), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, emissive: 0x8899aa, emissiveIntensity: 0.4 })); rim.rotation.x = PI / 2; rim.position.y = 0.095; root.add(rim);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.025, 0.04, 32), waterMat()); water.position.y = 0.027; water.renderOrder = 2; root.add(water);
  return { root, water };
}

// Ruban d'eau qui s'échappe du verre, figé : gouttes le long d'une courbe (de a vers b), tailles décroissantes
export function createSpill(a, b, bulge, n = 26, seed = 1) {
  const root = new THREE.Group(), drops = [];
  let s = seed; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), C = A.clone().lerp(B, 0.5).add(new THREE.Vector3(...bulge));
  const curve = new THREE.QuadraticBezierCurve3(A, C, B);
  const m = waterMat(), geo = new THREE.SphereGeometry(1, 20, 14);
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1), p = curve.getPoint(k), tan = curve.getTangent(k);
    const r = 0.011 * (1 - k * 0.75) * (0.6 + rnd() * 0.6);
    const d = new THREE.Mesh(geo, m); d.position.copy(p).add(new THREE.Vector3((rnd() - 0.5) * 0.03, (rnd() - 0.5) * 0.02, (rnd() - 0.5) * 0.03));
    d.scale.set(r, r * (1.2 + rnd() * 1.4), r); d.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan); d.renderOrder = 2;
    root.add(d); drops.push(d);
  }
  // nappe principale (langue d'eau) au départ
  const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(A, A.clone().lerp(C, 0.6), A.clone().lerp(B, 0.35).add(new THREE.Vector3(...bulge).multiplyScalar(0.5))), 16, 0.008, 10), m); tube.renderOrder = 2; root.add(tube);
  return { root, drops, curve };
}

// Éclats de verre au sol (bris final) : petits tétraèdres projetés en étoile, physique simple
export function createShards(n = 40, seed = 5) {
  const root = new THREE.Group(); const list = [];
  let s = seed; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const m = new THREE.MeshPhysicalMaterial({ color: 0xeaf4ff, roughness: 0.05, transparent: true, opacity: 0.6, clearcoat: 1, emissive: 0x6688aa, emissiveIntensity: 0.3 });
  for (let i = 0; i < n; i++) {
    const sh = new THREE.Mesh(new THREE.TetrahedronGeometry(0.004 + rnd() * 0.012), m); sh.scale.set(1, 0.3 + rnd() * 0.5, 1 + rnd());
    const a = rnd() * PI * 2, sp = 0.15 + rnd() * 0.6;
    list.push({ m: sh, v: [Math.cos(a) * sp, 0.4 + rnd() * 1.3, Math.sin(a) * sp], spin: [rnd() * 20, rnd() * 20, rnd() * 20] });
    root.add(sh);
  }
  // flaque
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshPhysicalMaterial({ color: 0x9fc4e0, roughness: 0.02, transparent: true, opacity: 0.45, clearcoat: 1 }));
  puddle.rotation.x = -PI / 2; puddle.position.y = 0.002; root.add(puddle);
  // dt : temps depuis l'impact
  function at(dt) {
    root.visible = dt >= 0;
    list.forEach((p, i) => {
      const t = Math.max(0, dt); let x = p.v[0] * t, z = p.v[2] * t, y = p.v[1] * t - 4.9 * t * t;
      // rebonds amortis
      if (y < 0) { const tb = p.v[1] / 4.9, t2 = t - tb; const v2 = p.v[1] * 0.3; y = Math.max(0, v2 * t2 - 4.9 * t2 * t2); x = p.v[0] * (tb + t2 * 0.4); z = p.v[2] * (tb + t2 * 0.4); }
      const slow = Math.min(t, 0.9);
      p.m.position.set(Math.min(Math.abs(x), 0.5) * Math.sign(x), y + 0.003, Math.min(Math.abs(z), 0.5) * Math.sign(z));
      p.m.rotation.set(p.spin[0] * slow, p.spin[1] * slow, p.spin[2] * slow);
    });
    const k = Math.min(1, Math.max(0, dt) / 0.6); puddle.scale.setScalar(0.01 + 0.16 * Math.sqrt(k));
  }
  at(-1);
  return { root, at };
}

// Montre au poignet : bracelet + cadran + trotteuse rouge (qui s'arrête quand le temps se fige)
export function createWatch(r = 0.024, side = -1) {
  const root = new THREE.Group();
  const band = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.22, 10, 32), new THREE.MeshStandardMaterial({ color: 0x1a1512, roughness: 0.6 })); band.rotation.x = PI / 2; band.scale.set(0.82, 1.05, 1); root.add(band);
  const face = new THREE.Group(); face.position.set(side * r * 0.95, 0, 0); face.rotation.z = side * PI / 2; root.add(face);
  const caseM = new THREE.MeshStandardMaterial({ color: 0xb8b8b0, roughness: 0.25, metalness: 0.9 });
  const cs = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.62, r * 0.62, r * 0.28, 32), caseM); face.add(cs);
  const dial = new THREE.Mesh(new THREE.CircleGeometry(r * 0.52, 32), new THREE.MeshStandardMaterial({ color: 0x1c1c22, roughness: 0.3 })); dial.rotation.x = -PI / 2; dial.position.y = r * 0.145; face.add(dial);
  const hm = new THREE.MeshStandardMaterial({ color: 0xe8e4da, emissive: 0x333330 });
  const mk = (len, w, m) => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(w, r * 0.02, len), m); b.position.z = -len / 2; g.add(b); g.position.y = r * 0.16; face.add(g); return g; };
  const hour = mk(r * 0.28, r * 0.06, hm), min = mk(r * 0.42, r * 0.045, hm), sec = mk(r * 0.48, r * 0.02, new THREE.MeshStandardMaterial({ color: 0xc01818, emissive: 0x300000 }));
  hour.rotation.y = -1.1; min.rotation.y = 2.3;
  return { root, sec, setSeconds: (s) => (sec.rotation.y = -(Math.floor(s) / 60) * PI * 2) };
}

// Doudou : petit lapin de tissu usé, sculpté. Tenu par une oreille (origine = bout de l'oreille, pend vers -y)
export function createDoudou() {
  const S = new Sculpture({ cell: 0.0014, color: 0xcdb89a, material: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }) });
  const root = group(); const body = group([0, -0.075, 0]); root.add(body);
  S.add(root, 'cone', [0.006, 0.009, 0.045], { rot: [PI, 0, 0], blend: 0.004 }); // oreille tenue
  S.add(body, 'ell', [0.024, 0.022, 0.021], { pos: [0, 0.012, 0], blend: 0.01 }); // tête
  S.add(body, 'cone', [0.006, 0.009, 0.035], { pos: [0.012, 0.03, 0], rot: [0, 0, -0.9], blend: 0.004 }); // l'autre oreille
  S.add(body, 'ell', [0.028, 0.035, 0.024], { pos: [0, -0.035, 0], blend: 0.012 }); // corps
  [-1, 1].forEach((s) => { S.add(body, 'cone', [0.008, 0.007, 0.03], { pos: [s * 0.022, -0.02, 0.004], rot: [0, 0, s * 2.4], blend: 0.005 }); S.add(body, 'cone', [0.01, 0.009, 0.026], { pos: [s * 0.013, -0.06, 0.004], rot: [PI, 0, s * 0.3], blend: 0.005 }); });
  S.add(body, 'ell', [0.016, 0.02, 0.01], { pos: [0, -0.035, 0.018], op: 'paint', color: 0xeee4d2, sharp: 0.003 }); // ventre clair
  S.add(body, 'ell', [0.009, 0.008, 0.008], { pos: [0, 0.006, 0.02], blend: 0.004, color: 0xeee4d2 }); // museau
  [-1, 1].forEach((s) => S.add(body, 'ell', [0.0035, 0.0035, 0.003], { pos: [s * 0.009, 0.016, 0.019], op: 'paint', color: 0x1a1210, sharp: 0.0012 })); // yeux boutons
  S.add(body, 'ell', [0.0045, 0.003, 0.003], { pos: [0, 0.009, 0.027], op: 'paint', color: 0x8a4a4a, sharp: 0.0012 });
  S.add(body, 'ell', [0.01, 0.006, 0.006], { pos: [0.014, -0.05, 0.02], op: 'paint', color: 0xa07a5a, sharp: 0.002 }); // reprise cousue
  root.add(S.mesh); S.update(root);
  return { root };
}
