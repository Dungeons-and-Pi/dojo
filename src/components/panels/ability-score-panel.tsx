import { message } from 'antd';
import React from 'react';

import Utils from '../../utils/utils';

import { Monster } from '../../models/monster-group';

import NumberSpin from '../controls/number-spin';

interface Props {
	combatant: Monster;
	edit: boolean;
	onNudgeValue: (combatant: Monster, field: string, delta: number) => void;
}

interface State {
	showAbilityScores: boolean;
}

export default class AbilityScorePanel extends React.Component<Props, State> {
	public static defaultProps = {
		edit: null,
		onNudgeValue: null
	};

	constructor(props: Props) {
		super(props);
		this.state = {
			showAbilityScores: false
		};
	}

	private toggleAbilityScores() {
		this.setState({
			showAbilityScores: !this.state.showAbilityScores
		});
	}

	private roll(e: React.MouseEvent, ability: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha') {
		e.stopPropagation();

		const score = this.props.combatant.abilityScores[ability];
		const result = Utils.modifierValue(score) + Utils.dieRoll();

		message.info(
			<div className='message-details'>
				<div>rolling {ability}</div>
				<div className='result'>{result}</div>
			</div>,
			10
		);
	}

	private getAbilityScore(ability: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha') {
		const score = this.props.combatant.abilityScores[ability];

		let value = null;
		if (this.state.showAbilityScores) {
			value = (
				<div>{score}</div>
			);
		} else {
			value = (
				<div>
					<button className='link' onClick={e => this.roll(e, ability)}>
						{Utils.modifier(score)}
					</button>
				</div>
			);
		}

		return (
			<div className='ability-score'>
				<div className='ability-heading'>{ability}</div>
				<div className='ability-value'>{value}</div>
			</div>
		);
	}

	public render() {
		try {
			let result = null;

			if (this.props.edit) {
				result = (
					<div>
						<NumberSpin
							value={this.props.combatant.abilityScores.str}
							label='strength'
							downEnabled={this.props.combatant.abilityScores.str > 0}
							onNudgeValue={delta => this.props.onNudgeValue(this.props.combatant, 'abilityScores.str', delta)}
						/>
						<NumberSpin
							value={this.props.combatant.abilityScores.dex}
							label='dexterity'
							downEnabled={this.props.combatant.abilityScores.dex > 0}
							onNudgeValue={delta => this.props.onNudgeValue(this.props.combatant, 'abilityScores.dex', delta)}
						/>
						<NumberSpin
							value={this.props.combatant.abilityScores.con}
							label='constitution'
							downEnabled={this.props.combatant.abilityScores.con > 0}
							onNudgeValue={delta => this.props.onNudgeValue(this.props.combatant, 'abilityScores.con', delta)}
						/>
						<NumberSpin
							value={this.props.combatant.abilityScores.int}
							label='intelligence'
							downEnabled={this.props.combatant.abilityScores.int > 0}
							onNudgeValue={delta => this.props.onNudgeValue(this.props.combatant, 'abilityScores.int', delta)}
						/>
						<NumberSpin
							value={this.props.combatant.abilityScores.wis}
							label='wisdom'
							downEnabled={this.props.combatant.abilityScores.wis > 0}
							onNudgeValue={delta => this.props.onNudgeValue(this.props.combatant, 'abilityScores.wis', delta)}
						/>
						<NumberSpin
							value={this.props.combatant.abilityScores.cha}
							label='charisma'
							downEnabled={this.props.combatant.abilityScores.cha > 0}
							onNudgeValue={delta => this.props.onNudgeValue(this.props.combatant, 'abilityScores.cha', delta)}
						/>
					</div>
				);
			} else {
				result = (
					<div className='ability-scores' onClick={() => this.toggleAbilityScores()}>
						{this.getAbilityScore('str')}
						{this.getAbilityScore('dex')}
						{this.getAbilityScore('con')}
						{this.getAbilityScore('int')}
						{this.getAbilityScore('wis')}
						{this.getAbilityScore('cha')}
					</div>
				);
			}

			return result;
		} catch (e) {
			console.error(e);
			return <div className='render-error'/>;
		}
	}
}
