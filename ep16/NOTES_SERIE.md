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

## Mises à jour (épisodes 28 à 31, oct. 2026)
- Épisodes faits : 28 Colisée rempli d'eau, 29 tardigrades, 30 Arche d'alliance, 31 Machiavel (d'après une vidéo modèle de Mr A).
- Titres : Mr A préfère les titres affirmatifs et intrigants aux questions plates
  (ép. 28 : « ILS ONT ESSAYÉ DE REMPLIR LE COLISÉE D'EAU » au lieu de « Le Colisée était-il rempli d'eau ? »).
- Rendu : lancer `./rendu.sh epN` en tâche de fond avec la limite de temps maximale (timeout 7200000) ;
  la limite par défaut (30 min) coupe le rendu. Si c'est arrivé : compter les images de seg/s*.mp4, puis `bash assemble.sh`.
- Humains : la coiffure 'wrap' de lib.js masque le visage. Pour un turban ou un voile, utiliser hairStyle 'short' + hat 'cap'.
- Éclairage : placer le soleil du côté de la caméra quand des personnages marchent vers elle (sinon les visages sont à contre-jour).
- Les étiquettes 3D (label) dans un groupe orienté avec lookAt peuvent disparaître : pour un texte important, utiliser une carte (cardsMgr)
  avec un yf entre 0,05 et 0,35 (sous les sous-titres).
- Décors à l'échelle 1 = 10 m (Colisée) : garder la caméra dans le volume de l'arène ou bien au-dessus des murs, sinon elle traverse les gradins.

## Mises à jour (épisodes 32 à 34, oct. 2026)
- Épisodes faits : 32 Le Soleil fonce à 830 000 km/h (orbites, canon de Newton, d'après une vidéo modèle), 33 L'Ange déchu (Cabanel),
  34 Les neuf chœurs des anges / Pseudo-Denys (tableau de Botticini). Les trois ont été demandés d'après des vidéos modèles de Mr A,
  à faire « l'un après l'autre » sans validation intermédiaire.
- assemble.sh : les anciens dossiers écrivent dans /home/user/Animations (A majuscule) ; depuis l'ép. 32, chemin relatif `livrables/...`.
- Images d'œuvres : Wikimedia renvoie souvent 429 (trop de requêtes). Essayer `commons.wikimedia.org/wiki/Special:FilePath/<nom>`
  avec un User-Agent explicite ; sinon le serveur IIIF du musée (National Gallery : `server.iip?IIIF=...`, 800 px max par requête,
  assembler les tuiles avec PIL). Toujours prendre la pleine résolution pour les gros plans (frac ≥ 0,15 dans pview).
- Sous-titres anglais sur un tableau clair (ciel) : contour 4,5 et ombre 2,5 dans le style Sub (voir ep33/build_audio.py).
- Soleil en 3D : halo en sprite à dégradé radial (makeSun dans ep32/web/body.js), pas des sphères concentriques (anneaux visibles).
- Vue de côté Soleil–Terre en format vertical : rapprocher les objets (le champ horizontal est étroit, ≈ 0,56 × le vertical).
- faster-whisper : si `av.open(... metadata_errors)` plante, lui passer un tableau numpy (langcheck.py le fait déjà via ffmpeg).
- Encadrés : éviter qu'un trait lumineux passe derrière (le bloom efface le texte) ; monter l'encadré (yf ≈ 0,1) si besoin.
- Voix : une phrase faite seulement d'une liste de noms (« Séraphins, Chérubins, Trônes… ») est lue en anglais par la voix multilingue.
  L'insérer dans une vraie phrase française (« Il y a d'abord les séraphins… ») et toujours lancer langcheck.py avant le rendu.
