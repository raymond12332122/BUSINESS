// Shared helpers for the map-board scenes.
import * as THREE from 'three';
import * as M from '../lib/map.js';
import { label } from '../lib/kit.js';

let data = null;
export async function preload() { data = await M.loadMapData(); }
export function board(scene) { const m = M.buildMap(data); scene.add(m.group); return m; }
export const at = (lon, lat, y = 0.22) => { const [x, z] = M.proj(lon, lat); return [x, y, z]; };
export const TOKEN = 2.2; // characters stand on the map like big board-game pieces
export function place(rig, lon, lat, yaw = 0) { const [x, y, z] = at(lon, lat); rig.root.position.set(x, y, z); rig.root.rotation.y = yaw; rig.root.scale.setScalar(TOKEN); }
export function mapLabel(ctx, lon, lat, text, k = 1, cls = 'n', y = 0.9) { return label(ctx, at(lon, lat, y), text, cls, k); }
export { M };
