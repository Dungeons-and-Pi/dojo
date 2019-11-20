import React from 'react';

import { Col, Icon, Row } from 'antd';

import { Monster, MonsterGroup } from '../../models/monster-group';

import MonsterCard from '../cards/monster-card';
import ConfirmButton from '../controls/confirm-button';
import Textbox from '../controls/textbox';
import GridPanel from '../panels/grid-panel';
import Note from '../panels/note';

interface Props {
    monsterGroup: MonsterGroup;
    library: MonsterGroup[];
    goBack: () => void;
    removeMonsterGroup: () => void;
    addMonster: () => void;
    importMonster: () => void;
    removeMonster: (monster: Monster) => void;
    editMonster: (monster: Monster) => void;
    cloneMonster: (monster: Monster, name: string) => void;
    sortMonsters: () => void;
    moveToGroup: (monster: Monster, groupID: string) => void;
    changeValue: (source: any, field: string, value: any) => void;
    nudgeValue: (source: any, field: string, value: number) => void;
}

export default class MonsterScreen extends React.Component<Props> {
    public render() {
        try {
            const cards: JSX.Element[] = [];

            if (this.props.monsterGroup.monsters.length !== 0) {
                this.props.monsterGroup.monsters.forEach(m => {
                    cards.push(
                        <MonsterCard
                            monster={m}
                            mode={'view editable'}
                            library={this.props.library}
                            changeValue={(source, type, value) => this.props.changeValue(source, type, value)}
                            nudgeValue={(source, type, delta) => this.props.nudgeValue(source, type, delta)}
                            moveToGroup={(monster, groupID) => this.props.moveToGroup(monster, groupID)}
                            removeMonster={monster => this.props.removeMonster(monster)}
                            editMonster={monster => this.props.editMonster(monster)}
                            cloneMonster={(monster, monsterName) => this.props.cloneMonster(monster, monsterName)}
                        />
                    );
                });
            } else {
                cards.push(
                    <Note><div className='section'>there are no monsters in this group</div></Note>
                );
            }

            return (
                <Row className='full-height'>
                    <Col xs={12} sm={12} md={8} lg={6} xl={4} className='scrollable sidebar left'>
                        <MonsterInfo
                            monsterGroup={this.props.monsterGroup}
                            goBack={() => this.props.goBack()}
                            addMonster={() => this.props.addMonster()}
                            importMonster={() => this.props.importMonster()}
                            sortMonsters={() => this.props.sortMonsters()}
                            changeValue={(type, value) => this.props.changeValue(this.props.monsterGroup, type, value)}
                            removeMonsterGroup={() => this.props.removeMonsterGroup()}
                        />
                    </Col>
                    <Col xs={12} sm={12} md={16} lg={18} xl={20} className='scrollable'>
                        <GridPanel
                            content={cards}
                            heading={this.props.monsterGroup.name || 'unnamed group'}
                        />
                    </Col>
                </Row>
            );
        } catch (e) {
            console.error(e);
            return <div className='render-error'/>;
        }
    }
}

interface MonsterInfoProps {
    monsterGroup: MonsterGroup;
    goBack: () => void;
    changeValue: (field: string, value: string) => void;
    addMonster: () => void;
    importMonster: () => void;
    sortMonsters: () => void;
    removeMonsterGroup: () => void;
}

class MonsterInfo extends React.Component<MonsterInfoProps> {
    private getSummary() {
        if (this.props.monsterGroup.monsters.length === 0) {
            return (
                <div className='section centered'>
                    <i>no monsters</i>
                </div>
            );
        }

        const challenge: { min: number | null, max: number | null } = { min: null, max: null };

        this.props.monsterGroup.monsters.forEach(monster => {
            challenge.min = challenge.min === null ? monster.challenge : Math.min(challenge.min, monster.challenge);
            challenge.max = challenge.max === null ? monster.challenge : Math.max(challenge.max, monster.challenge);
        });

        const challengeSummary = challenge.min === challenge.max ? (challenge.min as number).toString() : challenge.min + ' - ' + challenge.max;

        return (
            <div className='group-panel'>
                <div className='section'>
                    <div className='subheading'>challenge rating</div>
                </div>
                <div className='section'>
                    {challengeSummary}
                </div>
            </div>
        );
    }

    public render() {
        try {
            return (
                <div>
                    <div className='section'>
                        <div className='subheading'>monster group name</div>
                        <Textbox
                            text={this.props.monsterGroup.name}
                            placeholder='monster group name'
                            onChange={value => this.props.changeValue('name', value)}
                        />
                    </div>
                    <div className='divider' />
                    {this.getSummary()}
                    <div className='divider' />
                    <div className='section'>
                        <button onClick={() => this.props.addMonster()}>add a new monster</button>
                        <button onClick={() => this.props.importMonster()}>import a monster</button>
                        <button onClick={() => this.props.sortMonsters()}>sort monsters</button>
                        <ConfirmButton text='delete group' callback={() => this.props.removeMonsterGroup()} />
                        <div className='divider' />
                        <button onClick={() => this.props.goBack()}><Icon type='caret-left' style={{ fontSize: '10px' }} /> back to the list</button>
                    </div>
                </div>
            );
        } catch (e) {
            console.error(e);
            return <div className='render-error'/>;
        }
    }
}
