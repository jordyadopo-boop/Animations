// Réglages de chaque vidéo de trajet (les données réelles sont dans data/<nom>/).
export default {
  koumassi_mockeyville: {
    // Dot de Jordy & Marie-Emmanuella : Grand Carrefour de Koumassi -> cour familiale (Mockeyville), sans péage
    title: ['Jordy & Marie-Emmanuella'],
    titleHTML: '<em>Mariage traditionnel – La Dot</em><span class="nm">Jordy <b>&amp;</b> Marie-Emmanuella</span><small>Du Grand Carrefour de Koumassi à Mockeyville</small>',
    fromLabel: 'Grand Carrefour de Koumassi',
    toLabel: 'Cour familiale de la mariée',
    fromZone: 'Koumassi',
    toZone: 'Mockeyville',
    duration: 54,
    endHold: 6,
    slowEnd: { meters: 1150, seconds: 12, dist: 400 },
    theme: { name: 'theme-dot', pagne: true, line: { core: '#e0b23e', glow: '#d6a6f2', glow2: '#4b0f8a' }, pin: ['#d63bbd', '#a3168e', '#6d0b5e'] },
    landmarks: [
      { n: 'Carrefour Akwaba', lat: 5.267204, lon: -3.960614, num: 2 },
      { n: 'Aéroport FHB', lat: 5.264277, lon: -3.925424, near: 4, num: 3 },
      { n: 'Sortie « Ancien A100 »', lat: 5.236559, lon: -3.878797, num: 4 },
      { n: 'Anani', lat: 5.234881, lon: -3.869628, num: 5 },
      { n: 'Modeste', lat: 5.222941, lon: -3.822201, num: 6 },
      { n: 'Boulangerie Mak Mirmont', lat: 5.21143, lon: -3.7708332, near: 4, num: 8 },
      { n: 'Espace du Château', lat: 5.21714, lon: -3.769014, near: 4, num: 9 },
      { n: 'Terrain synthétique de Mockey-ville', lat: 5.216535, lon: -3.766612, near: 4, num: 10 },
      { n: 'Stade Fondation Didier Drogba', lat: 5.216071, lon: -3.766133, num: '⚽', near: 4 },
    ],
    avoid: [{ n: 'Péage de Bassam : à éviter', lat: 5.234496, lon: -3.813618 }],
    turns: [
      { dir: 'droite', name: 'Bretelle « Ancien A100 » (ancienne route)', lat: 5.236559, lon: -3.878797, before: 900 },
      { dir: 'gauche', name: 'à la boulangerie Mak Mirmont', lat: 5.21115, lon: -3.77054, before: 300 },
      { dir: 'droite', name: "à l'Espace du Château", lat: 5.21714, lon: -3.769014, before: 300 },
      { dir: 'gauche', name: 'au Terrain synthétique de Mockey-ville', lat: 5.216535, lon: -3.766612, before: 220 },
    ],
    endCard: '<div class="k">Cour familiale de la mariée</div><div class="d">Samedi <b>21</b> novembre <b>2026</b></div><div class="a">Quartier Mockeyville, Grand-Bassam · près du Stade Fondation Didier Drogba</div>',
  },
  bassam_angre: {
    title: ['De Mockeyville', 'à Angré'],
    fromLabel: 'Départ',
    toLabel: 'Milca Cloth Home',
    fromZone: 'Mockeyville',   // quartier affiché au départ / à l'arrivée
    toZone: 'Angré',
    duration: 40,
    // les noms de quartiers viennent automatiquement d'OpenStreetMap (data/<nom>/map.json)
  },
};
