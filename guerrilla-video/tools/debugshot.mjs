import { serve } from './server.mjs'; import { openPage } from './browser.mjs';
const srv = await serve(); const { browser, page } = await openPage('http://localhost:8765/src/' + (process.argv[2]||'debug.html'), +(process.argv[4]||1600), +(process.argv[5]||800));
await page.screenshot({ path: process.argv[3] || '/tmp/claude-0/-home-user-BUSINESS/a6bf4c70-7473-5252-8e29-d6699e26ac1b/scratchpad/debug.png' });
await browser.close(); srv.close();
