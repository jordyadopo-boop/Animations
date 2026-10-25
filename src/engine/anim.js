// Outils d'animation : interpolation, courbes d'accélération, pistes de clés, ressorts.
// Tout est une fonction pure du temps t (secondes) -> rendu déterministe image par image.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const range = (t, t0, t1) => clamp((t - t0) / (t1 - t0));

export const ease = {
  linear: (k) => k,
  in: (k) => k * k * k,
  out: (k) => 1 - Math.pow(1 - k, 3),
  inOut: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  // dépassement puis retour (overshoot)
  back: (k) => { const c = 2.2; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
  // rebond élastique façon cartoon
  elastic: (k) => (k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
  bounce: (k) => {
    const n = 7.5625, d = 2.75;
    if (k < 1 / d) return n * k * k;
    if (k < 2 / d) return n * (k -= 1.5 / d) * k + 0.75;
    if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + 0.9375;
    return n * (k -= 2.625 / d) * k + 0.984375;
  },
  step: (k) => (k < 1 ? 0 : 1),
};

// Piste de clés : [[t, valeur, easing?], ...]. L'easing d'une clé s'applique au segment qui y arrive.
// Les valeurs peuvent être des nombres ou des tableaux de nombres.
export function track(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e] = keys[i];
      if (t <= t1) {
        const [t0, v0] = keys[i - 1];
        const k = (ease[e || 'inOut'])((t - t0) / (t1 - t0));
        return Array.isArray(v0) ? v0.map((a, j) => lerp(a, v1[j], k)) : lerp(v0, v1, k);
      }
    }
    return keys[keys.length - 1][1];
  };
}

// Oscillation amortie déclenchée à t0 (impact -> vibration qui s'éteint)
export const wobble = (t, t0, amp = 1, freq = 9, decay = 5) =>
  t < t0 ? 0 : amp * Math.sin((t - t0) * freq * Math.PI * 2) * Math.exp(-(t - t0) * decay);

// Arc de saut : hauteur parabolique entre t0 et t1
export const hop = (t, t0, t1, h) => { const k = range(t, t0, t1); return k <= 0 || k >= 1 ? 0 : 4 * h * k * (1 - k); };

// Bruit déterministe lisse (pour tremblements de caméra, chaleur, respiration)
const hash = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
export const noise1 = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; };
export const shake = (t, amp, speed = 25, seed = 0) => [noise1(t * speed + seed) * amp, noise1(t * speed + seed + 91.7) * amp];

// Cycle de clignement naturel
export const blink = (t, period = 3.1, offset = 0) => { const p = ((t + offset) % period) / period; return p > 0.95 ? Math.sin(((p - 0.95) / 0.05) * Math.PI) : 0; };
