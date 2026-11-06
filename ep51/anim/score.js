// Ep. 51 — ELLE EST TOMBÉE, BABYLONE LA GRANDE (Apocalypse 18, 1-8). Premier épisode en animation 2D.
// La timeline (scènes, repères, durée) vient de la narration : ../build_audio.py écrit timeline.js.
// Son et image lisent donc la même source : rien n'est calé à la main en deux endroits.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const TL = node ? require('./timeline.js') : globalThis.TL;
  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = MU.makeClock({ bpm: 90, offset: 0 });
  const DURATION = TL.duration + 0.4;
  const S = {}; for (const s of TL.scenes) S[s.id] = [s.start, s.end];
  S.cover = [1000, 1006];
  const C = TL.cues;
  const markers = {
    titre: { t: C.title, sync: 'v' },
    ange: S.ange[0] + 4, cri: { t: S.cri[0] + 2.6, sync: 'av' }, isaie: C.isaie + 2, cyrus: C.cyrus + 6,
    oiseaux: S.oiseaux[0] + 6, ruines: C.ruines + 4, sortez: S.sortez[0] + 6, jeremie: C.jeremie + 3, babel: C.babel + 3,
    reine: S.reine[0] + 6, feu: C.orgueil + 6.5, fin: S.fin[0] + 6, cover: 1003,
  };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T: clock.T, BEAT: clock.BEAT, S, C, TL, markers, m: MU.m };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
