# Épisode 48 — LE CIEL ENTIER CRIE ALLÉLUIA (Apocalypse 19, 1-10)
- Titre choisi par Mr A parmi deux propositions (l'autre : « UN MARIAGE DANS LE CIEL »).
- Construit sur la base de l'ép. 47 (branche de la série biblique `ccr-8ce4a7d9-guy1rk`) : web/helpers.js = helpers de l'ép. 47,
  web/sets48.js = scènes de l'ép. 48 ; `cat web/helpers.js web/sets48.js > web/body.js` avant `./rendu.sh ep48`.
- Nouveaux éléments réutilisables : crowd()/crowdPts() (foule instanciée, bras qui se lèvent), goldHeaven() (ciel d'or, sol doré),
  goldWord() (mot doré à contour sombre, lisible sur ciel clair), feastTable(), bride(), lamb(), millstone(), scoreSheet().
- Leçons : sur un ciel clair, les hologrammes additifs (holoMat) deviennent invisibles → objets pleins ; sol et nuages blancs
  écrasent l'image → sol doré, nuages seulement au loin ; ne jamais mettre de nuages entre la caméra et la scène.
- Prochain : 49 Apocalypse 18, 21-24 (un ange jette une meule dans la mer) → proposer titre + couverture avant de commencer.
- ⚠ DÉCISION de Mr A (5 nov. 2026) : épisodes 49 et 50 encore en 3D (même pipeline), puis À PARTIR DE L'ÉPISODE 51,
  passage en « stick animation » (animation de bonhommes dessinés) avec le skill animation-studio.
- ⚠ Pour la stick animation (ép. 51 et suivants) : montrer d'abord des CAPTURES (images fixes du style et des scènes)
  à Mr A et attendre son accord avant le rendu complet.
- ⚠ DÉCISION de Mr A (6 nov. 2026), après comparaison des 3 rendus de l'ép. 51 (3D, 2D Animation Studio, slapstick) :
  ON CONTINUE EN 3D. Les versions 2D et slapstick de l'ép. 51 sont gardées en archives (ep51/anim, ep51/anim-slap, ep51/livrables).
  L'ép. 51 officiel = la version 3D (ep51/web/sets51.js, livrables/episode51_3D_...).
- Prochain : 52 Apocalypse 17, 7-18 (l'ange explique le mystère de la femme et de la bête) → proposer titre + couverture d'abord.
- Ép. 57 UN SOLEIL DE FEU (Ap 16,8-9) livré. Ép. 58 LES FLEUVES DEVIENNENT DU SANG (Ap 16,4-7) : sources, couverture, légende commitées ;
  rendu complet via `./rendu.sh ep58` (livrables/episode58_les_fleuves_deviennent_du_sang.mp4).
- Prochain : 59 Apocalypse 16, 1-3 (voix du temple : « versez les sept coupes » ; 1re coupe = ulcères ; 2e coupe = la mer comme le sang d'un mort)
  → proposer 2 titres + couverture d'abord. Nouveau épisode = copier ep58 (render.js, web/head|tail|lib|helpers*, build_audio.py), body.js = cat helpers*.js setsNN.js.
- ⚠ NOUVEAU FORMAT demandé par Mr A (à partir de l'ép. 59) : un personnage à son image, « Mr A », discute avec Claude
  et les deux racontent l'histoire ensemble (dialogue). Personnage : personnages/helpersMrA.js (fonction mrA() :
  peau foncée, cheveux très courts, bouc, lunettes ovales dorées verres sombres, polo marron manches courtes) ;
  captures : personnages/mrA_captures.jpg. À copier dans epNN/web/ et ajouter dans body.js avant setsNN.js.
  Voix de Mr A : en attente de son choix (Gérard fr-BE-GerardNeural / Fabrice fr-CH-FabriceNeural / Henri fr-FR-HenriNeural,
  Henri sert déjà aux citations bibliques).
