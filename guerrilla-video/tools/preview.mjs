// Usage: node tools/preview.mjs <sceneId> <t1,t2,...> [outdir]   (times are scene-local seconds)
import { serve } from './server.mjs'; import { openPage } from './browser.mjs';
const [id, times, out = process.env.OUT || 'build/preview'] = process.argv.slice(2);
import fs from 'node:fs'; fs.mkdirSync(out, { recursive: true });
const srv = await serve(8766 + Math.floor(Math.random() * 500));
const port = srv.address().port;
const t0 = Date.now();
const { browser, page } = await openPage(`http://localhost:${port}/src/index.html?only=${id}`);
console.log('load', ((Date.now() - t0) / 1000).toFixed(1), 's');
const start = await page.evaluate(id => window.TL.scenes.find(s => s.id === id).start, id);
for (const t of times.split(',').map(Number)) {
  const a = Date.now();
  await page.evaluate(T => window.renderAt(T), start + t);
  await page.screenshot({ path: `${out}/${id}_${t.toFixed(2)}.jpg`, type: 'jpeg', quality: 85 });
  console.log(id, t, ((Date.now() - a) / 1000).toFixed(2) + 's');
}
await browser.close(); srv.close();
