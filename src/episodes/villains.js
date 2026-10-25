// Planche des méchants : Margot la pie et Bec-de-Fer l'aigle, repliés puis ailes ouvertes
import * as THREE from 'three';
import { createMargot, createBecDeFer } from '../characters/bird.js';
import { makeTrunk, makeBranch } from '../engine/canopy.js';
export const duration = 4, fps = 30;
export function build({ scene, setCamera, focusShadow, dof, fx }) {
  scene.add(makeTrunk(1.6, -15, 34, 1));
  const t2 = makeTrunk(1.4, -15, 32, 2); t2.position.set(12, 0, -6); scene.add(t2);
  scene.add(makeBranch([0.5, 19.6, 0.6], [7, 19.8, 2.2], 0.25, false));
  const margot = createMargot(), aigle = createBecDeFer(); scene.add(margot.root, aigle.root);
  const V = new THREE.Vector3();
  return (t) => {
    const v = Math.floor(t), who = v < 2 ? margot : aigle, other = v < 2 ? aigle : margot;
    other.root.visible = false; who.root.visible = true;
    const open = v % 2 === 1;
    who.root.position.set(3.2, open ? 20.6 : 19.88, 1.3); who.root.rotation.set(0, open ? 0.25 : -0.45, 0);
    const P = who === margot
      ? (open ? { pitch: 0.15, wingL: [1, 0.25, 0], wingR: [1, 0.25, 0], tailSpread: 1, beak: 0.5, lid: 0.1, eyeScale: 1.1, browAng: 0.2, legL: [-0.6, 0.5], legR: [-0.6, 0.5], grip: 1 }
              : { lid: 0.5, smirk: 1, browAng: -0.6, lookX: 0.3, tailLift: -0.3, crest: 0, beak: 0.08 })
      : (open ? { pitch: 0.1, wingL: [1, 0.35, 0], wingR: [1, 0.35, 0], tailSpread: 1, beak: 0.6, lid: 0.15, browAng: -1, brow: -0.4, crest: 1, legL: [-0.3, 0.3], legR: [-0.3, 0.3], grip: 0.3 }
              : { lid: 0.42, browAng: -1.1, brow: -0.5, beak: 0.0, crest: 0.4, headNod: 0.15 });
    who.pose(P);
    focusShadow(3.2, 20.2, 1.3);
    const box = new THREE.Box3().setFromObject(who.root), c = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3());
    const h = Math.max(sz.y, sz.x * 1080 / 1920) * 1.2, dist = h / (2 * Math.tan((34 * Math.PI) / 360));
    const cam = [c.x + dist * 0.2, c.y + dist * 0.08, c.z + dist];
    setCamera({ pos: cam, target: c.toArray(), fov: 34 }); dof(V.set(...cam).distanceTo(c), 0.4);
    fx.set([{ text: v < 2 ? 'MARGOT LA PIE' : 'BEC-DE-FER L’AIGLE', x: 0.5, y: 0.08, size: 80, color: '#ffffff' }]);
  };
}
