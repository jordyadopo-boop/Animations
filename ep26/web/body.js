const SETS = {};
// ---------- helpers
function card(text, o = {}) {
  const w = o.w ?? 2.2, h = o.h ?? 0.42, c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * h / w);
  const g = c.getContext('2d');
  g.fillStyle = o.bg ?? 'rgba(14,10,8,0.82)'; g.strokeStyle = o.border ?? '#e0b070'; g.lineWidth = 8;
  g.beginPath(); g.roundRect(6, 6, c.width - 12, c.height - 12, 34); g.fill(); g.stroke();
  g.fillStyle = o.color ?? '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const lines = text.split('\n'); let fs = o.font ?? Math.min(110, c.height / (lines.length * 1.3));
  g.font = `bold ${fs}px Inter`;
  const mw = Math.max(...lines.map(l => g.measureText(l).width)); if (mw > c.width * 0.9) { fs = fs * c.width * 0.9 / mw; g.font = `bold ${fs}px Inter`; }
  lines.forEach((l, i) => { if (i > 0 && o.small) { g.font = `600 ${fs * 0.72}px Inter`; g.fillStyle = o.subColor ?? '#e2dccf'; } g.fillText(l, c.width / 2, c.height / 2 + (i - (lines.length - 1) / 2) * fs * 1.18); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false, fog: false, toneMapped: false, color: new THREE.Color(0.85, 0.85, 0.85) })); mesh.renderOrder = 20; return mesh;
}
function camCard(cam, c, frac = 0.86, yf = 0.36) {
  const w = c.geometry.parameters.width, th = Math.tan(cam.fov * Math.PI / 360), d = w / (frac * 2 * th * cam.aspect);
  const dir = new THREE.Vector3(); cam.getWorldDirection(dir); const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
  c.position.copy(cam.position).addScaledVector(dir, d).addScaledVector(up, d * th * yf); c.quaternion.copy(cam.quaternion);
}
function cardsMgr(scene, cam) {
  const cards = [];
  const K = (text, o, show, yf = -0.55, frac = 0.82) => { const c = card(text, o); scene.add(c); cards.push([c, show, yf, frac]); return c; };
  K.update = (t) => cards.forEach(([c, show, yf, frac]) => { fade(c, show(t)); camCard(cam, c, frac, yf); });
  return K;
}
const imagined = (K, text, a, b) => K(text, { w: 0.9, h: 0.2, border: '#ffd070', color: '#ffe0a0' }, t => win(t, a, b, 0.2, 0.2), -0.42, 0.42);
function studioBase(o = {}) {
  const B = base({ bg: 0x07060c, fog: [0x07060c, 8, 30], hemi: [0xb0a8c8, 0x18141c, 1.0], sun: [0xffffff, 1.0, [2, 5, 4]], shadow: false, bloom: [0.5, 0.5, 0.82], ...o });
  const grid = new THREE.GridHelper(40, 40, new THREE.Color(0xd99a57).multiplyScalar(0.9), new THREE.Color(0xd99a57).multiplyScalar(0.25)); B.scene.add(grid);
  return B;
}
// eclairage de face pour les visages
function faceLight(scene, pos, k = 1.6, c = 0xfff0e0) { const l = new THREE.PointLight(c, k, 4, 1.2); l.position.set(...pos); scene.add(l); return l; }
const imagined2 = imagined;
// ---------- l'espace
function spaceBase(o = {}) {
  const B = base({ bg: 0x020308, hemi: [0x8090c0, 0x050508, 0.5], sun: [0xffffff, 0.8, [3, 4, 5]], shadow: false, bloom: o.bloom ?? [0.45, 0.4, 0.82], exposure: o.exposure ?? 1.0 });
  B.scene.add(L.stars(1500, 300, 1.4));
  return B;
}
function asteroid(scene, pos, s = 1) {
  const geo = new THREE.IcosahedronGeometry(0.6, 1); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const k = 0.85 + 0.3 * hash(Math.round(p.getX(i) * 9) * 7 + Math.round(p.getY(i) * 9) * 13 + Math.round(p.getZ(i) * 9)); p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.45, p.getZ(i) * k); }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, M(0x5a5560)); m.position.set(...pos); m.scale.setScalar(s); scene.add(m); return m;
}
// trou noir : sphere noire, anneau de photons, disque d'accretion en particules
function blackHole(R = 0.5, n = 900) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 20), new THREE.MeshBasicMaterial({ color: 0x000000 })); g.add(core);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 1.08, R * 0.04, 8, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc080).multiplyScalar(1.3), transparent: true })); g.add(ring);
  const geo = new THREE.BufferGeometry(); const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), seeds = [];
  for (let i = 0; i < n; i++) { const r = R * (1.4 + 2.6 * Math.pow(hash(i * 3.1), 1.6)); seeds.push([r, hash(i * 7.3) * Math.PI * 2, (hash(i * 1.7) - 0.5) * 0.06 * r]); const c = new THREE.Color().setHSL(0.07 + 0.06 * hash(i), 1, 0.45 + 0.35 * (1 - (r / R - 1.4) / 2.6)); col.set([c.r * 1.2, c.g * 1.2, c.b * 1.2], i * 3); }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.022, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); g.add(pts);
  g.userData = { core, ring, pts, seeds, R };
  // dir = +1 : la matiere tombe en spirale ; dir = -1 : film a l'envers, elle ressort
  g.userData.update = (t, dir = 1) => {
    const a = geo.attributes.position.array;
    seeds.forEach(([r0, ph, h], i) => {
      const life = ((dir > 0 ? t * 0.08 : -t * 0.08) + hash(i * 5.5)) % 1; const u = (life + 1) % 1;
      const r = R * 1.05 + (r0 - R * 1.05) * (1 - u * 0.85); const ang = ph + (t * 1.2 * dir) * Math.pow(R / r, 1.5) * 2;
      a[i * 3] = Math.cos(ang) * r; a[i * 3 + 1] = h * (r / r0); a[i * 3 + 2] = Math.sin(ang) * r;
    });
    geo.attributes.position.needsUpdate = true;
  };
  return g;
}
// trou blanc : coeur eblouissant, rayons et particules qui jaillissent
function whiteHole(R = 0.45, n = 700) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(1.4) })); g.add(core);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.6, 32, 20), new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(halo);
  const geo = new THREE.BufferGeometry(); const pos = new Float32Array(n * 3), dirs = [];
  for (let i = 0; i < n; i++) { const th = hash(i * 2.3) * Math.PI * 2, z = hash(i * 4.1) * 2 - 1, s = Math.sqrt(1 - z * z); dirs.push(new THREE.Vector3(Math.cos(th) * s, z * 0.6, Math.sin(th) * s).normalize()); }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.025, color: new THREE.Color(0xdff4ff).multiplyScalar(1.1), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); g.add(pts);
  const rays = []; for (let i = 0; i < 14; i++) { const r = new THREE.Mesh(new THREE.ConeGeometry(0.05, 2.4, 4, 1, true), new THREE.MeshBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false })); r.geometry.translate(0, 1.2, 0); r.lookAt(dirs[i * 37 % n]); r.rotateX(Math.PI / 2); g.add(r); rays.push(r); }
  g.userData = { core, halo, pts, rays, R };
  g.userData.update = (t, k = 1) => {
    const a = geo.attributes.position.array;
    dirs.forEach((d, i) => { const u = (t * 0.25 + hash(i * 9.1)) % 1; const r = R + u * 3.2 * k; a[i * 3] = d.x * r; a[i * 3 + 1] = d.y * r; a[i * 3 + 2] = d.z * r; });
    geo.attributes.position.needsUpdate = true; pts.material.opacity = 0.9 * k;
    halo.scale.setScalar(1 + 0.06 * Math.sin(t * 5)); rays.forEach((r, i) => r.material.opacity = (0.08 + 0.06 * Math.sin(t * 3 + i)) * k);
  };
  return g;
}
function claudeOnRock(scene, pos, ry = 0, color = 0x55e6ff) {
  asteroid(scene, [pos[0], pos[1] - 0.12, pos[2]], 0.55);
  return claudeRig(scene, pos, ry, [0.42, 0, 0.0], color, 0.45, 0.28);
}

// ---------- intro : un trou noir… puis son contraire
SETS.intro = () => {
  const B = spaceBase(); const { scene, cam } = B;
  const bh = blackHole(0.55); bh.rotation.x = 0.35; scene.add(bh);
  const wh = whiteHole(0.45); scene.add(wh);
  const flash = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); scene.add(flash);
  return {
    ...B, update(t) {
      const sw = sstep(5.3, 5.9, t);
      bh.visible = sw < 0.5; wh.visible = sw >= 0.5;
      bh.userData.update(t, 1); wh.userData.update(t, sstep(5.6, 7.0, t));
      flash.material.opacity = 0.8 * win(t, 5.2, 6.2, 0.3, 0.7); flash.scale.setScalar(0.5 + 3 * sstep(5.2, 6.2, t));
      camKeys(cam, t, [{ t: 0, p: [0, 1.3, 6.2], l: [0, 0, 0], f: 46 }, { t: 5.2, p: [0.3, 0.8, 5.0], l: [0, 0, 0], f: 46 }, { t: C.title, p: [0, 0.5, 7.0], l: [0, 0.2, 0], f: 50 }, { t: SC.noir.start, p: [0, 0.5, 7.4], l: [0, 0.2, 0], f: 50 }]);
    }
  };
};

// ---------- le trou noir, puis le film a l'envers
SETS.noir = () => {
  const B = spaceBase(); const { scene, cam } = B;
  const bh = blackHole(0.6, 1100); bh.rotation.x = 0.3; scene.add(bh);
  const wh = whiteHole(0.5); scene.add(wh);
  const rig = claudeOnRock(scene, [1.4, -0.9, 1.6], -0.6);
  const rew = label('◀◀', { w: 0.5, h: 0.25, color: '#7dd8ff', font: 'bold 200px Inter' }); rig.holoG.add(rew);
  const K = cardsMgr(scene, cam);
  K('TROU NOIR\nmême la lumière ne s\'en échappe pas', { w: 1.6, h: 0.42, border: '#ffb070', small: true }, t => win(t, SC.noir.start + 1.0, SC.noir.start + 5.5, 0.3, 0.2), -0.55);
  K('2019 · première image\nde l\'ombre d\'un trou noir (M87*)', { w: 1.6, h: 0.42, border: '#ffb070', small: true }, t => win(t, SC.noir.start + 5.7, SC.envers.start, 0.3, 0.2), -0.55);
  K('TROU BLANC\nrien n\'entre · tout sort', { w: 1.6, h: 0.42, border: '#bfe8ff', small: true }, t => win(t, C.blanc + 1.5, SC.pont.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const rk = win(t, SC.envers.start + 0.5, C.blanc + 0.3, 0.3, 0.3);
      const rev = sstep(SC.envers.start + 1.0, C.blanc - 0.3, t);
      const toWhite = sstep(C.blanc - 0.4, C.blanc + 0.2, t);
      bh.visible = toWhite < 0.5; wh.visible = !bh.visible;
      bh.userData.update(t, rev > 0.5 ? -1.6 : 1); wh.userData.update(t, sstep(C.blanc, C.blanc + 1.5, t));
      beamOn(rig, rk, t); fade(rew, rk * (0.6 + 0.4 * Math.sin(t * 8))); rew.lookAt(cam.position);
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: SC.noir.start, p: [0.0, 1.2, 5.6], l: [0, 0, 0], f: 46 }, { t: SC.envers.start, p: [0.6, 0.5, 5.8], l: [0.5, -0.2, 0.6], f: 48 }, { t: C.blanc, p: [0.4, 0.6, 6.0], l: [0.3, -0.1, 0.4], f: 48 }, { t: SC.pont.start, p: [0.0, 0.7, 6.0], l: [0, 0, 0], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- le pont d'Einstein-Rosen (hologramme)
SETS.pont = () => {
  const B = spaceBase({ bloom: [0.45, 0.4, 0.82] }); const { scene, cam } = B;
  const pts = []; for (let i = 0; i <= 24; i++) { const y = -1.2 + i / 24 * 2.4; pts.push(new THREE.Vector2(0.25 + 0.5 * y * y, y)); }
  const geo = new THREE.LatheGeometry(pts, 40);
  const wm = new THREE.LineSegments(new THREE.WireframeGeometry(geo), new THREE.LineBasicMaterial({ color: new THREE.Color(0x7dd8ff).multiplyScalar(1.4), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
  const worm = new THREE.Group(); worm.add(wm); worm.rotation.z = Math.PI / 2; worm.position.set(0, 0.3, 0); scene.add(worm);
  const bhS = blackHole(0.18, 300); bhS.position.set(-1.2, 0.3, 0); bhS.rotation.z = Math.PI / 2; scene.add(bhS);
  const whS = whiteHole(0.14, 250); whS.position.set(1.2, 0.3, 0); scene.add(whS);
  const l1 = label('trou noir', { w: 0.7, h: 0.14, color: '#ffb070', font: 'bold 100px Inter' }); l1.position.set(-1.2, -0.75, 0.3); scene.add(l1);
  const l2 = label('trou blanc', { w: 0.7, h: 0.14, color: '#dff4ff', font: 'bold 100px Inter' }); l2.position.set(1.2, -0.75, 0.3); scene.add(l2);
  const rig = claudeOnRock(scene, [0.0, -1.3, 1.6], 0.0);
  const K = cardsMgr(scene, cam);
  K('1935 · Einstein et Rosen\nun « pont » entre deux régions de l\'espace', { w: 1.6, h: 0.42, border: '#7dd8ff', small: true }, t => win(t, SC.pont.start + 1.0, C.novikov, 0.3, 0.2), 0.42);
  K('années 1960 · Novikov et Ne\'eman\n« ils existent peut-être »', { w: 1.6, h: 0.42, border: '#dff4ff', small: true }, t => win(t, C.novikov + 0.6, SC.instable.start, 0.3, 0.2), 0.42);
  return {
    ...B, update(t) {
      const T0 = SC.pont.start;
      worm.rotation.x = t * 0.3; fade(worm, sstep(T0 + 0.5, T0 + 2.0, t));
      bhS.userData.update(t, 1); whS.userData.update(t, 0.4);
      const sk = sstep(T0 + 7.0, T0 + 8.0, t); bhS.visible = whS.visible = sk > 0.02; fade(l1, sk); fade(l2, sstep(T0 + 9.0, T0 + 10.0, t));
      beamOn(rig, 1, t); rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0, 0.6, 7.0], l: [0, -0.1, 0], f: 50 }, { t: SC.instable.start, p: [0.4, 0.4, 6.6], l: [0, -0.15, 0], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- instable : un grain de matiere, et le trou blanc se referme
SETS.instable = () => {
  const B = spaceBase(); const { scene, cam } = B;
  const wh = whiteHole(0.5); scene.add(wh); const bh = blackHole(0.55); bh.rotation.x = 0.3; scene.add(bh);
  const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), M(0x8a8a90)); scene.add(rock);
  const flash = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); scene.add(flash);
  const K = cardsMgr(scene, cam);
  K('jamais observé', { w: 1.6, h: 0.28, border: '#ff9a6a' }, t => win(t, SC.instable.start + 0.5, SC.instable.start + 3.0, 0.3, 0.2), -0.55);
  K('1974 · Douglas Eardley\nun trou blanc serait instable', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.instable.start + 3.2, SC.grb.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.instable.start, hit = T0 + 7.6;
      const u = sstep(T0 + 4.0, hit, t); rock.position.set(lerp(2.2, 0.0, u), lerp(1.4, 0.0, u), lerp(1.0, 0.0, u)); rock.visible = t < hit; rock.rotation.set(t * 2, t * 3, 0);
      const done = t > hit + 0.25; wh.visible = !done; bh.visible = done;
      wh.userData.update(t, 1); bh.userData.update(t, 1);
      flash.material.opacity = 0.55 * win(t, hit - 0.1, hit + 0.6, 0.1, 0.5); flash.scale.setScalar(0.5 + 1.0 * sstep(hit - 0.1, hit + 0.6, t));
      camKeys(cam, t, [{ t: T0, p: [0, 0.9, 6.4], l: [0, 0, 0], f: 48 }, { t: hit, p: [0.6, 0.6, 5.0], l: [0.3, 0.1, 0], f: 48 }, { t: SC.grb.start, p: [0.2, 0.8, 5.6], l: [0, 0, 0], f: 48 }]);
      K.update(t);
    }
  };
};

// ---------- GRB 060614 : un eclair gamma dans le ciel
SETS.grb = () => {
  const B = spaceBase({ bloom: [0.6, 0.5, 0.75] }); const { scene, cam } = B;
  const sat = new THREE.Group(); sat.position.set(0.0, 0.0, 1.6); scene.add(sat);
  sat.add(box(0.3, 0.22, 0.22, M(0xd8d8e0))); for (const s of [-1, 1]) sat.add(at(box(0.5, 0.01, 0.2, M(0x2a4a8a, { emissive: new THREE.Color(0x0a1a3a) })), s * 0.42, 0, 0)); sat.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.12, 10), M(0x9aa0aa)), 0, 0, -0.16).rotateX(Math.PI / 2));
  const burst = new THREE.Group(); burst.position.set(-0.6, 1.4, -8); scene.add(burst);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xc8a0ff).multiplyScalar(2.5) })); burst.add(core);
  for (const s of [-1, 1]) { const j = new THREE.Mesh(new THREE.ConeGeometry(0.35, 6, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xb08aff, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false })); j.geometry.translate(0, -3, 0); j.rotation.z = s > 0 ? Math.PI : 0; j.rotation.x = 0.4; burst.add(j); }
  const q = label('trou blanc ?', { w: 1.2, h: 0.22, color: '#dff4ff', font: 'bold 120px Inter' }); q.position.set(-0.6, 0.5, -6); scene.add(q);
  const K = cardsMgr(scene, cam);
  K('GRB 060614 · 14 juin 2006\nlong éclair gamma, sans supernova', { w: 1.6, h: 0.42, border: '#b08aff', small: true }, t => win(t, SC.grb.start + 1.5, SC.grb.start + 6.5, 0.3, 0.2), -0.55);
  K('HYPOTHÈSE', { w: 1.2, h: 0.3, border: '#ffd070', color: '#ffe070' }, t => win(t, SC.grb.start + 7.0, SC.rovelli.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.grb.start;
      const k = win(t, T0 + 1.0, T0 + 8.5, 0.2, 2.5) * (0.85 + 0.15 * Math.sin(t * 20)); burst.scale.setScalar(0.3 + 0.9 * k); fade(burst, k);
      fade(q, win(t, T0 + 6.0, SC.rovelli.start, 0.4, 0.3)); q.lookAt(cam.position);
      sat.rotation.y = 0.3 * Math.sin(t * 0.4) + 0.5;
      camKeys(cam, t, [{ t: T0, p: [0.6, 0.4, 3.4], l: [-0.2, 0.6, -4], f: 50 }, { t: SC.rovelli.start, p: [0.4, 0.3, 3.2], l: [-0.3, 0.8, -4], f: 50 }]);
      K.update(t);
    }
  };
};

// ---------- Rovelli : le rebond ; matiere noire ; Big Bang
SETS.rovelli = () => {
  const B = spaceBase(); const { scene, cam } = B;
  const bh = blackHole(0.55); bh.rotation.x = 0.3; scene.add(bh); const wh = whiteHole(0.4); scene.add(wh);
  const dots = []; for (let i = 0; i < 80; i++) { const d = new THREE.Mesh(new THREE.IcosahedronGeometry(0.02, 0), G(0xdff4ff, 2.2)); d.position.set((hash(i) - 0.5) * 6, (hash(i * 3) - 0.5) * 4, (hash(i * 7) - 0.5) * 4); scene.add(d); dots.push(d); }
  const galaxies = []; for (let i = 0; i < 40; i++) { const gx = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05 + hash(i) * 0.05, 0), G([0xffd0a0, 0xa0c8ff, 0xffffff][i % 3], 1.8)); scene.add(gx); galaxies.push([gx, new THREE.Vector3(hash(i * 2) - 0.5, hash(i * 5) - 0.5, hash(i * 9) - 0.5).normalize()]); }
  const rig = claudeOnRock(scene, [1.3, -1.0, 1.7], -0.6, 0xffd070);
  const K = cardsMgr(scene, cam);
  K('Carlo Rovelli et coll. (2014)\nun trou noir qui « rebondit » en trou blanc', { w: 1.6, h: 0.42, border: '#ffd070', small: true }, t => win(t, SC.rovelli.start + 1.0, C.matiere, 0.3, 0.2), -0.55);
  K('HYPOTHÈSE · de minuscules trous blancs\ndans la matière noire ?', { w: 1.6, h: 0.42, border: '#dff4ff', small: true }, t => win(t, C.matiere + 0.5, C.bigbang, 0.3, 0.2), -0.55);
  K('SPÉCULATION\nle Big Bang, un trou blanc ?', { w: 1.6, h: 0.42, border: '#ff9a6a', small: true }, t => win(t, C.bigbang + 1.0, SC.fin.start, 0.3, 0.2), -0.55);
  return {
    ...B, update(t) {
      const T0 = SC.rovelli.start;
      const shrink = sstep(T0 + 1.5, T0 + 5.0, t), bounce = t > T0 + 5.2;
      bh.visible = !bounce && t < C.bigbang; bh.scale.setScalar(1 - 0.8 * shrink); bh.userData.update(t, 1);
      wh.visible = bounce && t < C.matiere + 0.5; wh.userData.update(t, sstep(T0 + 5.2, T0 + 6.2, t));
      dots.forEach((d, i) => fade(d, win(t, C.matiere, C.bigbang, 0.4 + (i % 5) * 0.1, 0.4) * (0.6 + 0.4 * Math.sin(t * 3 + i))));
      const bb = sstep(C.bigbang, C.bigbang + 4.0, t);
      galaxies.forEach(([gx, d], i) => { gx.position.copy(d).multiplyScalar(0.1 + bb * (1.5 + hash(i) * 2.5)); gx.visible = t > C.bigbang; });
      rig.c.update(t, env('claude', t), {});
      camKeys(cam, t, [{ t: T0, p: [0, 0.9, 6.0], l: [0, 0, 0], f: 48 }, { t: C.matiere, p: [0.3, 0.5, 6.5], l: [0, 0, 0], f: 50 }, { t: C.bigbang, p: [0.3, 0.5, 6.5], l: [0, 0, 0], f: 50 }, { t: SC.fin.start, p: [0, 0.4, 7.5], l: [0, 0, 0], f: 52 }]);
      K.update(t);
    }
  };
};

// ---------- fin
SETS.fin = () => {
  const B = spaceBase(); const { scene, cam } = B;
  const wh = whiteHole(0.08, 200); wh.position.set(-0.3, 0.9, -3); scene.add(wh);
  const rig = claudeOnRock(scene, [0, -0.2, 1.0], 0.0);
  const qm = label('?', { w: 0.3, h: 0.3, color: '#dff4ff', font: 'bold 300px Inter' }); rig.holoG.add(qm);
  return {
    ...B, update(t) {
      wh.userData.update(t, 0.5); wh.scale.setScalar(1 + 0.2 * Math.sin(t * 4));
      const qk = sstep(C.question, C.question + 0.5, t); beamOn(rig, qk, t); fade(qm, qk); qm.lookAt(cam.position);
      rig.c.update(t, env('claude', t), { wave: sstep(TL.duration - 2.0, TL.duration - 1.5, t) });
      camKeys(cam, t, [{ t: SC.fin.start, p: [0.2, 0.7, 4.8], l: [0, 0.5, 0], f: 46 }, { t: TL.duration, p: [0.2, 0.6, 4.2], l: [0, 0.4, 0.5], f: 46 }]);
    }
  };
};

const SHOTS = [
  ['intro', 0, SC.noir.start], ['noir', SC.noir.start, SC.pont.start], ['pont', SC.pont.start, SC.instable.start], ['instable', SC.instable.start, SC.grb.start],
  ['grb', SC.grb.start, SC.rovelli.start], ['rovelli', SC.rovelli.start, SC.fin.start], ['fin', SC.fin.start, 1000],
];
