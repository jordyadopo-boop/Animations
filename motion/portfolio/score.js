// Partition commune à l'image (index.html) et au son (audio.js) : tout est calé sur un tempo de 120 BPM.
export const fps = 30, duration = 16, width = 1080, height = 1920;
export const BPM = 120, BEAT = 60 / BPM;

// Scènes [début, fin] en secondes
export const T = {
  title: [0, 2.05],   // <je.fais.ton.site/> en lettres 3D
  bounce: [2, 4.5],   // la balle rouge rebondit : Idée. Design. Code. puis recul sur l'éditeur
  morph: [4.5, 6],    // la balle grossit, devient une fenêtre, puis remplit l'écran
  work: [6, 9.1],     // les 4 réalisations en cartes
  grid: [9, 11.1],    // les 6 services
  count: [11, 13.1],  // les chiffres
  end: [12.85, 16],   // signature + WhatsApp
};

export const IMPACTS = [2.5, 3.0, 3.5, 3.85, 4.1];        // rebonds de la balle
export const WORDS = ['Idée.', 'Design.', 'Code.'];        // un mot par rebond
export const PULLBACK = [3.5, 4.3];                       // recul de caméra : l'éditeur apparaît
export const TYPING = [3.75, 4.45];                       // le code se tape
export const MORPH = { grow: 4.6, square: 5.0, fill: 5.45, wipe: 5.62 };
export const PROJECT_IN = [6.0, 6.75, 7.5, 8.25];         // une réalisation par temps fort
export const GRID_IN = 9.15, GRID_STAGGER = 0.08;
export const STAT_IN = [11.0, 11.67, 12.33];
export const END = { reveal: 12.85, type: 13.15, name: 13.65, tag: 13.95, button: 14.15, cursor: 14.3, click: 14.75, fade: 15.75 };

export const PROJECTS = [
  { name: 'Le Glaceur', cat: 'Entreprise · Abidjan', img: 'leglaceur.jpg', tags: ['Site vitrine', 'Devis en ligne', 'SEO local'] },
  { name: 'AMD Design', cat: "Architecture · Côte d'Ivoire", img: 'amddesign.jpg', tags: ['Vitrine premium', 'Galerie 3D', 'Mobile'] },
  { name: 'Odyssée Games', cat: 'Jeux · Divertissement', img: 'odysseegames.jpg', tags: ['Application web', 'Jeux', 'Interactif'] },
  { name: 'LIY10.LEARNING', cat: 'Éducation · E-learning', img: 'liy10learning.jpg', tags: ['E-learning', 'Exercices', 'Mobile'] },
];

export const SERVICES = [
  { sym: '{ }', title: 'Site vitrine' },
  { sym: '∑', title: 'Devis en ligne' },
  { sym: 'λ', title: 'Applications web' },
  { sym: '√', title: 'Référencement Google' },
  { sym: 'π', title: 'Mobile d\'abord' },
  { sym: '∞', title: 'Hébergement & suivi' },
];

export const STATS = [
  { v: '4+', c: 'sites livrés.' },
  { v: '100%', c: 'adaptés au mobile.' },
  { v: '24/7', c: 'votre vitrine ouverte.' },
];

export const CONTACT = { name: 'Jordy Adopo', logo: '<je.fais.ton.site/>', tag: 'Sites internet sur mesure', phone: '+225 07 09 95 10 92' };
