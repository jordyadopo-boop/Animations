# Passe « qualité » : arêtes arrondies, ombrage lisse (PBR + environnement), yeux à pupille,
# ombres douces, flou de profondeur (bokeh) et rendu en 1080x1920.  Usage : python3 tools_qualite.py epNN
import sys, re, os
d = sys.argv[1]
lib = open(f'{d}/web/lib.js').read()
if 'RoundedBoxGeometry' not in lib:
    lib = lib.replace("import * as THREE from 'three';", "import * as THREE from 'three';\nimport { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';")
    lib = lib.replace("export function M(color, o = {}) { return new THREE.MeshLambertMaterial({ color, flatShading: true, ...o }); }",
        "export function M(color, o = {}) { const { flatShading, ...r } = o; return new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.0, ...r }); }")
    lib = lib.replace("export function box(w, h, d, mat) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); }",
        """const _rb = new Map();
export function box(w, h, d, mat) {
  const k = `${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}`; let g = _rb.get(k);
  if (!g) { const r = Math.min(w, h, d) * 0.24; g = (Math.min(w, h, d) < 0.012) ? new THREE.BoxGeometry(w, h, d) : new RoundedBoxGeometry(w, h, d, 3, r); _rb.set(k, g); }
  return new THREE.Mesh(g, mat);
}""")
    # tete : cube arrondi ; yeux blancs a pupille noire
    lib = lib.replace("const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 1), skin);\n    head.scale.set(1, 1.12, 1); head.position.y = 0.17; this.neck.add(head);",
        "const head = new THREE.Mesh(new RoundedBoxGeometry(0.29, 0.31, 0.28, 4, 0.07), skin);\n    head.position.y = 0.17; this.neck.add(head);")
    lib = lib.replace("const e = at(box(0.035, 0.045, 0.02, BLACK), s * 0.055, 0.19, 0.137); this.neck.add(e); this.eyes.push(e);",
        "const e = at(box(0.05, 0.058, 0.02, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })), s * 0.06, 0.19, 0.141); this.neck.add(e); this.eyes.push(e); const pu = at(box(0.026, 0.034, 0.012, BLACK), -s * 0.004, -0.004, 0.008); e.add(pu); const hl = at(box(0.009, 0.009, 0.006, new THREE.MeshBasicMaterial({ color: 0xffffff })), s * 0.006, 0.01, 0.016); e.add(hl);")
    lib = lib.replace("this.mouth = at(box(0.07, 0.018, 0.02,", "this.mouth = at(box(0.075, 0.02, 0.02,")
    # la camera retient sa distance de mise au point
    lib = lib.replace("  cam.position.set(...P); cam.lookAt(...L);", "  cam.position.set(...P); cam.lookAt(...L); cam.userData.focus = Math.hypot(P[0] - L[0], P[1] - L[1], P[2] - L[2]);")
    open(f'{d}/web/lib.js', 'w').write(lib)
head = open(f'{d}/web/head.js').read()
if 'BokehPass' not in head:
    head = head.replace("import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';",
        "import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';\nimport { BokehPass } from 'three/addons/postprocessing/BokehPass.js';\nimport { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';")
    head = head.replace("const W = 720, H = 1280;", "const W = 1080, H = 1920;")
    head = head.replace("renderer.shadowMap.type = THREE.PCFShadowMap;", "renderer.shadowMap.type = THREE.PCFSoftShadowMap;")
    head = head.replace("composer.addPass(rp); composer.addPass(bloom); composer.addPass(new OutputPass());",
        "const bokeh = new BokehPass(new THREE.Scene(), new THREE.PerspectiveCamera(), { focus: 6, aperture: 0.0012, maxblur: 0.0055 });\ncomposer.addPass(rp); composer.addPass(bokeh); composer.addPass(bloom); composer.addPass(new OutputPass());\nconst pmrem = new THREE.PMREMGenerator(renderer); const ENV = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;")
    head = head.replace("  const scene = new THREE.Scene();\n", "  const scene = new THREE.Scene(); scene.environment = ENV; scene.environmentIntensity = 0.35;\n")
    head = head.replace("    sun = new THREE.DirectionalLight(o.sun[0], o.sun[1]);", "    sun = new THREE.DirectionalLight(o.sun[0], o.sun[1] * 1.15);")
    head = head.replace("sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);", "sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 4;")
    open(f'{d}/web/head.js', 'w').write(head)
tail = open(f'{d}/web/tail.js').read()
if 'bokeh.scene' not in tail:
    tail = tail.replace("  rp.scene = set.scene; rp.camera = set.cam;", "  rp.scene = set.scene; rp.camera = set.cam; bokeh.scene = set.scene; bokeh.camera = set.cam; bokeh.uniforms.focus.value = set.cam.userData.focus ?? 6; bokeh.uniforms.aspect.value = set.cam.aspect;")
    open(f'{d}/web/tail.js', 'w').write(tail)
r = open(f'{d}/render.js').read().replace("viewport: { width: 720, height: 1280 }", "viewport: { width: 1080, height: 1920 }")
open(f'{d}/render.js', 'w').write(r)
print('qualite ok', d)
