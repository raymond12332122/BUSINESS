// Screenshot any page under src/: node tools/pageshot.mjs "ww1/costest.html?list=..." out.jpg [w h]
import { serve } from './server.mjs'; import { openPage } from './browser.mjs';
const port = 9700 + Math.floor(Math.random() * 250);
const srv = await serve(port);
const [pg, out = 'build/shot.jpg', w = 1600, h = 900] = process.argv.slice(2);
const { browser, page } = await openPage(`http://localhost:${port}/src/${pg}`, +w, +h);
await page.screenshot({ path: out, type: out.endsWith('.png') ? 'png' : 'jpeg', ...(out.endsWith('.png') ? {} : { quality: 88 }) });
await browser.close(); srv.close();
