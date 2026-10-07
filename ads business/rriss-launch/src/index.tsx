import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {DURATION, RrissLaunch} from './Video';

const Root: React.FC = () => (
	<Composition id="RrissLaunch" component={RrissLaunch} durationInFrames={DURATION} fps={30} width={1080} height={1920} />
);

registerRoot(Root);
