// Briques communes aux personnages : sphères, gélules, yeux globuleux expressifs.
import * as THREE from 'three';

export const mat = (color, roughness = 0.75, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });

export function sph(r, material, s = [1, 1, 1], p = [0, 0, 0], seg = 28) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7)), material);
  m.scale.set(...s); m.position.set(...p); m.castShadow = true; m.receiveShadow = true; return m;
}
export function cap(r, len, material, p = [0, 0, 0], rot = [0, 0, 0]) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 16), material);
  m.position.set(...p); m.rotation.set(...rot); m.castShadow = true; m.receiveShadow = true; return m;
}
export function group(p = [0, 0, 0], ...children) { const g = new THREE.Group(); g.position.set(...p); children.forEach((c) => g.add(c)); return g; }

// Œil globuleux : blanc + iris + pupille + reflet + paupière (fermeture 0..1) + sourcil
const WHITE = mat(0xffffff, 0.25), PUPIL = mat(0x0b0b0b, 0.2), GLINT = new THREE.MeshBasicMaterial({ color: 0xffffff });
export function makeEye(r, lidMat, irisColor, browMat, side = 1, irisScale = 1) {
  const g = new THREE.Group();
  g.add(sph(r, WHITE, [1, 1, 1], [0, 0, 0], 32));
  const look = new THREE.Group(); g.add(look);
  const ir = 0.52 * irisScale, pr = 0.3 * irisScale, front = (k) => r * Math.sqrt(Math.max(0.05, 1 - k * k));
  const iris = sph(r * ir, mat(irisColor, 0.3), [1, 1, 0.45], [0, 0, front(ir) * 0.98], 24); look.add(iris);
  look.add(sph(r * pr, PUPIL, [1, 1, 0.5], [0, 0, front(pr) * 1.0], 20));
  const gl = sph(r * 0.12 * irisScale, GLINT, [1, 1, 1], [r * 0.22 * side * irisScale, r * 0.24 * irisScale, r * 1.02], 10); gl.castShadow = false; look.add(gl);
  // paupière supérieure : demi-sphère qui pivote vers le bas
  const lidGeo = new THREE.SphereGeometry(r * 1.06, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const lidTop = new THREE.Mesh(lidGeo, lidMat); lidTop.castShadow = true; g.add(lidTop);
  const lidBot = new THREE.Mesh(lidGeo, lidMat); lidBot.rotation.x = Math.PI; g.add(lidBot);
  const brow = cap(r * 0.12, r * 0.9, browMat, [0, r * 1.3, r * 0.5], [0, 0, Math.PI / 2]); g.add(brow);
  g.userData = { r, look, lidTop, lidBot, brow, side, iris, pupil: look.children[1] };
  return g;
}
// lid: 0 ouvert, 1 fermé ; browAng > 0 = sourcils relevés au centre (surpris / inquiet), < 0 = froncés en V (fâché / rusé)
// tilt > 0 : paupières en biais (coin intérieur abaissé = regard sournois / fâché) ; pupil < 1 : pupille en tête d'épingle
export function poseEye(eye, { lookX = 0, lookY = 0, lid = 0, lidLow = 0, browY = 0, browAng = 0, scale = 1, tilt = 0, pupil = 1 }) {
  const { r, look, lidTop, lidBot, brow, side, iris, pupil: pup } = eye.userData;
  pup.scale.set(pupil, pupil, 0.5);
  eye.scale.setScalar(scale);
  look.rotation.set(-lookY * 0.6, lookX * 0.7, 0);
  // pôle de la demi-sphère : vers l'arrière = ouvert, vers l'avant = fermé
  lidTop.rotation.order = 'ZXY'; lidBot.rotation.order = 'ZXY';
  lidTop.rotation.z = side * tilt * 0.45; lidBot.rotation.z = -side * tilt * 0.35;
  lidTop.rotation.x = THREE.MathUtils.lerp(-1.75, 1.57, lid);
  lidBot.rotation.x = THREE.MathUtils.lerp(Math.PI + 1.6, Math.PI - 1.4, lidLow);
  brow.position.y = r * (1.3 + browY * 0.35 - lid * 0.25);
  brow.rotation.z = Math.PI / 2 - browAng * side * 0.6; // browAng < 0 : sourcils en V (fâché / sournois)
}
