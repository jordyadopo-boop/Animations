# Notes de la série (à relire avant chaque nouvel épisode)

## Préférences de Mr A (oct. 2026)
- Varier les sujets : en plus de l'histoire, la science et la religion, analyser et interpréter
  des œuvres d'art célèbres ou mystérieuses, anciennes ou récentes, publiques ou privées.
  Modèle : vidéo « Watchers in the Night » (Thomas Blackshear) : accroche « ce n'est pas un hasard »,
  une seule œuvre détaillée, voix grave et calme, question finale troublante.
- On montre la vraie œuvre (domaine public : sans souci ; œuvre protégée : extraits courts
  pour commentaire, crédit de l'artiste dans la légende).
- Après les suppressions TikTok des ép. 13 (« Devenir riche grâce à l'IA ») et 14 (« Et si demain
  n'arrivait pas ») : pas de titre type fin du monde ni promesse d'argent ; peur par l'ambiance,
  pas d'image choquante ; faits du passé sourcés.
- Vues faibles : image forte et connue dès la 1re seconde, durée visée 75–100 s,
  couvertures plus variées (vraie image en grand).

## Rendu
- Toujours lancer le rendu complet avec `./rendu.sh epN` en tâche de fond : il attend les 4 rendus
  par leur PID, vérifie le nombre d'images de chaque morceau puis assemble. Ne jamais surveiller
  avec `pgrep node` (confond avec d'autres programmes node et avec la commande de surveillance elle-même).

## Mises à jour (épisodes 21 à 27, oct. 2026)
- Épisodes faits : 21 Voynich, 22 pieuvre, 23 grosses fesses, 24 Watchers in the Night (Blackshear), 25 Faune au clair de lune (Spilliaert), 26 trous blancs, 27 pyramides.
- Les épisodes 13 et 14 sont revenus sur TikTok.
- Analyse d'œuvre (ép. 24, 25) : Mr A veut l'œuvre à l'écran du début à la fin, décortiquée en détail
  (point de vue, lumière, composition, symboles), même si elle est protégée : crédit permanent en bas de l'écran
  et dans la légende. Modèle technique : ep24/web/body.js (tableau en plan, pview, traits lumineux qui se dessinent).
- Quand Mr A envoie une vidéo modèle (TikTok d'un autre créateur) : reprendre le sujet, vérifier chaque fait,
  corriger les erreurs, réécrire entièrement le texte (ne pas copier).
- Quand Mr A dit « vas-y, pas besoin de valider le script » : enchaîner script, fabrication et livraison sans attendre.
- Ép. 23 : Mr A a choisi lui-même le titre et la couverture (femmes de dos, formes variées : ronde, mince, type BBL).
  Respecter ses choix éditoriaux sur sa chaîne, en restant habillé et stylisé low-poly.
- Couverture : le sujet du titre doit être la vedette de l'image (ép. 26 : le trou blanc en grand, pas le trou noir).
- Contrôles : toujours vérifier qu'aucun personnage n'est filmé de dos, que les cartes ne chevauchent pas les
  sous-titres anglais, et que les hologrammes additifs restent visibles sur fond clair (sinon matériau opaque).
- Si un rendu est interrompu (redémarrage de la machine), relancer `./rendu.sh epN` ; pour corriger un seul passage,
  refaire uniquement le morceau concerné (render.js a b seg/sK.mp4, vérifier le nombre d'images) puis `bash assemble.sh`.
