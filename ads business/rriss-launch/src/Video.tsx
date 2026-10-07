import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DotGrid, Hud, HudState, Kinetic, Rings} from './components';
import {C, DISPLAY, EASE, MONO, fit} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const INTRO = 45;
const TYPE = 120;
const PINK = 50;
const CARD = 55;
const GRID = 45;
const OUTRO = 130;

type Product = {photo: string; name: string[]; tag: string; bg: string; fg: string; accent: string; reveal: 'wipe' | 'iris'};

const PRODUCTS: Product[] = [
	{photo: 'taro', name: ['HELADO', 'DE TARO'], tag: 'NUEVO SABOR', bg: C.taro, fg: C.ink, accent: C.ink, reveal: 'iris'},
	{photo: 'boba', name: ['BLUEBERRY', 'BOBA'], tag: 'EDICIÓN LIMITADA', bg: C.blue, fg: C.cream, accent: C.lime, reveal: 'wipe'},
	{photo: 'frappe', name: ['FRAPPÉS'], tag: 'CON CARAMELO', bg: C.cream, fg: C.ink, accent: C.pink, reveal: 'iris'},
	{photo: 'crepa', name: ['CREPAS'], tag: 'RECIÉN HECHAS', bg: C.ink, fg: C.cream, accent: C.pink, reveal: 'wipe'},
	{photo: 'fresas', name: ['FRESAS', 'CON CREMA'], tag: 'EL CLÁSICO', bg: C.pink, fg: C.ink, accent: C.cream, reveal: 'iris'},
	{photo: 'helados', name: ['HELADOS'], tag: 'CON TOPPINGS', bg: C.lime, fg: C.ink, accent: C.ink, reveal: 'wipe'},
];

const T_TYPE = INTRO;
const T_PINK = T_TYPE + TYPE;
const T_CARDS = T_PINK + PINK;
const T_GRID = T_CARDS + PRODUCTS.length * CARD;
const T_OUTRO = T_GRID + GRID;
export const DURATION = T_OUTRO + OUTRO;

const Intro: React.FC = () => {
	const f = useCurrentFrame();
	const w = f < 10 ? interpolate(f, [0, 8], [0, 22], clamp) : interpolate(f, [10, 26], [22, 1080], {...clamp, easing: EASE});
	const h = f < 26 ? interpolate(f, [8, 12], [22, 6], clamp) : interpolate(f, [26, 42], [6, 1920], {...clamp, easing: EASE});
	return (
		<AbsoluteFill style={{background: C.ink, alignItems: 'center', justifyContent: 'center'}}>
			<div style={{width: w, height: h, background: C.cream, borderRadius: f < 10 ? '50%' : 0}} />
		</AbsoluteFill>
	);
};

const TypeScene: React.FC = () => {
	const f = useCurrentFrame();
	const arc = interpolate(f, [28, 70], [1, 0], {...clamp, easing: EASE});
	const r = interpolate(f, [80, 118], [0, 1350], {...clamp, easing: EASE});
	return (
		<AbsoluteFill style={{background: C.cream}}>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<path d="M 120 1500 C 300 1500, 420 520, 960 470" fill="none" stroke={C.pink} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={arc} />
				<circle cx={960} cy={470} r={f > 66 ? 12 : 0} fill={C.pink} />
			</svg>
			<div style={{position: 'absolute', left: 80, top: 600, display: 'flex', flexDirection: 'column'}}>
				<Kinetic text="PAN," size={230} color={C.ink} delay={2} />
				<Kinetic text="CAFÉ" size={230} color={C.ink} delay={14} />
				<Kinetic text="Y" size={230} color={C.ink} delay={26} />
				<Kinetic text="ANTOJOS." size={fit('ANTOJOS.', 230)} color={C.pink} delay={34} />
			</div>
			<div style={{position: 'absolute', left: 540 - r, top: 1250 - r, width: r * 2, height: r * 2, borderRadius: '50%', background: C.pink}} />
		</AbsoluteFill>
	);
};

const PinkScene: React.FC = () => (
	<AbsoluteFill style={{background: C.pink, alignItems: 'center', justifyContent: 'center'}}>
		<Kinetic text="PRUEBA" size={fit('PRUEBA', 200)} color={C.ink} delay={2} />
		<Kinetic text="LO NUEVO" size={fit('LO NUEVO', 200)} color={C.cream} delay={10} />
	</AbsoluteFill>
);

const ProductCard: React.FC<{p: Product}> = ({p}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const intro = interpolate(f, [0, 10], [1, 0], {...clamp, easing: EASE});
	const reveal = spring({frame: f - 4, fps, config: {damping: 200, stiffness: 140}, durationInFrames: 16});
	const block = spring({frame: f - 1, fps, config: {damping: 200}, durationInFrames: 12});
	const clip = p.reveal === 'iris' ? `circle(${reveal * 85}% at 50% 50%)` : `inset(${(1 - reveal) * 100}% 0 0 0)`;
	const zoom = interpolate(f, [0, CARD], [1.14, 1.0]);
	const tagW = interpolate(f, [22, 32], [0, 1], {...clamp, easing: EASE});
	const nameSize = Math.min(...p.name.map((n) => fit(n, 136)));
	return (
		<AbsoluteFill style={{background: p.bg}}>
			<div style={{position: 'absolute', left: 80 + 22 * block, top: 200 + 22 * block, width: 920, height: 1110, background: p.accent, opacity: block}} />
			<div style={{position: 'absolute', left: 80, top: 200, width: 920, height: 1110, overflow: 'hidden', clipPath: clip}}>
				<Img src={staticFile(`photos/${p.photo}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`}} />
			</div>
			<div style={{position: 'absolute', left: 80, top: 1370, display: 'flex', flexDirection: 'column'}}>
				{p.name.map((line, i) => (
					<Kinetic key={line} text={line} size={nameSize} color={p.fg} delay={8 + i * 6} />
				))}
			</div>
			<div style={{position: 'absolute', left: 80, top: 1380 + p.name.length * nameSize * 1.1 + 24, overflow: 'hidden', width: 640 * tagW}}>
				<div style={{display: 'inline-block', whiteSpace: 'nowrap', fontFamily: MONO, fontWeight: 500, fontSize: 30, letterSpacing: '0.08em', color: p.bg, background: p.fg, padding: '10px 18px'}}>
					{p.tag} ↗
				</div>
			</div>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
				<div style={{width: 2400 * intro, height: 2400 * intro, background: p.accent, transform: `rotate(${(1 - intro) * 90 + 45}deg)`}} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const GridScene: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.ink}}>
			<DotGrid dur={GRID} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div style={{background: C.ink, padding: '26px 36px', opacity: interpolate(f, [14, 18], [0, 1], clamp)}}>
					<Kinetic text="TODO EN" size={fit('TODO EN', 120, 760)} color={C.cream} delay={14} />
					<Kinetic text="UN LUGAR" size={fit('TODO EN', 120, 760)} color={C.pink} delay={20} />
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Outro: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const sub = interpolate(f, [40, 52], [0, 1], clamp);
	const cta = spring({frame: f - 58, fps, config: {damping: 14, stiffness: 160}});
	const dot = spring({frame: f - 30, fps, config: {damping: 10}});
	return (
		<AbsoluteFill style={{background: C.ink}}>
			<Rings cx={540} cy={720} color={C.pink} delay={4} />
			<div style={{position: 'absolute', left: 540 - 40 * dot, top: 720 - 40 * dot, width: 80 * dot, height: 80 * dot, borderRadius: '50%', background: C.pink}} />
			<AbsoluteFill style={{alignItems: 'center', top: 1040}}>
				<Kinetic text="Bread & Coffee" size={64} weight={700} color={C.cream} delay={10} stagger={1} style={{letterSpacing: '-0.02em'}} />
				<Kinetic text="RRISS" size={fit('RRISS', 260)} color={C.pink} delay={18} stagger={3} />
				<div style={{fontFamily: MONO, fontWeight: 500, fontSize: 28, letterSpacing: '0.12em', color: C.cream, opacity: sub, marginTop: 10}}>
					PANADERÍA · PASTELERÍA · CAFÉ
				</div>
				<div
					style={{
						marginTop: 90,
						transform: `scale(${cta})`,
						background: C.pink,
						color: C.ink,
						fontFamily: DISPLAY,
						fontWeight: 900,
						fontSize: 46,
						letterSpacing: '-0.02em',
						padding: '30px 54px',
						borderRadius: 999,
					}}
				>
					PIDE POR WHATSAPP
				</div>
				<div style={{marginTop: 34, fontFamily: MONO, fontWeight: 500, fontSize: 26, letterSpacing: '0.1em', color: C.cream, opacity: interpolate(f, [72, 84], [0, 0.8], clamp)}}>
					BÚSCANOS EN FACEBOOK
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const hudState = (frame: number): HudState => {
	if (frame < T_TYPE) return {label: 'INTRO', color: C.cream};
	if (frame < T_PINK) return {label: 'PAN · CAFÉ · ANTOJOS', color: C.ink};
	if (frame < T_CARDS) return {label: 'LO NUEVO', color: C.ink};
	if (frame < T_GRID) {
		const i = Math.floor((frame - T_CARDS) / CARD);
		const p = PRODUCTS[i];
		return {label: `0${i + 1} / 0${PRODUCTS.length} · ${p.name.join(' ')}`, color: p.fg};
	}
	if (frame < T_OUTRO) return {label: 'cubic-bezier(.65,0,.35,1)', color: C.cream};
	return {label: 'RRISS', color: C.cream};
};

export const RrissLaunch: React.FC = () => (
	<AbsoluteFill style={{background: C.ink}}>
		<Sequence durationInFrames={INTRO}>
			<Intro />
		</Sequence>
		<Sequence from={T_TYPE} durationInFrames={TYPE}>
			<TypeScene />
		</Sequence>
		<Sequence from={T_PINK} durationInFrames={PINK}>
			<PinkScene />
		</Sequence>
		{PRODUCTS.map((p, i) => (
			<Sequence key={p.photo} from={T_CARDS + i * CARD} durationInFrames={CARD}>
				<ProductCard p={p} />
			</Sequence>
		))}
		<Sequence from={T_GRID} durationInFrames={GRID}>
			<GridScene />
		</Sequence>
		<Sequence from={T_OUTRO} durationInFrames={OUTRO}>
			<Outro />
		</Sequence>
		<Hud state={hudState} />
	</AbsoluteFill>
);
