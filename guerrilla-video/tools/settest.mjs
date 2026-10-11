// Usage: node tools/settest.mjs <shots.json> <outdir>
// shots.json: [[name, set, [px,py,pz], [lx,ly,lz], fov, extras], ...]   (renders src/napo/settest.html)
import fs from 'node:fs';
import { serve } from './server.mjs'; import { openPage } from './browser.mjs';
const [file, out = 'build/settest'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const shots = JSON.parse(fs.readFileSync(file, 'utf8'));
const srv = await serve(9300 + Math.floor(Math.random() * 400));
const { browser, page } = await openPage(`http://localhost:${srv.address().port}/src/${process.env.VIDEO || 'napo'}/settest.html`, 1280, 720);
for (const [name, set, p, l, fov, extras] of shots) {
  const a = Date.now();
  await page.evaluate(([s, p, l, f, e]) => window.show(s, p, l, f, e), [set, p, l, fov || 38, extras ?? 'probe']);
  await page.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 85 });
  console.log(name, ((Date.now() - a) / 1000).toFixed(1) + 's');
}
await browser.close(); srv.close();
