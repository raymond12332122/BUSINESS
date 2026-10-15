#!/usr/bin/env bash
# Builds HELIRUBY-Studio.apk from ../heliruby-studio.html without Gradle.
# Needs: JDK 17+, Android SDK with "platforms;android-34" and "build-tools;35.0.0".
# Signing: set KEYSTORE (path), KS_PASS and KEY_ALIAS; a new key is created if KEYSTORE doesn't exist.
set -euo pipefail
cd "$(dirname "$0")"
SDK="${ANDROID_HOME:-$HOME/android-sdk}"
BT="$SDK/build-tools/35.0.0"
JAR="$SDK/platforms/android-34/android.jar"
VERSION_CODE="${VERSION_CODE:-1}"
VERSION_NAME="${VERSION_NAME:-1.0}"
KEYSTORE="${KEYSTORE:-$HOME/heliruby-release.keystore}"
KS_PASS="${KS_PASS:?Set KS_PASS to the keystore password}"
KEY_ALIAS="${KEY_ALIAS:-heliruby}"

rm -rf build && mkdir -p build/gen build/classes build/assets/www build/res
cp ../heliruby-studio.html build/assets/www/index.html

"$BT/aapt2" compile --dir res -o build/res/
"$BT/aapt2" link -o build/unsigned.apk -I "$JAR" --manifest AndroidManifest.xml \
  --java build/gen -A build/assets build/res/*.flat \
  --min-sdk-version 24 --target-sdk-version 34 \
  --version-code "$VERSION_CODE" --version-name "$VERSION_NAME"

javac -nowarn -Xlint:-options -source 8 -target 8 -bootclasspath "$JAR" -d build/classes \
  $(find src build/gen -name '*.java')
"$BT/d8" --min-api 24 --lib "$JAR" --output build $(find build/classes -name '*.class')
(cd build && zip -q unsigned.apk classes.dex)

"$BT/zipalign" -p -f 4 build/unsigned.apk build/aligned.apk
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -keystore "$KEYSTORE" -storepass "$KS_PASS" -keypass "$KS_PASS" -alias "$KEY_ALIAS" \
    -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=HELIRUBY Studio" >/dev/null 2>&1
  echo "Created new signing key: $KEYSTORE (keep it — updates must be signed with the same key)"
fi
"$BT/apksigner" sign --ks "$KEYSTORE" --ks-pass "pass:$KS_PASS" --ks-key-alias "$KEY_ALIAS" \
  --out build/HELIRUBY-Studio.apk build/aligned.apk
"$BT/apksigner" verify build/HELIRUBY-Studio.apk
echo "Built android/build/HELIRUBY-Studio.apk"
