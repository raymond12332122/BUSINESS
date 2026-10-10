// On-screen text translation. Scenes are written in English; with ?lang=es every overlay string is
// swapped through this dictionary (longest keys first, so phrases win over the words inside them).
export const LANG = new URLSearchParams(location.search).get('lang') || 'en';

const ES = {
  // title
  'EXPLAINED WITH CHIBIS': 'EXPLICADO CON CHIBIS', 'HOW GUERRILLA<br>WARFARE WORKS': 'CÓMO FUNCIONA LA<br>GUERRA DE GUERRILLAS',
  'From WWI to WWII to Ukraine': 'De la Primera Guerra Mundial a Ucrania', 'The Army': 'El ejército', 'Guerrillas': 'Guerrilleros',
  // imbalance
  '10,000': '10.000', '>soldiers<': '>soldados<', '>tanks<': '>tanques<', '>fighters<': '>combatientes<', '>Army<': '>Ejército<',
  // chapters
  'Rule ': 'Regla ', 'Hit and run': 'Golpear y huir', 'Use the terrain': 'Aprovechar el terreno', 'The people': 'La gente',
  'Cut the supply lines': 'Cortar los suministros', 'Win over the people': 'Ganarse a la gente', 'Outlast the enemy': 'Resistir más que el enemigo',
  // hit and run
  '>Target<': '>Objetivo<', 'Supply convoy': 'Convoy de suministros', 'Lightly guarded, easy to predict': 'Poco protegido y predecible',
  '⏱ Time on target': '⏱ Tiempo en el objetivo', 'Under 1 minute': 'Menos de 1 minuto', 'Then gone before help arrives': 'Y se van antes de que llegue ayuda',
  'Mao Zedong summed it up:': 'Mao Zedong lo resumió así:',
  'The enemy advances, we retreat.': 'El enemigo avanza, nosotros retrocedemos.', 'The enemy camps, we harass.': 'El enemigo acampa, nosotros lo hostigamos.',
  'The enemy tires, we attack.': 'El enemigo se cansa, nosotros atacamos.', 'The enemy retreats, we pursue.': 'El enemigo se retira, nosotros lo perseguimos.',
  'Mao Zedong, 1930s guerrilla doctrine': 'Mao Zedong, doctrina guerrillera de los años 30',
  // terrain
  'VIETNAM · 1960s': 'VIETNAM · AÑOS 60', 'Cu Chi tunnels': 'Túneles de Cu Chi',
  '200+ km of tunnels: hideouts, storerooms, kitchens': 'Más de 200 km de túneles: escondites, almacenes y cocinas',
  'Hidden entrance': 'Entrada oculta', '>Storeroom<': '>Almacén<', '>Kitchen<': '>Cocina<', 'Escape exit': 'Salida de escape',
  'Enemy patrol': 'Patrulla enemiga', '▼ Trapdoor': '▼ Trampilla',
  // people
  '🐟 Guerrilla = fish': '🐟 Guerrillero = pez', '🌊 People = sea': '🌊 Pueblo = agua',
  '>Food<': '>Comida<', '>Shelter<': '>Refugio<', '>Recruits<': '>Reclutas<', '>Information<': '>Información<', '>Intel<': '>Inteligencia<',
  'Patrol at the bridge, 6 AM': 'Patrulla en el puente, 6 a. m.', 'Locals see everything and tell the guerrillas': 'Los vecinos lo ven todo y avisan a la guerrilla',
  'Without the people': 'Sin la gente', 'Nowhere to hide': 'Sin dónde esconderse', 'No food, no shelter, no warning': 'Sin comida, sin refugio, sin avisos',
  'Locals give food,': 'La población les da comida,', 'shelter,': 'refugio,', 'new recruits,': 'nuevos reclutas',
  "and most importantly, information: where the enemy is, and where it's going.": 'y, sobre todo, información: dónde está el enemigo y hacia dónde va.',
  // supply
  '>Depot<': '>Depósito<', '>Front line<': '>Frente<', 'Supply road': 'Ruta de suministro', '✂ Line cut': '✂ Línea cortada',
  'WORLD WAR II · 1941–1945': 'SEGUNDA GUERRA MUNDIAL · 1941–1945', 'WORLD WAR I · 1916–1918': 'PRIMERA GUERRA MUNDIAL · 1916–1918',
  'Hejaz Railway': 'Ferrocarril del Hiyaz', 'T. E. Lawrence &amp; the Arab Revolt kept blowing up the Ottoman line': 'Lawrence de Arabia y la Revuelta Árabe volaban una y otra vez la línea otomana',
  'T. E. Lawrence & the Arab Revolt kept blowing up the Ottoman line': 'Lawrence de Arabia y la Revuelta Árabe volaban una y otra vez la línea otomana',
  'Partisan rail war': 'La guerra de los rieles', 'Soviet & Yugoslav partisans wrecked rail lines behind German lines': 'Partisanos soviéticos y yugoslavos destruían vías tras las líneas alemanas',
  'Soviet &amp; Yugoslav partisans wrecked rail lines behind German lines': 'Partisanos soviéticos y yugoslavos destruían vías tras las líneas alemanas',
  // ukraine
  '2022 · RUSSO-UKRAINIAN WAR': '2022 · GUERRA RUSO-UCRANIANA', 'Battle of Kyiv': 'Batalla de Kiev',
  'Small teams + cheap drones vs. long armored columns': 'Equipos pequeños + drones baratos contra largas columnas blindadas',
  'TGT: ARMORED COLUMN': 'OBJ: COLUMNA BLINDADA', '>Result<': '>Resultado<', 'Column stopped cold': 'Columna frenada en seco',
  'Lead and tail knocked out, everything else trapped': 'Cabeza y cola destruidas: el resto queda atrapado', 'Lead hit': 'Cabeza alcanzada', 'Tail hit': 'Cola alcanzada',
  // dilemma
  'It has to guard every road,': 'Tiene que vigilar cada carretera,', 'every bridge': 'cada puente', 'and every town.': 'y cada pueblo.',
  'The guerrillas only have to hit one of them.': 'A los guerrilleros les basta con golpear uno.',
  'The occupier’s problem': 'El problema del ocupante', 'Too much to guard': 'Demasiado que vigilar', 'Bunched up': 'Agrupado',
  'Countryside lost': 'Campo perdido', 'Spread out': 'Disperso', 'Weak everywhere': 'Débil en todas partes',
  // victory
  'Scoreboard': 'Marcador', 'Army: wins most battles': 'Ejército: gana casi todas las batallas',
  'Guerrillas: still there. Every single year.': 'Guerrilla: sigue ahí. Año tras año.', 'of the war': 'de guerra', 'cost so far': 'costo acumulado',
  'Real examples': 'Ejemplos reales', 'They went home': 'Se fueron a casa',
  'France left Algeria (1962) · the US left Vietnam (1973) · the USSR left Afghanistan (1989)': 'Francia dejó Argelia (1962) · EE. UU. dejó Vietnam (1973) · la URSS dejó Afganistán (1989)',
  'As Henry Kissinger put it:': 'Como dijo Henry Kissinger:', 'The guerrilla wins if he does not lose.': 'La guerrilla gana si no pierde.',
  'The conventional army loses if it does not win.': 'El ejército convencional pierde si no gana.',
  // outro
  'Hit and run.': 'Golpear y huir.', 'Use the terrain.': 'Aprovechar el terreno.', 'Win over the people.': 'Ganarse a la gente.',
  'Cut the supply lines.': 'Cortar los suministros.', 'And outlast the enemy.': 'Y resistir más que el enemigo.',
  ">THAT'S<": '>ESO ES LA<', 'GUERRILLA WARFARE': 'GUERRA DE GUERRILLAS', 'Thanks for watching!': '¡Gracias por ver!',
};
const DICT = { es: ES }[LANG] || {};
const KEYS = Object.keys(DICT).sort((a, b) => b.length - a.length);
const PH = KEYS.map((_, i) => `\u0001${i}\u0002`);

export function tr(s) { return DICT[s] ?? s; }
export function trHTML(html) {
  if (!KEYS.length) return html;
  // two-phase replace so translated text is never re-matched by shorter keys
  KEYS.forEach((k, i) => { if (html.includes(k)) html = html.split(k).join(PH[i]); });
  html = html.replace(/>Year (\d+)</g, '>Año $1<').replace(/>\$(\d+)B</g, '>US$ $1 mil M<');
  KEYS.forEach((k, i) => { if (html.includes(PH[i])) html = html.split(PH[i]).join(DICT[k]); });
  return html;
}
