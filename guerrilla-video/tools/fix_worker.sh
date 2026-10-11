#!/bin/bash
# Render several frame ranges (sequentially) into build/mx/es/fixframes. Usage: tools/fix_worker.sh "a b" "c d" ...
cd "$(dirname "$0")/.."
for r in "$@"; do set -- $r; LANG_V=es VIDEO=mx node tools/render.mjs $1 $2 build/mx/es/fixframes; done
echo "worker finished"
