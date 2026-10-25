// Fourrure en relief par « coquilles » (shell texturing) : N copies du maillage gonflées le long des normales,
// percées selon un motif de mèches. La couleur s'assombrit vers la racine (occlusion), les pointes s'éclaircissent,
// et la gravité / le « peigné » couchent les poils.
import * as THREE from 'three';

const NOISE = `
  float fhash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
`;

function shellMaterial(base, h, o) {
  const m = new THREE.MeshStandardMaterial({ color: base.color.clone(), roughness: 0.95, metalness: 0, map: base.map || null });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uH = { value: h };
    sh.uniforms.uLen = { value: o.length };
    sh.uniforms.uDen = { value: o.density };
    sh.uniforms.uComb = { value: new THREE.Vector3(...o.comb) };
    sh.uniforms.uTip = { value: new THREE.Color(o.tip ?? 0xffffff) };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uH, uLen; uniform vec3 uComb; varying vec3 vBase;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvBase = position; transformed += normal * uLen * uH + uComb * uLen * uH * uH;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform float uH, uDen; uniform vec3 uTip; varying vec3 vBase;${NOISE}`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        vec3 q = vBase * uDen; vec3 cell = floor(q);
        vec3 jit = vec3(fhash(cell + 3.1), fhash(cell + 7.7), fhash(cell + 11.3)) - 0.5;
        vec3 f = fract(q) - 0.5 - jit * 0.55;
        float r = fhash(cell);
        float strand = mix(0.55, 1.0, r);                 // hauteur de la mèche
        float thick = (1.0 - uH / strand) * 0.75;         // la mèche s'affine vers la pointe
        if (uH > strand || length(f) > thick) discard;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        diffuseColor.rgb *= mix(0.42, 1.0, smoothstep(0.0, 0.8, uH));
        diffuseColor.rgb = mix(diffuseColor.rgb, uTip * diffuseColor.rgb * 1.35, smoothstep(0.6, 1.0, uH) * 0.5);`);
  };
  return m;
}

const cache = new Map();
// Ajoute la fourrure à un maillage (et le garde comme « peau » de base)
export function addFur(mesh, opts = {}) {
  const o = { shells: 14, length: 0.02, density: 300, comb: [0, -0.4, -0.6], ...opts };
  const key = `${mesh.material.uuid}|${o.shells}|${o.length}|${o.density}|${o.comb}|${o.tip}`;
  let mats = cache.get(key);
  if (!mats) { mats = []; for (let i = 1; i <= o.shells; i++) mats.push(shellMaterial(mesh.material, i / o.shells, o)); cache.set(key, mats); }
  // la peau de base est plus sombre (racines)
  mesh.material = mesh.material.clone(); mesh.material.color.multiplyScalar(0.55);
  mats.forEach((m) => { const s = new THREE.Mesh(mesh.geometry, m); s.castShadow = false; s.receiveShadow = true; mesh.add(s); });
  return mesh;
}
