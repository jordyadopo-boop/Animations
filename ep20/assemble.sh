#!/bin/bash
set -e
cd "$(dirname "$0")"
mkdir -p livrables
printf "file '%s.mp4'\n" s0 s1 s2 s3 > seg/list.txt
ffmpeg -y -v error -f concat -safe 0 -i seg/list.txt -i build/audio.wav \
  -vf "scale=1080:1920:flags=lanczos,ass=build/subs.ass" \
  -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -r 24 \
  -c:a aac -profile:a aac_low -ar 44100 -ac 2 -b:a 160k -shortest -movflags +faststart \
  /home/user/Animations/ep20/livrables/episode20_ton_cerveau_croit_ce_que_tu_repetes.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 /home/user/Animations/ep20/livrables/episode20_ton_cerveau_croit_ce_que_tu_repetes.mp4
