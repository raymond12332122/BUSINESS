#!/bin/bash
# Encode the vertical short "Monopolio" from its 720x1280/24 fps frames: two-pass H.264 under 30 MiB for chat delivery.
# No denoise: the dithering and grain are part of the look.
set -e
cd "$(dirname "$0")/.."
F=build/mono/es/frames; A=build/mono/es/mix.wav; O=output; mkdir -p $O
N=$(ls $F | grep -c 'jpg$')
DUR=$(python3 -c "print($N / 24)")
VB=$(python3 -c "print(int((29.0*8*1024*1024/$DUR - 128000)*0.97))")
echo "frames: $N  duration $DUR s  video bitrate $VB"
ffmpeg -y -loglevel error -framerate 24 -i $F/f_%05d.jpg -c:v libx264 -preset slow -tune grain -b:v $VB -pass 1 -passlogfile /tmp/mono720 -pix_fmt yuv420p -an -f mp4 /dev/null
ffmpeg -y -loglevel error -framerate 24 -i $F/f_%05d.jpg -i $A -c:v libx264 -preset slow -tune grain -b:v $VB -pass 2 -passlogfile /tmp/mono720 -pix_fmt yuv420p -c:a aac -b:a 128k -shortest -movflags +faststart $O/tmp_mono.mp4
mv $O/tmp_mono.mp4 $O/monopolio.mp4
ls -la $O/monopolio.mp4
