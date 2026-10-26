#!/bin/bash
set -e
cd "$(dirname "$0")"
mkdir -p livrables
printf "file '%s.mp4'\n" s0 s1 s2 s3 > seg/list.txt
ffmpeg -y -v error -f concat -safe 0 -i seg/list.txt -i build/audio.wav \
  -vf "scale=1080:1920:flags=lanczos,ass=build/subs.ass" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 24 \
  -c:a aac -b:a 192k -shortest -movflags +faststart \
  /home/user/Animations/ep16/livrables/episode16_il_ne_crie_pas.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 /home/user/Animations/ep16/livrables/episode16_il_ne_crie_pas.mp4
