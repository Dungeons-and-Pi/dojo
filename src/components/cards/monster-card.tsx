import React from 'react';

import Utils from '../../utils/utils';

import { Monster, Trait, MonsterGroup } from '../../models/monster-group';
import { EncounterSlot, EncounterWave, Encounter } from '../../models/encounter';
import { Combatant, Combat } from '../../models/combat';
import { Condition } from '../../models/condition';

import Expander from '../controls/expander';
import Dropdown from '../controls/dropdown';
import ConfirmButton from '../controls/confirm-button';
import Radial from '../controls/radial';
import Spin from '../controls/spin';
import InfoCard from './info-card';
import AbilityScorePanel from '../panels/ability-score-panel';
import TraitsPanel from '../panels/traits-panel';
import ConditionsPanel from '../panels/conditions-panel';

import arrow from "../../resources/images/down-arrow.svg";

interface Props {
    combatant: Monster | (Monster & Combatant);
    mode: string;
    library: MonsterGroup[];
    changeValue: (monster: Monster, field: string, value: any) => void;
    nudgeValue: (source: any, field: string, delta: number) => void;
    // Library
    editMonster: (monster: Monster) => void;
    removeMonster: (monster: Monster) => void;
    cloneMonster: (monster: Monster, name: string) => void;
    moveToGroup: (monster: Monster, group: string) => void;
    copyTrait: (trait: Trait) => void;
    // Encounter builder
    encounter: Encounter;
    slot: EncounterSlot;
    addEncounterSlot: (monster: Monster, waveID: string | null) => void;
    removeEncounterSlot: (slot: EncounterSlot) => void;
    // Combat
    combat: Combat;
    makeCurrent: (combatant: Combatant) => void;
    makeActive: (combatant: Combatant) => void;
    makeDefeated: (combatant: Combatant) => void;
    endTurn: (combatant: Combatant) => void;
    mapAdd: (combatant: Combatant) => void;
    mapMove: (combatant: Combatant, dir: string) => void;
    mapRemove: (combatant: Combatant) => void;
    removeCombatant: (combatant: Combatant) => void;
    changeHP: (combatant: Combatant, hp: number, tempHP: number) => void;
    addCondition: (combatant: Combatant) => void;
    editCondition: (combatant: Combatant, condition: Condition) => void;
    removeCondition: (combatant: Combatant, conditionID: string) => void;
    nudgeConditionValue: (condition: Condition, field: string, delta: number) => void;
}

interface State {
    showDetails: boolean;
    cloneName: string;
    damageOrHealing: number;
}

export default class MonsterCard extends React.Component<Props, State> {
    public static defaultProps = {
        library: null,
        changeValue: null,
        nudgeValue: null,
        editMonster: null,
        removeMonster: null,
        cloneMonster: null,
        moveToGroup: null,
        copyTrait: null,
        encounter: null,
        slot: null,
        addEncounterSlot: null,
        removeEncounterSlot: null,
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
        nudgeConditionValue: null
    };

    constructor(props: Props) {
        super(props);
        this.state = {
            showDetails: false,
            cloneName: props.combatant.name + " copy",
            damageOrHealing: 0
        };
    }

    setCloneName(cloneName: string) {
        this.setState({
            cloneName: cloneName
        });
    }

    toggleDetails() {
        this.setState({
            showDetails: !this.state.showDetails
        })
    }

    setDamage(value: number) {
        this.setState({
            damageOrHealing: value
        });
    }

    nudgeDamage(delta: number) {
        this.setState({
            damageOrHealing: Math.max(this.state.damageOrHealing + delta, 0)
        });
    }

    heal() {
        var combatant = this.props.combatant as Combatant;

        var hp = (combatant.hp ? combatant.hp : 0) + this.state.damageOrHealing;
        hp = Math.min(hp, this.props.combatant.hpMax);

        this.setState({
            damageOrHealing: 0
        }, () => {
            this.props.changeHP(combatant, hp, this.props.combatant.hpTemp);
        });
    }

    damage() {
        var combatant = this.props.combatant as Combatant;

        var hp = (combatant.hp ? combatant.hp : 0);
        var temp = this.props.combatant.hpTemp;

        var damage = this.state.damageOrHealing;

        // Take damage off temp HP first
        var val = Math.min(damage, temp);
        damage -= val;
        temp -= val;

        // Take the rest off HP
        hp -= damage;
        hp = Math.max(hp, 0);

        this.setState({
            damageOrHealing: 0
        }, () => {
            this.props.changeHP(combatant, hp, temp);
        });
    }

    description() {
        var sizeAndType = (this.props.combatant.size + " " + this.props.combatant.category).toLowerCase();
        if (this.props.combatant.tag) {
            sizeAndType += " (" + this.props.combatant.tag.toLowerCase() + ")";
        }
        sizeAndType += ", ";

        var align = "";
        if (this.props.combatant.alignment) {
            align = this.props.combatant.alignment.toLowerCase() + ", ";
        }

        var cr = "cr " + Utils.challenge(this.props.combatant.challenge);

        return sizeAndType + align + cr;
    }

    monsterIsInWave(wave: EncounterWave) {
        return wave.slots.some(s => {
            var group = this.props.library.find(g => g.monsters.includes(this.props.combatant));
            return !!group && (s.monsterGroupName === group.name) && (s.monsterName === this.props.combatant.name)
        });
    }

    render() {
        try {
            var options = [];
            if (this.props.mode.indexOf("no-buttons") === -1) {
                if (this.props.mode.indexOf("view") !== -1) {
                    if (this.props.mode.indexOf("editable") !== -1) {
                        options.push(
                            <button key="edit" onClick={() => this.props.editMonster(this.props.combatant)}>edit monster</button>
                        );

                        options.push(
                            <Expander
                                key="clone"
                                text="clone monster"
                                content={
                                    <div>
                                        <input type="text" placeholder="monster name" value={this.state.cloneName} onChange={event => this.setCloneName(event.target.value)} />
                                        <button onClick={() => this.props.cloneMonster(this.props.combatant, this.state.cloneName)}>create copy</button>
                                    </div>
                                }
                            />
                        );

                        var groupOptions: { id: string, text: string }[] = [];
                        this.props.library.forEach(group => {
                            if (group.monsters.indexOf(this.props.combatant) === -1) {
                                groupOptions.push({
                                    id: group.id,
                                    text: group.name
                                });
                            }
                        });
                        options.push(
                            <Dropdown
                                key="move"
                                options={groupOptions}
                                placeholder="move to group..."
                                select={optionID => this.props.moveToGroup(this.props.combatant, optionID)}
                            />
                        );

                        options.push(<ConfirmButton key="remove" text="delete monster" callback={() => this.props.removeMonster(this.props.combatant)} />);
                    }
                    if (this.props.mode.indexOf("encounter") !== -1) {
                        if (this.props.slot) {
                            // This card is in an encounter or a wave
                            options.push(<button key="remove" onClick={() => this.props.removeEncounterSlot(this.props.slot)}>remove from encounter</button>);
                        } else {
                            var canAdd = false;
                            // This card is in the library list
                            if (!this.monsterIsInWave(this.props.encounter)) {
                                options.push(<button key="add encounter" onClick={() => this.props.addEncounterSlot(this.props.combatant, null)}>add to encounter</button>);
                                canAdd = true;
                            }
                            this.props.encounter.waves.forEach(wave => {
                                if (!this.monsterIsInWave(wave)) {
                                    options.push(<button key={"add " + wave.id} onClick={() => this.props.addEncounterSlot(this.props.combatant, wave.id)}>add to {wave.name}</button>);
                                    canAdd = true;
                                }
                            });
                            // If we can't add it anywhere, don't show it
                            if (!canAdd) {
                                return (
                                    <InfoCard
                                        getHeading={() => {
                                            return (
                                                <div className="heading">
                                                    <div className="title">{this.props.combatant.name}</div>
                                                </div>
                                            );
                                        }}
                                        getContent={() => {
                                            return (
                                                <div className="section centered">
                                                    <i>this monster is already part of this encounter</i>
                                                </div>
                                            );
                                        }}
                                    />
                                );
                            }
                        }
                    }
                }
                if (this.props.mode.indexOf("combat") !== -1) {
                    var combatant = this.props.combatant as Combatant;

                    if (this.props.mode.indexOf("tactical") !== -1) {
                        if (this.props.mode.indexOf("on-map") !== -1) {
                            options.push(
                                <div key="mapMove" className="section centered">
                                    <Radial
                                        direction="eight"
                                        click={dir => this.props.mapMove(combatant, dir)}
                                    />
                                </div>
                            );
                            options.push(
                                <Spin
                                    key="altitude"
                                    source={this.props.combatant}
                                    name="altitude"
                                    label="altitude"
                                    display={value => value + " ft."}
                                    nudgeValue={delta => this.props.nudgeValue(this.props.combatant, "altitude", delta * 5)}
                                />
                            );
                            options.push(<button key="mapRemove" onClick={() => this.props.mapRemove(combatant)}>remove from map</button>);
                        }
                        if (this.props.mode.indexOf("off-map") !== -1) {
                            options.push(<button key="mapAdd" onClick={() => this.props.mapAdd(combatant)}>add to map</button>);
                        }
                        options.push(<div key="tactical-div" className="divider"></div>);
                    }
                    if (combatant.pending && !combatant.active && !combatant.defeated) {
                        options.push(<ConfirmButton key="remove" text="remove from encounter" callback={() => this.props.removeCombatant(combatant)} />);
                    }
                    if (!combatant.pending && combatant.active && !combatant.defeated) {
                        if (combatant.current) {
                            options.push(<button key="endTurn" onClick={() => this.props.endTurn(combatant)}>end turn</button>);
                            options.push(<button key="makeDefeated" onClick={() => this.props.makeDefeated(combatant)}>mark as defeated and end turn</button>);
                        } else {
                            options.push(<button key="makeCurrent" onClick={() => this.props.makeCurrent(combatant)}>start turn</button>);
                            options.push(<button key="makeDefeated" onClick={() => this.props.makeDefeated(combatant)}>mark as defeated</button>);
                            options.push(<ConfirmButton key="remove" text="remove from encounter" callback={() => this.props.removeCombatant(combatant)} />);
                        }
                    }
                    if (!combatant.pending && !combatant.active && combatant.defeated) {
                        options.push(<button key="makeActive" onClick={() => this.props.makeActive(combatant)}>mark as active</button>);
                        options.push(<ConfirmButton key="remove" text="remove from encounter" callback={() => this.props.removeCombatant(combatant)} />);
                    }
                    options.push(
                        <Expander
                            key="rename"
                            text="change name"
                            content={(
                                <div>
                                    <input type="text" value={combatant.displayName} onChange={event => this.props.changeValue(this.props.combatant, "displayName", event.target.value)} />
                                </div>
                            )}
                        />
                    );
                }
                if (this.props.mode.indexOf("template") !== -1) {
                    // None
                }
            }

            var stats = null;
            if (this.props.mode.indexOf("view") !== -1) {
                var slotSection = null;
                if (this.props.slot) {
                    slotSection = (
                        <div>
                            <div className="divider"></div>
                            <Spin
                                source={this.props.slot}
                                name="count"
                                label="count"
                                nudgeValue={delta => this.props.nudgeValue(this.props.slot, "count", delta)}
                            />
                        </div>
                    );
                }

                var details = null;
                if (this.state.showDetails) {
                    details = (
                        <div>
                            <div className="divider"></div>
                            <div className="section">
                                <b>ac</b> {this.props.combatant.ac}
                            </div>
                            <div className="section" style={{ display: this.props.combatant.hpMax !== 0 ? "" : "none" }}>
                                <b>hp</b> {this.props.combatant.hitDice !== 0 ? this.props.combatant.hpMax + " (" + this.props.combatant.hitDice + "d" + Utils.hitDieType(this.props.combatant.size) + ")" : this.props.combatant.hpMax}
                            </div>
                            <div className="section" style={{ display: this.props.combatant.speed !== "" ? "" : "none" }}>
                                <b>speed</b> {this.props.combatant.speed}
                            </div>
                            <div className="section">
                                <AbilityScorePanel combatant={this.props.combatant} />
                            </div>
                            <div className="section" style={{ display: this.props.combatant.savingThrows !== "" ? "" : "none" }}>
                                <b>saving throws</b> {this.props.combatant.savingThrows}
                            </div>
                            <div className="section" style={{ display: this.props.combatant.skills !== "" ? "" : "none" }}>
                                <b>skills</b> {this.props.combatant.skills}
                            </div>
                            <div className="section" style={{ display: this.props.combatant.damage.resist !== "" ? "" : "none" }}>
                                <b>damage resistances</b> {this.props.combatant.damage.resist}
                            </div>
                            <div className="section" style={{ display: this.props.combatant.damage.vulnerable !== "" ? "" : "none" }}>
                                <b>damage vulnerabilities</b> {this.props.combatant.damage.vulnerable}
                            </div>
                            <div className="section" style={{ display: this.props.combatant.damage.immune !== "" ? "" : "none" }}>
                                <b>damage immunities</b> {this.props.combatant.damage.immune}
                            </div>
                            <div className="section" style={{ display: this.props.combatant.conditionImmunities !== "" ? "" : "none" }}>
                                <b>condition immunities</b> {this.props.combatant.conditionImmunities}
                            </div>
                            <div className="section" style={{ display: this.props.combatant.senses !== "" ? "" : "none" }}>
                                <b>senses</b> {this.props.combatant.senses}
                            </div>
                            <div className="section" style={{ display: this.props.combatant.languages !== "" ? "" : "none" }}>
                                <b>languages</b> {this.props.combatant.languages}
                            </div>
                            <div className="section" style={{ display: this.props.combatant.equipment !== "" ? "" : "none" }}>
                                <b>equipment</b> {this.props.combatant.equipment}
                            </div>
                            <div className="divider"></div>
                            <TraitsPanel combatant={this.props.combatant} />
                        </div>
                    );
                }

                stats = (
                    <div className="stats">
                        <div className="section centered">
                            <i>{this.description()}</i>
                        </div>
                        {slotSection}
                        {details}
                    </div>
                );
            }
            if (this.props.mode.indexOf("combat") !== -1) {
                stats = (
                    <div className="stats">
                        <div className="section centered">
                            <i>{this.description()}</i>
                        </div>
                        <div className="divider"></div>
                        <Spin
                            source={this.props.combatant}
                            name="hp"
                            label="hit points"
                            factors={[1, 10]}
                            nudgeValue={delta => this.props.nudgeValue(this.props.combatant, "hp", delta)}
                        />
                        <Spin
                            source={this.props.combatant}
                            name="hpTemp"
                            label="temp hp"
                            factors={[1, 10]}
                            nudgeValue={delta => this.props.nudgeValue(this.props.combatant, "hpTemp", delta)}
                        />
                        <div className="divider"></div>
                        <Spin
                            source={this.state}
                            name="damage"
                            factors={[1, 10]}
                            nudgeValue={delta => this.nudgeDamage(delta)}
                        />
                        <div className={this.state.damageOrHealing > 0 ? "" : "disabled"}>
                            <button className="damage-btn" onClick={() => this.heal()}>heal</button>
                            <button className="damage-btn" onClick={() => this.setDamage(0)}>reset</button>
                            <button className="damage-btn" onClick={() => this.damage()}>damage</button>
                        </div>
                        <div className="section" style={{ display: this.props.combatant.damage.resist !== "" ? "" : "none" }}>
                            <b>damage resistances</b> {this.props.combatant.damage.resist}
                        </div>
                        <div className="section" style={{ display: this.props.combatant.damage.vulnerable !== "" ? "" : "none" }}>
                            <b>damage vulnerabilities</b> {this.props.combatant.damage.vulnerable}
                        </div>
                        <div className="section" style={{ display: this.props.combatant.damage.immune !== "" ? "" : "none" }}>
                            <b>damage immunities</b> {this.props.combatant.damage.immune}
                        </div>
                        <div className="divider"></div>
                        <div className="section">
                            <AbilityScorePanel combatant={this.props.combatant} />
                        </div>
                        <div className="section" style={{ display: this.props.combatant.ac !== 0 ? "" : "none" }}>
                            <b>ac</b> {this.props.combatant.ac}
                        </div>
                        <div className="section" style={{ display: this.props.combatant.savingThrows !== "" ? "" : "none" }}>
                            <b>saving throws</b> {this.props.combatant.savingThrows}
                        </div>
                        <div className="section" style={{ display: this.props.combatant.skills !== "" ? "" : "none" }}>
                            <b>skills</b> {this.props.combatant.skills}
                        </div>
                        <div className="section" style={{ display: this.props.combatant.speed !== "" ? "" : "none" }}>
                            <b>speed</b> {this.props.combatant.speed}
                        </div>
                        <div className="section" style={{ display: this.props.combatant.senses !== "" ? "" : "none" }}>
                            <b>senses</b> {this.props.combatant.senses}
                        </div>
                        <div className="section" style={{ display: this.props.combatant.languages !== "" ? "" : "none" }}>
                            <b>languages</b> {this.props.combatant.languages}
                        </div>
                        <div className="section" style={{ display: this.props.combatant.equipment !== "" ? "" : "none" }}>
                            <b>equipment</b> {this.props.combatant.equipment}
                        </div>
                        <div className="divider"></div>
                        <TraitsPanel combatant={this.props.combatant} />
                        <div className="divider"></div>
                        <div className="section subheading">
                            conditions
                        </div>
                        <div className="section" style={{ display: this.props.combatant.conditionImmunities !== "" ? "" : "none" }}>
                            <b>condition immunities</b> {this.props.combatant.conditionImmunities}
                        </div>
                        <ConditionsPanel
                            combatant={this.props.combatant as Combatant}
                            combat={this.props.combat}
                            addCondition={() => this.props.addCondition(this.props.combatant as Combatant)}
                            editCondition={condition => this.props.editCondition(this.props.combatant as Combatant, condition)}
                            removeCondition={conditionID => this.props.removeCondition(this.props.combatant as Combatant, conditionID)}
                            nudgeConditionValue={(condition, type, delta) => this.props.nudgeConditionValue(condition, type, delta)}
                        />
                    </div>
                );
            }
            if (this.props.mode.indexOf("template") !== -1) {
                if (this.props.mode.indexOf("overview") !== -1) {
                    stats = (
                        <div>
                            <div className="section centered">
                                <i>{this.description()}</i>
                            </div>
                            <div className="divider"></div>
                            <div className="section">
                                <b>speed</b> {this.props.combatant.speed || "-"}
                            </div>
                            <div className="section">
                                <b>senses</b> {this.props.combatant.senses || "-"}
                            </div>
                            <div className="section">
                                <b>languages</b> {this.props.combatant.languages || "-"}
                            </div>
                            <div className="section">
                                <b>equipment</b> {this.props.combatant.equipment || "-"}
                            </div>
                        </div>
                    );
                }
                if (this.props.mode.indexOf("abilities") !== -1) {
                    stats = (
                        <div>
                            <div className="section">
                                <AbilityScorePanel combatant={this.props.combatant} />
                            </div>
                            <div className="section">
                                <b>saving throws</b> {this.props.combatant.savingThrows || "-"}
                            </div>
                            <div className="section">
                                <b>skills</b> {this.props.combatant.skills || "-"}
                            </div>
                        </div>
                    );
                }
                if (this.props.mode.indexOf("combat") !== -1) {
                    stats = (
                        <div>
                            <div className="section">
                                <b>ac</b> {this.props.combatant.ac}
                            </div>
                            <div className="section">
                                <b>hp</b> {this.props.combatant.hitDice !== 0 ? this.props.combatant.hpMax + " (" + this.props.combatant.hitDice + "d" + Utils.hitDieType(this.props.combatant.size) + ")" : this.props.combatant.hpMax}
                            </div>
                            <div className="section">
                                <b>damage immunity</b> {this.props.combatant.damage.immune || "-"}
                            </div>
                            <div className="section">
                                <b>damage resistance</b> {this.props.combatant.damage.resist || "-"}
                            </div>
                            <div className="section">
                                <b>damage vulnerability</b> {this.props.combatant.damage.vulnerable || "-"}
                            </div>
                            <div className="section">
                                <b>condition immunities</b> {this.props.combatant.conditionImmunities || "-"}
                            </div>
                        </div>
                    );
                }
                if (this.props.mode.indexOf("actions") !== -1) {
                    stats = (
                        <TraitsPanel
                            combatant={this.props.combatant}
                            mode='template'
                            copyTrait={trait => this.props.copyTrait(trait)}
                        />
                    );
                }
            }

            var toggle = null;
            if (this.props.mode.indexOf("combat") !== -1) {
                // Don't show toggle button for combatant
            } else if (this.props.mode.indexOf("template") !== -1) {
                // Don't show toggle button for template
            } else {
                var imageStyle = this.state.showDetails ? "image rotate" : "image";
                toggle = <img className={imageStyle} src={arrow} alt="arrow" onClick={() => this.toggleDetails()} />
            }

            return (
                <div className="card monster">
                    <div className="heading">
                        <div className="title">{(this.props.combatant as Combatant ? (this.props.combatant as Combatant).displayName : null) || this.props.combatant.name || "unnamed monster"}</div>
                        {toggle}
                    </div>
                    <div className="card-content">
                        {stats}
                        <div style={{ display: options.length > 0 ? "" : "none" }}>
                            <div className="divider"></div>
                            <div className="section">{options}</div>
                        </div>
                    </div>
                </div>
            );
        } catch (e) {
            console.error(e);
        }
    }
}