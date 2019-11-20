import React from 'react';

import Napoleon from '../../utils/napoleon';
import Utils from '../../utils/utils';

import { MonsterFilter } from '../../models/encounter';
import { CATEGORY_TYPES, SIZE_TYPES } from '../../models/monster-group';

import Dropdown from '../controls/dropdown';
import Expander from '../controls/expander';
import NumberSpin from '../controls/number-spin';
import Textbox from '../controls/textbox';

interface Props {
    filter: MonsterFilter;
    changeValue: (type: 'name' | 'challengeMin' | 'challengeMax' | 'category' | 'size', value: any) => void;
    nudgeValue: (type: 'challengeMin' | 'challengeMax', delta: number) => void;
    resetFilter: () => void;
}

export default class FilterPanel extends React.Component<Props> {
    public render() {
        try {
            const sizes = ['all sizes'].concat(SIZE_TYPES);
            const sizeOptions = sizes.map(size => ({ id: size, text: size }));

            const categories = ['all types'].concat(CATEGORY_TYPES);
            const catOptions = categories.map(cat => ({ id: cat, text: cat }));

            return (
                <Expander text={'showing ' + Napoleon.getFilterDescription(this.props.filter)}>
                    <Textbox
                        text={this.props.filter.name}
                        placeholder='name'
                        onChange={value => this.props.changeValue('name', value)}
                    />
                    <NumberSpin
                        source={this.props.filter}
                        name='challengeMin'
                        label='min cr'
                        display={value => Utils.challenge(value)}
                        nudgeValue={delta => this.props.nudgeValue('challengeMin', delta)}
                    />
                    <NumberSpin
                        source={this.props.filter}
                        name='challengeMax'
                        label='max cr'
                        display={value => Utils.challenge(value)}
                        nudgeValue={delta => this.props.nudgeValue('challengeMax', delta)}
                    />
                    <Dropdown
                        options={sizeOptions}
                        placeholder='filter by size...'
                        selectedID={this.props.filter.size}
                        select={optionID => this.props.changeValue('size', optionID)}
                    />
                    <Dropdown
                        options={catOptions}
                        placeholder='filter by type...'
                        selectedID={this.props.filter.category}
                        select={optionID => this.props.changeValue('category', optionID)}
                    />
                    <div className='divider' />
                    <div className='section'>
                        <button onClick={() => this.props.resetFilter()}>clear filter</button>
                    </div>
                </Expander>
            );
        } catch (e) {
            console.error(e);
            return <div className='render-error'/>;
        }
    }
}
