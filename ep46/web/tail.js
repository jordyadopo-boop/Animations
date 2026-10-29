const built = {};
function getSet(name) { if (!built[name]) built[name] = SETS[name](); return built[name]; }
function shotAt(t) { for (const s of SHOTS) if (t >= s[1] && t < s[2]) return s; return SHOTS[SHOTS.length - 1]; }
window.renderAt = (t) => {
  const [name] = shotAt(t);
  const set = getSet(name);
  set.update(t);
  rp.scene = set.scene; rp.camera = set.cam;
  [bloom.strength, bloom.radius, bloom.threshold] = set.bloom;
  let k = 1;
  for (const sc of TL.scenes) { if (sc.start > 0.1) k = Math.min(k, 0.35 + 0.65 * Math.min(1, Math.abs(t - sc.start) / 0.18)); }
  if (t < 0.3) k = t / 0.3;
  if (t > TL.duration - 0.6 && t < 999) k = Math.max(0, (TL.duration + 0.3 - t) / 0.9);
  renderer.toneMappingExposure = set.exposure * k;
  composer.render();
  return true;
};
window.ready = true;
