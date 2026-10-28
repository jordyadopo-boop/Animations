# Motion : petits films promo en code

Des vidéos verticales (1080 × 1920, 30 i/s) dans le style « motion design SaaS » : lettres en relief, balle qui s'écrase et s'étire, courbes d'accélération, cartes à ressort, compteurs.
Chaque film est **une seule page HTML** : la fonction `renderFrame(t)` place tout à l'instant `t`, donc le rendu image par image est exact et reproductible.

## Films

| Film | Dossier | Durée | Rendu |
| --- | --- | --- | --- |
| Portfolio Jordy Adopo, « Je fais ton site internet » | `portfolio/` | 16 s | `rendus/portfolio.mp4` |
| Le Glaceur, « La fraîcheur sous toutes ses formes » | `glaceur/` | 21 s | `rendus/glaceur.mp4` |
| Auto-promo « Je fais ton site », style interface iPhone | `jefais/` | 14 s | `rendus/jefais.mp4` |

### Portfolio : déroulé (120 BPM, une coupe par temps fort)

| Temps | Scène |
| --- | --- |
| 0 – 2 s | `<je.fais.ton.site/>` en lettres 3D qui tombent en place |
| 2 – 4,5 s | La balle rouge rebondit : *Idée. Design. Code.* La caméra recule : l'éditeur, le code qui se tape, la courbe *ease-in-out* |
| 4,5 – 6 s | La balle grossit (*Livré.*), devient une fenêtre de navigateur, remplit l'écran |
| 6 – 9 s | Les 4 réalisations en cartes : Le Glaceur, AMD Design, Odyssée Games, LIY10.LEARNING |
| 9 – 11 s | Les 6 services, chacun avec sa mini-animation |
| 11 – 13 s | Les chiffres : 4+, 100 %, 24/7 |
| 13 – 16 s | Signature, bouton WhatsApp cliqué, numéro |

Textes, captures et couleurs viennent du site `business-sites` (charte : noir, rouge `#ff3b4e`, Space Grotesk, JetBrains Mono).
Tout le minutage est dans `portfolio/score.js`, partagé par l'image et le son.

### Le Glaceur : déroulé (120 BPM)

| Temps | Scène |
| --- | --- |
| 0 – 4,7 s | **Vrai glaçon 3D** (three.js, verre physique qui réfracte le mot GLACEUR) : chute, rebonds écrasés-étirés, *Pureté. Hygiène. Qualité.*, pluie de glaçons, caméra qui tourne puis plonge dans la glace, voile de givre |
| 4,5 – 8,6 s | Carrousel 3D des 6 glaces avec photos et prix réels qui défilent |
| 8,5 – 14 s | Le devis sur téléphone : les quantités montent, la jauge débloque la livraison offerte à 20 articles, le PDF sort, l'envoi sur WhatsApp, lu, réponse |
| 13,8 – 17 s | Carte schématique d'Abidjan : les livraisons partent d'Abatta vers les 14 communes |
| 17 – 18,7 s | Carboglace : le compteur descend à −78,5 °C |
| 18,5 – 21 s | Logo, « La fraîcheur sous toutes ses formes », bouton WhatsApp, numéro |

Prix, produits, communes et numéro viennent de `src/js/config.js` du site Le Glaceur (photos et polices Barlow du site).

### Je fais ton site : déroulé (120 BPM, style interface iPhone)

| Temps | Scène |
| --- | --- |
| 0 – 2 s | Accroche sur fond noir : des blocs de couleur deviennent « Toujours à la recherche d'un (développeur) ? » |
| 2 – 4,6 s | Barre de recherche : un point la touche, elle s'élargit, on tape `je.fais.ton.site`, halo à la validation |
| 4,5 – 7 s | Carte de profil (avatar de la page, pastilles Vitrine / Devis / Apps / Google), défilement vers « Mes réalisations », la main touche AMD Design |
| 7 – 8,8 s | « Des sites qui travaillent pour toi. » : les 4 sites en éventail 3D |
| 8,8 – 10,3 s | Bande rouge, carte `<je.fais/>` et « demande ton DEVIS » |
| 10,3 – 12 s | Bulle de message « On fait ton site ensemble ? » + WhatsApp |
| 12 – 14 s | Logo `<je.fais.ton.site/>` lumineux, nom et numéro |

## Commandes

```bash
npm install                                   # une fois (Playwright doit être disponible)
node render/serve.js                          # aperçu : http://localhost:5173/motion/portfolio/index.html
                                              # (?t=7.2 fige une image)
node motion/portfolio/audio.js                # bande-son synthétisée -> out/portfolio.wav
node motion/render.js portfolio               # film -> out/portfolio.mp4 (flou de mouvement : 4 sous-images par image)
node motion/render.js portfolio --stills 3,8  # images fixes -> out/stills/
node motion/glaceur/audio.js && node motion/render.js glaceur   # film Le Glaceur (WebGL logiciel, plus lent)
node motion/jefais/audio.js && node motion/render.js jefais     # auto-promo Je fais ton site
```

Polices : Space Grotesk, JetBrains Mono et Barlow (Inter pour « Je fais ton site », police du système), licence SIL OFL (`*/assets/OFL-*.txt`).
