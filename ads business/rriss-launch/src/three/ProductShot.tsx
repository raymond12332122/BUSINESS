import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill} from 'remotion';
import {Boba, Cake, Croissant, Cup, Donut} from './models';
import {Env, Lights, Rig} from './world';

const MODELS: Record<string, {Model: React.FC; scale: number; y: number}> = {
	cafe: {Model: Cup, scale: 1.55, y: -0.55},
	croissant: {Model: Croissant, scale: 1.7, y: -0.35},
	pastel: {Model: Cake, scale: 1.35, y: -0.7},
	dona: {Model: Donut, scale: 1.6, y: -0.35},
	boba: {Model: Boba, scale: 1.05, y: -0.95},
};

export const ProductShot: React.FC<{id: string}> = ({id}) => {
	const m = MODELS[id];
	return (
		<AbsoluteFill>
			<ThreeCanvas width={800} height={800} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}} camera={{fov: 30, near: 0.1, far: 100, position: [0, 2.2, 6.4]}}>
				<Env />
				<Rig frame={0} impacts={[]} base={[0, 2.2, 6.4]} target={[0, 0.1, 0]} />
				<Lights />
				<group position={[0, m.y, 0]} rotation={[0, -0.45, 0]} scale={m.scale}>
					<m.Model />
				</group>
			</ThreeCanvas>
		</AbsoluteFill>
	);
};
