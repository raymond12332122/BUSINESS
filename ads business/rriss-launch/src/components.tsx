import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, DISPLAY, EASE, MONO} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Kinetic: React.FC<{
	text: string;
	size: number;
	color: string;
	delay?: number;
	stagger?: number;
	weight?: number;
	style?: React.CSSProperties;
}> = ({text, size, color, delay = 0, stagger = 1.5, weight = 900, style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<div
			style={{
				display: 'flex',
				fontFamily: DISPLAY,
				fontWeight: weight,
				fontSize: size,
				color,
				letterSpacing: '-0.04em',
				lineHeight: 1,
				overflow: 'hidden',
				paddingBottom: size * 0.1,
				whiteSpace: 'pre',
				...style,
			}}
		>
			{[...text].map((ch, i) => {
				const p = spring({frame: frame - delay - i * stagger, fps, config: {damping: 200, stiffness: 170}, durationInFrames: 14});
				return (
					<span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - p) * 115}%)`}}>
						{ch}
					</span>
				);
			})}
		</div>
	);
};

export type HudState = {label: string; color: string};

export const Hud: React.FC<{state: (frame: number) => HudState}> = ({state}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const {label, color} = state(frame);
	const s = Math.floor(frame / fps);
	const ff = String(frame % fps).padStart(2, '0');
	const tc = `00:00:${String(s).padStart(2, '0')}:${ff}`;
	const text: React.CSSProperties = {fontFamily: MONO, fontWeight: 500, fontSize: 22, color, letterSpacing: '0.04em', position: 'absolute'};
	const corner = (pos: React.CSSProperties, rot: number) => (
		<div style={{position: 'absolute', width: 34, height: 34, borderTop: `3px solid ${color}`, borderLeft: `3px solid ${color}`, transform: `rotate(${rot}deg)`, ...pos}} />
	);
	return (
		<AbsoluteFill style={{opacity: interpolate(frame, [20, 32], [0, 0.85], clamp)}}>
			{corner({top: 40, left: 40}, 0)}
			{corner({top: 40, right: 40}, 90)}
			{corner({bottom: 40, right: 40}, 180)}
			{corner({bottom: 40, left: 40}, 270)}
			<div style={{...text, top: 92, left: 64}}>● RRISS — BREAD &amp; COFFEE</div>
			<div style={{...text, top: 92, right: 64}}>{label}</div>
			<div style={{...text, bottom: 104, left: 64}}>{tc}</div>
			<div style={{...text, bottom: 104, right: 64}}>1080×1920 · 30 FPS</div>
			<div style={{position: 'absolute', left: 64, right: 64, bottom: 82, height: 2, background: color, opacity: 0.25}} />
			<div style={{position: 'absolute', left: 64, bottom: 82, height: 2, background: color, width: (1080 - 128) * (frame / durationInFrames)}} />
		</AbsoluteFill>
	);
};

const SQUARE_COLORS = [C.pink, C.lime, C.blue, C.taro, C.cream];

export const DotGrid: React.FC<{dur: number}> = ({dur}) => {
	const frame = useCurrentFrame();
	const cols = 9;
	const rows = 16;
	const sp = 120;
	const exit = interpolate(frame, [dur - 8, dur], [1, 0], clamp);
	const dots = [];
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const x = 60 + c * sp;
			const y = 60 + r * sp;
			const d = Math.hypot(x - 540, y - 960) / 1100;
			const appear = interpolate(frame, [d * 10, d * 10 + 8], [0, 1], {...clamp, easing: EASE});
			const morph = interpolate(frame, [12 + d * 14, 22 + d * 14], [0, 1], {...clamp, easing: EASE});
			const size = (10 + morph * 30) * appear * exit;
			const color = morph > 0.5 ? SQUARE_COLORS[(r * 7 + c * 3) % SQUARE_COLORS.length] : C.cream;
			dots.push(
				<div
					key={`${r}-${c}`}
					style={{
						position: 'absolute',
						left: x - size / 2,
						top: y - size / 2,
						width: size,
						height: size,
						background: color,
						borderRadius: `${(1 - morph) * 50}%`,
						transform: `rotate(${morph * (45 + frame * 3)}deg)`,
					}}
				/>,
			);
		}
	}
	return <AbsoluteFill>{dots}</AbsoluteFill>;
};

export const Rings: React.FC<{cx: number; cy: number; color: string; delay?: number}> = ({cx, cy, color, delay = 0}) => {
	const frame = useCurrentFrame() - delay;
	return (
		<AbsoluteFill>
			{[0, 1, 2, 3].map((i) => {
				const t = ((frame + i * 12) % 48) / 48;
				const r = 40 + t * 520;
				const op = frame < 0 ? 0 : interpolate(t, [0, 0.15, 1], [0, 0.9, 0]);
				return (
					<div
						key={i}
						style={{position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `6px solid ${color}`, opacity: op}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};
