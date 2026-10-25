// PÉPIN ! — Épisode 1 : « La Noisette d'or » (≈54 s + générique), 16:9, muet.
// Les plans (image) et CUES (son) partagent la même horloge.
import * as THREE from 'three';
import { track, range, lerp, ease, wobble, hop, shake, blink, clamp } from '../engine/anim.js';
import { makeTrunk, makeCrown, makeBranch, makeHollow, makeCloud } from '../engine/canopy.js';
import { createPepin, POSE, blend } from '../characters/pepin.js';
import { createMargot, createBecDeFer } from '../characters/bird.js';
import { createNut, createWorm, createEagleShadow, createTwig } from '../characters/props.js';

export const fps = 24, duration = 62;
export const title = 'La Noisette d’or';
export const CREDITS = `
  <div class="t">PÉPIN !</div>
  <div class="n">Épisode 1 — La Noisette d’or</div>
  <div class="h">UNE SÉRIE CRÉÉE PAR</div><div class="n">Jordy Adopo</div>
  <div class="h">CONTACT</div><div class="n">jordy.adopo@outlook.fr</div><div class="n">+225 07 09 95 10 92</div>
  <div class="h">AVEC</div><div class="n">Pépin l’écureuil volant</div><div class="n">Margot la pie</div><div class="n">Bec-de-Fer l’aigle</div><div class="n">et le ver de la noisette</div>
  <div class="h">© Jordy Adopo — tous droits réservés</div>`;

// Bruitages / musique (lus par render/audio.js) : [nom, temps, options]
export const CUES = [
  ['music', 0, { until: 52, theme: 'pepin' }],
  ['title', 1.0], ['snore', 1.2], ['snore', 3.2],
  ['growl', 5.4], ['blink', 6.2], ['stretch', 6.9, { dur: 0.8 }], ['yawn', 7.2],
  ['twinkle', 8.4], ['zoom', 9.0], ['boing', 9.7], ['drool', 10.3],
  ['spring', 12.1], ['whoosh', 12.3, { dur: 1.2 }],
  ['wind', 14.0, { dur: 2.0 }], ['slideUp', 15.0, { dur: 0.7 }], ['whistleDown', 15.8, { dur: 0.6 }], ['whoosh', 16.4, { dur: 1.0 }],
  ['splat', 17.5], ['squeak', 18.2, { dur: 1.4 }], ['scramble', 19.6, { dur: 0.4 }],
  ['tiptoe', 20.2, { dur: 2.5 }], ['eagleTheme', 22.6], ['gulp', 23.6], ['screech', 24.0], ['whistleDown', 24.3, { dur: 1.1 }],
  ['whoosh', 25.0, { dur: 0.4 }], ['doing', 25.5], ['tweet', 26.0, { dur: 2.0 }], ['flap', 26.4, { dur: 2.0 }],
  ['creak', 28.8, { dur: 1.6 }], ['strain', 30.2, { dur: 0.8 }], ['ploc', 31.0], ['boing', 31.05], ['whistleUp', 31.1, { dur: 1.6 }],
  ['ding', 33.1], ['margotTheme', 33.6], ['swoosh', 33.9], ['beat', 34.3], ['whistleDown', 35.2, { dur: 0.5 }],
  ['hehe', 36.6], ['idea', 37.3], ['whoosh', 37.8, { dur: 0.8 }], ['spooky', 38.6, { dur: 1.6 }], ['screechMagpie', 40.0], ['whistleDown', 40.4, { dur: 0.9 }],
  ['catch', 43.2], ['eagleTheme', 43.8], ['screech', 44.0], ['zoomAway', 44.4, { dur: 1.0 }],
  ['crack', 46.8], ['ploc', 47.2], ['coucou', 47.6], ['sad', 49.8], ['iris', 50.8],
  ['outro', 52.0], ['credits', 54.5, { until: 62 }],
];

// Repères du décor
const PI = Math.PI;
const B = { from: new THREE.Vector3(11.75, 21.2, -1.6), to: new THREE.Vector3(8.8, 21.5, -0.8), r: 0.2 };
const onB = (k) => B.from.clone().lerp(B.to, k).add(new THREE.Vector3(0, B.r * (1 - 0.4 * k) * 0.92, 0));
const LEDGE = new THREE.Vector3(0.95, 20.13, 1.6);
const SPLAT = new THREE.Vector3(11.5, 20.55, -1.77);
const yawTo = (dx, dz) => Math.atan2(dx, dz);
const KEY = new THREE.Vector3(-0.45, 0.8, 0.55).normalize();

export function build({ scene, camera, setCamera, focusShadow, dof, fx, animated }) {
  // ---- décor ----
  scene.children.slice().forEach((o) => { if ((o.isMesh || o.isGroup) && o.position.x > 14 && o.position.x < 60 && o.position.z > -30 && o.position.z < 14) scene.remove(o); });
  scene.add(makeTrunk(1.6, -15, 34, 1));
  const crA = makeCrown(6, 10); crA.position.set(0, 35, 0); scene.add(crA);
  const tB = makeTrunk(1.4, -15, 33, 2); tB.position.set(13, 0, -2); scene.add(tB);
  const crB = makeCrown(5.5, 9); crB.position.set(13, 34, -2); scene.add(crB);
  scene.add(makeBranch([0.3, 20.0, 1.2], [2.3, 20.1, 2.3], 0.16, false));
  const brB = makeBranch(B.from.toArray(), B.to.toArray(), B.r, true); scene.add(brB);
  scene.add(makeBranch([1.2, 24.5, -0.6], [5.5, 25.2, -2.5], 0.22, true));
  scene.add(makeBranch([11.9, 18.0, -1.0], [15.5, 17.6, 1.5], 0.2, true));
  const hollow = makeHollow(0.95, 1.25); hollow.position.set(0.0, 20.6, 1.585); scene.add(hollow);
  // nuages du ciel (poursuite) et banc de nuage « écran » pour l'ombre chinoise
  const skyClouds = [[24, 29, -9, 4.2], [36, 31, -14, 5], [16, 31, -16, 4], [44, 27.5, -10, 4.5]].map(([x, y, z, s], i) => { const c = makeCloud(s, i); c.position.set(x, y, z); scene.add(c); return c; });
  const screenCloud = makeCloud(3.0, 7); screenCloud.position.set(33.5, 27.3, -3.4); scene.add(screenCloud);
  const puppet = createEagleShadow(); puppet.position.set(33.0, 27.5, 1.3); puppet.material.fog = false; puppet.renderOrder = 2; puppet.scale.setScalar(2.4); scene.add(puppet);

  // ---- acteurs ----
  const pep = createPepin(), margot = createMargot(), aigle = createBecDeFer();
  [pep, margot, aigle].forEach((c) => (c.root.rotation.order = 'YXZ')); // cap d'abord, puis tangage autour de l'axe propre
  const nut = createNut(), worm = createWorm(), twig = createTwig();
  scene.add(pep.root, margot.root, aigle.root, nut.root, worm.root);
  const twigAnchor = onB(0.93).add(new THREE.Vector3(0, -0.12, 0)); twig.root.position.copy(twigAnchor); scene.add(twig.root);
  const nutHome = () => twig.tip.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, -0.04, 0));

  const V = new THREE.Vector3();
  const toScreen = (p) => { V.copy(p).project(camera); return [(V.x + 1) / 2, (1 - V.y) / 2]; };
  const cam = (pos, target, fov = 40, roll = 0, sh = [0, 0], focus = 0) => {
    setCamera({ pos: [pos[0] + sh[0], pos[1] + sh[1], pos[2]], target: [target[0] + sh[0] * 0.4, target[1] + sh[1] * 0.4, target[2]], fov, roll });
    if (focus) dof(new THREE.Vector3(...pos).distanceTo(new THREE.Vector3(...target)), focus);
  };
  const pop = (t, t0, text, x, y, o = {}) => {
    const d = o.dur || 0.9; if (t < t0 || t > t0 + d) return null; const k = (t - t0) / d;
    return { text, x, y: y - k * 0.02, size: o.size || 140, color: o.color, rot: (o.rot ?? -6) + Math.sin(t * 30) * (o.jitter ?? 0), scale: ease.elastic(clamp(k * 3.2)) * (1 - ease.in(range(k, 0.75, 1))) + 0.001 };
  };
  // pose de vol plané de Pépin, avec battement de queue
  const glide = (t, extra = {}) => ({ ...blend(POSE.stand, POSE.glide, 1), tailWave: 0.4, tailPhase: t * 6, ...extra });
  const flapM = (t, amp = 0.7, speed = 9) => { const f = Math.sin(t * speed) * amp; return { wingL: [1, f, 0], wingR: [1, f, 0] }; };
  // marche à quatre pattes (sur la branche)
  const crawl = (t, speed = 7, amt = 1) => { const a = Math.sin(t * speed) * 0.6 * amt, b = Math.cos(t * speed) * 0.25 * amt;
    return { pitch: 0.05, armL: [0.3 + a, 0.25, 0.4 + b], armR: [0.3 - a, 0.25, 0.4 - b], legL: [-0.2 - a, 0.2, -0.6 + b], legR: [-0.2 + a, 0.2, -0.6 - b], bodyY: Math.abs(Math.sin(t * speed)) * 0.015 * amt }; };

  function hideAll() { pep.root.visible = margot.root.visible = aigle.root.visible = worm.root.visible = false; nut.root.visible = true; puppet.visible = false; pep.root.scale.set(1, 1, 1); pep.root.rotation.set(0, 0, 0); aigle.root.rotation.set(0, 0, 0); margot.root.rotation.set(0, 0, 0); nut.open(0); twig.root.rotation.set(0, 0, 0); }
  const show = (...a) => a.forEach((o) => (o.root.visible = true));
  const nutAtHome = () => nut.root.position.copy(nutHome());
  const handPos = () => pep.parts.hands[1].getWorldPosition(new THREE.Vector3()).lerp(pep.parts.hands[0].getWorldPosition(new THREE.Vector3()), 0.5);
  const beakTip = (bird) => bird.parts.jaw.localToWorld(new THREE.Vector3(0, 0, 0.12));
  // place l'oiseau pour que la pointe de son bec soit exactement au point donné (bec planté)
  const stick = (bird, at) => { bird.root.updateMatrixWorld(true); const tip = bird.parts.head.localToWorld(new THREE.Vector3(0, -0.03, 0.58)); bird.root.position.add(at.clone().sub(tip)); bird.root.updateMatrixWorld(true); };

  const shots = [
    // 1. Lever de soleil sur la mer de nuages ; Pépin dort roulé en boule dans son trou ; titre
    [0, 5, (t) => {
      show(pep); nutAtHome();
      pep.root.position.set(0.0, 20.12, 1.32);
      pep.pose({ ...POSE.curl, squash: 0.9 + 0.04 * Math.sin(t * 2.4), tailFluff: 1.2, lid: 1 });
      const k = ease.inOut(range(t, 0, 4.6));
      cam([lerp(9, 0.7, k), lerp(25, 20.85, k), lerp(22, 3.2, k)], [lerp(4, 0.0, k), lerp(22, 20.45, k), lerp(-4, 1.4, k)], lerp(46, 34, k), 0, [0, 0], k > 0.8 ? 0.4 : 0);
      const items = [];
      [1.2, 3.2].forEach((z0) => [0, 0.35, 0.7].forEach((d, i) => { const lt = t - z0 - d; if (lt > 0 && lt < 1.4) items.push({ text: 'z', x: 0.55 + lt * 0.05 + i * 0.02, y: 0.48 - lt * 0.08 - i * 0.03, size: 60 + i * 20, color: '#ffffff', rot: -12, opacity: 1 - lt / 1.4, scale: 1 }); }));
      if (t > 1.0 && t < 4.7) {
        const k2 = t - 1.0, out = 1 - ease.in(range(t, 4.3, 4.7));
        items.push({ text: 'PÉPIN !', x: 0.5, y: 0.3, size: 230, rot: -4 + Math.sin(t * 3) * 2, scale: ease.elastic(clamp(k2 * 1.4)) * out + 0.001, color: '#ffb81f' });
        items.push({ text: title, x: 0.5, y: 0.45, size: 80, rot: 2, scale: ease.back(clamp((k2 - 0.5) * 2.5)) * out + 0.001, color: '#ffffff' });
      }
      fx.set(items); focusShadow(0, 20.5, 1.4);
    }],
    // 2. Le ventre gargouille, un œil s'ouvre, puis l'autre ; il s'extirpe et s'étire en bâillant
    [5, 8, (t) => {
      show(pep); nutAtHome();
      const out = ease.inOut(range(t, 6.7, 7.4));
      pep.root.position.set(lerp(0.0, LEDGE.x, out), lerp(20.12, LEDGE.y, out) + hop(t, 6.7, 7.4, 0.15), lerp(1.32, LEDGE.z, out)); pep.root.rotation.y = lerp(0, 0.5, out);
      const growl = t > 5.4 && t < 6.0 ? Math.sin((t - 5.4) * 40) * 0.06 : 0;
      const yawn = range(t, 7.2, 7.5) * (1 - range(t, 7.75, 7.95));
      const base = blend(POSE.curl, POSE.sit, ease.out(range(t, 6.5, 7.2)));
      pep.pose({ ...base, squash: (t < 6.5 ? 0.9 : base.squash) + growl, lid: t < 6.2 ? 1 : 0.55 - yawn * 0.4, wink: t > 6.2 && t < 6.6 ? 1 : 0, lidLow: 0.25,
        neck: 1 + yawn * 0.5 + (t > 6.9 && t < 7.7 ? 0.25 : 0), mouth: yawn * 1.0, tongue: yawn * 0.4, armL: yawn > 0 ? [2.6, 0.5, 0.3] : base.armL, armR: yawn > 0 ? [2.6, 0.5, 0.3] : base.armR, fingers: yawn, tuft: -0.3 + yawn * 0.8, earBack: 0.3, lookX: t > 6.6 ? 0.2 : 0 });
      const pp = pep.root.position; cam([lerp(0.55, 1.4, out), 20.82, lerp(2.75, 3.1, out)], [lerp(0.25, pp.x, out), lerp(20.5, pp.y + 0.35, out), lerp(1.45, pp.z, out)], 34, 0, shake(t, t > 5.4 && t < 6 ? 0.008 : 0, 30), 0.5);
      fx.set([pop(t, 5.35, 'GROUUUU', 0.62, 0.62, { size: 120, jitter: 3, dur: 0.8 }), pop(t, 7.25, 'hôôôaaah…', 0.3, 0.25, { size: 90, color: '#ffffff', dur: 0.7 })].filter(Boolean));
      focusShadow(0.5, 20.5, 1.5);
    }],
    // 3. Il repère la noisette dorée sur l'arbre d'en face : scintillement, zoom éclair, réaction
    [8, 11.5, (t) => {
      show(pep); nutAtHome();
      pep.root.position.copy(LEDGE); pep.root.rotation.y = PI / 2 - 0.25;
      const love = range(t, 9.6, 9.8);
      pep.pose({ ...POSE.sit, lid: love ? 0 : 0.35, eyePop: love * 1.1, eyeScale: 1 + love * 0.2, tuft: love * 1.3, mouth: love * 0.45, tongue: love * (0.5 + 0.2 * Math.sin(t * 12)), neck: 1 + love * 0.5,
        headTurn: love ? -0.15 : 0, lookX: love ? 0 : -0.2, earBack: -0.3 * love, smile: 0.8, fingers: love, cheeks: 0, tailWave: love, tailPhase: t * 12 });
      if (t < 9.0) { // par-dessus l'épaule : la noisette brille au loin
        cam([LEDGE.x - 0.9, LEDGE.y + 0.55, LEDGE.z + 0.75], [9, 21.2, -0.8], 34);
        const [sx, sy] = toScreen(nut.root.position);
        fx.set([pop(t, 8.35, '✦', sx, sy, { size: 110, color: '#fff6c0', dur: 0.6, rot: t * 40 })].filter(Boolean));
      } else if (t < 9.6) { // zoom éclair sur la noisette
        const k = ease.out(range(t, 9.0, 9.25)); const n = nut.root.position;
        cam([n.x + lerp(2.5, 0.55, k), n.y + 0.08, n.z + lerp(3, 0.65, k)], n.toArray(), 32);
        fx.speed(0.6 * (1 - range(t, 9.25, 9.6)), 0);
        fx.set([pop(t, 9.05, '✦', 0.53, 0.42, { size: 160, color: '#fff6c0', dur: 0.5, rot: t * 60 })].filter(Boolean));
      } else { // gros plan réaction : les yeux jaillissent, il bave
        const h = pep.parts.head.getWorldPosition(new THREE.Vector3());
        cam([h.x + 0.85, h.y + 0.02, h.z + 0.45], [h.x, h.y - 0.03, h.z], 32, 0, shake(t, t < 9.85 ? 0.01 : 0, 40), 0.6);
        fx.set([pop(t, 9.65, 'BOÏNG !', 0.3, 0.25, { size: 120, dur: 0.6 }), pop(t, 10.2, 'mmmiam…', 0.68, 0.72, { size: 90, color: '#ffffff', dur: 1.0 })].filter(Boolean));
      }
      focusShadow(LEDGE.x, LEDGE.y, LEDGE.z);
    }],
    // 4. Anticipation, saut, grand vol plané
    [11.5, 14, (t) => {
      show(pep); nutAtHome();
      const crouch = ease.out(range(t, 11.5, 12.05)), fly = range(t, 12.1, 14);
      const P0 = LEDGE, P1 = new THREE.Vector3(5.5, 21.2, 0.5);
      const p = P0.clone().lerp(P1, ease.out(fly)); p.y += hop(t, 12.1, 13.2, 0.6);
      pep.root.position.copy(p); pep.root.rotation.y = yawTo(P1.x - P0.x, P1.z - P0.z); pep.root.rotation.z = fly > 0 ? Math.sin(t * 3) * 0.06 : 0;
      if (fly <= 0) pep.pose({ ...POSE.sit, squash: lerp(1, 0.62, crouch), lid: 0.3, browAng: -0.6, brow: -0.3, tuft: 0.6, mouth: 0.05, smile: 0.6, earBack: crouch * 0.6 });
      else pep.pose(glide(t, { squash: lerp(1.5, 1, range(t, 12.1, 12.5)), lid: 0.25, browAng: -0.3, smile: 0.9, mouth: 0.15, earBack: 0.8, tuft: -0.4, eyeScale: 1.1 }));
      cam([p.x - 0.6, p.y + 0.35, p.z + 3.2], [p.x + 0.3, p.y + 0.15, p.z], 38, 0, [0, 0], 0.3);
      fx.set([pop(t, 12.1, 'HOP !', 0.25, 0.3, { size: 120, dur: 0.6 }), pop(t, 12.3, 'YAHOOO !', 0.6, 0.2, { size: 110, color: '#ffffff', dur: 1.2 })].filter(Boolean));
      focusShadow(p.x, p.y, p.z);
    }],
    // 5. Rafale de vent : surplace, recul en vrille, chute, puis piqué vers l'arbre d'en face
    [14, 17.5, (t) => {
      show(pep); nutAtHome();
      const key = [[14.0, [5.5, 21.2, 0.5]], [15.0, [5.75, 21.25, 0.45]], [15.8, [4.2, 21.5, 0.6]], [16.4, [4.4, 19.9, 0.4]], [17.5, [SPLAT.x - 0.05, SPLAT.y, SPLAT.z + 0.05]]];
      const P = new THREE.Vector3(...track(key.map(([tt, v], i) => [tt, v, i === 4 ? 'in' : 'inOut']))(t));
      pep.root.position.copy(P);
      const wind = t < 15.8, back = range(t, 15.0, 15.8), drop = range(t, 15.8, 16.4), dive = range(t, 16.4, 17.5);
      pep.root.rotation.y = yawTo(1, -0.15); pep.root.rotation.z = back > 0 && back < 1 ? back * PI * 2 : 0;
      if (t < 15.8) pep.pose(glide(t, { stretchX: 1.25, squash: 0.88, lid: 0.7, lidLow: 0.4, mouth: 0.3 + 0.1 * Math.sin(t * 30), teeth: 1, earBack: 1.2, tuft: -1, cheeks: 0.4 + 0.2 * Math.sin(t * 25), billow: 1.1, tailWave: 1.5, tailPhase: t * 25, eyeScale: 0.9 }));
      else if (t < 16.4) pep.pose({ ...POSE.curl, lid: 0, eyeScale: 1.4, eyePop: 0.8, mouth: 0.8, squash: 1.2, tuft: 1.2 });
      else pep.pose(glide(t, { pitch: 0.25, stretchX: 0.9, squash: 1.15, lid: 0.1, browAng: -0.7, brow: -0.4, mouth: 0.1, earBack: 1.3, tuft: -0.8, tailWave: 0.3 }));
      const shk = shake(t, wind ? 0.03 : 0.01, 20);
      cam([P.x - lerp(0.3, 1.8, dive), P.y + 0.4, P.z + lerp(3.0, 2.6, dive)], [P.x, P.y, P.z], 40, 0, shk);
      if (wind) fx.speed(0.45, t * 30);
      fx.set([pop(t, 14.05, 'FFFOUUUU', 0.7, 0.3, { size: 130, color: '#dff4ff', jitter: 4, dur: 1.7 }), pop(t, 15.85, 'GLOUPS', 0.35, 0.25, { size: 110, dur: 0.5 })].filter(Boolean));
      focusShadow(P.x, P.y, P.z);
    }],
    // 6. SPLAT contre le tronc, il reste collé puis glisse lentement (et remonte à toute vitesse)
    [17.5, 20, (t) => {
      show(pep); nutAtHome();
      const slide = ease.in(range(t, 18.2, 19.6)), up = range(t, 19.6, 20);
      pep.root.position.set(SPLAT.x, SPLAT.y - slide * 0.55 + up * 0.8, SPLAT.z);
      pep.root.rotation.y = yawTo(0.988, -0.152);
      const sq = t < 17.6 ? lerp(0.2, 0.3, range(t, 17.5, 17.6)) : 0.3 + wobble(t, 17.6, 0.06, 6, 4);
      pep.root.scale.set(1.35, 1.35, up > 0 ? 1 : sq);
      pep.pose({ ...POSE.splat, pitch: -1.45, eyeScale: 1.1, cross: 0.5, lid: 0.15, mouth: 0.3, tongue: 0.6, tuft: -1, earBack: 1, fingers: 1, billow: 0, squash: 1 });
      const fl = t < 17.58 ? 1 : 0;
      fx.flash(fl);
      cam([SPLAT.x - 2.2, SPLAT.y + 0.15, SPLAT.z + 1.3], [SPLAT.x, SPLAT.y - 0.15, SPLAT.z], 36, 0, shake(t, t < 17.9 ? 0.05 : 0), 0.5);
      fx.set([pop(t, 17.5, 'SPLATCH !', 0.4, 0.25, { size: 190, rot: -8 }), pop(t, 18.25, 'fuiiiiik…', 0.6, 0.7, { size: 90, color: '#ffffff', dur: 1.3 })].filter(Boolean));
      focusShadow(SPLAT.x, SPLAT.y, SPLAT.z);
    }],
    // 7. Il rampe sur la branche vers la noisette… une ombre grandit : l'aigle pique !
    [20, 25, (t) => {
      show(pep); nutAtHome();
      const k = lerp(0.12, 0.7, ease.inOut(range(t, 20.2, 22.8)));
      const P = onB(k); pep.root.position.copy(P); pep.root.rotation.y = yawTo(B.to.x - B.from.x, B.to.z - B.from.z);
      const look = range(t, 23.5, 23.65);
      pep.pose({ ...POSE.stand, ...crawl(t, 9, t < 22.8 ? 1 : 0), squash: 0.9, lid: look ? 0 : 0.4, lidLow: 0.2, browAng: look ? 0.8 : -0.5, tilt: look ? 0 : 0.3, smirk: look ? 0 : 0.6, smile: 0.6, tongue: look ? 0 : 0.3 * Math.abs(Math.sin(t * 3)),
        eyePop: look * 1.0, eyeScale: 1 + look * 0.3, headNod: -look * 0.7, lookY: look * 0.9, tuft: look * 1.4, mouth: look * 0.4, earBack: -look * 0.3, tailCurl: 1.2 });
      // l'aigle descend dans l'axe du soleil : son ombre recouvre Pépin
      const dive = range(t, 22.4, 25);
      if (t > 22.4) {
        show(aigle); const A = P.clone().addScaledVector(KEY, lerp(9, 2.5, ease.in(dive)));
        aigle.root.position.copy(A).add(new THREE.Vector3(0, -0.6, 0)); aigle.root.rotation.y = yawTo(P.x - A.x, P.z - A.z);
        aigle.pose({ pitch: 0.9, wingL: [0.55, 0.5, -0.3], wingR: [0.55, 0.5, -0.3], tailSpread: 0.6, beak: 0.6, lid: 0.3, tilt: 0.8, pupil: 0.35, browAng: -1.3, legL: [0.4, 0.4], legR: [0.4, 0.4], grip: 0.2 });
      }
      fx.dim(0.3 * range(t, 22.6, 23.4));
      if (t < 24.0) cam([P.x + 0.5, P.y + 0.35, P.z + 2.0], [P.x - 0.2, P.y + 0.1, P.z], 36, 0, [0, 0], 0.4);
      else { // contre-plongée : l'aigle en piqué, ailes repliées, cri
        const A = aigle.root.position; cam([P.x + 0.3, P.y + 0.15, P.z + 0.5], [A.x, A.y + 0.3, A.z], 50, 0.1, shake(t, 0.02, 30));
      }
      fx.set([t > 20.3 && t < 22.8 ? { text: 'tip… tip… tip…', x: 0.3, y: 0.78, size: 70, color: '#ffffff', rot: -4, scale: 1, opacity: 0.9 } : null,
        pop(t, 23.55, '?!', 0.62, 0.22, { size: 170, dur: 0.6 }), pop(t, 24.0, 'KRIIIIIIIH !', 0.5, 0.2, { size: 150, color: '#ff4d5e', jitter: 5, dur: 1.0 })].filter(Boolean));
      focusShadow(P.x, P.y, P.z);
    }],
    // 8. Pépin bondit en arrière, l'aigle rate et se plante le bec dans la branche : DOÏNG
    [25, 28.5, (t) => {
      show(pep, aigle); nutAtHome();
      const jump = range(t, 25.0, 25.35);
      const P = onB(lerp(0.7, 0.45, ease.out(jump))); P.y += hop(t, 25.0, 25.35, 0.3);
      pep.root.position.copy(P); pep.root.rotation.y = yawTo(B.to.x - B.from.x, B.to.z - B.from.z);
      const peek = range(t, 26.8, 27.2);
      pep.pose({ ...POSE.sit, squash: jump > 0 && jump < 1 ? 1.3 : 1, eyeScale: 1.2 - peek * 0.2, lid: peek * 0.5, smirk: peek * 1.2, smile: 0.7, browAng: -0.4 * peek, tuft: 1 - peek, mouth: 0.4 * (1 - peek), headTilt: peek * 0.2 });
      // l'aigle, bec planté dans la branche juste devant
      const hit = onB(0.72);
      const arrive = ease.in(range(t, 25.0, 25.5));
      const A = hit.clone().addScaledVector(KEY, lerp(2.5, 0, arrive));
      const vib = wobble(t, 25.5, 1, 7, 2.5);
      aigle.root.position.copy(A);
      aigle.root.rotation.set(0.95 + vib * 0.08, yawTo(-KEY.x, -KEY.z), vib * 0.05);
      const struggle = range(t, 26.4, 26.6);
      aigle.pose({ pitch: 0.2, wingL: [struggle ? 1 : 0.6, struggle ? Math.sin(t * 22) * 0.8 : 0.4, 0], wingR: [struggle ? 1 : 0.6, struggle ? Math.sin(t * 22 + 0.5) * 0.8 : 0.4, 0], tailSpread: 1, tailWag: vib * 0.6,
        cross: t > 25.5 ? 0.5 : 0, lid: 0.2, eyeScale: 1.2, browAng: 0.6, brow: 0.6, beak: 0.15, legL: [0.6, 0.5], legR: [0.2, 0.8], grip: 1 });
      stick(aigle, A.clone().add(new THREE.Vector3(0, 0.02, 0)));
      cam([hit.x + 1.8, hit.y + 1.0, hit.z + 5.4], [hit.x + 0.2, hit.y + 0.75, hit.z], 40, 0, shake(t, t > 25.5 && t < 25.9 ? 0.06 : 0), 0.3);
      fx.flash(t > 25.5 && t < 25.55 ? 0.8 : 0);
      fx.set([pop(t, 25.5, 'DOÏÏÏNG !', 0.55, 0.18, { size: 170, rot: 6, jitter: 4 }), pop(t, 27.0, 'hé hé', 0.2, 0.55, { size: 90, color: '#ffffff', dur: 0.9 })].filter(Boolean));
      focusShadow(hit.x, hit.y, hit.z);
    }],
    // 9. La noisette résiste : la brindille plie sous son poids… PLOC ! et la brindille le catapulte
    [28.5, 33, (t) => {
      show(pep, aigle);
      const hit = onB(0.72);
      aigle.root.position.copy(hit); aigle.root.rotation.set(0.95, yawTo(-KEY.x, -KEY.z), 0);
      aigle.pose({ pitch: 0.2, wingL: [1, Math.sin(t * 20) * 0.8, 0], wingR: [1, Math.sin(t * 20 + 0.5) * 0.8, 0], tailSpread: 1, cross: 0.5, eyeScale: 1.2, browAng: 0.6, legL: [0.6, 0.5], legR: [0.2, 0.8], grip: 1 });
      stick(aigle, hit.clone().add(new THREE.Vector3(0, 0.02, 0)));
      const bend = track([[28.5, 0], [29.6, 0], [30.4, 0.9, 'inOut'], [31.0, 1.0], [31.08, -0.5, 'out'], [31.4, 0.15], [31.8, 0]])(t);
      twig.root.rotation.z = -bend * 0.9;
      const tip = twig.tip.getWorldPosition(new THREE.Vector3());
      const launch = range(t, 31.05, 33);
      let P;
      if (t < 29.6) { const k = range(t, 28.5, 29.6); P = onB(lerp(0.5, 0.88, ease.inOut(k))); pep.root.rotation.y = yawTo(B.to.x - B.from.x, B.to.z - B.from.z); pep.pose({ ...POSE.stand, ...crawl(t, 10), lid: 0.3, smile: 0.8, smirk: 0.5 }); }
      else if (t < 31.05) { // assis sur la brindille qui plie, il tire de toutes ses forces
        P = tip.clone().add(new THREE.Vector3(0.0, 0.02, 0.08)); pep.root.rotation.y = yawTo(-1, 0.3);
        const strain = range(t, 30.2, 31.0);
        pep.pose({ ...POSE.sit, squash: 1 - strain * 0.15 + Math.sin(t * 40) * 0.03 * strain, armL: [2.2 - strain * 0.8, 0.2, 0.2], armR: [2.2 - strain * 0.8, 0.2, 0.2], neck: 1 + strain * 0.4, lid: 0.8 * strain, lidLow: 0.5 * strain, mouth: 0.1, teeth: 1, cheeks: strain * 0.8, browAng: -1, tuft: strain, eyeScale: 0.9, fingers: 0 });
      } else { // catapulté vers le ciel, noisette en main
        P = tip.clone().add(new THREE.Vector3(lerp(0, -2, launch), ease.out(launch) * 6.5, lerp(0, 1.5, launch)));
        pep.root.rotation.y = yawTo(-1, 0.3); pep.root.rotation.x = -launch * PI * 3;
        pep.pose({ ...POSE.curl, lid: 0, eyeScale: 1.3, eyePop: 0.6, mouth: 0.7, tuft: 1.3, squash: lerp(1.6, 1, range(t, 31.05, 31.5)), armL: [2.5, 0.3, 0.2], armR: [2.5, 0.3, 0.2] });
      }
      pep.root.position.copy(P);
      if (t < 31.0) nut.root.position.copy(tip).add(new THREE.Vector3(0, -0.05, 0)); else nut.root.position.copy(handPos());
      if (t < 31.1) cam([tip.x - 2.4, tip.y + 0.15, tip.z + 3.3], [tip.x + 0.2, tip.y + 0.25, tip.z], 38, 0, shake(t, t > 30.2 && t < 31 ? 0.008 : 0, 40), 0.4);
      else cam([tip.x + 1.5, tip.y + 0.4, tip.z + 6], [P.x, P.y, P.z], 44);
      fx.set([t > 28.8 && t < 30.4 ? { text: 'crrrrriii…', x: 0.65, y: 0.7, size: 70, color: '#ffffff', rot: 4, scale: 1, opacity: 0.85 } : null,
        pop(t, 30.3, 'hnnnnn !', 0.3, 0.22, { size: 110, jitter: 3, dur: 0.7 }), pop(t, 31.0, 'PLOC !', 0.52, 0.48, { size: 140, dur: 0.5 }), pop(t, 31.1, 'BOÏÏÏNG !', 0.45, 0.2, { size: 170, dur: 1.0 })].filter(Boolean));
      focusShadow(P.x, P.y, P.z);
    }],
    // 10. Au sommet de sa course, il savoure… Margot passe en flèche et lui chipe la noisette
    [33, 36, (t) => {
      show(pep, margot);
      const apex = new THREE.Vector3(18, 27.3, 1.5);
      const fall = ease.in(range(t, 35.2, 36));
      const P = apex.clone().add(new THREE.Vector3(fall * 0.5, -fall * 1.6 + Math.sin(t * 2) * 0.03, 0));
      pep.root.position.copy(P); pep.root.rotation.y = -0.2;
      const snatched = t > 34.0;
      const stare = range(t, 34.3, 34.45);
      if (t < 35.6) pep.pose({ ...POSE.sit, pitch: -1.2, lid: snatched ? 0.1 : 1, smile: snatched ? 0.2 : 1, mouth: snatched ? 0 : 0.1, armL: snatched ? [1.6, 0.6, 0.4] : [2.8, 0.3, 0.3], armR: snatched ? [1.6, 0.6, 0.4] : [2.8, 0.3, 0.3], fingers: snatched ? 1 : 0.2,
        tuft: snatched ? -0.6 : 0.6, headTurn: stare * 0.5, eyeScale: snatched ? 1.1 : 1, lookX: stare * 0.4, legL: [0.6, 0.6, 1.2], legR: [0.6, 0.6, 1.2], wink: 0 });
      else pep.pose(glide(t, { lid: 0.3, eyeScale: 1.2, mouth: 0.5, earBack: 1 }));
      // Margot fonce de droite à gauche et attrape la noisette au vol
      const m = range(t, 33.6, 34.5);
      const M = new THREE.Vector3(lerp(23, 13, ease.inOut(m)), apex.y + 0.55 - Math.sin(m * PI) * 0.35, apex.z + 0.1);
      margot.root.position.copy(M); margot.root.rotation.y = -PI / 2;
      margot.pose({ pitch: 0.15, ...flapM(t, 0.6, 14), tailSpread: 0.5, lid: 0.35, tilt: 0.6, pupil: 0.5, smirk: 1, browAng: -0.8, beak: snatched ? 0.05 : 0.5, legL: [-0.6, 0.6], legR: [-0.6, 0.6], grip: 1 });
      if (!snatched) nut.root.position.copy(handPos()).add(new THREE.Vector3(0, 0.07, 0)); else nut.root.position.copy(beakTip(margot));
      cam([apex.x + 0.6, apex.y + 0.25, apex.z + 3.4], [apex.x + 0.1, apex.y + 0.25, apex.z], 36, 0, [0, 0], 0.3);
      if (t > 34.45 && t < 35.2) cam([apex.x + 0.2, apex.y + 0.45, apex.z + 1.4], [P.x, P.y + 0.45, P.z], 32, 0, [0, 0], 0.5); // regard caméra
      fx.set([pop(t, 33.1, '♪', 0.62, 0.3, { size: 110, color: '#ffffff', dur: 0.8 }), pop(t, 33.9, 'TCHAK !', 0.5, 0.2, { size: 150, dur: 0.6 }), pop(t, 35.25, 'fiiiiiou…', 0.6, 0.75, { size: 90, color: '#ffffff', dur: 0.8 })].filter(Boolean));
      focusShadow(P.x, P.y, P.z);
    }],
    // 11. La poursuite en vol. Idée ! Il se place devant le soleil : ombre chinoise d'aigle sur le nuage
    [36, 42.5, (t) => {
      show(pep, margot);
      const u = range(t, 36, 42.5);
      const M = new THREE.Vector3(lerp(24, 33.5, u), 27.2 + Math.sin(t * 2.2) * 0.25, 0.6);
      const climb = range(t, 37.6, 38.6);
      const P = new THREE.Vector3(lerp(20.5, 31, u), lerp(26.6, 28.6, ease.inOut(climb)), lerp(0.4, -0.6, climb));
      margot.root.position.copy(M); margot.root.rotation.y = PI / 2;
      const scared = range(t, 39.9, 40.1);
      margot.pose({ pitch: 0.1, ...flapM(t, scared ? 1.1 : 0.55, scared ? 22 : 10), tailSpread: 0.4, lid: scared ? 0 : 0.35, tilt: scared ? 0 : 0.6, pupil: scared ? 0.3 : 0.5, eyeScale: 1 + scared * 0.4, eyePop: scared, browAng: scared ? 1 : -0.6,
        beak: t > 40.4 ? 0.9 : 0.05, smirk: scared ? 0 : 1, crest: scared });
      pep.root.position.copy(P); pep.root.rotation.y = PI / 2 - 0.1;
      const idea = range(t, 37.25, 37.4), puppetPose = range(t, 38.4, 38.8);
      pep.pose(glide(t, { lid: 0.25, smirk: idea * 1.2, smile: 0.8, browAng: -0.6 * idea, tuft: idea * 1.4, eyeScale: 1.05, billow: 0.9,
        armL: [lerp(0.55, 0.3, puppetPose), lerp(1.35, 1.55, puppetPose) + Math.sin(t * 6) * 0.25 * puppetPose, 0], armR: [lerp(0.55, 0.3, puppetPose), lerp(1.35, 1.55, puppetPose) + Math.sin(t * 6) * 0.25 * puppetPose, 0] }));
      // l'ombre chinoise d'aigle grandit sur le nuage devant Margot
      const sh = range(t, 38.6, 39.9);
      puppet.visible = sh > 0; puppet.scale.set(lerp(1.2, 3.4, ease.out(sh)), lerp(1.2, 3.4, ease.out(sh)) * (0.85 + 0.15 * Math.sin(t * 6)), 1);
      puppet.material.opacity = 0.85 * sh;
      if (t > 40.4) nut.root.position.copy(beakTip(margot)).add(new THREE.Vector3(0, -ease.in(range(t, 40.4, 42.5)) * 6, 0)); else nut.root.position.copy(beakTip(margot));
      const mid = M.clone().lerp(P, 0.5);
      if (t < 38.6) cam([mid.x - 1.5, mid.y + 0.4, mid.z + 7.5], [mid.x, mid.y, mid.z - 0.3], 40);
      else if (t < 40.4) cam([M.x - 3.2, M.y + 0.1, M.z + 4.6], [lerp(M.x, 33.2, 0.6), M.y + 0.3, -1.0], 44, 0, shake(t, scared ? 0.02 : 0, 30));
      else cam([M.x - 1.6, M.y + 0.1, M.z + 2.4], [M.x, M.y + 0.05, M.z], 34);
      const [px, py] = toScreen(P);
      fx.set([pop(t, 36.6, 'hé hé hé !', 0.68, 0.25, { size: 100, color: '#ffffff', dur: 1.0 }), pop(t, 37.3, '!', px, py - 0.12, { size: 200, dur: 0.6, rot: 8 }),
        pop(t, 40.0, 'KWAAAAA !', 0.5, 0.2, { size: 160, color: '#ff4d5e', jitter: 5, dur: 1.0 })].filter(Boolean));
      focusShadow(mid.x, mid.y, mid.z);
    }],
    // 12. Il rattrape la noisette en piqué… et derrière Margot surgit le VRAI aigle
    [42.5, 46, (t) => {
      show(pep, margot, aigle);
      const C = new THREE.Vector3(32, 24.5, 0.5);
      const dive = ease.in(range(t, 42.5, 43.2));
      const P = C.clone().add(new THREE.Vector3(lerp(-1.5, 0, dive), lerp(2.5, 0, dive), 0));
      pep.root.position.copy(P); pep.root.rotation.y = PI / 2;
      const caught = t > 43.2;
      pep.pose(caught ? glide(t, { lid: 0.45, smirk: 1.2, smile: 0.9, browAng: -0.5, tuft: 0.6, armL: [1.9, 0.5, 0.6], armR: [1.9, 0.5, 0.6] }) : glide(t, { pitch: 0.6, eyeScale: 1.2, mouth: 0.3, earBack: 1.3 }));
      nut.root.position.copy(caught ? handPos() : C.clone().add(new THREE.Vector3(0, 0.15 + (1 - range(t, 42.5, 43.2)) * 1.8, 0)));
      // Margot (plus haut) se retourne : l'aigle est juste derrière elle
      const flee = ease.in(range(t, 44.4, 45.4));
      const M = new THREE.Vector3(lerp(34.5, 45, flee), 26.6 + flee * 1.5, -0.4);
      margot.root.position.copy(M); margot.root.rotation.y = t < 44.4 ? -PI / 2 : PI / 2;
      const scared = t > 43.9;
      margot.pose({ ...flapM(t, 1.1, 24), pitch: scared ? -0.3 : 0.1, lid: 0, eyeScale: 1.4, eyePop: scared ? 1.2 : 0.3, browAng: 1.1, beak: 0.9, tailSpread: 1, crest: 1, cross: 0.2 });
      const A = new THREE.Vector3(lerp(36.5, 47, ease.in(range(t, 44.6, 45.8))), 26.9 + Math.sin(t * 3) * 0.1, -1.2);
      aigle.root.position.copy(A).add(new THREE.Vector3(0, -0.9, 0)); aigle.root.rotation.y = t < 44.4 ? -PI / 2 - 0.3 : PI / 2;
      aigle.pose({ pitch: 0.05, wingL: [1, Math.sin(t * 7) * 0.6, 0], wingR: [1, Math.sin(t * 7) * 0.6, 0], tailSpread: 0.8, lid: 0.45, tilt: 0.9, pupil: 0.35, browAng: -1.4, brow: -0.5, beak: t > 43.9 && t < 44.6 ? 0.9 : 0.2, crest: 1, legL: [-0.4, 0.4], legR: [-0.4, 0.4], grip: 0.6 });
      if (t < 43.7) cam([P.x - 0.8, P.y + 0.3, P.z + 2.6], [P.x, P.y + 0.1, P.z], 36, 0, [0, 0], 0.4);
      else cam([34.8, 26.4, 5.5], [36.5, 26.6, -0.8], 40, 0, shake(t, t > 43.9 && t < 44.5 ? 0.04 : 0));
      fx.set([pop(t, 43.2, 'CHOP !', 0.55, 0.3, { size: 140, dur: 0.6 }), pop(t, 44.0, 'KRIIIIIH !', 0.62, 0.18, { size: 150, color: '#ff4d5e', jitter: 5, dur: 0.8 }), pop(t, 44.5, 'FIOUUUU !', 0.7, 0.35, { size: 150, dur: 1.0 })].filter(Boolean));
      focusShadow(caught ? 35 : P.x, 26, 0);
    }],
    // 13. De retour chez lui, il croque la noisette : CRAC… elle est vide. Un ver lui fait coucou.
    [46, 52, (t) => {
      show(pep, worm);
      pep.root.position.copy(LEDGE); pep.root.rotation.y = -0.1;
      const bite = range(t, 46.5, 46.8), open = ease.out(range(t, 47.0, 47.3)), sad = range(t, 49.7, 50.0);
      pep.pose({ ...POSE.sit, armL: [1.25, 0.2, 1.3], armR: [1.25, 0.2, 1.3], fingers: 0.2, mouth: bite * (1 - range(t, 46.8, 46.9)) * 0.7, lid: open ? 0.0 : 0.45, eyeScale: open ? 1.2 : 1, eyePop: open * (1 - sad) * 0.6,
        smile: sad ? -0.6 : 0.8, smirk: open ? 0 : 0.5, earBack: sad * 1.0, tuft: sad ? -1 : 0.5, lidLow: sad * 0.25, browAng: sad * 0.9, brow: sad * 0.3, headTilt: sad * 0.12, lookX: t > 47.3 && t < 49.7 ? 0.0 : 0, lookY: t > 47.3 && t < 49.7 ? -0.35 : 0 });
      const hd = pep.parts.head.getWorldPosition(new THREE.Vector3()); const H = hd.clone().add(new THREE.Vector3(0.0, -0.27, 0.16)); nut.root.position.copy(H); nut.root.rotation.set(0, 0, 0); nut.open(open);
      worm.root.position.copy(H).add(new THREE.Vector3(0, -0.01 + open * 0.025, 0.0)); worm.root.scale.setScalar(open > 0.05 ? 1.4 : 0.001); worm.pose(t, t > 47.5 ? 1 : 0);
      const h = pep.parts.head.getWorldPosition(new THREE.Vector3());
      if (t < 47.3 || t > 49.6) cam([h.x + 0.25, h.y - 0.02, h.z + 1.15], [h.x, h.y - 0.12, h.z], 32, 0, shake(t, t > 46.75 && t < 46.95 ? 0.02 : 0), 0.5);
      else cam([H.x + 0.18, H.y + 0.14, H.z + 0.95], [H.x, H.y + 0.06, H.z], 30, 0, [0, 0], 0.6);
      const items = [pop(t, 46.75, 'CRAC !', 0.4, 0.3, { size: 150, dur: 0.6 }), pop(t, 47.6, 'coucou !', 0.62, 0.3, { size: 100, color: '#ffffff', dur: 1.4 })].filter(Boolean);
      if (t >= 50.8) { const k = range(t, 50.8, 51.9); const [ex, ey] = toScreen(h); fx.iris(lerp(1.2, 0, ease.inOut(k)), ex, ey); }
      fx.set(items);
      focusShadow(LEDGE.x, LEDGE.y, LEDGE.z);
    }],
    // 14. Carton final puis générique de fin
    [52, duration, (t) => {
      cam([0.6, 20.8, 3.2], [0, 20.5, 1.4], 34);
      if (t < 54.5) {
        fx.dim(1); const k = t - 52;
        fx.set([{ text: 'PÉPIN !', x: 0.5, y: 0.4, size: 240, color: '#ffb81f', rot: -4 + Math.sin(t * 3) * 2, scale: ease.elastic(clamp(k * 1.2)) + 0.001 },
          { text: 'à suivre…', x: 0.5, y: 0.6, size: 90, color: '#ffffff', rot: 2, scale: ease.back(clamp((k - 0.6) * 2)) + 0.001 }]);
      } else fx.credits(CREDITS, range(t, 54.6, duration), Math.min(1, (t - 54.5) * 3));
    }],
  ];

  return (t) => {
    hideAll();
    for (const [t0, t1, fn] of shots) if (t >= t0 && t < t1) { fn(t); return; }
    shots[shots.length - 1][2](t);
  };
}
