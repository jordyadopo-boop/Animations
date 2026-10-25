// Planche de 6 réactions de Pépin (validation du jeu d'acteur), une par seconde
import * as THREE from 'three';
import { createPepin, POSE, blend } from '../characters/pepin.js';
import { makeTrunk, makeCrown, makeBranch } from '../engine/canopy.js';
export const duration = 6, fps = 30;

const R = {
  // 1. Surprise : cou étiré, yeux qui jaillissent, bras et doigts en étoile, mèche dressée
  surprise: { ...POSE.sit, pitch: -1.35, bodyY: 0.12, squash: 1.22, neck: 2.0, eyePop: 1.2, lid: 0, lidLow: 0, brow: 1.3, browAng: 0.5, mouth: 0.45, tuft: 1.4, earBack: -0.3,
    armL: [1.55, 1.25, 0.1], armR: [1.55, 1.25, 0.1], fingers: 1, legL: [1.0, 0.6, 1.2], legR: [1.0, 0.6, 1.2], tailCurl: 2.2 },
  // 2. Le cri : mâchoire jusqu'à la poitrine, yeux exorbités, oreilles plaquées
  cri: { ...POSE.sit, pitch: -1.2, bodyY: 0.08, neck: 1.4, headNod: -0.35, eyePop: 0.8, cross: 0.15, lid: 0, lidLow: 0, brow: 1.4, browAng: 0.9, mouth: 1.0, tongue: 0.6, earBack: 1, tuft: 1,
    armL: [2.0, 1.2, 0.6], armR: [2.0, 1.2, 0.6], fingers: 1, tailCurl: 1.2 },
  // 3. Aplati comme une crêpe, yeux qui se croisent, langue pendante
  crepe: { ...POSE.splat, squash: 0.3, bodyY: -0.15, neck: 0.8, headNod: -0.5, eyeScale: 1.1, cross: 0.5, lid: 0.2, mouth: 0.25, tongue: 1, earBack: 1, tuft: -1, fingers: 1, tailCurl: -0.2 },
  // 4. Course : penché en avant, pattes qui moulinent, oreilles et queue à l'horizontale
  course: { pitch: 0.25, bodyY: 0.04, stretchX: 0.95, neck: 1.25, headNod: 0.2, eyeScale: 1.15, lid: 0.1, brow: 0.6, browAng: 0.6, mouth: 0.15, earBack: 1, tuft: -0.5,
    armL: [1.6, 0.2, 0.2], armR: [-0.8, 0.2, 0.9], legL: [1.2, 0.2, -0.2], legR: [-1.3, 0.2, -1.0], tailCurl: -0.3, tailFluff: 1.2, fingers: 0.6 },
  // 5. La peur : recroquevillé, il se fait tout petit et claque des dents
  peur: { ...POSE.sit, pitch: -0.9, bodyY: 0.0, squash: 0.82, neck: 0.55, headNod: 0.25, eyeScale: 1.35, eyeL: 1.1, eyeR: 0.9, lid: 0, lidLow: 0.35, brow: 1, browAng: 1.1, mouth: 0.12, teeth: 1, earBack: 1.2, tuft: -1,
    armL: [1.9, -0.3, 2.2], armR: [1.9, -0.3, 2.2], legL: [1.5, 0.05, 2.1], legR: [1.5, 0.05, 2.1], tailCurl: 3.0, fingers: 0 },
  // 6. Le malin : assis, sourire en coin, un sourcil levé, un doigt levé (« j'ai une idée »)
  malin: { ...POSE.sit, neck: 1.15, headTilt: -0.15, lid: 0.55, lidLow: 0.15, smirk: 1.2, smile: 0.8, browAng: -0.3, lookX: 0.35, tuft: 1, cheeks: 0.15,
    armR: [2.6, 0.35, 1.7], armL: [1.4, 0.1, 1.3], fingers: 0 },
};
const ORDER = [['surprise', '1. SURPRISE !'], ['cri', '2. LE CRI'], ['crepe', '3. LA CRÊPE'], ['course', '4. LA COURSE'], ['peur', '5. LA PEUR'], ['malin', '6. LE MALIN']];

export function build({ scene, setCamera, focusShadow, dof, fx }) {
  const t1 = makeTrunk(1.6, -15, 34, 1); scene.add(t1);
  const cr = makeCrown(6, 10); cr.position.set(0, 35, 0); scene.add(cr);
  const t2 = makeTrunk(1.4, -15, 32, 2); t2.position.set(12, 0, -6); scene.add(t2);
  const br = makeBranch([0.5, 19.6, 0.6], [6, 19.8, 1.9], 0.22, false); scene.add(br);
  const pep = createPepin(); scene.add(pep.root);
  const V = new THREE.Vector3();
  return (t) => {
    const v = Math.min(5, Math.floor(t)); const [key, label] = ORDER[v];
    pep.root.position.set(2.8, 19.86, 1.18); pep.root.rotation.set(0, key === 'course' ? 1.25 : -0.25, 0);
    if (key === 'crepe') pep.root.rotation.set(0, -0.15, 0);
    pep.pose(blend(R[key], R[key], 1));
    focusShadow(2.8, 20, 1.2);
    // cadrage automatique sur la silhouette
    const box = new THREE.Box3().setFromObject(pep.root), c = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3());
    const h = Math.max(sz.y, sz.x * 1080 / 1920, sz.z * 0.5) * (key === 'surprise' ? 1.0 : 1.3), dist = h / (2 * Math.tan((34 * Math.PI) / 360));
    const cam = key === 'crepe' ? [c.x + 0.15, c.y + dist * 0.6, c.z + dist * 0.75] : [c.x + dist * 0.15, c.y + dist * 0.06, c.z + dist];
    if (key === 'crepe') { // à plat ventre, vu de face au ras de la branche : il relève une tête sonnée
      const hd = pep.parts.head.getWorldPosition(new THREE.Vector3()), p = hd.clone().add(new THREE.Vector3(0.18, 0.26, 1.35));
      setCamera({ pos: p.toArray(), target: [hd.x, hd.y - 0.04, hd.z - 0.2], fov: 34 }); dof(p.distanceTo(hd), 0.5);
    } else setCamera({ pos: cam, target: [c.x, c.y + h * 0.06, c.z], fov: 34 });
    dof(V.set(...cam).distanceTo(c), 0.5);
    const ono = { surprise: ['!!', '#ffd21f'], cri: ['AAAAH !', '#ff4d5e'], crepe: ['SPLATCH', '#ffd21f'], course: ['FIOUUU', '#ffffff'], peur: ['gloups...', '#ffffff'], malin: ['hé hé', '#ffffff'] }[key];
    fx.set([{ text: label, x: 0.5, y: 0.08, size: 90, color: '#ffffff', rot: 0 }, { text: ono[0], x: 0.78, y: 0.3, size: 120, color: ono[1], rot: -8 }]);
    if (key === 'course') fx.speed(0.5, 0, 0.45, 0.6);
  };
}
