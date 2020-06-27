import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import React from 'react';

import Frankenstein from '../../utils/frankenstein';
import Gygax from '../../utils/gygax';

import { Combatant } from '../../models/combat';
import { Encounter } from '../../models/encounter';
import { Monster, MonsterGroup, Trait } from '../../models/monster';

import ConfirmButton from '../controls/confirm-button';
import Dropdown from '../controls/dropdown';
import Expander from '../controls/expander';
import Textbox from '../controls/textbox';
import AbilityScorePanel from '../panels/ability-score-panel';
import PortraitPanel from '../panels/portrait-panel';
import TraitsPanel from '../panels/traits-panel';
import Napoleon from '../../utils/napoleon';

interface Props {
	monster: Monster | (Monster & Combatant);
	mode: string;
	showRollButtons: boolean;
	library: MonsterGroup[];
	encounters: Encounter[];
	nudgeValue: (source: any, field: string, delta: number) => void;
	// Library
	viewMonster: (monster: Monster) => void;
	editMonster: (monster: Monster) => void;
	removeMonster: (monster: Monster) => void;
	exportMonster: (monster: Monster) => void;
	cloneMonster: (monster: Monster, name: string) => void;
	moveToGroup: (monster: Monster, group: string) => void;
	copyTrait: (trait: Trait) => void;
	selectMonster: (monster: Monster) => void;
	deselectMonster: (monster: Monster) => void;
	// Combat
	useTrait: (trait: Trait) => void;
	rechargeTrait: (trait: Trait) => void;
	onRollDice: (count: number, sides: number, constant: number) => void;
}

interface State {
	cloneName: string;
}

export default class MonsterCard extends React.Component<Props, State> {
	public static defaultProps = {
		mode: 'full',
		showRollButtons: false,
		library: null,
		encounters: null,
		nudgeValue: null,
		viewMonster: null,
		editMonster: null,
		removeMonster: null,
		exportMonster: null,
		cloneMonster: null,
		moveToGroup: null,
		copyTrait: null,
		selectMonster: null,
		deselectMonster: null,
		combat: null,
		makeCurrent: null,
		makeActive: null,
		makeDefeated: null,
		endTurn: null,
		mapAdd: null,
		mapMove: null,
		mapRemove: null,
		removeCombatant: null,
		changeHP: null,
		addCondition: null,
		editCondition: null,
		removeCondition: null,
		nudgeConditionValue: null,
		toggleTag: null,
		toggleCondition: null,
		useTrait: null,
		rechargeTrait: null,
		onRollDice: null
	};

	constructor(props: Props) {
		super(props);
		this.state = {
			cloneName: props.monster.name + ' copy'
		};
	}

	private setCloneName(cloneName: string) {
		this.setState({
			cloneName: cloneName
		});
	}

	private canSelect() {
		if (this.props.mode.indexOf('template') !== -1) {
			return true;
		}

		if (this.props.mode.indexOf('candidate') !== -1) {
			return true;
		}

		return false;
	}

	private getHP() {
		const combatant = this.props.monster as Monster & Combatant;
		if ((combatant.hpCurrent === null) || (combatant.hpCurrent === undefined)) {
			const hp = Frankenstein.getTypicalHP(this.props.monster);
			const str = Frankenstein.getTypicalHPString(this.props.monster);
			return hp + ' (' + str + ')';
		}

		const currentHP = combatant.hpCurrent ?? 0;
		const maxHP = combatant.hpMax ?? 0;
		const tempHP = combatant.hpTemp ?? 0;

		let current = currentHP.toString();
		if (tempHP > 0) {
			current += '+' + tempHP;
		}
		if ((maxHP > 0) && (currentHP !== maxHP)) {
			current += ' / ' + maxHP;
		}

		return current;
	}

	private statSection(text: string, value: string, showButtons: boolean = false) {
		if (!value) {
			return null;
		}

		let showText = true;
		let buttonSection = null;
		if (showButtons && (this.props.mode.indexOf('combat') !== -1)) {
			let remainingText = value;
			const buttons: JSX.Element[] = [];
			Array.from(value.matchAll(/([^,;:/]*)\s+([+-]?)\s*(\d+)/g))
				.forEach(exp => {
					const expression = exp[0];
					const sign = exp[2] || '+';
					const bonus = parseInt(exp[3], 10) * (sign === '+' ? 1 : -1);
					buttons.push(
						<button
							key={expression}
							className='link'
							onClick={() => this.props.onRollDice(1, 20, bonus)}
						>
							{expression}
						</button>
					);
					remainingText = remainingText.replace(expression, '');
				});
			showText = !!remainingText.match(/[a-zA-Z]/);
			buttonSection = (
				<div className='roll-buttons'>
					{buttons}
				</div>
			);
		}

		return (
			<div className='section'>
				<b>{text}</b> {showText ? value : null}
				{buttonSection}
			</div>
		);
	}

	private getTags() {
		const tags = [];

		let size = this.props.monster.size;
		const combatant = this.props.monster as Combatant;
		if (combatant) {
			size = combatant.displaySize || size;
		}
		let sizeAndType = (size + ' ' + this.props.monster.category).toLowerCase();
		if (this.props.monster.tag) {
			sizeAndType += ' (' + this.props.monster.tag.toLowerCase() + ')';
		}
		tags.push(<Tag key='tag-main'>{sizeAndType}</Tag>);

		if (this.props.monster.alignment) {
			tags.push(<Tag key='tag-align'>{this.props.monster.alignment.toLowerCase()}</Tag>);
		}

		tags.push(<Tag key='tag-cr'>cr {Gygax.challenge(this.props.monster.challenge)}</Tag>);

		return tags;
	}

	private getButtons() {
		const options = [];

		if (this.props.mode.indexOf('editable') !== -1) {
			options.push(
				<button key='view' onClick={() => this.props.viewMonster(this.props.monster)}>statblock</button>
			);

			options.push(
				<button key='edit' onClick={() => this.props.editMonster(this.props.monster)}>edit monster</button>
			);

			options.push(
				<button key='export' onClick={() => this.props.exportMonster(this.props.monster)}>export monster</button>
			);

			options.push(
				<Expander key='clone' text='copy monster'>
					<Textbox
						text={this.state.cloneName}
						placeholder='monster name'
						onChange={value => this.setCloneName(value)}
					/>
					<button onClick={() => this.props.cloneMonster(this.props.monster, this.state.cloneName)}>create copy</button>
				</Expander>
			);

			const groupOptions: { id: string, text: string }[] = [];
			this.props.library.forEach(group => {
				if (group.monsters.indexOf(this.props.monster) === -1) {
					groupOptions.push({
						id: group.id,
						text: group.name
					});
				}
			});
			options.push(
				<Dropdown
					key='move'
					options={groupOptions}
					placeholder='move to group...'
					onSelect={optionID => this.props.moveToGroup(this.props.monster, optionID)}
				/>
			);

			const inUse = this.props.encounters.some(enc => Napoleon.encounterHasMonster(enc, this.props.monster.id));
			options.push(
				<ConfirmButton key='remove' text='delete monster' disabled={inUse} onConfirm={() => this.props.removeMonster(this.props.monster)} />
			);
		}

		return options;
	}

	private getStats() {
		let stats = null;

		if (this.props.mode.indexOf('template') === -1) {
			let statBlock = null;
			if ((this.props.mode.indexOf('full') !== -1) || (this.props.mode.indexOf('combat') !== -1)) {
				statBlock = (
					<div>
						<hr/>
						<div className='section'>
							<AbilityScorePanel
								combatant={this.props.monster}
								showRollButtons={this.props.showRollButtons}
								onRollDice={(count, sides, constant) => this.props.onRollDice(count, sides, constant)}
							/>
						</div>
						{this.statSection('ac', this.props.monster.ac.toString())}
						{this.statSection('hp', this.getHP())}
						{this.statSection('saving throws', this.props.monster.savingThrows, this.props.showRollButtons)}
						{this.statSection('skills', this.props.monster.skills, this.props.showRollButtons)}
						{this.statSection('speed', this.props.monster.speed)}
						{this.statSection('senses', this.props.monster.senses)}
						{this.statSection('damage resistances', this.props.monster.damage.resist)}
						{this.statSection('damage vulnerabilities', this.props.monster.damage.vulnerable)}
						{this.statSection('damage immunities', this.props.monster.damage.immune)}
						{this.statSection('condition immunities', this.props.monster.conditionImmunities)}
						{this.statSection('languages', this.props.monster.languages)}
						{this.statSection('equipment', this.props.monster.equipment)}
						<hr/>
						<TraitsPanel
							combatant={this.props.monster}
							mode={this.props.mode.indexOf('combat') !== -1 ? 'combat' : 'view'}
							showRollButtons={this.props.showRollButtons}
							useTrait={trait => this.props.useTrait(trait)}
							rechargeTrait={trait => this.props.rechargeTrait(trait)}
							onRollDice={(count, sides, constant) => this.props.onRollDice(count, sides, constant)}
						/>
					</div>
				);
			}

			stats = (
				<div className='stats'>
					<PortraitPanel source={this.props.monster} />
					<div className='section centered'>
						{this.getTags()}
					</div>
					{statBlock}
				</div>
			);
		} else {
			if (this.props.mode.indexOf('overview') !== -1) {
				stats = (
					<div className='stats'>
						<PortraitPanel source={this.props.monster} />
						<div className='section centered'>
							{this.getTags()}
						</div>
						<hr/>
						{this.statSection('speed', this.props.monster.speed)}
						{this.statSection('senses', this.props.monster.senses)}
						{this.statSection('languages', this.props.monster.languages)}
						{this.statSection('equipment', this.props.monster.equipment)}
					</div>
				);
			}
			if (this.props.mode.indexOf('abilities') !== -1) {
				stats = (
					<div className='stats'>
						<div className='section'>
							<AbilityScorePanel combatant={this.props.monster} />
						</div>
						{this.statSection('saving throws', this.props.monster.savingThrows)}
						{this.statSection('skills', this.props.monster.skills)}
					</div>
				);
			}
			if (this.props.mode.indexOf('cbt-stats') !== -1) {
				stats = (
					<div className='stats'>
						{this.statSection('ac', this.props.monster.ac.toString())}
						{this.statSection('hp', this.getHP())}
						{this.statSection('damage resistances', this.props.monster.damage.resist)}
						{this.statSection('damage vulnerabilities', this.props.monster.damage.vulnerable)}
						{this.statSection('damage immunities', this.props.monster.damage.immune)}
						{this.statSection('condition immunities', this.props.monster.conditionImmunities)}
					</div>
				);
			}
			if (this.props.mode.indexOf('actions') !== -1) {
				stats = (
					<TraitsPanel
						combatant={this.props.monster}
						mode='template'
						copyTrait={trait => this.props.copyTrait(trait)}
					/>
				);
			}
		}

		return stats;
	}

	private getIcon() {
		if (this.canSelect()) {
			if (this.props.mode.indexOf('selected') !== -1) {
				return (
					<MinusCircleOutlined onClick={() => this.props.deselectMonster(this.props.monster)} />
				);
			} else {
				return (
					<PlusCircleOutlined onClick={() => this.props.selectMonster(this.props.monster)} />
				);
			}
		}

		return null;
	}

	public render() {
		try {
			const buttons = this.getButtons();

			const name = (this.props.monster as Combatant ? (this.props.monster as Combatant).displayName : null)
				|| this.props.monster.name
				|| 'unnamed monster';

			return (
				<div className='card monster'>
					<div className='heading'>
						<div className='title' title={name}>
							{name}
						</div>
						{this.getIcon()}
					</div>
					<div className='card-content'>
						{this.getStats()}
						<div style={{ display: buttons.length > 0 ? '' : 'none' }}>
							<hr/>
							<div className='section'>{buttons}</div>
						</div>
					</div>
				</div>
			);
		} catch (e) {
			console.error(e);
			return <div className='render-error'/>;
		}
	}
}
