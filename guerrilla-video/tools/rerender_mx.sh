#!/bin/bash
# Re-render frame ranges after fixes: tools/rerender_mx.sh "a1 b1" "a2 b2" ...   (two workers, ranges split between them)
cd "$(dirname "$0")/.."
F=build/mx/es/frames
for r in "$@"; do set -- $r; for ((f=$1; f<$2; f++)); do rm -f $F/$(printf 'f_%05d.jpg' $f); done; done
i=0
for r in "$@"; do set -- $r; LANG_V=es VIDEO=mx node tools/render.mjs $1 $2 $F > build/mx/rerender_$1.log 2>&1 & i=$((i+1)); if (( i % 2 == 0 )); then wait; fi; done
wait; echo "rerender done"; ls $F | grep -c 'jpg$'
