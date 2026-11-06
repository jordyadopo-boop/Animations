# Pub « Odyssée Games » — 16:9, 3 min 15

Typographie animée + gameplay réel, dans le style de la vidéo de référence (écran d'ordinateur), en plein cadre 1920x1080.
Rendu : `episodes_rendus/ODYSSEE_GAMES_pub_16x9.mp4`.

## Refaire la vidéo
1. `pip install edge-tts numpy scipy` (voix neuronale fr-FR-HenriNeural)
2. Modifier le texte dans `script.json`, puis `python3 pub/odyssee/tools/tts.py` → voix + `timeline.json` (minutage mot à mot)
3. `python3 pub/odyssee/tools/frames.py /chemin/vers/games-02/media` (β : capture du vrai jeu dans `out/odyssee/src/beta-capture.mp4`, filmée avec Playwright) → images des extraits de gameplay (`clips.json`)
4. `node pub/odyssee/tools/render.mjs --stills 3,20,80` (contrôle) puis `--workers 4` (vidéo muette)
5. `python3 pub/odyssee/tools/music.py` → musique + bruitages synthétisés, mixés avec la voix (−14 LUFS)
6. `ffmpeg -i out/odyssee/video.mp4 -i out/odyssee/mix.wav -map 0:v -map 1:a -c:v libx264 -crf 23 -c:a aac -b:a 192k -shortest episodes_rendus/ODYSSEE_GAMES_pub_16x9.mp4`

Le contenu des scènes est dans `screen.js` (une fonction par scène, calée sur les mots de la voix).
