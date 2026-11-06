#!/bin/bash
set -e
cd "$(dirname "$0")"
mkdir -p livrables
OUT=livrables/episode55_trois_esprits_verts_sortent_de_la_gueule_du_dragon.mp4
printf "file '%s.mp4'\n" s0 s1 s2 s3 > seg/list.txt
ffmpeg -y -v error -f concat -safe 0 -i seg/list.txt -i build/audio.wav \
  -vf "scale=1080:1920:flags=lanczos,ass=build/subs.ass" \
  -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -r 24 \
  -c:a aac -profile:a aac_low -ar 44100 -ac 2 -b:a 160k -shortest -movflags +faststart $OUT
ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT
