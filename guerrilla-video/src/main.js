import * as THREE from 'three';
import * as C from './lib/chars.js';

const W = 1920, H = 1080;
const SCENES = ['title', 'imbalance', 'hitrun', 'terrain', 'people', 'supply', 'ukraine', 'dilemma', 'victory', 'outro'];

async function boot() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H); renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  document.body.prepend(renderer.domElement);
  const ui = document.getElementById('ui'), fade = document.getElementById('fade');

  const TL = await (await fetch('/build/timeline.json')).json();
  await C.loadCast();
  const only = new URLSearchParams(location.search).get('only');
  const built = [];
  for (const s of TL.scenes) {
    if (only && !only.split(',').includes(s.id)) { built.push(null); continue; }
    const mod = await import(`./scenes/${s.id}.js`);
    const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 900);
    const ctx = { L: s.lines, dur: s.dur, camera, W, H, renderer,
      project(v) { camera.updateMatrixWorld(); const p = new THREE.Vector3(...v).project(camera); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H, p.z < 1]; } };
    const inst = mod.build(ctx);
    inst.ctx = ctx; built.push(inst);
    // warm up shaders
    for (const sc of inst.scenes || [inst.scene]) renderer.compile(sc, camera);
  }

  function captionAt(lines, t) {
    for (const l of lines) {
      if (t < l.t0 - 0.15 || t > l.t1 + 0.3) continue;
      // split long lines into chunks timed by length
      const chunks = splitText(l.text), total = chunks.reduce((a, c) => a + c.length, 0);
      let acc = l.t0;
      for (const c of chunks) { const d = (l.t1 - l.t0) * c.length / total; if (t < acc + d || c === chunks[chunks.length - 1]) return c; acc += d; }
    }
    return null;
  }

  window.renderAt = (T) => {
    let i = TL.scenes.findIndex(s => T >= s.start && T < s.start + s.dur);
    if (i < 0) i = TL.scenes.length - 1;
    const s = TL.scenes[i], inst = built[i], t = T - s.start;
    if (!inst) return;
    const html = inst.update(t) || '';
    const sc = inst.current || inst.scene;
    if (sc.userData.sky) sc.userData.sky.position.copy(inst.ctx.camera.position);
    renderer.render(sc, inst.ctx.camera);
    const cap = captionAt(s.lines, t);
    ui.innerHTML = html + (cap && !inst.noCaptions && !(inst.hideCaptions && inst.hideCaptions(t)) ? `<div class="cap">${cap}</div>` : '');
    const fi = i === 0 ? 0.6 : 0.3, fo = 0.3;
    fade.style.opacity = Math.max(0, 1 - t / fi, i === TL.scenes.length - 1 ? (t - (s.dur - 1.2)) / 1.2 : 1 - (s.dur - t) / fo).toFixed(3);
  };
  window.getEvents = () => {
    const ev = [];
    TL.scenes.forEach((s, i) => { for (const e of (built[i]?.sfx || [])) ev.push({ ...e, t: +(s.start + e.t).toFixed(3) }); });
    return ev;
  };
  window.TL = TL;
  window.__ready = true;
}

function splitText(text) {
  if (text.length <= 78) return [text];
  const parts = text.split(/(?<=[.:;,?!])\s+/), out = [];
  let cur = '';
  for (const p of parts) {
    if ((cur + ' ' + p).trim().length > 78 && cur) { out.push(cur.trim()); cur = p; } else cur = (cur + ' ' + p).trim();
  }
  if (cur) out.push(cur.trim());
  // still-too-long pieces: split on words
  return out.flatMap(c => {
    if (c.length <= 90) return [c];
    const w = c.split(' '), half = Math.ceil(w.length / 2);
    return [w.slice(0, half).join(' '), w.slice(half).join(' ')];
  });
}

boot().catch(e => { window.__error = String(e.stack || e); });
