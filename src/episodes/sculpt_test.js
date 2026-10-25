// Test du style sculpté : Bouboule en gros plan puis en pied
import * as THREE from 'three';
import { createBouboule } from '../characters/bouboule.js';
import { makeTrunk, makeBranch } from '../engine/canopy.js';
export const duration = 3, fps = 30;
export function build({ scene, setCamera, focusShadow, dof, ao }) {
  if (new URLSearchParams(location.search).get('noao')) ao.enabled = false;
  scene.add(makeTrunk(1.6, -15, 34, 1));
  const t2 = makeTrunk(1.4, -15, 32, 2); t2.position.set(12, 0, -6); scene.add(t2);
  scene.add(makeBranch([0.5, 19.6, 0.6], [9, 19.85, 2.6], 0.3, false));
  const b = createBouboule(); scene.add(b.root);
  const V = new THREE.Vector3();
  return (t) => {
    const v = Math.floor(t);
    b.root.position.set(3.3, 19.95, 1.42); b.root.rotation.y = -0.3;
    const t0 = performance.now();
    b.pose(v === 2 ? { mouth: 0.8, grin: 1, browAng: 0.5, brow: 1, lid: 0, lidLow: 0, tilt: 0, pupil: 0.4, eyeScale: 1.3, armL: [1.8, 0.9, 0.4], armR: [1.8, 0.9, 0.4], lean: -0.1 }
      : { headNod: 0.15, lookY: 0.2, armL: [0.5, 0.35, 1.2], armR: [0.3, 0.3, 0.6], belly: 0.3 });
    console.log('sculpt ms', Math.round(performance.now() - t0));
    focusShadow(3.3, 20.3, 1.4);
    const h = b.parts.head.getWorldPosition(new THREE.Vector3());
    if (v === 0) { const cam = [h.x + 0.2, h.y + 0.02, h.z + 0.75]; setCamera({ pos: cam, target: [h.x, h.y - 0.03, h.z], fov: 32 }); dof(V.set(...cam).distanceTo(h), 0.5); }
    else { const c = b.root.position.clone().add(new THREE.Vector3(0, 0.5, 0)); const cam = [c.x + 0.5, c.y + 0.15, c.z + 2.1]; setCamera({ pos: cam, target: c.toArray(), fov: 32 }); dof(2.2, 0.4); }
  };
}
