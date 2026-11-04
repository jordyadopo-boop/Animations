# Vidéos de trajet en 3D (données réelles)

Une ligne bleue trace un vrai itinéraire sur une maquette 3D du quartier (format 9:16, 1080×1920).

Sources :
- itinéraire : OSRM (vraies routes, distance et durée) ;
- bâtiments : empreintes Overture Maps (OSM + détections satellite Google/Microsoft). Hauteur réelle quand elle est connue, sinon estimée d'après la surface ;
- eau, verdure, routes : tuiles vectorielles OpenFreeMap (OpenStreetMap) ;
- arbres : semés automatiquement dans les espaces libres (pas de données réelles d'arbres).

## Nouvelle vidéo

```bash
# 1. trajet + carte
node trajets/fetch.mjs --name mon_trajet --from LAT,LON --to LAT,LON [--mode driving|foot|bike]
# 2. bâtiments (pip install duckdb==1.1.3)
AWS_ACCESS_KEY_ID= AWS_SECRET_ACCESS_KEY= python3 -I trajets/buildings.py mon_trajet
# 3. ajouter une entrée dans trajets/trajets.js (titre, étiquettes, repères, durée)
# 4. images de contrôle puis rendu
node trajets/render.mjs --name mon_trajet --stills 1,8,18
node trajets/render.mjs --name mon_trajet --workers 4 [--audio musique.wav]
```

Le résultat est écrit dans `out/trajet_<nom>.mp4`.
