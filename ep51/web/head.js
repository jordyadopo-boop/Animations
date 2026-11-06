import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import * as L from './lib.js';


const { clamp, sstep, lerp, hash, win, M, G, box, at, holo, holoMat, fade, label, Human, camKeys } = L;

const W = 720, H = 1280;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);
const composer = new EffectComposer(renderer);
const rp = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.6, 0.5, 0.85);
composer.addPass(rp); composer.addPass(bloom); composer.addPass(new OutputPass());

const TL = await (await fetch('/build/timeline.json')).json();
const C = TL.cues, S = TL.subs, SC = Object.fromEntries(TL.scenes.map(s => [s.id, s]));
const env = (spk, t) => { const a = TL.env[spk]; if (!a) return 0; const f = t * 24, i = Math.floor(f); return lerp(a[i] ?? 0, a[i + 1] ?? 0, f - i); };

function base(o) {
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(o.fov ?? 45, W / H, 0.05, 900);
  if (o.sky) scene.add(L.skyDome(...o.sky));
  if (o.bg !== undefined) scene.background = new THREE.Color(o.bg);
  if (o.fog) scene.fog = new THREE.Fog(...o.fog);
  const hemi = new THREE.HemisphereLight(...(o.hemi ?? [0xffffff, 0x444444, 1])); scene.add(hemi);
  let sun = null;
  if (o.sun) {
    sun = new THREE.DirectionalLight(o.sun[0], o.sun[1]); sun.position.set(...o.sun[2]); scene.add(sun);
    if (o.shadow !== false) {
      sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
      const s = o.shadowSize ?? 8; Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 0.5, far: 120 });
      sun.shadow.bias = -0.0008; sun.target.position.set(...(o.target ?? [0, 0, 0])); scene.add(sun.target);
    }
  }
  return { scene, cam, hemi, sun, bloom: o.bloom ?? [0.5, 0.5, 0.85], exposure: o.exposure ?? 1 };
}
function claudeRig(scene, pos, ry = 0, projOff = [0.45, 0, 0.12], color = 0x55e6ff, beamH = 0.6, beamR = 0.32) {
  const c = L.makeClaude(); c.g.position.set(...pos); c.g.rotation.y = ry; scene.add(c.g);
  const pr = L.makeProjector(color, beamH, beamR); pr.position.set(pos[0] + projOff[0], pos[1] + projOff[1], pos[2] + projOff[2]); scene.add(pr);
  const holoG = new THREE.Group(); holoG.position.set(pr.position.x, pr.position.y + pr.userData.top + 0.25, pr.position.z); scene.add(holoG);
  return { c, pr, holoG };
}
const beamOn = (rig, k, t) => fade(rig.pr.userData.cone, k * (0.85 + 0.15 * Math.sin(t * 17)));

