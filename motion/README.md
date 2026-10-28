# Motion : petits films promo en code

Des vidéos verticales (1080 × 1920, 30 i/s) dans le style « motion design SaaS » : lettres en relief, balle qui s'écrase et s'étire, courbes d'accélération, cartes à ressort, compteurs.
Chaque film est **une seule page HTML** : la fonction `renderFrame(t)` place tout à l'instant `t`, donc le rendu image par image est exact et reproductible.

## Films

| Film | Dossier | Durée | Rendu |
| --- | --- | --- | --- |
| Portfolio Jordy Adopo, « Je fais ton site internet » | `portfolio/` | 16 s | `rendus/portfolio.mp4` |

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

## Commandes

```bash
npm install                                   # une fois (Playwright doit être disponible)
node render/serve.js                          # aperçu : http://localhost:5173/motion/portfolio/index.html
                                              # (?t=7.2 fige une image)
node motion/portfolio/audio.js                # bande-son synthétisée -> out/portfolio.wav
node motion/render.js portfolio               # film -> out/portfolio.mp4 (flou de mouvement : 4 sous-images par image)
node motion/render.js portfolio --stills 3,8  # images fixes -> out/stills/
```

Polices : Space Grotesk et JetBrains Mono, licence SIL OFL (`portfolio/assets/OFL-*.txt`).
