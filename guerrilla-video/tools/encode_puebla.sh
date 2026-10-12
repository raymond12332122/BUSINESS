#!/bin/bash
# Encode the Puebla organized-crime video: 1080p master + denoised 720p two-pass copy under 30 MiB for chat delivery.
set -e
cd "$(dirname "$0")/.."
F=build/puebla/es/frames; A=build/puebla/es/mix.wav; O=output; mkdir -p $O
N=$(ls $F | grep -c 'jpg$')
echo "frames: $N"
ffmpeg -y -loglevel error -framerate 30 -i $F/f_%05d.jpg -i $A -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart $O/tmp_master.mp4
M=$O/puebla-crimen-organizado-1080p.mp4; mv $O/tmp_master.mp4 $M
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $M)
# 29.5 MiB budget, 96 kb/s audio; grain smoothed first so the low bitrate isn't spent on noise
VB=$(python3 -c "print(int((29.5*8*1024*1024/$DUR - 96000)*0.985))")
VF="hqdn3d=3:2.5:6:5,scale=1280:720:flags=lanczos"
echo "duration $DUR s; video bitrate $VB"
ffmpeg -y -loglevel error -i $M -vf "$VF" -c:v libx264 -preset slow -tune animation -b:v $VB -pass 1 -passlogfile /tmp/puebla720 -an -f mp4 /dev/null
ffmpeg -y -loglevel error -i $M -vf "$VF" -c:v libx264 -preset slow -tune animation -b:v $VB -pass 2 -passlogfile /tmp/puebla720 -c:a aac -b:a 96k -movflags +faststart $O/tmp_720.mp4
mv $O/tmp_720.mp4 $O/puebla-crimen-organizado.mp4
ls -la $O/puebla-crimen-organizado*.mp4
