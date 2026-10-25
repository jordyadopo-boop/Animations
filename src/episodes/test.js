// Planche : Pépin dans ses poses de base + décor
import { createPepin, POSE, blend } from '../characters/pepin.js';
import { makeTrunk, makeCrown, makeBranch, makeHollow } from '../engine/canopy.js';
export const duration = 6, fps = 30;
export function build({ scene, setCamera, focusShadow }) {
  const t1 = makeTrunk(1.6, -15, 34, 1); scene.add(t1);
  const cr = makeCrown(6, 10); cr.position.set(0, 35, 0); scene.add(cr);
  const t2 = makeTrunk(1.4, -15, 32, 2); t2.position.set(12, 0, -4); scene.add(t2);
  const c2 = makeCrown(5.5, 9); c2.position.set(12, 33, -4); scene.add(c2);
  const br = makeBranch([0.5, 19.6, 0.6], [5, 19.75, 1.7], 0.22, false); scene.add(br);
  const hol = makeHollow(); hol.position.set(0, 21, 1.55); scene.add(hol);
  const names = ['stand', 'sit', 'glide', 'curl', 'splat'];
  const peps = names.map(() => { const p = createPepin(); scene.add(p.root); return p; });
  return (t) => {
    const v = Math.floor(t);
    peps.forEach((p, i) => {
      p.root.position.set(1.6 + i * 0.7, 19.83, 0.95 + i * 0.16);
      p.root.rotation.y = 0.5;
      if (names[i] === 'glide') p.root.position.y += 0.5;
      p.pose({ ...blend(POSE.stand, POSE[names[i]], 1), tuft: v === 1 ? 1 : 0, cheeks: v === 2 ? 1 : 0, mouth: v === 3 ? 0.6 : 0, lookX: 0.2 });
    });
    focusShadow(3, 20, 1);
    if (v >= 4) { peps.forEach((p, i) => (p.root.visible = i === 2)); const g = peps[2].root.position;
      if (v === 4) setCamera({ pos: [g.x + 0.2, g.y + 1.4, g.z + 0.9], target: [g.x, g.y + 0.15, g.z], fov: 40 });
      else setCamera({ pos: [g.x + 0.9, g.y - 0.5, g.z + 1.1], target: [g.x, g.y + 0.15, g.z], fov: 40 });
      return; }
    if (v === 4) setCamera({ pos: [8, 24, 14], target: [3, 19, 0], fov: 45 });
    else if (v === 5) setCamera({ pos: [3.2, 20.4, 2.6], target: [3.1, 20.3, 1.3], fov: 40 });
    else setCamera({ pos: [3.3, 20.5, 4.2], target: [3.1, 20.1, 1.3], fov: 36 });
  };
}
