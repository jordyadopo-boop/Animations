// Planche des personnages (contrôle visuel)
import { createPouf } from '../characters/pouf.js';
import { createShark, createDolphin, createOrca } from '../characters/predators.js';
import { makeKelp, makeRock, makeCoral, makeBrainCoral, makeAnemone, makeStarfish, floorHeight, createBubbles } from '../engine/ocean.js';
export const duration = 7, fps = 30;
export function build({ scene, setCamera, animated }) {
  const pouf = createPouf(), shark = createShark(), dol = createDolphin(), orca = createOrca();
  scene.add(pouf.root, shark.root, dol.root, orca.root);
  const kelps = [[-2.5, -2], [-3.2, -3], [2.8, -2.5], [3.5, -4]].map(([x, z], i) => { const k = makeKelp(5 + i, i); k.position.set(x, floorHeight(x, z), z); scene.add(k); return k; });
  animated.push((t) => kelps.forEach((k) => k.userData.update(t)));
  const an = makeAnemone(); an.position.set(-0.8, floorHeight(-0.8, 0.3), 0.3); scene.add(an); animated.push((t) => an.userData.update(t));
  const r = makeRock(1.2); r.position.set(1.6, floorHeight(1.6, -1), -1); scene.add(r);
  const c = makeCoral(0xff7a59, 3, 1.2); c.position.set(-1.6, floorHeight(-1.6, -1), -1); scene.add(c);
  const b = makeBrainCoral(0.7); b.position.set(0.6, floorHeight(0.6, -2.2), -2.2); scene.add(b);
  const st = makeStarfish(); st.position.set(0.3, floorHeight(0.3, 0.9) + 0.03, 0.9); scene.add(st);
  const bub = createBubbles(scene); bub.add(0, [0, 1.6, 0.4], 12, 0.15);
  animated.push((t) => bub.update(t + 1));
  return (t) => {
    const view = Math.floor(t);
    pouf.root.position.set(0, 1.3, 0.5); pouf.root.rotation.y = 0.3;
    pouf.pose({ swim: t * 2, inflate: view === 1 ? 1 : 0, mouth: 0.3, lookX: 0.2 });
    shark.root.position.set(-1.0, 2.6, -2.5); shark.root.rotation.y = 0.9; shark.pose({ jaw: view === 2 ? 1 : 0.2, swim: t });
    dol.root.position.set(1.6, 3.0, -2); dol.root.rotation.y = -0.9; dol.pose({ swim: t, lid: 0 });
    orca.root.position.set(4, 5.5, -9); orca.root.rotation.y = -1.2; orca.pose({ swim: t * 0.5 });
    if (view >= 4) {
      const who = [shark, dol, orca][view - 4]; const L = who.L;
      [shark, dol, orca].forEach((o) => (o.root.visible = o === who));
      who.root.position.set(0, 2.5, 0); who.root.rotation.y = 1.25; who.pose({ jaw: 0.5, swim: 0.1, lid: 0 });
      setCamera({ pos: [L * 0.75, 2.5 + L * 0.1, L * 1.1], target: [0, 2.5, 0], fov: 40 }); pouf.root.visible = false; return;
    }
    if (view === 3) setCamera({ pos: [4.5, 2.3, 0.5], target: [-1, 2.5, -2.5], fov: 40 });
    else setCamera({ pos: [0, 1.7, 5.2], target: [0, 2.2, -1], fov: 46 });
  };
}
