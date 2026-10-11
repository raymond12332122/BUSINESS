#!/bin/bash
# Encode the Revolution video: 1080p master + 720p two-pass copy under 30 MiB for chat delivery.
set -e
cd "$(dirname "$0")/.."
F=build/mx/es/frames; A=build/mx/es/mix.wav; O=output; mkdir -p $O
N=$(ls $F | grep -c 'jpg$')
echo "frames: $N"
ffmpeg -y -loglevel error -framerate 30 -i $F/f_%05d.jpg -i $A -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart $O/tmp_master.mp4
mv $O/tmp_master.mp4 $O/revolucion-mexicana-1080p.mp4
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $O/revolucion-mexicana-1080p.mp4)
# 29.5 MiB budget, 96 kb/s audio
VB=$(python3 -c "print(int((29.5*8*1024*1024/$DUR - 96000)*0.985))")
echo "duration $DUR s; video bitrate $VB"
ffmpeg -y -loglevel error -i $O/revolucion-mexicana-1080p.mp4 -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slow -b:v $VB -pass 1 -passlogfile /tmp/mx2pass -an -f mp4 /dev/null
ffmpeg -y -loglevel error -i $O/revolucion-mexicana-1080p.mp4 -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slow -b:v $VB -pass 2 -passlogfile /tmp/mx2pass -c:a aac -b:a 96k -movflags +faststart $O/tmp_720.mp4
mv $O/tmp_720.mp4 $O/revolucion-mexicana.mp4
ls -la $O/revolucion-mexicana*.mp4
