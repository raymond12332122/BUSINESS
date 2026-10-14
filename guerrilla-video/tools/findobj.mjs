// Debug helper: list meshes of the current set whose world centre falls in a box, at time T of a scene.
// usage: VIDEO=ww1 node tools/findobj.mjs <scene> <T> x0 x1 z0 z1
import { serve } from './server.mjs'; import { openPage } from './browser.mjs';
const [id, T, x0, x1, z0, z1] = process.argv.slice(2);
const srv = await serve(9300 + Math.floor(Math.random() * 400));
const { browser, page } = await openPage(`http://localhost:${srv.address().port}/src/index.html?only=${id}&lang=es&video=${process.env.VIDEO || 'ww1'}`);
const out = await page.evaluate(([id, T, x0, x1, z0, z1]) => {
  const i = window.TL.scenes.findIndex(s => s.id === id), s = window.TL.scenes[i]; window.renderAt(s.start + T); const inst = window.__built[i]; const sc = inst.current || inst.scene; const res = [];
  sc.updateMatrixWorld(true);
  sc.traverse(o => { if (!o.isMesh || !o.visible) return; if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); const c = o.geometry.boundingSphere.center.clone().applyMatrix4(o.matrixWorld);
    if (c.x >= x0 && c.x <= x1 && c.z >= z0 && c.z <= z1) { const chain = []; for (let p = o; p; p = p.parent) chain.push(p.type + (p.name ? ':' + p.name : '')); res.push([c.x.toFixed(2), c.y.toFixed(2), c.z.toFixed(2), o.geometry.type, JSON.stringify(o.geometry.parameters || {}).slice(0, 80), o.material.color?.getHexString(), chain.slice(0, 4).join('<')]); } });
  return res;
}, [id, +T, +x0, +x1, +z0, +z1]);
for (const r of out) console.log(r.join(' | '));
await browser.close(); srv.close();
