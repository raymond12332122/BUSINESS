package com.heliruby.studio;

import android.Manifest;
import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.graphics.Color;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashMap;

/**
 * Hosts heliruby-studio.html (bundled as assets/www/index.html) in a WebView.
 * The page is served from a fixed https origin so IndexedDB autosave persists,
 * no network requests leave the device, and a small JS bridge saves exports.
 */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START_URL = "https://" + HOST + "/index.html";
    private static final int REQ_FILE = 1;
    private static final int REQ_STORAGE = 2;

    private WebView web;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        setContentView(web);
        applySystemBarColors();

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setTextZoom(100);
        s.setSupportZoom(false);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);

        web.addJavascriptInterface(new NativeBridge(), "HeliNative");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (!HOST.equals(u.getHost())) {
                    return blocked(); // fully offline: nothing is fetched from the internet
                }
                String path = u.getPath();
                if (path == null || path.equals("/") || path.isEmpty()) path = "/index.html";
                try {
                    InputStream in = getAssets().open("www" + path);
                    return new WebResourceResponse(mimeFor(path), "utf-8", in);
                } catch (IOException e) {
                    return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found",
                            new HashMap<String, String>(), new ByteArrayInputStream(new byte[0]));
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (HOST.equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                String type = "*/*";
                String[] accept = params.getAcceptTypes();
                if (accept != null && accept.length > 0 && accept[0] != null && accept[0].contains("/")) type = accept[0];
                i.setType(type);
                if (params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                try {
                    startActivityForResult(Intent.createChooser(i, "Choose a file"), REQ_FILE);
                    return true;
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
            }
        });

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(START_URL);
    }

    private static WebResourceResponse blocked() {
        return new WebResourceResponse("text/plain", "utf-8", 403, "Offline app",
                new HashMap<String, String>(), new ByteArrayInputStream(new byte[0]));
    }

    private static String mimeFor(String path) {
        String p = path.toLowerCase();
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".js")) return "application/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".json")) return "application/json";
        return "application/octet-stream";
    }

    private void applySystemBarColors() {
        Window w = getWindow();
        boolean dark = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
        int bar = dark ? Color.rgb(0x1e, 0x21, 0x27) : Color.WHITE;
        w.setStatusBarColor(bar);
        w.setNavigationBarColor(bar);
        int flags = 0;
        if (!dark) {
            flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            if (Build.VERSION.SDK_INT >= 26) flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        }
        w.getDecorView().setSystemUiVisibility(flags);
        if (web != null) web.setBackgroundColor(dark ? Color.rgb(0x14, 0x16, 0x1a) : Color.WHITE);
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        applySystemBarColors();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != REQ_FILE) { super.onActivityResult(requestCode, resultCode, data); return; }
        if (fileCallback == null) return;
        Uri[] result = null;
        if (resultCode == RESULT_OK && data != null) {
            ArrayList<Uri> uris = new ArrayList<>();
            if (data.getClipData() != null) {
                for (int i = 0; i < data.getClipData().getItemCount(); i++) uris.add(data.getClipData().getItemAt(i).getUri());
            } else if (data.getData() != null) {
                uris.add(data.getData());
            }
            if (!uris.isEmpty()) result = uris.toArray(new Uri[0]);
        }
        fileCallback.onReceiveValue(result);
        fileCallback = null;
    }

    @Override
    public void onBackPressed() {
        // The page pushes a history entry while a dialog is open, so Back closes dialogs first.
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onPause() {
        if (web != null) web.evaluateJavascript("try{saveNow()}catch(e){}", null);
        super.onPause();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        if (web != null) web.saveState(out);
    }

    @Override
    protected void onDestroy() {
        if (web != null) { web.destroy(); web = null; }
        super.onDestroy();
    }

    /** Streams a file from JavaScript (base64 chunks) into shared storage. */
    private class NativeBridge {
        private OutputStream out;
        private Uri pendingUri;
        private File pendingFile;
        private String where = "";

        @JavascriptInterface
        public synchronized String begin(String name, String mime) {
            abort();
            String safe = name.replaceAll("[\\\\/:*?\"<>|]", "_");
            boolean image = mime != null && mime.startsWith("image/");
            try {
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentResolver cr = getContentResolver();
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.MediaColumns.DISPLAY_NAME, safe);
                    v.put(MediaStore.MediaColumns.MIME_TYPE, mime);
                    String dir = (image ? Environment.DIRECTORY_PICTURES : Environment.DIRECTORY_DOWNLOADS) + "/HELIRUBY";
                    v.put(MediaStore.MediaColumns.RELATIVE_PATH, dir);
                    v.put(MediaStore.MediaColumns.IS_PENDING, 1);
                    Uri col = image ? MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
                                    : MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
                    pendingUri = cr.insert(col, v);
                    if (pendingUri == null) return "Android refused to create the file.";
                    out = cr.openOutputStream(pendingUri);
                    where = dir;
                } else {
                    if (checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                        runOnUiThread(new Runnable() {
                            @Override public void run() {
                                requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, REQ_STORAGE);
                            }
                        });
                        return "Please allow storage access, then tap save again.";
                    }
                    File dir = new File(Environment.getExternalStoragePublicDirectory(
                            image ? Environment.DIRECTORY_PICTURES : Environment.DIRECTORY_DOWNLOADS), "HELIRUBY");
                    if (!dir.exists() && !dir.mkdirs()) return "Could not create the HELIRUBY folder.";
                    File f = new File(dir, safe);
                    int n = 1;
                    String base = safe.contains(".") ? safe.substring(0, safe.lastIndexOf('.')) : safe;
                    String ext = safe.contains(".") ? safe.substring(safe.lastIndexOf('.')) : "";
                    while (f.exists()) f = new File(dir, base + " (" + (n++) + ")" + ext);
                    pendingFile = f;
                    out = new FileOutputStream(f);
                    where = (image ? "Pictures" : "Download") + "/HELIRUBY";
                }
                return out == null ? "Could not open the file for writing." : "";
            } catch (Exception e) {
                abort();
                return "Could not save: " + e.getMessage();
            }
        }

        @JavascriptInterface
        public synchronized boolean write(String base64) {
            if (out == null) return false;
            try {
                out.write(Base64.decode(base64, Base64.DEFAULT));
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        @JavascriptInterface
        public synchronized String finish() {
            if (out == null) return "ERR:Nothing to save.";
            try {
                out.close();
                out = null;
                if (pendingUri != null) {
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.MediaColumns.IS_PENDING, 0);
                    getContentResolver().update(pendingUri, v, null, null);
                    pendingUri = null;
                }
                if (pendingFile != null) {
                    MediaScannerConnection.scanFile(MainActivity.this, new String[]{pendingFile.getAbsolutePath()}, null, null);
                    pendingFile = null;
                }
                return where;
            } catch (Exception e) {
                abort();
                return "ERR:Could not finish saving: " + e.getMessage();
            }
        }

        @JavascriptInterface
        public synchronized void abort() {
            try { if (out != null) out.close(); } catch (Exception ignored) { }
            out = null;
            try { if (pendingUri != null) getContentResolver().delete(pendingUri, null, null); } catch (Exception ignored) { }
            pendingUri = null;
            if (pendingFile != null) { //noinspection ResultOfMethodCallIgnored
                pendingFile.delete(); pendingFile = null; }
        }
    }
}
