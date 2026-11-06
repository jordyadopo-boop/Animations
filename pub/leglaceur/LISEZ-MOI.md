# Pub « Le Glaceur » — 16:9, 2 min 04

Même principe que la pub Odyssée (et la vidéo de référence) : typographie animée, voix off calée mot à mot, effets façon studio,
photos produits du site et **vrai site filmé** (accueil 3D + parcours de devis). Faits et prix tirés de `leglaceur/src/js/config.js`.
Rendu : `episodes_rendus/LE_GLACEUR_pub_16x9.mp4`.

## Refaire la vidéo
1. Texte : `script.json`, puis `python3 pub/leglaceur/tools/tts.py` (voix + `timeline.json`)
2. Filmer le site (dépôt leglaceur lancé avec `npx vite --port 5179`) :
   `node pub/leglaceur/tools/capture-site.cjs http://127.0.0.1:5179 home <dossier>` et `... devis <dossier> pub/leglaceur/timeline.json`,
   puis copier les images dans `out/leglaceur/frames/home|devis/` et mettre à jour `out/leglaceur/frames/counts.json`
3. `node pub/leglaceur/tools/render.mjs --stills 10,40` (contrôle) puis `--workers 4`
4. `python3 pub/leglaceur/tools/music.py` (musique + bruitages + voix, −14 LUFS)
5. `ffmpeg -i out/leglaceur/video.mp4 -i out/leglaceur/mix.wav -map 0:v -map 1:a -c:v libx264 -crf 26 -c:a aac -b:a 192k -shortest episodes_rendus/LE_GLACEUR_pub_16x9.mp4`
