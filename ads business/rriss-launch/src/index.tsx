import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {DURATION, RrissLaunch} from './Video';
import {DURATION_3D, RrissLaunch3D} from './three/Video3D';

const Root: React.FC = () => (
	<>
		<Composition id="RrissLaunch" component={RrissLaunch} durationInFrames={DURATION} fps={30} width={1080} height={1920} />
		<Composition id="RrissLaunch3D" component={RrissLaunch3D} durationInFrames={DURATION_3D} fps={30} width={1080} height={1920} />
	</>
);

registerRoot(Root);
