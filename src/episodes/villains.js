// Planche des méchants : gros plans « tête de méchant » puis silhouettes côte à côte
import * as THREE from 'three';
import { createMargot, createBecDeFer, createTacTac } from '../characters/bird.js';
import { createBouboule } from '../characters/bouboule.js';
import { createPepin, POSE } from '../characters/pepin.js';
import { makeTrunk, makeBranch } from '../engine/canopy.js';
export const duration = 5, fps = 30;

// expressions : méchant mais pas effrayant (paupières en biais, pupilles d'épingle, sourcils en V, regard par en dessous)
const FACES = {
  margot: { lid: 0.45, lidLow: 0.3, tilt: 0.7, pupil: 0.45, browAng: -1.0, brow: -0.3, smirk: 1.2, headNod: 0.25, lookY: 0.25, beak: 0.12, tailLift: -0.2 },
  bouboule: { lid: 0.5, lidLow: 0.3, tilt: 0.65, pupil: 0.5, browAng: -0.9, grin: 1, mouth: 0.08, headNod: 0.2, lookY: 0.2, belly: 0.3, armL: [0.8, 0.5, 1.4], armR: [0.8, 0.5, 1.4] },
  tactac: { lid: 0.15, lidLow: 0.05, tilt: 0.2, pupil: 0.55, cross: 0.55, brow: 0.6, browAng: 0.4, beak: 0.25, neck: 1.6, crest: 1, headTilt: 0.25 },
  aigle: { lid: 0.5, lidLow: 0.3, tilt: 0.85, pupil: 0.35, browAng: -1.3, brow: -0.6, beak: 0.3, headNod: 0.35, lookY: 0.35, crest: 0.6 },
};

export function build({ scene, setCamera, focusShadow, dof, fx }) {
  scene.add(makeTrunk(1.6, -15, 34, 1));
  const t2 = makeTrunk(1.4, -15, 32, 2); t2.position.set(12, 0, -6); scene.add(t2);
  scene.add(makeBranch([0.5, 19.6, 0.6], [9, 19.85, 2.6], 0.27, false));
  const cast = { margot: createMargot(), bouboule: createBouboule(), tactac: createTacTac(), aigle: createBecDeFer(), pepin: createPepin() };
  Object.values(cast).forEach((c) => scene.add(c.root));
  const V = new THREE.Vector3();
  const names = { margot: 'MARGOT LA PIE', bouboule: 'BOUBOULE LE RATON', tactac: 'TAC-TAC LE PIC-VERT', aigle: 'BEC-DE-FER L’AIGLE' };
  const keys = ['margot', 'bouboule', 'tactac', 'aigle'];
  return (t) => {
    const v = Math.floor(t);
    // positions en rang sur la branche (planche silhouettes) ; gros plans : un seul visible
    const line = { pepin: 2.0, tactac: 2.9, margot: 3.9, bouboule: 5.1, aigle: 6.9 };
    Object.entries(cast).forEach(([k, c]) => {
      const x = line[k]; c.root.position.set(x, 19.6 + 0.25 * ((x - 0.5) / 8.5) + 0.27, 0.6 + 2.0 * ((x - 0.5) / 8.5)); c.root.rotation.set(0, -0.15, 0);
      c.pose(k === 'pepin' ? { ...POSE.sit, lid: 0.3, lookX: 0.4 } : FACES[k]);
      c.root.visible = v === 4 || k === keys[v];
    });
    focusShadow(4.5, 20, 1.6);
    if (v < 4) { // gros plan visage
      const c = cast[keys[v]]; const h = c.parts.head.getWorldPosition(new THREE.Vector3());
      const d = keys[v] === 'aigle' ? 1.6 : 0.85;
      const cam = [h.x + d * 0.25, h.y + d * 0.02, h.z + d];
      setCamera({ pos: cam, target: [h.x, h.y - d * 0.04, h.z], fov: 32 }); dof(V.set(...cam).distanceTo(h), 0.6);
      fx.set([{ text: names[keys[v]], x: 0.5, y: 0.08, size: 80, color: '#ffffff' }]);
    } else {
      const c = new THREE.Vector3(4.6, 20.6, 1.7);
      setCamera({ pos: [c.x + 0.4, c.y + 0.3, c.z + 6.2], target: c.toArray(), fov: 34 }); dof(6.2, 0.2);
      fx.set([{ text: 'LE TRIO… ET LE PRÉDATEUR', x: 0.5, y: 0.08, size: 80, color: '#ffffff' }]);
    }
  };
}
