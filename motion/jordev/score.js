// Partition du film JorDEV (adapté de la structure « Valtic » : accroche → marque → démo → preuves → pour qui → promesse → appel).
// Commune à l'image (index.html) et au son (audio.js). 120 BPM.
export const fps = 30, duration = 25, width = 1080, height = 1920;
export const BPM = 120, BEAT = 60 / BPM;

export const T = {
  hook: [0, 9.05],      // « Tu cherches quelqu'un pour réaliser… » + une vraie réalisation par service
  logo: [8.9, 10.45],   // le cerveau du site + JorDEV
  search: [10.3, 11.95],// la demande se tape
  skills: [11.85, 14.1],// fichiers, tableaux de bord, suivi de business
  proofs: [14, 16.65],  // rafale de preuves « = … »
  who: [16.55, 18.85],  // que ce soit pour…
  promise: [18.75, 21.45],
  cta: [21.35, 25],
};

export const QUESTION = 0.1;  // la question se forme
export const SERVICES = [
  { pre: 'ton', word: 'site internet', t: 0.8, d: 1.0, kind: 'site' },
  { pre: 'ton', word: 'logo', t: 1.8, d: 0.8, kind: 'logo' },
  { pre: 'ton', word: 'affiche pub', t: 2.6, d: 0.9, kind: 'poster' },
  { pre: 'ton', word: 'montage vidéo', t: 3.5, d: 3.0, kind: 'edit' },
  { pre: 'ton', word: 'tableau de bord', t: 6.5, d: 0.9, kind: 'dash' },
  { pre: 'tes', word: "cartes d'invitation", t: 7.4, d: 1.0, kind: 'invite' },
];
export const EDIT = { cut: 4.75, beats: [3.5, 4.0, 4.5, 4.75, 5.25, 5.75, 6.25] };  // montage : coupe et coups de zoom
export const GATHER = 8.4;            // les cartes se rassemblent dans le cerveau
export const LOGO = { brain: 8.95, name: 9.35 };
export const SEARCH = { pill: 10.4, typeFrom: 10.6, typeTo: 11.55, enter: 11.7, query: 'Il me faut un site + un logo…' };
export const SKILLS = { title: 11.95, panel: 12.1 };
export const PROOFS = { from: 14.15, step: 0.42, items: [
  { kind: 'site', label: 'Site internet' }, { kind: 'logo', label: 'Logo' }, { kind: 'poster', label: 'Affiche pub' },
  { kind: 'edit', label: 'Montage vidéo' }, { kind: 'dash', label: 'Tableau de bord' }, { kind: 'invite', label: 'Invitation' },
] };
export const WHO = { lead: 16.7, words: [['ton', 'entreprise', 17.0], ['ta', 'boutique', 17.55], ['ton', 'événement', 18.1]] };
export const PROMISE = { from: 18.95, text: ['JorDEV', 'donne', 'à', 'ton', 'business', "l'image", "qu'il", 'mérite.'] };
export const CTA = { brain: 21.4, name: 21.7, button: 22.2, slogan: 22.8, fade: 24.6 };
export const CONTACT = { name: 'JorDEV', phone: '+225 07 09 95 10 92', slogan: 'Et arrête de chercher.' };
