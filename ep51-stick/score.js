// Ep. 51 (essai stick animation) : Apocalypse 18, 1-8 — images fixes de proposition.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = MU.makeClock({ bpm: 90, offset: 0 });
  const DURATION = 42;
  // scenes (secondes)
  const S = { ange: [0, 8], tombee: [8, 15], oiseaux: [15, 22], sortez: [22, 29], claude: [29, 36], cover: [36, 42] };
  const ev = { descend: 0.5, cri: 9.0, chute: 10.0, sortez: 23.0 };
  const markers = { ange: 5.5, tombee: 12.5, oiseaux: 19.5, sortez: 26.5, claude: 33, cover: 40 };
  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T: clock.T, BEAT: clock.BEAT, S, ev, markers, m: MU.m };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
