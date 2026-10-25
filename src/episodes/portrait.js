// Portrait de validation du style : Pépin sur sa branche, devant son trou d'arbre
import { createPepin, POSE, blend } from '../characters/pepin.js';
import { makeTrunk, makeCrown, makeBranch, makeHollow } from '../engine/canopy.js';
export const duration = 3, fps = 30;
export function build({ scene, setCamera, focusShadow, dof }) {
  const t1 = makeTrunk(1.6, -15, 34, 1); scene.add(t1);
  const cr = makeCrown(6, 10); cr.position.set(0, 35, 0); scene.add(cr);
  const t2 = makeTrunk(1.4, -15, 32, 2); t2.position.set(12, 0, -6); scene.add(t2);
  const c2 = makeCrown(5.5, 9); c2.position.set(12, 33, -6); scene.add(c2);
  const br = makeBranch([0.5, 19.6, 0.6], [5, 19.75, 1.7], 0.22, true); scene.add(br);
  const hol = makeHollow(); hol.position.set(0.15, 20.55, 1.6); scene.add(hol);
  const pep = createPepin(); scene.add(pep.root);
  return (t) => {
    const v = Math.floor(t);
    pep.root.position.set(2.5, 19.84, 1.08); pep.root.rotation.y = -0.2;
    const expr = [
      { lid: 0.5, smirk: 1, smile: 0.5, browAng: -0.4, lookX: 0.25, tuft: 0.2 },
      { lid: 0, eyeScale: 1.25, mouth: 0.7, brow: 1, browAng: 0.6, tuft: 1, earBack: -0.2 },
      { lid: 0.55, cheeks: 1, smile: 0.6, browAng: 0.2, lookY: 0.2 },
    ][v];
    pep.pose({ ...blend(POSE.stand, POSE.sit, 1), headTurn: 0.25, headTilt: -0.08, ...expr });
    focusShadow(1.3, 20, 1);
    const h = pep.parts.head.getWorldPosition(new pep.root.position.constructor());
    const cam = [h.x + 0.5, h.y + 0.02, h.z + 1.55];
    setCamera({ pos: cam, target: [h.x - 0.05, h.y - 0.22, h.z], fov: 30 });
    dof(Math.hypot(cam[0] - h.x, cam[1] - h.y, cam[2] - h.z), 1);
  };
}
