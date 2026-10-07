import React, {useMemo} from 'react';
import * as THREE from 'three';
import {random} from 'remotion';

export const P = {
	navy: '#060F2A',
	blue: '#1F4FD8',
	sky: '#7C9BF0',
	white: '#F7F5F0',
	gold: '#D4AF37',
	goldText: '#E2C26A',
	pastry: '#D9A13B',
	pastryDark: '#B97F22',
	dough: '#E2B05A',
	crema: '#C69458',
	pearl: '#0B1640',
	berry: '#1B2F7A',
};

export const Gold: React.FC = () => <meshStandardMaterial color={P.gold} metalness={1} roughness={0.22} />;
export const Porcelain: React.FC<{double?: boolean}> = ({double}) => (
	<meshPhysicalMaterial color={P.white} roughness={0.18} clearcoat={1} clearcoatRoughness={0.1} side={double ? THREE.DoubleSide : THREE.FrontSide} />
);
export const Gloss: React.FC<{color: string; double?: boolean}> = ({color, double}) => (
	<meshPhysicalMaterial color={color} roughness={0.25} clearcoat={0.8} side={double ? THREE.DoubleSide : THREE.FrontSide} />
);

export const Cup: React.FC = () => {
	const pts = useMemo(
		() =>
			[
				[0, 0], [0.4, 0], [0.44, 0.03], [0.5, 0.25], [0.56, 0.5], [0.6, 0.76],
				[0.565, 0.76], [0.525, 0.5], [0.47, 0.26], [0.41, 0.07], [0, 0.07],
			].map(([x, y]) => new THREE.Vector2(x, y)),
		[],
	);
	return (
		<group>
			<mesh position={[0, 0.03, 0]}>
				<cylinderGeometry args={[0.95, 0.62, 0.06, 64]} />
				<Porcelain />
			</mesh>
			<mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
				<torusGeometry args={[0.93, 0.018, 12, 96]} />
				<Gold />
			</mesh>
			<group position={[0, 0.06, 0]}>
				<mesh>
					<latheGeometry args={[pts, 64]} />
					<Porcelain double />
				</mesh>
				<mesh position={[0, 0.76, 0]} rotation={[Math.PI / 2, 0, 0]}>
					<torusGeometry args={[0.582, 0.018, 12, 96]} />
					<Gold />
				</mesh>
				<mesh position={[0, 0.47, 0]}>
					<cylinderGeometry args={[0.568, 0.546, 0.1, 64, 1, true]} />
					<Gloss color={P.blue} double />
				</mesh>
				<mesh position={[0, 0.68, 0]} rotation={[-Math.PI / 2, 0, 0]}>
					<circleGeometry args={[0.553, 64]} />
					<meshStandardMaterial color={P.crema} roughness={0.4} />
				</mesh>
				<mesh position={[0.04, 0.682, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
					<circleGeometry args={[0.2, 48]} />
					<meshStandardMaterial color={P.white} roughness={0.5} />
				</mesh>
				<mesh position={[0.55, 0.42, 0]} rotation={[0, 0, -Math.PI / 2 - 0.075 * Math.PI]}>
					<torusGeometry args={[0.2, 0.045, 16, 48, Math.PI * 1.15]} />
					<Porcelain />
				</mesh>
			</group>
		</group>
	);
};

export const Croissant: React.FC = () => {
	const R = 0.62;
	const at = (t: number) => {
		const a = t * 1.45;
		const r = 0.33 * (1 - 0.8 * Math.pow(Math.abs(t), 1.8));
		return {a, r, pos: [R * Math.sin(a), r * 0.85, R * Math.cos(a) - 0.35] as [number, number, number]};
	};
	const body = useMemo(() => Array.from({length: 26}, (_, i) => ({i, ...at((i / 25) * 2 - 1)})), []);
	const bands = useMemo(() => [-0.78, -0.52, -0.26, 0, 0.26, 0.52, 0.78].map((t, i) => ({i, ...at(t)})), []);
	return (
		<group position={[0, 0.14, 0]} rotation={[0.45, 0, 0]}>
			{body.map((g) => (
				<mesh key={`b${g.i}`} position={g.pos} scale={[g.r, g.r * 0.85, g.r]}>
					<sphereGeometry args={[1, 32, 24]} />
					<meshPhysicalMaterial color={P.pastry} roughness={0.45} clearcoat={0.5} clearcoatRoughness={0.3} />
				</mesh>
			))}
			{bands.map((g) => (
				<mesh key={`r${g.i}`} position={g.pos} rotation={[0, g.a, 0]} scale={[g.r * 0.45, g.r * 0.95, g.r * 1.12]}>
					<sphereGeometry args={[1, 32, 24]} />
					<meshPhysicalMaterial color={P.pastryDark} roughness={0.4} clearcoat={0.6} clearcoatRoughness={0.25} />
				</mesh>
			))}
		</group>
	);
};

export const Cake: React.FC = () => {
	const ring = (n: number, r: number, y: number, size: number) =>
		Array.from({length: n}, (_, i) => {
			const a = (i / n) * Math.PI * 2;
			return (
				<mesh key={`${r}-${i}`} position={[Math.cos(a) * r, y, Math.sin(a) * r]}>
					<sphereGeometry args={[size, 12, 10]} />
					<Gold />
				</mesh>
			);
		});
	const berries = [[0.12, 0.05], [-0.1, 0.1], [0.02, -0.14], [-0.16, -0.06], [0.18, -0.08], [0.05, 0.18]];
	return (
		<group>
			<mesh position={[0, 0.02, 0]}>
				<cylinderGeometry args={[0.88, 0.88, 0.04, 64]} />
				<Gold />
			</mesh>
			<mesh position={[0, 0.29, 0]}>
				<cylinderGeometry args={[0.75, 0.75, 0.5, 64]} />
				<meshPhysicalMaterial color={P.white} roughness={0.55} clearcoat={0.3} />
			</mesh>
			<mesh position={[0, 0.14, 0]}>
				<cylinderGeometry args={[0.757, 0.757, 0.09, 64, 1, true]} />
				<Gloss color={P.blue} double />
			</mesh>
			<mesh position={[0, 0.74, 0]}>
				<cylinderGeometry args={[0.5, 0.5, 0.4, 64]} />
				<meshPhysicalMaterial color={P.white} roughness={0.55} clearcoat={0.3} />
			</mesh>
			<mesh position={[0, 0.6, 0]}>
				<cylinderGeometry args={[0.507, 0.507, 0.07, 64, 1, true]} />
				<Gloss color={P.blue} double />
			</mesh>
			{ring(28, 0.74, 0.54, 0.035)}
			{ring(20, 0.49, 0.94, 0.03)}
			{berries.map(([x, z], i) => (
				<mesh key={i} position={[x, 1.0, z]}>
					<sphereGeometry args={[0.075, 20, 16]} />
					<Gloss color={P.berry} />
				</mesh>
			))}
			<mesh position={[0, 1.04, 0]}>
				<sphereGeometry args={[0.06, 20, 16]} />
				<Gold />
			</mesh>
		</group>
	);
};

export const Donut: React.FC = () => {
	const R = 0.5;
	const sprinkles = useMemo(
		() =>
			Array.from({length: 46}, (_, i) => {
				const u = random(`u${i}`) * Math.PI * 2;
				const v = 0.5 + random(`v${i}`) * 2.1;
				const rr = R + 0.25 * Math.cos(v);
				return {
					pos: [rr * Math.cos(u), 0.24 + 0.19 * Math.sin(v) + 0.07, rr * Math.sin(u)] as [number, number, number],
					rot: [random(`a${i}`) * 3, random(`b${i}`) * 3, random(`c${i}`) * 3] as [number, number, number],
					gold: i % 3 === 0,
				};
			}),
		[],
	);
	return (
		<group>
			<mesh position={[0, 0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
				<torusGeometry args={[R, 0.24, 32, 64]} />
				<meshStandardMaterial color={P.dough} roughness={0.6} />
			</mesh>
			<mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, 0.75]}>
				<torusGeometry args={[R, 0.25, 32, 64]} />
				<meshPhysicalMaterial color={P.blue} roughness={0.12} clearcoat={1} />
			</mesh>
			{sprinkles.map((s, i) => (
				<mesh key={i} position={s.pos} rotation={s.rot}>
					<capsuleGeometry args={[0.014, 0.06, 4, 8]} />
					{s.gold ? <Gold /> : <meshStandardMaterial color={P.white} roughness={0.4} />}
				</mesh>
			))}
		</group>
	);
};

export const Boba: React.FC = () => {
	const pearls = useMemo(
		() =>
			Array.from({length: 26}, (_, i) => {
				const a = random(`pa${i}`) * Math.PI * 2;
				const r = random(`pr${i}`) * 0.24;
				return [Math.cos(a) * r, 0.08 + random(`py${i}`) * 0.22, Math.sin(a) * r] as [number, number, number];
			}),
		[],
	);
	return (
		<group>
			<mesh position={[0, 0.5, 0]}>
				<cylinderGeometry args={[0.395, 0.305, 0.98, 48]} />
				<meshPhysicalMaterial color={P.sky} roughness={0.35} clearcoat={0.4} />
			</mesh>
			{pearls.map((p, i) => (
				<mesh key={i} position={p}>
					<sphereGeometry args={[0.055, 16, 12]} />
					<meshPhysicalMaterial color={P.pearl} roughness={0.15} clearcoat={1} />
				</mesh>
			))}
			<mesh position={[0, 0.55, 0]}>
				<cylinderGeometry args={[0.42, 0.32, 1.1, 48, 1, true]} />
				<meshPhysicalMaterial color={P.white} roughness={0.05} transparent opacity={0.28} side={THREE.DoubleSide} />
			</mesh>
			<mesh position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
				<torusGeometry args={[0.425, 0.02, 10, 64]} />
				<Gold />
			</mesh>
			<mesh position={[0, 1.1, 0]} scale={[1, 0.5, 1]}>
				<sphereGeometry args={[0.43, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
				<meshPhysicalMaterial color={P.white} roughness={0.05} transparent opacity={0.22} side={THREE.DoubleSide} />
			</mesh>
			{[[0.1, 0.05], [-0.12, 0.02], [0.0, -0.13]].map(([x, z], i) => (
				<mesh key={i} position={[x, 1.08, z]}>
					<sphereGeometry args={[0.07, 20, 16]} />
					<Gloss color={P.berry} />
				</mesh>
			))}
			<mesh position={[0.12, 1.3, 0.02]} rotation={[0, 0, -0.16]}>
				<cylinderGeometry args={[0.04, 0.04, 1.5, 20]} />
				<Gold />
			</mesh>
		</group>
	);
};
