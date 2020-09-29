import React from 'react';

import { Encounter } from '../../models/encounter';
import { Party } from '../../models/party';

import { ConfirmButton } from '../controls/confirm-button';
import { Dropdown } from '../controls/dropdown';
import { Expander } from '../controls/expander';
import { Textbox } from '../controls/textbox';

interface Props {
	encounter: Encounter;
	parties: Party[];
	edit: (encounter: Encounter) => void;
	clone: (encounter: Encounter, name: string) => void;
	run: (partyID: string, encounterID: string) => void;
	delete: (encounter: Encounter) => void;
}

interface State {
	cloneName: string;
}

export class EncounterOptions extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			cloneName: props.encounter.name + ' copy'
		};
	}

	private setCloneName(cloneName: string) {
		this.setState({
			cloneName: cloneName
		});
	}

	public render() {
		try {
			let run = null;
			if (this.props.parties.length > 0) {
				run = (
					<Dropdown
						options={this.props.parties.map(p => ({ id: p.id, text: p.name }))}
						placeholder='start combat with...'
						onSelect={partyID => this.props.run(partyID, this.props.encounter.id)}
					/>
				);
			}

			return (
				<div>
					<button onClick={() => this.props.edit(this.props.encounter)}>edit encounter</button>
					<Expander text='copy encounter'>
						<Textbox
							text={this.state.cloneName}
							placeholder='encounter name'
							onChange={value => this.setCloneName(value)}
						/>
						<button onClick={() => this.props.clone(this.props.encounter, this.state.cloneName)}>create copy</button>
					</Expander>
					{run}
					<ConfirmButton text='delete encounter' onConfirm={() => this.props.delete(this.props.encounter)} />
				</div>
			);
		} catch (e) {
			console.error(e);
			return <div className='render-error'/>;
		}
	}
}
