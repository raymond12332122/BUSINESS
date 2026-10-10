// Team kits: guerrillas get a green scarf, backpack and an old wood rifle;
// the army gets a slate vest and a dark rifle.
import * as P from './props.js';

export const HOLDS = {
  aim:  { pos: [-0.035, 0.43, 0.03], dir: [0.06, 0.0, 1], R: -0.01, L: 0.15 },
  port: { pos: [0.0, 0.37, 0.12], dir: [0.75, 0.55, 0.25], R: -0.07, L: 0.12 },
  low:  { pos: [-0.06, 0.37, 0.09], dir: [0.1, -0.3, 1], R: -0.01, L: 0.15 },
  back: { pos: [0.02, 0.4, -0.15], dir: [0.6, 0.8, -0.1] },
  tube: { pos: [0.13, 0.37, 0.1], dir: [-0.05, 0.18, 1], L: [0.12, 0.33, 0.05], R: [0.08, 0.35, 0.22] },
};

export function guerrilla(rig, { pack = true, weapon = 'rifle' } = {}) {
  rig.attach('chest', P.bandana('#3f6b2e'), [0, 0.495, -0.01]);
  if (pack) rig.attach('chest', P.backpack('#5c6a3f'), [0, 0.37, -0.17]);
  const w = weapon === 'tube' ? P.launcher() : P.rifle('#3b3a36', '#8a5a32');
  rig.equip(w, HOLDS); rig.team = 'g'; return rig;
}
export function army(rig) {
  rig.attach('chest', P.vest('#4a5468'), [0, 0.395, -0.005]);
  rig.equip(P.rifle('#2e3138', '#2e3138'), HOLDS); rig.team = 'a'; return rig;
}
