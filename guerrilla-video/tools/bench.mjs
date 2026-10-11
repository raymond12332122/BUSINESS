// Time renderAt + screenshot for a few frames under URL flags. Usage: node tools/bench.mjs "aa=0&soft=0" t1,t2,...
import { serve } from './server.mjs'; import { openPage } from './browser.mjs';
const [flags = '', times = '30,120,200,300'] = process.argv.slice(2);
const srv = await serve(9500 + Math.floor(Math.random() * 400));
const { browser, page } = await openPage(`http://localhost:${srv.address().port}/src/index.html?lang=${process.env.LANG_V || 'es'}&video=${process.env.VIDEO || 'mx'}&${flags}`);
let tot = 0, n = 0;
for (const T of times.split(',').map(Number)) for (const d of [0, 1 / 30, 2 / 30]) {
  const a = Date.now(); await page.evaluate(x => window.renderAt(x), T + d); await page.screenshot({ path: `/tmp/claude-0/-home-user-BUSINESS/a6bf4c70-7473-5252-8e29-d6699e26ac1b/scratchpad/bench_${flags.replace(/[^a-z0-9]/gi, '')}_${T}.jpg`, type: 'jpeg', quality: 92 });
  if (d > 0) { tot += Date.now() - a; n++; }
}
console.log(flags || 'default', (tot / n / 1000).toFixed(2), 's/frame');
await browser.close(); srv.close();
