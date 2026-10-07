import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Hud, HudState, Kinetic} from '../components';
import {DISPLAY, EASE, MONO, fit} from '../theme';
import {Boba, Cake, Croissant, Cup, Donut, P} from './models';
import {Dropper, Env, IMPACT, Lights, Rig, Table} from './world';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const BG = 'radial-gradient(ellipse at 50% 58%, #1C3F96 0%, #0D2257 45%, #060F2A 100%)';

const INTRO = 75;
const SCENE = 96;
const EXPLODE = 72;
const FINALE = 195;

type Product = {id: string; name: string; tag: string; Model: React.FC; scale: number; colors: string[]};

const PRODUCTS: Product[] = [
	{id: 'cafe', name: 'CAFÉ', tag: 'RECIÉN MOLIDO', Model: Cup, scale: 1.6, colors: [P.white, P.gold, P.blue, P.crema]},
	{id: 'croissant', name: 'CROISSANT', tag: 'DE MANTEQUILLA', Model: Croissant, scale: 1.5, colors: [P.pastry, P.pastryDark, P.gold, P.white]},
	{id: 'pastel', name: 'PASTEL', tag: 'PARA CELEBRAR', Model: Cake, scale: 1.4, colors: [P.white, P.gold, P.blue, P.berry]},
	{id: 'dona', name: 'DONAS', tag: 'GLASEADO AZUL', Model: Donut, scale: 1.55, colors: [P.blue, P.dough, P.white, P.gold]},
	{id: 'boba', name: 'BLUEBERRY BOBA', tag: 'EDICIÓN LIMITADA', Model: Boba, scale: 1.15, colors: [P.sky, P.pearl, P.gold, P.white]},
];

const T_PRODUCTS = INTRO;
const T_FINALE = T_PRODUCTS + PRODUCTS.length * SCENE;
export const DURATION_3D = T_FINALE + FINALE;

const Flash: React.FC<{at: number[]; color?: string; peak?: number}> = ({at, color = '#FFFFFF', peak = 0.4}) => {
	const f = useCurrentFrame();
	const o = Math.max(0, ...at.map((a) => (f >= a && f < a + 6 ? peak * (1 - (f - a) / 6) : 0)));
	return <AbsoluteFill style={{background: color, opacity: o, pointerEvents: 'none'}} />;
};

const Intro: React.FC = () => {
	const f = useCurrentFrame();
	const dot = interpolate(f, [0, 8], [0, 22], clamp);
	const w = f < 10 ? dot : interpolate(f, [10, 26], [22, 780], {...clamp, easing: EASE});
	const h = f < 10 ? dot : interpolate(f, [8, 12], [22, 4], clamp);
	return (
		<AbsoluteFill style={{background: BG}}>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
				<div style={{width: w, height: h, background: P.gold, borderRadius: f < 10 ? '50%' : 0}} />
			</AbsoluteFill>
			<AbsoluteFill style={{alignItems: 'center', top: 760}}>
				<Kinetic text="BREAD & COFFEE" size={fit('BREAD & COFFEE', 84, 780)} color={P.white} delay={20} stagger={1} />
			</AbsoluteFill>
			<AbsoluteFill style={{alignItems: 'center', top: 1000}}>
				<Kinetic text="RRISS" size={fit('RRISS', 250)} color={P.goldText} delay={28} stagger={3} />
				<div style={{fontFamily: MONO, fontWeight: 500, fontSize: 28, letterSpacing: '0.14em', color: P.white, marginTop: 14, opacity: interpolate(f, [44, 54], [0, 0.85], clamp)}}>
					PANADERÍA · PASTELERÍA · CAFÉ
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Stage: React.FC<{children: React.ReactNode; impacts: number[]; base?: [number, number, number]; target?: [number, number, number]}> = ({children, impacts, base = [0, 2.6, 10.5], target = [0, 1.45, 0]}) => {
	const frame = useCurrentFrame();
	return (
		<ThreeCanvas width={1080} height={1920} gl={{antialias: true, alpha: true}} camera={{fov: 30, near: 0.1, far: 100, position: base}}>
			<Env />
			<Rig frame={frame} impacts={impacts} base={base} target={target} />
			<Lights />
			<Table />
			{children}
		</ThreeCanvas>
	);
};

const ProductScene: React.FC<{p: Product; idx: number}> = ({p, idx}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const tag = spring({frame: frame - 30, fps, config: {damping: 200}, durationInFrames: 12});
	const label = interpolate(frame, [IMPACT, IMPACT + 6], [0, 1], clamp);
	const out = interpolate(frame, [EXPLODE - 2, EXPLODE + 6], [0, 1], {...clamp, easing: EASE});
	return (
		<AbsoluteFill style={{background: BG}}>
			<Stage impacts={[IMPACT, EXPLODE]}>
				<Dropper frame={frame} scale={p.scale} colors={p.colors} seed={p.id} explodeAt={EXPLODE}>
					<p.Model />
				</Dropper>
			</Stage>
			<div style={{position: 'absolute', left: 80, right: 80, top: 230, transform: `translateY(${-out * 60}px)`, opacity: 1 - out}}>
				<div style={{fontFamily: MONO, fontWeight: 500, fontSize: 28, letterSpacing: '0.14em', color: P.goldText, opacity: label, marginBottom: 18}}>
					0{idx + 1} / 0{PRODUCTS.length} — RRISS
				</div>
				{p.name.split(' ').map((w, i) => (
					<Kinetic key={w} text={w} size={Math.min(...p.name.split(' ').map((x) => fit(x, 190)))} color={P.white} delay={IMPACT + 2 + i * 6} />
				))}
				<div style={{marginTop: 22, overflow: 'hidden', width: 620 * tag}}>
					<div style={{display: 'inline-block', whiteSpace: 'nowrap', fontFamily: MONO, fontWeight: 500, fontSize: 30, letterSpacing: '0.1em', color: P.goldText, border: `2px solid ${P.gold}`, padding: '10px 18px'}}>
						{p.tag} ↗
					</div>
				</div>
			</div>
			<Flash at={[IMPACT]} peak={0.28} />
			<Flash at={[EXPLODE]} color={P.goldText} peak={0.45} />
		</AbsoluteFill>
	);
};

const LINEUP: {p: Product; pos: [number, number, number]; delay: number; scale: number}[] = [
	{p: PRODUCTS[2], pos: [0, 0, -0.9], delay: 0, scale: 0.62},
	{p: PRODUCTS[1], pos: [-0.82, 0, -0.6], delay: 8, scale: 0.62},
	{p: PRODUCTS[4], pos: [0.85, 0, -0.6], delay: 16, scale: 0.6},
	{p: PRODUCTS[0], pos: [-0.5, 0, 0.55], delay: 24, scale: 0.62},
	{p: PRODUCTS[3], pos: [0.55, 0, 0.6], delay: 32, scale: 0.62},
];

const Confetti: React.FC<{frame: number}> = ({frame}) => (
	<group>
		{Array.from({length: 60}, (_, i) => {
			const r = (k: string) => random(`conf-${i}-${k}`);
			const t = (frame - 50 - r('d') * 60) / 30;
			if (t < 0) return null;
			const y = 4.2 - t * (0.9 + r('v') * 0.6);
			if (y < 0.02) return null;
			const x = (r('x') - 0.5) * 3.2 + Math.sin(t * 3 + i) * 0.15;
			const z = (r('z') - 0.5) * 2.4;
			return (
				<mesh key={i} position={[x, y, z]} rotation={[t * 5 + i, t * 3, t * 4]}>
					<planeGeometry args={[0.07, 0.035]} />
					<meshStandardMaterial color={i % 4 === 0 ? P.white : P.gold} metalness={i % 4 === 0 ? 0 : 1} roughness={0.25} side={2} />
				</mesh>
			);
		})}
	</group>
);

const Finale: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const push = interpolate(frame, [0, FINALE], [11.2, 9.9]);
	const cta = spring({frame: frame - 92, fps, config: {damping: 14, stiffness: 160}});
	return (
		<AbsoluteFill style={{background: BG}}>
			<Stage impacts={LINEUP.map((l) => l.delay + IMPACT)} base={[0, 2.4, push]} target={[0, 0.55, 0]}>
				{LINEUP.map((l) => (
					<Dropper key={l.p.id} frame={frame - l.delay} scale={l.scale} colors={l.p.colors} seed={`fin-${l.p.id}`} position={l.pos}>
						<l.p.Model />
					</Dropper>
				))}
				<Confetti frame={frame} />
			</Stage>
			<AbsoluteFill style={{alignItems: 'center', top: 250}}>
				<Kinetic text="Bread & Coffee" size={66} weight={700} color={P.white} delay={52} stagger={1} style={{letterSpacing: '-0.02em'}} />
				<Kinetic text="RRISS" size={fit('RRISS', 260)} color={P.goldText} delay={60} stagger={3} />
			</AbsoluteFill>
			<AbsoluteFill style={{alignItems: 'center', top: 1530}}>
				<div style={{transform: `scale(${cta})`, background: P.gold, color: P.navy, fontFamily: DISPLAY, fontWeight: 900, fontSize: 46, letterSpacing: '-0.02em', padding: '30px 54px', borderRadius: 999}}>
					PIDE POR WHATSAPP
				</div>
				<div style={{marginTop: 30, fontFamily: MONO, fontWeight: 500, fontSize: 26, letterSpacing: '0.12em', color: P.white, opacity: interpolate(frame, [104, 116], [0, 0.85], clamp)}}>
					BÚSCANOS EN FACEBOOK
				</div>
			</AbsoluteFill>
			<Flash at={LINEUP.map((l) => l.delay + IMPACT)} peak={0.18} />
		</AbsoluteFill>
	);
};

const hudState = (frame: number): HudState => {
	if (frame < T_PRODUCTS) return {label: 'INTRO', color: P.white};
	if (frame < T_FINALE) {
		const i = Math.floor((frame - T_PRODUCTS) / SCENE);
		return {label: `0${i + 1} / 0${PRODUCTS.length} · ${PRODUCTS[i].name}`, color: P.white};
	}
	return {label: 'RRISS', color: P.white};
};

export const RrissLaunch3D: React.FC = () => (
	<AbsoluteFill style={{background: P.navy}}>
		<Sequence durationInFrames={INTRO}>
			<Intro />
		</Sequence>
		{PRODUCTS.map((p, i) => (
			<Sequence key={p.id} from={T_PRODUCTS + i * SCENE} durationInFrames={SCENE}>
				<ProductScene p={p} idx={i} />
			</Sequence>
		))}
		<Sequence from={T_FINALE} durationInFrames={FINALE}>
			<Finale />
		</Sequence>
		<Hud state={hudState} />
	</AbsoluteFill>
);
