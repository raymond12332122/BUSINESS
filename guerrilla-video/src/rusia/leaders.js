// Leaders of the revolution. Each one is a chibi stand-in in period costume; the user's full-size models replace them
// (see BIG) and keep the same API as the chibi rigs (root, apply/pose, setFace, attach, equip).
import * as K from './kit.js';

export const STAND_IN = {
  nicolas: ['mcqueen', 'zarChibi'], zarina: ['daiwa', 'zarinaChibi'], rasputin: ['tamamo', 'rasputinChibi'],
  lenin: ['cafe', 'leninChibi'], leninBare: ['cafe', 'leninSinGorra'], trotski: ['helios', 'trotskiChibi'], trotskiRojo: ['helios', 'trotskiRojo'],
  stalin: ['oguri', 'stalinChibi'], kerenski: ['suzuka', 'kerenskiChibi'], kornilov: ['doto', 'kornilovChibi'], blanco: ['mcqueen', 'generalBlanco'],
  frida: ['daiwa', 'fridaChibi'], diego: ['tamamo', 'diegoChibi'], cardenas: ['doto', 'cardenasChibi'], mercader: ['suzuka', 'mercaderChibi'],
};
export const NAMES = {
  nicolas: ['Nicolás II', 'Zar de Rusia (1894–1917)'], zarina: ['Alejandra', 'Zarina'], rasputin: ['Grigori Rasputín', 'Místico de la corte'],
  lenin: ['Vladímir Lenin', 'Líder bolchevique'], leninBare: ['Vladímir Lenin', 'Líder bolchevique'], trotski: ['León Trotski', 'Organizador de la insurrección'],
  trotskiRojo: ['León Trotski', 'Jefe del Ejército Rojo'], stalin: ['Iósif Stalin', 'Secretario general del partido'], kerenski: ['Aleksandr Kérenski', 'Jefe del Gobierno Provisional'],
  kornilov: ['Lavr Kornílov', 'Comandante en jefe del ejército'], frida: ['Frida Kahlo', 'Pintora'], diego: ['Diego Rivera', 'Muralista'],
  cardenas: ['Lázaro Cárdenas', 'Presidente de México'], mercader: ['Ramón Mercader', 'Agente de Stalin'],
};
export const BIG = {};   // who -> loaded full-size model (filled by preloadLeaders when the files exist)

export function leader(parent, who, x = 0, z = 0, yaw = 0) {
  const [cast, outfit] = STAND_IN[who];
  const r = K.person(parent, cast, outfit, x, z, yaw); r.leader = who; return r;
}
