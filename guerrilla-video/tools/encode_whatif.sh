#!/bin/bash
# Encode the what-if video straight from its 720p/24 fps frames: denoised two-pass H.264 under 30 MiB for chat delivery.
set -e
cd "$(dirname "$0")/.."
F=build/whatif/es/frames; A=build/whatif/es/mix.wav; O=output; mkdir -p $O
N=$(ls $F | grep -c 'jpg$')
echo "frames: $N"
DUR=$(python3 -c "print($N / 24)")
# 29.5 MiB budget, 96 kb/s audio; grain smoothed first so the low bitrate isn't spent on noise
VB=$(python3 -c "print(int((29.5*8*1024*1024/$DUR - 96000)*0.985))")
VF="hqdn3d=3:2.5:6:5"
echo "duration $DUR s; video bitrate $VB"
ffmpeg -y -loglevel error -framerate 24 -i $F/f_%05d.jpg -vf "$VF" -c:v libx264 -preset slow -tune animation -b:v $VB -pass 1 -passlogfile /tmp/whatif720 -pix_fmt yuv420p -an -f mp4 /dev/null
ffmpeg -y -loglevel error -framerate 24 -i $F/f_%05d.jpg -i $A -vf "$VF" -c:v libx264 -preset slow -tune animation -b:v $VB -pass 2 -passlogfile /tmp/whatif720 -pix_fmt yuv420p -c:a aac -b:a 96k -shortest -movflags +faststart $O/tmp_whatif.mp4
mv $O/tmp_whatif.mp4 $O/que-pasaria-si.mp4
ls -la $O/que-pasaria-si.mp4
