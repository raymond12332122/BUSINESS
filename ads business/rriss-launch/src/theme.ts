import {loadFont} from '@remotion/fonts';
import {Easing, staticFile} from 'remotion';

export const C = {
	cream: '#F1ECE3',
	ink: '#0D0D0F',
	pink: '#FF5C93',
	taro: '#B79CF2',
	blue: '#2F5BEA',
	lime: '#D7F23A',
};

export const DISPLAY = 'Unbounded';
export const MONO = 'JetBrains Mono';

loadFont({family: DISPLAY, url: staticFile('fonts/unbounded-latin-900-normal.woff2'), weight: '900'});
loadFont({family: DISPLAY, url: staticFile('fonts/unbounded-latin-700-normal.woff2'), weight: '700'});
loadFont({family: MONO, url: staticFile('fonts/jetbrains-mono-latin-500-normal.woff2'), weight: '500'});

export const EASE = Easing.bezier(0.65, 0, 0.35, 1);

// Unbounded Black runs ~0.9em per uppercase glyph at this tracking.
export const fit = (text: string, max: number, width = 920) =>
	Math.min(max, Math.floor(width / (text.length * 0.9)));
