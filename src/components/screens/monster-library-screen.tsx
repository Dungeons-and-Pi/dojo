import React from 'react';

import Utils from '../../utils/utils';

import { Monster, MonsterGroup } from '../../models/monster-group';

import InfoCard from '../cards/info-card';
import MonsterLibraryCard from '../cards/information/monster-library-card';
import MonsterCard from '../cards/monster-card';
import MonsterGroupCard from '../cards/monster-group-card';
import MonsterGroupListItem from '../list-items/monster-group-list-item';
import CardGroup from '../panels/card-group';

interface Props {
    library: MonsterGroup[];
    selection: MonsterGroup | null;
    showHelp: boolean;
    filter: string;
    selectMonsterGroup: (group: MonsterGroup | null) => void;
    addMonsterGroup: () => void;
    removeMonsterGroup: () => void;
    addMonster: () => void;
    removeMonster: (monster: Monster) => void;
    editMonster: (monster: Monster) => void;
    cloneMonster: (monster: Monster, name: string) => void;
    sortMonsters: () => void;
    moveToGroup: (monster: Monster, groupID: string) => void;
    changeValue: (source: any, field: string, value: any) => void;
    nudgeValue: (source: any, field: string, value: number) => void;
}

export default class MonsterLibraryScreen extends React.Component<Props> {
    private showMonsterGroup(group: MonsterGroup) {
        let result = Utils.match(this.props.filter, group.name);

        if (!result) {
            group.monsters.forEach(monster => {
                result = Utils.match(this.props.filter, monster.name) || result;
            });
        }

        return result;
    }

    public render() {
        try {
            let help = null;
            if (this.props.showHelp) {
                help = (
                    <MonsterLibraryCard />
                );
            }

            const listItems = this.props.library.filter(group => this.showMonsterGroup(group)).map(group => {
                return (
                    <MonsterGroupListItem
                        key={group.id}
                        group={group}
                        filter={this.props.filter}
                        selected={group === this.props.selection}
                        setSelection={grp => this.props.selectMonsterGroup(grp)}
                    />
                );
            });

            const cards = [];

            if (this.props.selection) {
                cards.push(
                    <div className='column' key='info'>
                        <MonsterGroupCard
                            selection={this.props.selection}
                            filter={this.props.filter}
                            addMonster={() => this.props.addMonster()}
                            sortMonsters={() => this.props.sortMonsters()}
                            changeValue={(type, value) => this.props.changeValue(this.props.selection, type, value)}
                            removeMonsterGroup={() => this.props.removeMonsterGroup()}
                        />
                    </div>
                );

                const monsters = this.props.selection.monsters.filter(monster => {
                    return Utils.match(this.props.filter, monster.name);
                });

                if (monsters.length !== 0) {
                    monsters.forEach(m => {
                        cards.push(
                            <div className='column' key={m.id}>
                                <MonsterCard
                                    combatant={m}
                                    mode={'view editable'}
                                    library={this.props.library}
                                    changeValue={(source, type, value) => this.props.changeValue(source, type, value)}
                                    nudgeValue={(source, type, delta) => this.props.nudgeValue(source, type, delta)}
                                    moveToGroup={(monster, groupID) => this.props.moveToGroup(monster, groupID)}
                                    removeMonster={monster => this.props.removeMonster(monster)}
                                    editMonster={monster => this.props.editMonster(monster)}
                                    cloneMonster={(monster, monsterName) => this.props.cloneMonster(monster, monsterName)}
                                />
                            </div>
                        );
                    });
                } else {
                    cards.push(
                        <div className='column' key='empty'>
                            <InfoCard getContent={() => <div className='section'>no monsters</div>} />
                        </div>
                    );
                }
            }

            let name;
            if (this.props.selection) {
                name = this.props.selection.name;
                if (!name) {
                    name = 'unnamed group';
                }
            }

            return (
                <div className='monster-library row collapse'>
                    <div className='columns small-4 medium-4 large-3 scrollable list-column'>
                        {help}
                        <button onClick={() => this.props.addMonsterGroup()}>add a new monster group</button>
                        {listItems}
                    </div>
                    <div className='columns small-8 medium-8 large-9 scrollable'>
                        <CardGroup
                            content={cards}
                            heading={name}
                            showClose={this.props.selection !== null}
                            close={() => this.props.selectMonsterGroup(null)}
                        />
                    </div>
                </div>
            );
        } catch (e) {
            console.error(e);
        }
    }
}
