#!/bin/bash
# Render several frame ranges (sequentially) into build/$VIDEO/es/fixframes (VIDEO defaults to mx). Usage: tools/fix_worker.sh "a b" "c d" ...
cd "$(dirname "$0")/.."
V=${VIDEO:-mx}
for r in "$@"; do set -- $r; LANG_V=es VIDEO=$V node tools/render.mjs $1 $2 build/$V/es/fixframes; done
echo "worker finished"
