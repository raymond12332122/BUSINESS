// Leaders and named people of the First World War. Each one is a chibi stand-in in period costume (cast model + outfit).
import * as K from './kit.js';

export const STAND_IN = {
  franciscoFernando: ['mcqueen', 'archiduque'], sofia: ['daiwa', 'sofia'], princip: ['cafe', 'princip'], cabrinovic: ['helios', 'conspirador'], chofer: ['doto', 'chofer'],
  franciscoJose: ['oguri', 'francisco'], kaiser: ['suzuka', 'kaiser'], nicolas: ['mcqueen', 'zarChibi'], zimmermann: ['helios', 'zimmermann'], wilson: ['mcqueen', 'wilson'],
  carranza: ['oguri', 'carranza'], villa: ['doto', 'villa'], pershing: ['tamamo', 'pershing'], foch: ['doto', 'foch'], clemenceau: ['helios', 'clemenceau'],
  lloydGeorge: ['suzuka', 'lloydGeorge'], orlando: ['cafe', 'orlando'], lenin: ['cafe', 'leninChibi'],
};
export const NAMES = {
  franciscoFernando: ['Francisco Fernando', 'Heredero de Austria-Hungría'], sofia: ['Sofía Chotek', 'Duquesa de Hohenberg'], princip: ['Gavrilo Princip', '19 años · nacionalista serbobosnio'],
  cabrinovic: ['Nedeljko Čabrinović', 'Lanzó la primera bomba'], franciscoJose: ['Francisco José I', 'Emperador de Austria-Hungría'], kaiser: ['Guillermo II', 'Káiser de Alemania'],
  nicolas: ['Nicolás II', 'Zar de Rusia'], zimmermann: ['Arthur Zimmermann', 'Ministro de Exteriores de Alemania'], wilson: ['Woodrow Wilson', 'Presidente de EE. UU.'],
  carranza: ['Venustiano Carranza', 'Presidente de México'], villa: ['Pancho Villa', 'Revolucionario mexicano'], pershing: ['John J. Pershing', 'Jefe de las tropas de EE. UU.'],
  foch: ['Ferdinand Foch', 'Comandante en jefe aliado'], clemenceau: ['Georges Clemenceau', 'Francia'], lloydGeorge: ['David Lloyd George', 'Gran Bretaña'],
  orlando: ['Vittorio Orlando', 'Italia'],
};
export function leader(parent, who, x = 0, z = 0, yaw = 0) {
  const [cast, outfit] = STAND_IN[who];
  const r = K.person(parent, cast, outfit, x, z, yaw); r.leader = who; return r;
}
