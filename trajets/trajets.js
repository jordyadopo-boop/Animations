// Réglages de chaque vidéo de trajet (les données réelles sont dans data/<nom>/).
export default {
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
