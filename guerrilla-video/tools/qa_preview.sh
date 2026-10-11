#!/bin/bash
# Dense pre-render QA: preview every scene of a video every STEP seconds and build contact sheets.
# Usage: VIDEO=napo LANG_V=es STEP=1.5 tools/qa_preview.sh [scene ...]
cd "$(dirname "$0")/.."
SP=/tmp/claude-0/-home-user-BUSINESS/a6bf4c70-7473-5252-8e29-d6699e26ac1b/scratchpad/qa
mkdir -p $SP build/$VIDEO/qa
TLF=build/$VIDEO/${LANG_V}/timeline.json
SCENES=${@:-$(python3 -c "import json;print(' '.join(s['id'] for s in json.load(open('$TLF'))['scenes']))")}
for sc in $SCENES; do
  T=$(python3 -c "import json;s=[x for x in json.load(open('$TLF'))['scenes'] if x['id']=='$sc'][0];st=${STEP:-1.5};print(','.join('%.2f'%(0.4+i*st) for i in range(int((s['dur']-0.5)/st)+1)))")
  OUT=build/$VIDEO/qa node tools/preview.mjs $sc $T > /dev/null 2>&1
  FILES=$(python3 -c "print(' '.join('build/$VIDEO/qa/${sc}_%s.jpg'%t for t in '$T'.split(',')))")
  SMALL=1 python3 tools/sheet.py $SP/qa_$sc.jpg $FILES && echo "$sc -> $SP/qa_$sc.jpg"
done
