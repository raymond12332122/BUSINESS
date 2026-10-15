# BUSINESS
## HELIRUBY Studio

`heliruby-studio.html` is a single-file comic workbench for the fancomic
**HELIRUBY: THANK YOU, RUBY. GOODBYE.** It works offline and has no dependencies.

**Run it:** open `heliruby-studio.html` in Chrome (Android or desktop). For the most
reliable storage on Android, serve it from a web address (e.g. GitHub Pages) and use
Chrome → *Add to Home screen*.

**Features:** character reference library (Helios, Ruby, backgrounds) with categories,
sources, tags and search · optional puppet posing workspace · panel editor with layouts,
images, backgrounds, speech/thought/shout/whisper bubbles, captions and SFX · storyboard
with chapters C1–C5, reading order, reader preview and script · autosave plus
`.json` project files · PNG/JPEG export (single page, chapter, tall strip, whole comic).

The full guide is inside the app under **More → How to use**.

### Android app (APK)

`HELIRUBY-Studio.apk` is the same tool packaged as an Android app (Android 7.0+).
It runs fully offline. It has no internet permission use, and every request outside the bundled page is blocked.
Exported pages and pose images go to **Pictures/HELIRUBY** (they show in the gallery);
project files and scripts go to **Download/HELIRUBY**.

Install: download the APK on the phone → open it → allow "Install unknown apps" for
your browser/file manager when Android asks.

Rebuild after changing `heliruby-studio.html` (no Gradle needed; JDK 17+ and Android SDK
`platforms;android-34` + `build-tools;35.0.0`):

```sh
KEYSTORE=/path/to/heliruby-release.keystore KS_PASS=... VERSION_CODE=2 VERSION_NAME=1.1 android/build.sh
```

Use the same keystore for every update; Android only installs an update over the old
app if it is signed with the same key (otherwise you must uninstall, which deletes the
app's saved data — save a project file first). The keystore is not stored in this repo.
