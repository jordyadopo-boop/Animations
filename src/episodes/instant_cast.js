// Planche de casting de « L'INSTANT » : la famille dans l'appartement, puis gros plans (visage, poing).
import * as THREE from 'three';
import { createHuman } from '../characters/human.js';
export const world = 'room', fps = 24, duration = 6;
export function build({ scene, setCamera, dof }) {
  const man = createHuman('man', { skin: 0x6e4430, shirt: 0x39424f, pants: 0x2b3446 });
  const wom = createHuman('woman', { skin: 0x8a5638, shirt: 0xc9763a, skirt: 0x8a3a2a, pants: 0x8a5638, hair: 0x120c0a, lips: 0x6a3028 });
  const kid = createHuman('child', { skin: 0x7e4e34, shirt: 0x6fa0c8, pants: 0x6fa0c8, shoes: 0xd8d0c0, longSleeves: true });
  man.root.position.set(-0.4, 0, 0); man.root.rotation.y = 0.5;
  wom.root.position.set(0.25, 0, 0); wom.root.rotation.y = -0.3;
  kid.root.position.set(0.75, 0, 0.1); kid.root.rotation.y = -0.2;
  scene.add(man.root, wom.root, kid.root);
  const q = new URLSearchParams(location.search);
  return (t) => {
    const v = Math.floor(t);
    man.pose({ fistR: v === 4 ? 1 : 0.15, thumbR: v === 4 ? 1 : 0.2, armR: v >= 3 ? [1.4, 0.15, 0.2] : [0.05, 0.12, 0.2], wristR: v >= 3 ? [0, -0.3] : [0, 0] });
    wom.pose({}); kid.pose({});
    if (v === 0) { setCamera({ pos: [0.1, 0.65, 2.3], target: [0.15, 0.5, 0], fov: 40 }); }
    else if (v === 1) { const h = man.parts.head.getWorldPosition(new THREE.Vector3()); setCamera({ pos: [h.x + 0.12, h.y + 0.01, h.z + 0.32], target: [h.x, h.y, h.z], fov: 35 }); }
    else if (v === 2) { const h = wom.parts.head.getWorldPosition(new THREE.Vector3()); setCamera({ pos: [h.x - 0.05, h.y + 0.01, h.z + 0.32], target: [h.x, h.y, h.z], fov: 35 }); }
    else { const h = man.parts.hands[0].getWorldPosition(new THREE.Vector3()); setCamera({ pos: [h.x - 0.2, h.y + 0.02, h.z + 0.12], target: [h.x, h.y, h.z + 0.06], fov: 30 }); }
  };
}
