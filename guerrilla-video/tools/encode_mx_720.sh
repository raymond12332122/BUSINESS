#!/bin/bash
# 720p two-pass copy under 30 MiB for chat delivery. The film grain is smoothed out first (hqdn3d):
# at ~630 kb/s, per-frame grain would otherwise eat the bitrate and turn into blocky noise.
set -e
cd "$(dirname "$0")/.."
O=output; M=$O/revolucion-mexicana-1080p.mp4
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $M)
VB=$(python3 -c "print(int((29.5*8*1024*1024/$DUR - 96000)*0.985))")
VF="hqdn3d=3:2.5:6:5,scale=1280:720:flags=lanczos"
echo "duration $DUR s; video bitrate $VB"
ffmpeg -y -loglevel error -i $M -vf "$VF" -c:v libx264 -preset slow -tune animation -b:v $VB -pass 1 -passlogfile /tmp/mx720 -an -f mp4 /dev/null
ffmpeg -y -loglevel error -i $M -vf "$VF" -c:v libx264 -preset slow -tune animation -b:v $VB -pass 2 -passlogfile /tmp/mx720 -c:a aac -b:a 96k -movflags +faststart $O/tmp_720.mp4
mv $O/tmp_720.mp4 $O/revolucion-mexicana.mp4
ls -la $O/revolucion-mexicana.mp4
