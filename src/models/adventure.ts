import { Map } from './map';

export interface Adventure {
	id: string;
	name: string;
	plot: Plot;
}

export interface Plot {
	id: string;
	scenes: Scene[];
	map: Map | null;
}

export interface Scene {
	id: string;
	name: string;
	content: string;
	tags: string[];
	links: SceneLink[];
	plot: Plot;
	encounterIDs: string[];
}

export interface SceneLink {
	id: string;
	text: string;
	sceneID: string;
}
