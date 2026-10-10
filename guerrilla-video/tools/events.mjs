import fs from 'node:fs';
import { serve } from './server.mjs'; import { openPage } from './browser.mjs';
const srv = await serve(8600);
const { browser, page } = await openPage(`http://localhost:8600/src/index.html?lang=${process.env.LANG_V || 'en'}`);
fs.writeFileSync(process.env.LANG_V && process.env.LANG_V !== 'en' ? `build/${process.env.LANG_V}/events.json` : 'build/events.json', JSON.stringify(await page.evaluate(() => window.getEvents()), null, 1));
await browser.close(); srv.close();
