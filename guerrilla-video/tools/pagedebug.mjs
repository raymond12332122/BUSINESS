// Load a page under src/ and report failed requests, page errors and console errors: node tools/pagedebug.mjs ww1/settest.html [waitMs]
import { serve } from './server.mjs';
import { chromium } from 'playwright-core';
const port = 9950; const srv = await serve(port);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
page.on('requestfailed', r => console.log('FAILED', r.url()));
page.on('response', r => { if (r.status() >= 400) console.log('HTTP', r.status(), r.url()); });
page.on('pageerror', e => console.log('PAGEERR', e.message));
page.on('console', m => { if (m.type() === 'error' || m.text().startsWith('BONES')) console.log('CONSOLE', m.text()); });
await page.goto(`http://localhost:${port}/src/${process.argv[2]}`);
await page.waitForTimeout(+(process.argv[3] || 20000));
console.log('ready', await page.evaluate(() => [window.__ready, window.__error]));
await browser.close(); srv.close();
