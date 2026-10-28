// Partition commune à l'image (index.html) et au son (audio.js) : 120 BPM, une coupe par temps fort.
export const fps = 30, duration = 21, width = 1080, height = 1920;
export const BPM = 120, BEAT = 60 / BPM;

export const T = {
  ice: [0, 4.7],        // vrai glaçon 3D : chute, rebonds, pluie de glaçons, plongée dans la glace
  products: [4.45, 8.6],// carrousel des 6 glaces
  quote: [8.45, 14.1],  // le devis sur téléphone, jusqu'à WhatsApp
  map: [13.8, 17.15],   // livraison partout à Abidjan
  cold: [16.9, 18.75],  // -78,5 °C
  end: [18.45, 21],     // signature
};

// 1. glaçon 3D
export const IMPACTS = [0.5, 1.0, 1.5, 1.75];
export const WORDS = ['Pureté.', 'Hygiène.', 'Qualité.'];
export const RAIN = [2.0, 2.12, 2.24, 2.36, 2.48];      // petits glaçons qui tombent autour
export const HEADLINE = [2.55, 2.7, 2.85];              // LA FRAÎCHEUR / SOUS TOUTES / SES FORMES
export const DIVE = [3.75, 4.45];                       // la caméra plonge dans le glaçon
export const FROST = 4.2;                               // voile de givre

// 2. produits (un par temps)
export const PRODUCT_IN = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5];
export const PRODUCTS = [
  { name: 'Glace cubique', tag: 'Fraîcheur longue durée', img: 'glacons', price: 750, unit: 'pack de 5 kg' },
  { name: 'Glace en grain', tag: 'Douce, croquante, gourmande', img: 'grain', price: 750, unit: 'pack de 5 kg' },
  { name: 'Glace pilée', tag: 'Une fraîcheur intense', img: 'pilee', price: 3000, unit: 'sac de 50 kg' },
  { name: 'Carboglace', tag: 'Froid extrême · effet fumée', img: 'carboglace', price: 7500, unit: 'le kilo' },
  { name: 'Ice Cup', tag: "Pratique et prêt à l'emploi", img: 'gobelet', price: 250, unit: "l'Ice Cup" },
  { name: 'Barres de glace', tag: 'Fraîcheur et conservation', img: 'barres', price: 650, unit: 'barre de 10 kg' },
];

// 3. devis : chaque ligne reçoit ses « + » (instants des appuis)
const taps = (t0, n, dt) => Array.from({ length: n }, (_, i) => +(t0 + i * dt).toFixed(3));
export const QUOTE_LINES = [
  { name: 'Glace cubique', unit: 'Pack de 5 kg', img: 'glacons', price: 750, taps: taps(9.05, 12, 0.068) },
  { name: 'Glace pilée', unit: 'Sac de 50 kg', img: 'pilee', price: 3000, taps: taps(10.0, 4, 0.12) },
  { name: 'Barres de glace', unit: 'Barre de 10 kg', img: 'barres', price: 650, taps: taps(10.5, 6, 0.062) },
];
export const FREE_FROM = 20;                            // livraison offerte dès 20 articles
export const QUOTE = { phoneIn: 8.5, pdfTap: 11.35, waTap: 12.2, sent: 12.45, read: 12.95, reply: 13.3, out: 13.8, number: 'GLC-2026-0142' };

// 4. carte
export const DEPOT = { name: 'Abatta', x: 870, y: 905 };
export const COMMUNES = [  // plan schématique, pas à l'échelle
  ['Cocody', 745, 975], ['Bingerville', 1000, 905], ['Plateau', 585, 1085], ['Adjamé', 560, 960], ['Abobo', 575, 770],
  ['Anyama', 520, 625], ['Treichville', 600, 1210], ['Marcory', 735, 1235], ['Koumassi', 860, 1265], ['Attécoubé', 430, 1030],
  ['Yopougon', 270, 975], ['Port-Bouët', 715, 1390], ['Songon', 85, 1060], ['Grand-Bassam', 985, 1430],
];
export const ROUTES_IN = 14.45, ROUTE_STAGGER = 0.1;

// 5. froid
export const COLD = { count: [17.15, 17.95] };

// 6. fin
export const END = { logo: 18.6, tag: 19.05, button: 19.35, tap: 19.95, phone: 19.55, fade: 20.7 };
export const BRAND = { phone: '+225 07 89 85 16 86', site: 'leglaceur.ci' };
