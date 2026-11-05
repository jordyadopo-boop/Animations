#!/bin/bash
# Rendu complet d'un episode : ./rendu.sh ep18
# Lance 4 rendus en parallele, attend exactement ces 4 processus (wait sur leurs PID),
# verifie le nombre d'images de chaque morceau, puis assemble la video.
set -e
cd "$(dirname "$0")/$1"
cat web/head.js web/body.js web/tail.js > web/main.js
mkdir -p seg
N=$(python3 -c "import json;T=json.load(open('build/timeline.json'))['duration'];print(int(T*24)+12)")
Q=$((N / 4)); pids=()
for i in 0 1 2 3; do
  a=$((i * Q)); b=$(( i == 3 ? N : (i + 1) * Q ))
  node render.js $a $b seg/s$i.mp4 > seg/log$i.txt 2>&1 & pids+=($!)
done
for p in "${pids[@]}"; do wait "$p" || { echo "ECHEC du rendu (pid $p)"; exit 1; }; done
for i in 0 1 2 3; do
  a=$((i * Q)); b=$(( i == 3 ? N : (i + 1) * Q ))
  n=$(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 seg/s$i.mp4)
  [ "$n" -eq $((b - a)) ] || { echo "ECHEC : seg/s$i.mp4 a $n images au lieu de $((b - a))"; exit 1; }
done
bash assemble.sh
echo "RENDU TERMINE"
