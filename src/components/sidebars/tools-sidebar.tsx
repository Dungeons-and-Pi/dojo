import { CopyOutlined, FileOutlined, SoundOutlined } from '@ant-design/icons';
import { Col, Row, Upload } from 'antd';
import React from 'react';

import { Shakespeare } from '../../utils/shakespeare';
import { Svengali } from '../../utils/svengali';
import { Comms, CommsDM } from '../../utils/uhura';
import { Ustinov } from '../../utils/ustinov';

import { DieRollResult } from '../../models/dice';
import { CardDraw, Handout, PlayingCard } from '../../models/misc';

import { Checkbox } from '../controls/checkbox';
import { Dropdown } from '../controls/dropdown';
import { Expander } from '../controls/expander';
import { Selector } from '../controls/selector';
import { DieRollPanel } from '../panels/die-roll-panel';
import { DieRollResultPanel } from '../panels/die-roll-result-panel';
import { GridPanel } from '../panels/grid-panel';
import { Note } from '../panels/note';
import { PDF } from '../panels/pdf';
import { PlayingCardPanel } from '../panels/playing-card-panel';
import { Popout } from '../panels/popout';

interface Props {
	view: string;
	setView: (view: string) => void;
	// Dice
	dice: { [sides: number]: number };
	constant: number;
	dieRolls: DieRollResult[];
	setDie: (sides: number, count: number) => void;
	setConstant: (value: number) => void;
	rollDice: (mode: '' | 'advantage' | 'disadvantage') => void;
	resetDice: () => void;
	// Handout
	handout: Handout | null;
	setHandout: (handout: Handout | null) => void;
	// Language
	languagePreset: string | null;
	selectedLanguages: string[];
	languageOutput: string[];
	selectLanguagePreset: (language: string) => void;
	addLanguage: (language: string) => void;
	removeLanguage: (language: string) => void;
	selectRandomLanguages: () => void;
	resetLanguages: () => void;
	generateLanguage: () => void;
	// Oracle
	draws: CardDraw[];
	drawCards: (count: number, deck: PlayingCard[]) => void;
	resetDraw: () => void;
}

export class ToolsSidebar extends React.Component<Props> {
	public render() {
		try {
			const options = [
				{
					id: 'die',
					text: 'die roller'
				},
				{
					id: 'handout',
					text: 'handout'
				},
				{
					id: 'language',
					text: 'language'
				},
				{
					id: 'oracle',
					text: 'oracle'
				}
			];

			let content = null;
			switch (this.props.view) {
				case 'die':
					content = (
						<DieRollerTool
							dice={this.props.dice}
							constant={this.props.constant}
							dieRolls={this.props.dieRolls}
							setDie={(sides, count) => this.props.setDie(sides, count)}
							setConstant={value => this.props.setConstant(value)}
							rollDice={mode => this.props.rollDice(mode)}
							resetDice={() => this.props.resetDice()}
						/>
					);
					break;
				case 'handout':
					content = (
						<HandoutTool
							handout={this.props.handout}
							setHandout={handout => this.props.setHandout(handout)}
						/>
					);
					break;
				case 'language':
					content = (
						<LanguageTool
							languagePreset={this.props.languagePreset}
							selectedLanguages={this.props.selectedLanguages}
							output={this.props.languageOutput}
							selectLanguagePreset={preset => this.props.selectLanguagePreset(preset)}
							addLanguage={language => this.props.addLanguage(language)}
							removeLanguage={language => this.props.removeLanguage(language)}
							selectRandomLanguages={() => this.props.selectRandomLanguages()}
							resetLanguages={() => this.props.resetLanguages()}
							generateLanguage={() => this.props.generateLanguage()}
						/>
					);
					break;
				case 'oracle':
					content = (
						<OracleTool
							draws={this.props.draws}
							drawCards={(count, deck) => this.props.drawCards(count, deck)}
							resetDraw={() => this.props.resetDraw()}
						/>
					);
					break;
			}

			return (
				<div className='sidebar-container'>
					<div className='sidebar-header'>
						<div className='heading'>tools</div>
						<Selector
							options={options}
							selectedID={this.props.view}
							onSelect={optionID => this.props.setView(optionID)}
						/>
					</div>
					<div className='sidebar-content'>
						{content}
					</div>
				</div>
			);
		} catch (ex) {
			console.error(ex);
			return <div className='render-error'/>;
		}
	}
}

interface DieRollerToolProps {
	dice: { [sides: number]: number };
	constant: number;
	dieRolls: DieRollResult[];
	setDie: (sides: number, count: number) => void;
	setConstant: (value: number) => void;
	rollDice: (mode: '' | 'advantage' | 'disadvantage') => void;
	resetDice: () => void;
}

class DieRollerTool extends React.Component<DieRollerToolProps> {
	public render() {
		try {
			const results = this.props.dieRolls.map(result => <DieRollResultPanel key={result.id} result={result} />);

			return (
				<div>
					<DieRollPanel
						dice={this.props.dice}
						constant={this.props.constant}
						setDie={(sides, count) => this.props.setDie(sides, count)}
						setConstant={value => this.props.setConstant(value)}
						resetDice={() => this.props.resetDice()}
						rollDice={mode => this.props.rollDice(mode)}
					/>
					<hr/>
					{results}
				</div>
			);
		} catch (ex) {
			console.error(ex);
			return <div className='render-error'/>;
		}
	}
}

interface LanguageToolProps {
	languagePreset: string | null;
	selectedLanguages: string[];
	output: string[];
	selectLanguagePreset: (preset: string) => void;
	addLanguage: (language: string) => void;
	removeLanguage: (language: string) => void;
	selectRandomLanguages: () => void;
	resetLanguages: () => void;
	generateLanguage: () => void;
}

class LanguageTool extends React.Component<LanguageToolProps> {
	public render() {
		try {
			const presetOptions = ['draconic', 'dwarvish', 'elvish', 'goblin', 'orc', 'custom'].map(p => {
				return {
					id: p,
					text: p
				};
			});

			const allowGenerate = this.props.selectedLanguages.length > 0;
			const allowReset = allowGenerate || this.props.output.length > 0;

			let custom = null;
			if (this.props.languagePreset === 'custom') {
				let selectedLanguages = this.props.selectedLanguages.join(', ');
				if (selectedLanguages === '') {
					selectedLanguages = 'none';
				}

				const languages = Shakespeare.getSourceLanguages()
					.map(lang => {
						const isSelected = this.props.selectedLanguages.includes(lang);
						return (
							<Checkbox
								key={lang}
								label={lang}
								checked={isSelected}
								display='button'
								onChecked={value => value ? this.props.addLanguage(lang) : this.props.removeLanguage(lang)}
							/>
						);
					});

				custom = (
					<div className='group-panel'>
						<Expander text={'selected languages: ' + selectedLanguages}>
							<div className='language-options'>
								<GridPanel columns={3} content={languages} />
							</div>
						</Expander>
						<button onClick={() => this.props.selectRandomLanguages()}>random languages</button>
					</div>
				);
			}

			const output = [];
			if (this.props.output.length > 0) {
				output.push(
					<hr key='div' />
				);
			}
			for (let n = 0; n !== this.props.output.length; ++n) {
				output.push(
					<GeneratedText
						key={n}
						text={this.props.output[n]}
						languages={this.props.selectedLanguages}
					/>
				);
			}

			return (
				<div>
					<Note>
						<p>you can use this tool to generate words and sentences in fantasy languages</p>
					</Note>
					<Selector
						options={presetOptions}
						selectedID={this.props.languagePreset}
						itemsPerRow={3}
						onSelect={optionID => this.props.selectLanguagePreset(optionID)}
					/>
					{custom}
					<hr/>
					<Row gutter={10}>
						<Col span={12}>
							<button className={allowGenerate ? '' : 'disabled'} onClick={() => this.props.generateLanguage()}>generate text</button>
						</Col>
						<Col span={12}>
							<button className={allowReset ? '' : 'disabled'} onClick={() => this.props.resetLanguages()}>reset</button>
						</Col>
					</Row>

					{output}
				</div>
			);
		} catch (ex) {
			console.error(ex);
			return <div className='render-error'/>;
		}
	}
}

interface GeneratedTextProps {
	text: string;
	languages: string[];
}

class GeneratedText extends React.Component<GeneratedTextProps> {
	private copy(e: React.MouseEvent) {
		e.stopPropagation();
		navigator.clipboard.writeText(this.props.text);
	}

	private say(e: React.MouseEvent) {
		e.stopPropagation();
		Ustinov.say(this.props.text, this.props.languages);
	}

	public render() {
		try {
			return (
				<div className='generated-item group-panel'>
					<div className='text-section'>
						{this.props.text.toLowerCase()}
					</div>
					<div className='icon-section'>
						<div>
							<CopyOutlined title='copy to clipboard' onClick={e => this.copy(e)} />
						</div>
						<div>
							<SoundOutlined title='say (experimental)' onClick={e => this.say(e)} />
						</div>
					</div>
				</div>
			);
		} catch (ex) {
			console.error(ex);
			return <div className='render-error'/>;
		}
	}
}

interface HandoutToolProps {
	handout: Handout | null;
	setHandout: (handout: Handout | null) => void;
}

interface HandoutToolState {
	mode: string;
	playerViewOpen: boolean;
}

class HandoutTool extends React.Component<HandoutToolProps, HandoutToolState> {
	constructor(props: HandoutToolProps) {
		super(props);

		this.state = {
			mode: 'image',
			playerViewOpen: false
		};
	}

	private setMode(mode: string) {
		this.setState({
			mode: mode
		}, () => {
			this.props.setHandout(null);
		});
	}

	private readFile(file: File) {
		const reader = new FileReader();
		reader.onload = progress => {
			if (progress.target) {
				this.props.setHandout({
					type: this.state.mode,
					filename: file.name,
					src: progress.target.result as string
				});
			}
		};
		reader.readAsDataURL(file);
		return false;
	}

	private setPlayerViewOpen(open: boolean) {
		this.setState({
			playerViewOpen: open
		});
	}

	private clear() {
		if (Comms.data.shared.type === 'handout') {
			CommsDM.shareNothing();
		}

		this.setState({
			playerViewOpen: false
		}, () => {
			this.props.setHandout(null);
		});
	}

	private getAccept() {
		switch (this.state.mode) {
			case 'image':
				return 'image/*';
			case 'audio':
				return 'audio/*';
			case 'video':
				return 'video/*';
			case 'pdf':
				return '.pdf';
		}

		return undefined;
	}

	private getDisplay() {
		if (!this.props.handout) {
			return null;
		}

		switch (this.props.handout.type) {
			case 'image':
				return (
					<img
						className='nonselectable-image'
						src={this.props.handout.src || ''}
						alt={this.props.handout.filename || ''}
					/>
				);
			case 'audio':
				return (
					<audio controls={true}>
						<source src={this.props.handout.src || ''} />
					</audio>
				);
			case 'video':
				return (
					<video controls={true}>
						<source src={this.props.handout.src || ''} />
					</video>
				);
			case 'pdf':
				return (
					<PDF src={this.props.handout.src || ''} />
				);
		}

		return null;
	}

	private getPlayerView() {
		if (this.state.playerViewOpen) {
			return (
				<Popout title='Handout' onCloseWindow={() => this.setPlayerViewOpen(false)}>
					{this.getDisplay()}
				</Popout>
			);
		}

		return null;
	}

	public render() {
		try {
			let content = null;
			if (this.props.handout) {
				content = (
					<div>
						{this.getDisplay()}
						<hr/>
						<Checkbox
							label='share in player view'
							checked={this.state.playerViewOpen}
							onChecked={value => this.setPlayerViewOpen(value)}
						/>
						<Checkbox
							label='share in session'
							disabled={CommsDM.getState() !== 'started'}
							checked={Comms.data.shared.type === 'handout'}
							onChecked={value => value ? CommsDM.shareHandout(this.props.handout as Handout) : CommsDM.shareNothing()}
						/>
						<hr/>
						<button onClick={() => this.clear()}>change handout</button>
					</div>
				);
			} else {
				content = (
					<div>
						<Note>
							<p>you can use this tool to select a file and show it to your players</p>
						</Note>
						<Selector
							options={['image', 'audio', 'video', 'pdf'].map(o => ({ id: o, text: o }))}
							selectedID={this.state.mode}
							onSelect={mode => this.setMode(mode)}
						/>
						<Upload.Dragger accept={this.getAccept()} showUploadList={false} beforeUpload={file => this.readFile(file)}>
							<p className='ant-upload-drag-icon'>
								<FileOutlined />
							</p>
							<p className='ant-upload-text'>
								click here, or drag a file here, to upload it
							</p>
						</Upload.Dragger>
					</div>
				);
			}

			return (
				<div>
					{content}
					{this.getPlayerView()}
				</div>
			);
		} catch (ex) {
			console.error(ex);
			return <div className='render-error'/>;
		}
	}
}

interface OracleToolProps {
	draws: CardDraw[];
	drawCards: (count: number, deck: PlayingCard[]) => void;
	resetDraw: () => void;
}

interface OracleToolState {
	deck: string;
}

class OracleTool extends React.Component<OracleToolProps, OracleToolState> {
	constructor(props: OracleToolProps) {
		super(props);

		this.state = {
			deck: 'tarot deck'
		};
	}

	private draw(count: number) {
		let deck: PlayingCard[] = [];

		switch (this.state.deck) {
			case 'tarot deck':
				deck = Svengali.getTarotDeck();
				break;
			case 'tarot deck (major arcana)':
				deck = Svengali.getTarotMajorArcana();
				break;
			case 'tarot deck (minor arcana)':
				deck = Svengali.getTarotMinorArcana();
				break;
			case 'standard deck':
				deck = Svengali.getStandardDeck();
				break;
			case 'standard deck (with jokers)':
				deck = Svengali.getStandardDeckWithJokers();
				break;
			case 'deck of many things':
				deck = Svengali.getDeckOfManyThings();
				break;
			case 'deck of many things (13 cards)':
				deck = Svengali.getDeckOfManyThingsSmall();
				break;
		}

		this.props.drawCards(count, deck);
	}

	public render() {
		try {
			let cardSection = null;
			if (this.props.draws.length > 0) {
				const cards = this.props.draws.map(draw => {
					return (
						<Col span={8} key={draw.id}>
							<PlayingCardPanel card={draw.card} reversed={draw.reversed} />
						</Col>
					);
				});

				cardSection = (
					<div>
						<Row gutter={10} justify='space-around'>
							{cards}
						</Row>
						<button onClick={() => this.props.resetDraw()}>reset</button>
					</div>
				);
			} else {
				cardSection = (
					<Row gutter={10}>
						<Col span={12}>
							<button onClick={() => this.draw(1)}>draw a card</button>
						</Col>
						<Col span={12}>
							<button onClick={() => this.draw(3)}>draw three cards</button>
						</Col>
					</Row>
				);
			}

			return (
				<div>
					<Note>
						<p>this tool lets you draw cards from various different decks</p>
					</Note>
					<Dropdown
						options={[
							'tarot deck',
							'tarot deck (major arcana)',
							'tarot deck (minor arcana)',
							'standard deck',
							'standard deck (with jokers)',
							'deck of many things',
							'deck of many things (13 cards)'
						].map(o => ({ id: o, text: o }))}
						selectedID={this.state.deck}
						onSelect={id => this.setState({ deck: id })}
					/>
					{cardSection}
				</div>
			);
		} catch (ex) {
			console.error(ex);
			return <div className='render-error'/>;
		}
	}
}
