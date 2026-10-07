import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {random} from 'remotion';
import {P} from './models';

export const IMPACT = 16;
const FPS = 30;
const G = 9.8;

export const Env: React.FC = () => {
	const {gl, scene} = useThree();
	useMemo(() => {
		const pm = new THREE.PMREMGenerator(gl);
		scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
	}, [gl, scene]);
	return null;
};

export const Rig: React.FC<{frame: number; impacts: number[]; base: [number, number, number]; target: [number, number, number]}> = ({frame, impacts, base, target}) => {
	const {camera} = useThree();
	let sx = 0;
	let sy = 0;
	for (const imp of impacts) {
		const g = frame - imp;
		if (g >= 0 && g < 16) {
			const amp = 0.11 * Math.exp(-g / 3.5);
			sx += amp * Math.sin(g * 2.7);
			sy += amp * Math.cos(g * 3.3);
		}
	}
	camera.position.set(base[0] + sx, base[1] + sy, base[2]);
	camera.lookAt(target[0] + sx * 0.4, target[1] + sy * 0.4, target[2]);
	return null;
};

export const Lights: React.FC = () => (
	<>
		<ambientLight intensity={0.35} />
		<directionalLight position={[3, 6, 5]} intensity={2.2} color="#FFF4E0" />
		<directionalLight position={[-4, 3, -4]} intensity={1.6} color={P.sky} />
		<pointLight position={[0, 2.5, 3]} intensity={6} distance={10} color="#FFFFFF" />
	</>
);

export const Table: React.FC = () => (
	<group>
		<mesh position={[0, -0.15, 0]}>
			<boxGeometry args={[9, 0.3, 3]} />
			<meshPhysicalMaterial color={P.white} roughness={0.12} clearcoat={1} clearcoatRoughness={0.05} />
		</mesh>
		<mesh position={[0, -0.02, 1.5]}>
			<boxGeometry args={[9, 0.05, 0.05]} />
			<meshStandardMaterial color={P.gold} metalness={1} roughness={0.2} />
		</mesh>
		<mesh position={[0, -0.3, 1.5]}>
			<boxGeometry args={[9, 0.05, 0.05]} />
			<meshStandardMaterial color={P.gold} metalness={1} roughness={0.2} />
		</mesh>
	</group>
);

const useShadowTexture = () =>
	useMemo(() => {
		const c = document.createElement('canvas');
		c.width = c.height = 128;
		const ctx = c.getContext('2d')!;
		const grd = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
		grd.addColorStop(0, 'rgba(6,15,42,0.85)');
		grd.addColorStop(1, 'rgba(6,15,42,0)');
		ctx.fillStyle = grd;
		ctx.fillRect(0, 0, 128, 128);
		return new THREE.CanvasTexture(c);
	}, []);

const Shadow: React.FC<{height: number; size: number}> = ({height, size}) => {
	const tex = useShadowTexture();
	const k = Math.max(0, 1 - height / 6);
	return (
		<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} scale={size * (1.6 - 0.6 * k)}>
			<planeGeometry args={[1, 1]} />
			<meshBasicMaterial map={tex} transparent opacity={0.75 * k} depthWrite={false} />
		</mesh>
	);
};

const Shock: React.FC<{t: number; color: string}> = ({t, color}) => {
	if (t < 0 || t > 22) return null;
	const p = t / 22;
	return (
		<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} scale={0.4 + p * 2.4}>
			<ringGeometry args={[0.92, 1, 72]} />
			<meshBasicMaterial color={color} transparent opacity={(1 - p) * 0.9} depthWrite={false} />
		</mesh>
	);
};

export const Burst: React.FC<{
	t: number;
	count: number;
	colors: string[];
	seed: string;
	origin: [number, number, number];
	speed: [number, number];
	up: number;
	size: [number, number];
}> = ({t, count, colors, seed, origin, speed, up, size}) => {
	if (t < 0) return null;
	const sec = t / FPS;
	return (
		<group>
			{Array.from({length: count}, (_, i) => {
				const r = (k: string) => random(`${seed}-${i}-${k}`);
				const th = r('th') * Math.PI * 2;
				const sp = speed[0] + r('sp') * (speed[1] - speed[0]);
				const vx = Math.cos(th) * sp;
				const vz = Math.sin(th) * sp * 0.7;
				const vy = up * (0.5 + r('vy'));
				const s = size[0] + r('s') * (size[1] - size[0]);
				const ox = origin[0] + (r('ox') - 0.5) * 0.4;
				const oy = origin[1] + (r('oy') - 0.5) * 0.4;
				const oz = origin[2] + (r('oz') - 0.5) * 0.4;
				const tLand = (vy + Math.sqrt(vy * vy + 2 * G * Math.max(0, oy - s))) / G;
				const flight = Math.min(sec, tLand);
				const slide = sec > tLand ? (1 - Math.exp(-5 * (sec - tLand))) / 5 : 0;
				const x = ox + vx * (flight + slide);
				const z = oz + vz * (flight + slide);
				const y = sec > tLand ? s : oy + vy * sec - 0.5 * G * sec * sec;
				const spin = flight * (4 + r('spin') * 8);
				const color = colors[i % colors.length];
				const metal = color === P.gold;
				const shape = i % 3;
				return (
					<mesh key={i} position={[x, y, z]} rotation={[spin, spin * 0.7, spin * 1.3]} scale={s}>
						{shape === 0 ? <tetrahedronGeometry args={[1]} /> : shape === 1 ? <boxGeometry args={[1.3, 0.8, 1]} /> : <icosahedronGeometry args={[0.9]} />}
						<meshStandardMaterial color={color} metalness={metal ? 1 : 0.1} roughness={metal ? 0.25 : 0.4} />
					</mesh>
				);
			})}
		</group>
	);
};

export const Dropper: React.FC<{
	frame: number;
	children: React.ReactNode;
	scale: number;
	colors: string[];
	seed: string;
	explodeAt?: number;
	spinBase?: number;
	position?: [number, number, number];
	shadow?: number;
}> = ({frame, children, scale, colors, seed, explodeAt, spinBase = -0.5, position = [0, 0, 0], shadow = 1.6}) => {
	const f = frame;
	if (f < 0) return null;
	const g = f - IMPACT;
	const y = g < 0 ? 6 * (1 - (f / IMPACT) ** 2) : g < 10 ? 0.28 * scale * Math.sin((Math.PI * g) / 10) : 0;
	const sq = g < 0 ? 1.08 : 1 - 0.3 * Math.exp(-g / 3.5) * Math.cos(g * 0.75);
	const exploded = explodeAt !== undefined && f >= explodeAt;
	const pop = explodeAt !== undefined && f >= explodeAt - 4 && !exploded ? 1 + 0.06 * (f - (explodeAt - 4)) : 1;
	const tumble = g < 0 ? (1 - f / IMPACT) * 0.6 : 0;
	const rotY = spinBase + f * 0.016;
	return (
		<group position={position}>
			{!exploded && (
				<group position={[0, y, 0]} rotation={[tumble, rotY, tumble * 0.5]} scale={[scale * pop / Math.sqrt(sq), scale * sq * pop, scale * pop / Math.sqrt(sq)]}>
					{children}
				</group>
			)}
			{!exploded && <Shadow height={y} size={shadow * scale} />}
			<Shock t={g} color={P.gold} />
			<Burst t={g} count={24} colors={colors} seed={`${seed}-crumb`} origin={[0, 0.08, 0]} speed={[1.2, 2.6]} up={2.6} size={[0.025, 0.05]} />
			{explodeAt !== undefined && (
				<>
					<Burst t={f - explodeAt} count={70} colors={colors} seed={`${seed}-boom`} origin={[0, 0.55 * scale, 0]} speed={[2, 5.5]} up={4.5} size={[0.04, 0.11]} />
					<Shock t={f - explodeAt} color={P.white} />
				</>
			)}
		</group>
	);
};
