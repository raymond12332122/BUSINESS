// Render frames [from, to) of the full timeline to JPEGs. Usage: node tools/render.mjs from to outdir [fps]
import fs from 'node:fs';
import { serve } from './server.mjs'; import { openPage } from './browser.mjs';
const [from, to, out, fps = 30] = [+process.argv[2], +process.argv[3], process.argv[4], +(process.argv[5] || 30)];
fs.mkdirSync(out, { recursive: true });
const srv = await serve(9000 + Math.floor(Math.random() * 900));
const { browser, page } = await openPage(`http://localhost:${srv.address().port}/src/index.html?lang=${process.env.LANG_V || 'en'}`);
const t0 = Date.now();
for (let f = from; f < to; f++) {
  const file = `${out}/f_${String(f).padStart(5, '0')}.jpg`;
  if (fs.existsSync(file)) continue;
  await page.evaluate(T => window.renderAt(T), f / fps);
  await page.screenshot({ path: file + '.tmp', type: 'jpeg', quality: 92 });
  fs.renameSync(file + '.tmp', file);
  if ((f - from) % 100 === 0) console.log(`frame ${f} (${((Date.now() - t0) / 1000 / (f - from + 1)).toFixed(2)} s/f)`);
}
if (from === 0) fs.writeFileSync(`${out}/events.json`, JSON.stringify(await page.evaluate(() => window.getEvents()), null, 1));
await browser.close(); srv.close();
console.log('done', from, to);
