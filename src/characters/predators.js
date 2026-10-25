// Les prédateurs de POUF : Bruno le requin, Flip & Flop les dauphins farceurs, Mama Orque.
// Corps paramétrique fuselé (u = 0 queue -> 1 museau), ondulation de queue calculée sur les sommets,
// gueule articulée : palais rouge + dents sur la tête, mâchoire inférieure qui pivote.
// Orientés vers +z.
import * as THREE from 'three';
import { mat, group, makeEye, poseEye } from './parts.js';
import { causticMaterial } from '../engine/ocean.js';

const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };

// Nageoire : contour 2D extrudé et arrondi
function fin(points, material, depth = 0.03, bevel = 0.035) {
  const s = new THREE.Shape(); points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 6 });
  geo.translate(0, 0, -depth / 2); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, material); m.castShadow = true; return m;
}
const spline = (pts, n = 16) => new THREE.SplineCurve(pts.map(([x, y]) => new THREE.Vector2(x, y))).getPoints(n).map((v) => [v.x, v.y]);

function swimmer(cfg) {
  const { L, R, w, h } = cfg;
  const NU = 72, NT = 40;
  const zOf = (u) => (u - 0.5) * L;
  const top = new THREE.Color(cfg.top), belly = new THREE.Color(cfg.belly), red = new THREE.Color(0x9a1f35), patchC = new THREE.Color(cfg.patchColor || cfg.belly);

  // --- corps (tête + palais inclus) ---
  const pos = [], col = [], base = [], idx = [];
  for (let i = 0; i <= NU; i++) {
    const u = i / NU, r = Math.max(cfg.profile(u), 0.004), cy = cfg.camber(u);
    for (let j = 0; j <= NT; j++) {
      const th = (j / NT) * Math.PI * 2;
      let x = r * w * Math.cos(th), y = cy + r * h * Math.sin(th);
      const z = zOf(u);
      let c = top.clone().lerp(belly, smooth(-0.05, -0.45, Math.sin(th)));
      if (cfg.patch) { const pk = cfg.patch(u, th); if (pk > 0) c.lerp(patchC, pk); }
      // palais : tout ce qui est sous la ligne de bouche, à l'avant, est aplati et coloré en rouge
      if (u > cfg.uMouth) { const ym = cfg.mouthY(u); if (y < ym) { y = ym; c = red.clone(); } }
      pos.push(x, y, z); base.push(x, y, z, u); col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < NU; i++) for (let j = 0; j < NT; j++) { const a = i * (NT + 1) + j, b = a + NT + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const skin = causticMaterial({ vertexColors: true, roughness: cfg.rough ?? 0.4 }, 0.3);
  const root = new THREE.Group(), inner = new THREE.Group(); root.add(inner);
  const body = new THREE.Mesh(geo, skin); body.castShadow = true; inner.add(body);

  // --- mâchoire inférieure (pivot au coin de la bouche) ---
  const uM = cfg.uMouth, hinge = new THREE.Vector3(0, cfg.mouthY(uM), zOf(uM));
  const jaw = group(hinge.toArray()); inner.add(jaw);
  {
    const jp = [], jc = [], ji = []; const JU = 30, JT = 20;
    for (let i = 0; i <= JU; i++) {
      const u = uM + (i / JU) * (0.995 - uM), r = cfg.profile(u) * 0.97, cy = cfg.camber(u), ym = cfg.mouthY(u);
      // demi-section sous la ligne de bouche ; le dessus est la langue
      const yRel = Math.max(-1, Math.min(1, (ym - cy) / (r * h + 1e-6))), th0 = Math.asin(yRel);
      for (let j = 0; j <= JT; j++) {
        const th = Math.PI - th0 + (j / JT) * (Math.PI + 2 * th0); // du bord gauche au bord droit en passant par dessous
        const x = r * w * Math.cos(th), y = cy + r * h * Math.sin(th);
        const c = top.clone().lerp(belly, smooth(-0.05, -0.45, Math.sin(th)));
        jp.push(x, y - hinge.y, zOf(u) - hinge.z); jc.push(c.r, c.g, c.b);
      }
    }
    for (let i = 0; i < JU; i++) for (let j = 0; j < JT; j++) { const a = i * (JT + 1) + j, b = a + JT + 1; ji.push(a, a + 1, b, b, a + 1, b + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(jp, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(jc, 3)); g.setIndex(ji); g.computeVertexNormals();
    const jm = new THREE.Mesh(g, causticMaterial({ vertexColors: true, roughness: cfg.rough ?? 0.4, side: THREE.DoubleSide }, 0.3)); jm.castShadow = true; jaw.add(jm);
    // langue / intérieur
    const tongue = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xc4374f, 0.6));
    const um = (uM + 1) / 2; tongue.scale.set(cfg.profile(um) * w * 0.8, 0.04 * L, (1 - uM) * L * 0.45); tongue.position.set(0, -0.02 * L, zOf(um) - hinge.z - 0.02 * L); tongue.rotation.x = Math.PI; jaw.add(tongue);
    const inside = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), mat(0x4a0f1c, 0.9)); inside.scale.set(cfg.profile(um) * w * 0.8, 0.012 * L, (1 - uM) * L * 0.4); inside.position.set(0, -0.012 * L, zOf(um) - hinge.z - 0.01 * L); jaw.add(inside);
  }

  // --- dents le long du bord du palais et de la mâchoire ---
  if (cfg.teeth) {
    const tm = mat(0xffffff, 0.15);
    const edge = (u) => { const r = cfg.profile(u), cy = cfg.camber(u), ym = cfg.mouthY(u); const yr = (ym - cy) / (r * h); return r * w * Math.sqrt(Math.max(0, 1 - yr * yr)); };
    for (let k = 0; k < cfg.teeth; k++) {
      const a = k / (cfg.teeth - 1) * 2 - 1; // -1 gauche … 0 avant … 1 droite
      const u = uM + 0.04 + (1 - Math.abs(a)) * (0.985 - uM - 0.04);
      const x = Math.sign(a) * edge(u) * 0.93, size = cfg.toothSize * (0.8 + 0.4 * (1 - Math.abs(a)));
      const up = new THREE.Mesh(new THREE.ConeGeometry(size * 0.42, size, 6), tm); up.rotation.x = Math.PI; up.position.set(x, cfg.mouthY(u) - size * 0.45, zOf(u) - 0.01); inner.add(up);
      if (k % 2 === 0) { const lo = new THREE.Mesh(new THREE.ConeGeometry(size * 0.38, size * 0.85, 6), tm); lo.position.set(x * 0.95, cfg.mouthY(u) - hinge.y + size * 0.35, zOf(u) - hinge.z - 0.02); jaw.add(lo); }
    }
  }

  // --- yeux ---
  const eyeFlesh = mat(cfg.top, 0.4);
  const eyes = [-1, 1].map((s) => {
    const u = cfg.eyeU, r = cfg.profile(u), th = cfg.eyeTh;
    const e = makeEye(cfg.eyeR, eyeFlesh, cfg.iris, mat(0x14181f, 0.7), s);
    e.position.set(s * r * w * Math.cos(th) * 0.93, cfg.camber(u) + r * h * Math.sin(th), zOf(u)); e.rotation.y = s * cfg.eyeYaw; inner.add(e); return e;
  });

  // --- nageoires ---
  const finMat = causticMaterial({ color: cfg.finColor, roughness: 0.45 }, 0.25);
  const at = (u, th, k = 0.95) => { const r = cfg.profile(u); return [r * w * Math.cos(th) * k, cfg.camber(u) + r * h * Math.sin(th) * k, zOf(u)]; };
  const dorsal = fin(cfg.dorsal, finMat); dorsal.rotation.y = -Math.PI / 2; dorsal.position.set(...at(cfg.dorsalU, Math.PI / 2, 0.85)); inner.add(dorsal);
  const pecs = [-1, 1].map((s) => { const g = group(at(cfg.pecU, -0.5, 0.85)); g.position.x *= s; const f = fin(cfg.pec, finMat, 0.02); f.rotation.set(Math.PI / 2, 0, s > 0 ? 0 : Math.PI); f.rotation.y = s > 0 ? 0 : 0; g.add(f); inner.add(g); g.userData.s = s; return g; });
  pecs.forEach((g) => { if (g.userData.s < 0) g.children[0].scale.x = -1, g.children[0].rotation.z = 0; });
  const flukeG = group([0, 0, 0]); inner.add(flukeG);
  const fluke = fin(cfg.fluke, finMat, 0.03); flukeG.add(fluke);
  if (cfg.horizontal) fluke.rotation.set(-Math.PI / 2, 0, Math.PI / 2); else fluke.rotation.set(0, -Math.PI / 2, 0);
  if (cfg.extra) cfg.extra({ inner, at, mat, finMat });

  // --- pose ---
  const P0 = { swim: 0, swimAmt: 0.5, jaw: 0, stretch: 1, bend: 0, lookX: 0, lookY: 0, lid: 0.2, lidLow: 0, brow: 0, browAng: -0.5, cross: 0, eyeScale: 1, pec: 0, roll: 0 };
  const P = geo.attributes.position;
  const lat = (u, ph, amt, bend) => { const k = Math.pow(1 - u, 2); return (Math.sin(ph - (1 - u) * 4.5) * amt * 0.22 * L * k) + bend * L * 0.35 * k * k; };
  function pose(p = {}) {
    p = { ...P0, ...p };
    const st = p.stretch; inner.scale.set(1 / Math.sqrt(st), 1 / Math.sqrt(st), st);
    const ph = p.swim * Math.PI * 2;
    for (let i = 0; i < P.count; i++) {
      const u = base[i * 4 + 3], d = lat(u, ph, p.swimAmt, p.bend);
      if (cfg.horizontal) P.setXYZ(i, base[i * 4], base[i * 4 + 1] + d, base[i * 4 + 2]);
      else P.setXYZ(i, base[i * 4] + d, base[i * 4 + 1], base[i * 4 + 2]);
    }
    P.needsUpdate = true; geo.computeVertexNormals();
    // la nageoire caudale suit le bout de la queue
    const u0 = 0.01, d0 = lat(u0, ph, p.swimAmt, p.bend), d1 = lat(0.06, ph, p.swimAmt, p.bend), ang = Math.atan2(d1 - d0, 0.05 * L);
    if (cfg.horizontal) { flukeG.position.set(0, cfg.camber(u0) + d0, zOf(u0) + 0.02 * L); flukeG.rotation.set(ang, 0, 0); }
    else { flukeG.position.set(d0, cfg.camber(u0), zOf(u0) + 0.02 * L); flukeG.rotation.set(0, -ang, 0); }
    jaw.rotation.x = p.jaw * 0.85;
    pecs.forEach((g) => (g.rotation.z = g.userData.s * -(0.75 + p.pec + Math.sin(ph) * 0.12)));
    eyes.forEach((e, i) => poseEye(e, { lookX: p.lookX + (i ? -1 : 1) * p.cross, lookY: p.lookY, lid: p.lid, lidLow: p.lidLow, browY: p.brow, browAng: p.browAng, scale: p.eyeScale }));
    inner.rotation.z = p.roll;
  }
  pose();
  return { root, pose, L, parts: { inner, jaw }, mouthPos: () => new THREE.Vector3(0, cfg.mouthY(0.93), zOf(0.93)) };
}

export function createShark() {
  const R = 0.62;
  return swimmer({
    L: 3.6, R, w: 0.85, h: 1, top: 0x6d88a6, belly: 0xf2f5f8, finColor: 0x62809f, rough: 0.35,
    profile: (u) => R * Math.pow(Math.max(0, Math.sin(Math.PI * Math.min(0.999, Math.pow(u, 0.72)))), 0.62),
    camber: (u) => 0.08 * Math.sin(Math.PI * u),
    uMouth: 0.72, mouthY: (u) => -0.2 + 0.1 * Math.pow((1 - u) / 0.28, 2),
    teeth: 17, toothSize: 0.11,
    eyeU: 0.86, eyeTh: 0.45, eyeR: 0.12, eyeYaw: 0.55, iris: 0x1b1b1b,
    dorsalU: 0.55, dorsal: spline([[-0.5, 0], [-0.2, 0.4], [0.05, 0.85], [0.2, 0.7], [0.4, 0]]),
    pecU: 0.66, pec: [[0, 0.12], [0.85, -0.42], [0.95, -0.3], [0.3, -0.12]],
    fluke: spline([[0.05, 0], [-0.25, 0.3], [-0.6, 0.95], [-0.42, 0.3], [-0.38, -0.05], [-0.55, -0.55], [-0.1, -0.1]]),
    extra: ({ inner, at, mat: m }) => { [-1, 1].forEach((s) => [0, 1, 2].forEach((i) => { const p = at(0.69 - i * 0.03, 0.05, 0.99); const g = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.22, 4, 6), m(0x3b4d63, 0.8)); g.position.set(p[0] * s, p[1], p[2]); g.rotation.z = 0.1 * s; inner.add(g); })); },
  });
}

export function createDolphin(top = 0x7fb0d8) {
  const R = 0.42;
  const bodyR = (u) => R * Math.pow(Math.max(0, Math.sin(Math.PI * Math.min(0.999, Math.pow(Math.min(u / 0.9, 1), 0.85)))), 0.6);
  const beakR = (u) => (u < 0.78 ? 0 : 0.34 * R * Math.pow(Math.max(0, Math.cos(((u - 0.78) / 0.22) * Math.PI / 2)), 0.45));
  return swimmer({
    L: 2.6, R, w: 0.9, h: 1, top, belly: 0xf3f8fc, finColor: 0x6f9fc7, rough: 0.25, horizontal: true,
    profile: (u) => Math.max(bodyR(u), beakR(u)),
    camber: (u) => 0.06 * Math.sin(Math.PI * u) - 0.16 * smooth(0.8, 0.9, u),
    uMouth: 0.8, mouthY: (u) => -0.16 * smooth(0.8, 0.9, u) - 0.03 + 0.06 * Math.pow(Math.max(0, (0.88 - u) / 0.08), 2),
    teeth: 0,
    eyeU: 0.79, eyeTh: 0.25, eyeR: 0.1, eyeYaw: 0.6, iris: 0x3a230f,
    dorsalU: 0.5, dorsal: spline([[-0.35, 0], [-0.1, 0.25], [0.12, 0.48], [0.12, 0.3], [0.28, 0]]),
    pecU: 0.66, pec: [[0, 0.08], [0.5, -0.32], [0.56, -0.22], [0.2, -0.08]],
    fluke: spline([[0.05, 0], [-0.15, 0.35], [-0.38, 0.55], [-0.32, 0.22], [-0.26, 0], [-0.32, -0.22], [-0.38, -0.55], [-0.15, -0.35]]),
  });
}

export function createOrca() {
  const R = 1.25;
  return swimmer({
    L: 7, R, w: 0.92, h: 1, top: 0x14161b, belly: 0xf4f6f8, finColor: 0x14161b, rough: 0.2, horizontal: true,
    profile: (u) => R * Math.pow(Math.max(0, Math.sin(Math.PI * Math.min(0.999, Math.pow(u, 0.62)))), 0.55),
    camber: (u) => 0.1 * Math.sin(Math.PI * u),
    uMouth: 0.76, mouthY: (u) => -0.25 + 0.18 * Math.pow((1 - u) / 0.24, 2) * 0.6,
    teeth: 15, toothSize: 0.16,
    eyeU: 0.85, eyeTh: 0.12, eyeR: 0.17, eyeYaw: 0.7, iris: 0x111111,
    patch: (u, th) => smooth(0.3, 0.12, Math.hypot((u - 0.77) * 4.0, (Math.sin(th) - 0.45) * 1.2)) * smooth(0.0, 0.4, Math.abs(Math.cos(th))) + smooth(-0.2, -0.5, Math.sin(th)) * smooth(0.25, 0.4, u) * smooth(0.98, 0.85, u),
    patchColor: 0xf4f6f8,
    dorsalU: 0.5, dorsal: spline([[-0.6, 0], [-0.3, 0.9], [0.0, 1.9], [0.15, 1.1], [0.55, 0]]),
    pecU: 0.66, pec: [[0, 0.2], [0.8, -0.75], [1.15, -0.55], [0.45, 0.1]],
    fluke: spline([[0.05, 0], [-0.35, 0.7], [-0.9, 1.25], [-0.75, 0.45], [-0.6, 0], [-0.75, -0.45], [-0.9, -1.25], [-0.35, -0.7]]),
  });
}
