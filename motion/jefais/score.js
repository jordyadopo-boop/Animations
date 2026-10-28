// Partition commune à l'image (index.html) et au son (audio.js) : 120 BPM, coupes sèches sur les temps.
// Style « interface iPhone » : accroche sur fond noir, barre de recherche, carte de profil, bulle de message.
export const fps = 30, duration = 14, width = 1080, height = 1920;
export const BPM = 120, BEAT = 60 / BPM;

export const T = {
  hook: [0, 2.05],     // « Tu cherches encore (quelqu'un) pour ton site ? »
  search: [2, 4.6],    // barre de recherche : on tape je.fais.ton.site
  profile: [4.5, 7.05],// carte de profil + réalisations, la main touche un site
  works: [7, 8.85],    // cartes de sites en éventail 3D sur fond noir
  devis: [8.8, 10.35], // bande rouge « demande ton DEVIS » + carte logo
  chat: [10.3, 12.05], // bulle « On fait ton site ensemble ? »
  end: [12, 14],       // logo lumineux
};

export const HOOK = { blocks: 0.05, words: 0.4, paren: 0.75 };
export const SEARCH = { pill: 2.05, dot: 2.55, expand: 2.7, typeFrom: 3.05, typeTo: 3.85, enter: 4.05, query: 'je.fais.ton.site' };
export const PROFILE = { avatar: 4.6, name: 4.8, chips: 5.0, scroll: 5.6, thumbs: 5.75, hand: 6.0, tap: 6.5 };
export const CHIPS = [
  { ic: '{ }', t: 'Vitrine', bg: '#d9ecff', fg: '#1a73e8' },
  { ic: '∑', t: 'Devis', bg: '#fff1c2', fg: '#b88600' },
  { ic: 'λ', t: 'Apps', bg: '#d8f7e1', fg: '#1e9e4a' },
  { ic: '√', t: 'Google', bg: '#ffe0e3', fg: '#e5293d' },
];
export const SITES = [
  { img: 'leglaceur', name: 'Le Glaceur' },
  { img: 'amddesign', name: 'AMD Design' },
  { img: 'odysseegames', name: 'Odyssée Games' },
  { img: 'liy10learning', name: 'LIY10.LEARNING' },
];
export const WORKS = { title: 7.05, tap: 8.25 };
export const DEVIS = { band: 8.8, tile: 8.95, text: 9.1, zoom: 10.0 };
export const CHAT = { typing: 10.35, text: 10.8, wa: 11.4, msg: 'On fait ton site ensemble ?' };
export const END = { logo: 12.05, name: 12.6 };
export const CONTACT = { logo: '<je.fais.ton.site/>', name: 'Jordy Adopo', phone: '+225 07 09 95 10 92' };
