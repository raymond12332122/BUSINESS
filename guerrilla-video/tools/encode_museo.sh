#!/bin/bash
# Encode "El robo del siglo" straight from its 720p/24 fps frames: lightly denoised two-pass H.264 under 30 MiB for chat.
set -e
cd "$(dirname "$0")/.."
F=build/museo/es/frames; A=build/museo/es/mix.wav; O=output; mkdir -p $O
N=$(ls $F | grep -c 'jpg$')
echo "frames: $N"
DUR=$(python3 -c "print($N / 24)")
# 29.2 MiB budget, 128 kb/s audio (music + voice); the film grain is softened first so the bitrate goes to the picture
VB=$(python3 -c "print(int((29.2*8*1024*1024/$DUR - 128000)*0.985))")
VF="hqdn3d=2.5:2:5:4"
echo "duration $DUR s; video bitrate $VB"
ffmpeg -y -loglevel error -framerate 24 -i $F/f_%05d.jpg -vf "$VF" -c:v libx264 -preset slow -tune film -b:v $VB -pass 1 -passlogfile /tmp/museo720 -pix_fmt yuv420p -an -f mp4 /dev/null
ffmpeg -y -loglevel error -framerate 24 -i $F/f_%05d.jpg -i $A -vf "$VF" -c:v libx264 -preset slow -tune film -b:v $VB -pass 2 -passlogfile /tmp/museo720 -pix_fmt yuv420p -c:a aac -b:a 128k -shortest -movflags +faststart $O/tmp_museo.mp4
mv $O/tmp_museo.mp4 $O/el-robo-del-siglo.mp4
ls -la $O/el-robo-del-siglo.mp4
