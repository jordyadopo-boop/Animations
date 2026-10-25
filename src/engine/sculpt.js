// Personnages « sculptés » : une seule surface organique continue, définie par des formes (ellipsoïdes,
// cônes arrondis, gélules) fondues entre elles (union douce), creusées (orbites, bouche) et peintes
// (masque, ventre…). Les formes sont accrochées aux os d'un squelette ; à chaque image la surface est
// recalculée (champ de distance + « surface nets »), ce qui donne l'effet pâte à modeler qui bouge.
import * as THREE from 'three';

// ---- distances signées (Inigo Quilez) ----
function sdEllipsoid(x, y, z, a, b, c) {
  const k0 = Math.sqrt((x / a) ** 2 + (y / b) ** 2 + (z / c) ** 2);
  const k1 = Math.sqrt((x / (a * a)) ** 2 + (y / (b * b)) ** 2 + (z / (c * c)) ** 2);
  return k1 < 1e-9 ? -Math.min(a, b, c) : (k0 * (k0 - 1)) / k1;
}
// cône arrondi le long de +y : sphère r1 en 0, sphère r2 en (0,h,0)
function sdRoundCone(x, y, z, r1, r2, h) {
  const q = Math.sqrt(x * x + z * z);
  const b = (r1 - r2) / h, a = Math.sqrt(Math.max(0, 1 - b * b));
  const k = q * -b + y * a;
  if (k < 0) return Math.sqrt(q * q + y * y) - r1;
  if (k > a * h) return Math.sqrt(q * q + (y - h) ** 2) - r2;
  return q * a + y * b - r1;
}
const smin = (a, b, k) => { if (k <= 0) return Math.min(a, b); const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
const smax = (a, b, k) => -smin(-a, -b, k);

// Forme : { bone, type: 'ell'|'cone', size, pos, rot, blend, color, op: 'add'|'sub'|'paint', sharp }
export class Sculpture {
  constructor({ cell = 0.008, color = 0x888888, material } = {}) {
    this.cell = cell; this.prims = []; this.baseColor = new THREE.Color(color);
    this.geometry = new THREE.BufferGeometry();
    this.cap = 0; this._alloc(150000);
    this.mesh = new THREE.Mesh(this.geometry, material || new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.85, sheen: 0.35, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xd8d0c4) }));
    this.mesh.castShadow = true; this.mesh.receiveShadow = true; this.mesh.frustumCulled = false;
    this._m = new THREE.Matrix4(); this._inv = new THREE.Matrix4(); this._v = new THREE.Vector3();
  }
  _alloc(n) {
    const op = this.pos, oc = this.col;
    this.cap = n;
    this.pos = new Float32Array(n * 3); this.col = new Float32Array(n * 3); this.idx = new Uint32Array(n * 6);
    if (op) { this.pos.set(op); this.col.set(oc); }
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.geometry.setIndex(new THREE.BufferAttribute(this.idx, 1));
  }
  add(bone, type, size, opts = {}) {
    const p = { bone, type, size, pos: opts.pos || [0, 0, 0], rot: opts.rot || [0, 0, 0], blend: opts.blend ?? 0.03, op: opts.op || 'add',
      color: new THREE.Color(opts.color ?? this.baseColor), sharp: opts.sharp ?? 0.02, local: new THREE.Matrix4() };
    p.local.compose(new THREE.Vector3(...p.pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rot)), new THREE.Vector3(1, 1, 1));
    p.inv = new Float64Array(12); p.bound = type === 'cone' ? Math.max(size[0], size[1]) + size[2] : Math.max(...size);
    this.prims.push(p); return p;
  }

  // distance + (optionnel) couleur au point (x,y,z) de l'espace du personnage
  _eval(x, y, z, list) {
    let d = 1e9, dsub = -1e9;
    for (const p of list) {
      if (p.op === 'paint') continue;
      const m = p.inv, lx = m[0] * x + m[1] * y + m[2] * z + m[3], ly = m[4] * x + m[5] * y + m[6] * z + m[7], lz = m[8] * x + m[9] * y + m[10] * z + m[11];
      const s = p.type === 'cone' ? sdRoundCone(lx, ly, lz, p.size[0], p.size[1], p.size[2]) : sdEllipsoid(lx, ly, lz, p.size[0], p.size[1], p.size[2]);
      if (p.op === 'add') d = smin(d, s, p.blend); else d = smax(d, -s, p.blend);
    }
    return d;
  }
  _primDist(p, x, y, z) {
    const m = p.inv, lx = m[0] * x + m[1] * y + m[2] * z + m[3], ly = m[4] * x + m[5] * y + m[6] * z + m[7], lz = m[8] * x + m[9] * y + m[10] * z + m[11];
    return p.type === 'cone' ? sdRoundCone(lx, ly, lz, p.size[0], p.size[1], p.size[2]) : sdEllipsoid(lx, ly, lz, p.size[0], p.size[1], p.size[2]);
  }

  // Recalcule la surface. root : objet dont l'espace sert de repère (le personnage)
  update(root) {
    root.updateMatrixWorld(true);
    // ordre d'évaluation : ajouts puis creusements
    this.prims.sort((a, b) => (a.op === 'sub') - (b.op === 'sub'));
    const rootInv = this._inv.copy(root.matrixWorld).invert();
    const lo = new THREE.Vector3(1e9, 1e9, 1e9), hi = new THREE.Vector3(-1e9, -1e9, -1e9), c = this._v;
    for (const p of this.prims) {
      this._m.multiplyMatrices(rootInv, p.bone.matrixWorld).multiply(p.local);
      c.setFromMatrixPosition(this._m); p.center = c.clone();
      const sc = new THREE.Vector3().setFromMatrixScale(this._m); p.scl = Math.min(sc.x, sc.y, sc.z);
      const inv = this._m.clone().invert().elements; // colonne-major -> lignes
      p.inv[0] = inv[0]; p.inv[1] = inv[4]; p.inv[2] = inv[8]; p.inv[3] = inv[12];
      p.inv[4] = inv[1]; p.inv[5] = inv[5]; p.inv[6] = inv[9]; p.inv[7] = inv[13];
      p.inv[8] = inv[2]; p.inv[9] = inv[6]; p.inv[10] = inv[10]; p.inv[11] = inv[14];
      p.bound = p.type === 'cone' ? Math.max(p.size[0], p.size[1]) + p.size[2] : Math.max(...p.size);
      p.R = (p.bound + p.blend) * Math.max(1, 1 / p.scl);
      if (p.op === 'add') { lo.min(c.clone().subScalar(p.R)); hi.max(c.clone().addScalar(p.R)); }
    }
    const h = this.cell, B = 4;
    lo.subScalar(2 * h); hi.addScalar(2 * h);
    const nx = Math.ceil((hi.x - lo.x) / h / B) * B + 1, ny = Math.ceil((hi.y - lo.y) / h / B) * B + 1, nz = Math.ceil((hi.z - lo.z) / h / B) * B + 1;
    const N = nx * ny * nz, F = this._field && this._field.length >= N ? this._field : (this._field = new Float32Array(N));
    const id = (i, j, k) => i + nx * (j + ny * k);
    // 1) grille grossière + liste des formes utiles par bloc
    const bx = (nx - 1) / B, by = (ny - 1) / B, bz = (nz - 1) / B, blockR = B * h * 0.9;
    for (let K = 0; K < bz; K++) for (let J = 0; J < by; J++) for (let I = 0; I < bx; I++) {
      const cx = lo.x + (I + 0.5) * B * h, cy = lo.y + (J + 0.5) * B * h, cz = lo.z + (K + 0.5) * B * h;
      const list = this.prims.filter((p) => p.op !== 'paint' && Math.hypot(p.center.x - cx, p.center.y - cy, p.center.z - cz) < p.R + blockR + 0.02);
      const dc = list.length ? this._eval(cx, cy, cz, list) : 1;
      const near = Math.abs(dc) < blockR + 2 * h;
      for (let k = 0; k <= B; k++) for (let j = 0; j <= B; j++) for (let i = 0; i <= B; i++) {
        const gi = I * B + i, gj = J * B + j, gk = K * B + k;
        F[id(gi, gj, gk)] = near ? this._eval(lo.x + gi * h, lo.y + gj * h, lo.z + gk * h, list) : dc;
      }
    }
    // 2) surface nets : un sommet par cellule traversée, un quad par arête traversée
    const vid = this._vid && this._vid.length >= N ? this._vid : (this._vid = new Int32Array(N));
    let nv = 0, ni = 0;
    const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
    const CO = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
    const v8 = new Float32Array(8);
    for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      let mask = 0;
      for (let q = 0; q < 8; q++) { v8[q] = F[id(i + CO[q][0], j + CO[q][1], k + CO[q][2])]; if (v8[q] < 0) mask |= 1 << q; }
      if (mask === 0 || mask === 255) { vid[id(i, j, k)] = -1; continue; }
      let sx = 0, sy = 0, sz = 0, cnt = 0;
      for (const [a, b] of E) {
        if ((v8[a] < 0) === (v8[b] < 0)) continue;
        const t = v8[a] / (v8[a] - v8[b]);
        sx += CO[a][0] + (CO[b][0] - CO[a][0]) * t; sy += CO[a][1] + (CO[b][1] - CO[a][1]) * t; sz += CO[a][2] + (CO[b][2] - CO[a][2]) * t; cnt++;
      }
      if (nv >= this.cap) this._alloc(this.cap * 2);
      this.pos[nv * 3] = lo.x + (i + sx / cnt) * h; this.pos[nv * 3 + 1] = lo.y + (j + sy / cnt) * h; this.pos[nv * 3 + 2] = lo.z + (k + sz / cnt) * h;
      vid[id(i, j, k)] = nv++;
    }
    for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
      const a = F[id(i, j, k)] < 0;
      // arête +x
      if (a !== (F[id(i + 1, j, k)] < 0)) { const q = [vid[id(i, j - 1, k - 1)], vid[id(i, j, k - 1)], vid[id(i, j, k)], vid[id(i, j - 1, k)]]; ni = this._quad(q, a, ni); }
      if (a !== (F[id(i, j + 1, k)] < 0)) { const q = [vid[id(i - 1, j, k - 1)], vid[id(i - 1, j, k)], vid[id(i, j, k)], vid[id(i, j, k - 1)]]; ni = this._quad(q, a, ni); }
      if (a !== (F[id(i, j, k + 1)] < 0)) { const q = [vid[id(i - 1, j - 1, k)], vid[id(i, j - 1, k)], vid[id(i, j, k)], vid[id(i - 1, j, k)]]; ni = this._quad(q, a, ni); }
    }
    // 3) couleurs : mélange doux des couleurs des formes proches + peintures
    const tmp = new THREE.Color();
    for (let v = 0; v < nv; v++) {
      const x = this.pos[v * 3], y = this.pos[v * 3 + 1], z = this.pos[v * 3 + 2];
      let r = 0, g = 0, b = 0, w = 0;
      for (const p of this.prims) {
        if (p.op !== 'add') continue;
        if (Math.hypot(p.center.x - x, p.center.y - y, p.center.z - z) > p.R + 0.05) continue;
        const d = this._primDist(p, x, y, z), ww = Math.exp(-Math.max(d, 0) / p.sharp) + 1e-6;
        r += p.color.r * ww; g += p.color.g * ww; b += p.color.b * ww; w += ww;
      }
      tmp.setRGB(w ? r / w : this.baseColor.r, w ? g / w : this.baseColor.g, w ? b / w : this.baseColor.b);
      for (const p of this.prims) {
        if (p.op !== 'paint') continue;
        const d = this._primDist(p, x, y, z); if (d > p.sharp) continue;
        tmp.lerp(p.color, Math.min(1, (p.sharp - d) / (2 * p.sharp)));
      }
      // léger grain pour casser l'aspect plastique
      const n = (Math.sin(x * 431.7 + y * 913.1 + z * 271.3) * 43758.5) % 1 * 0.06;
      this.col[v * 3] = tmp.r * (0.97 + n); this.col[v * 3 + 1] = tmp.g * (0.97 + n); this.col[v * 3 + 2] = tmp.b * (0.97 + n);
    }
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.geometry.setIndex(new THREE.BufferAttribute(this.idx.subarray(0, ni), 1));
    this.geometry.computeVertexNormals();
    this.geometry.computeBoundingSphere();
    return { verts: nv, tris: ni / 3 };
  }
  _quad(q, flip, ni) {
    if (q[0] < 0 || q[1] < 0 || q[2] < 0 || q[3] < 0) return ni;
    if (ni + 6 > this.idx.length) return ni;
    const [a, b, c, d] = flip ? q : [q[0], q[3], q[2], q[1]];
    this.idx[ni++] = a; this.idx[ni++] = b; this.idx[ni++] = c; this.idx[ni++] = a; this.idx[ni++] = c; this.idx[ni++] = d;
    return ni;
  }
}
