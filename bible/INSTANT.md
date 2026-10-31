# L'INSTANT — court-métrage contre la violence

> 2 min 32 · 16:9 (1920×1080, 24 i/s) · sans dialogue · tout public
> Message : **un seul geste violent peut te faire perdre ce qui compte le plus.**

## Le principe
Un homme lève la main sur sa femme. Le temps se fige une seconde avant le coup.
Dans cette seconde suspendue, il voit ce que ce geste va lui coûter. Puis il ouvre la main.

- **3D sculptée** (pâte à modeler) = le présent figé, dans l'appartement la nuit.
- **2D à l'encre** (noir sur papier crème) = les visions de l'avenir.
- Aucune violence montrée frontalement : tout est suggéré (ombres chinoises, hors-champ, son).

## Découpage
| Temps | Plan |
|---|---|
| 0:00–0:06 | Accroche : noir, battements de cœur ; le poing qui se serre, ses yeux à elle, l'enfant et son doudou, le verre bousculé, le bras qui se lève. |
| 0:06 | **Gel** : le verre et l'eau restent suspendus, la trotteuse s'arrête. |
| 0:06–0:27 | La caméra traverse l'instant figé. Texte : *« Il reste une seconde. »* Plongée dans une goutte d'eau. |
| 0:27–0:55 | **Vision 1 — Partir** : elle s'en va avec l'enfant ; il reste seul ; appels sans réponse ; « PAPA » s'efface du dessin. *« Elle est vivante. Mais tu l'as perdue. »* |
| 0:55–1:00 | Retour : sa colère se fissure. |
| 1:00–1:32 | **Vision 2 — L'irréparable** : ombres chinoises, le noir ; une main immobile ; gyrophares ; menottes ; cellule. *« Une seconde de colère. Une vie entière de regrets. »* |
| 1:32–1:35 | Retour : l'horreur sur son visage ; on entre dans l'œil de l'enfant. |
| 1:35–1:58 | **Vision 3 — L'héritage** : l'enfant entend les cris ; il grandit ; à 32 ans il serre le poing à son tour, avec la même montre. *« Ton fils apprend de toi. »* |
| 1:58–2:11 | Raccord sur le poing du père, qui **s'ouvre** lentement. |
| 2:11–2:18 | Le temps repart : seul le verre se brise. |
| 2:20–2:32 | *« Un seul geste peut tout te prendre. — Arrête-toi avant. »* Titre : **L'INSTANT**. |

## Fichiers
- `src/episodes/instant.js` — l'épisode (chronologie, plans 3D, sons `CUES`).
- `src/episodes/instant_ink.js` — les trois visions à l'encre.
- `src/engine/room.js` — l'appartement de nuit (3D) + calque encre pour les visions.
- `src/characters/human.js` — humains sculptés (corps, tête fine, mains articulées).
- `src/characters/instant_props.js` — verre, eau figée, éclats, montre, doudou.
- `src/characters/inkpeople.js` — personnages au trait.
- `render/audio_instant.js` — bande-son synthétisée (cœur, verre, piano, sirène, pluie…).

## Rendu
```
node render/audio_instant.js instant           # son -> out/instant.wav
node render/render.js --ep instant --workers 4 # image + son -> out/instant.mp4
```
