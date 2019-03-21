import React from 'react';

import { Combat } from '../../models/models';

import MapPanel from '../panels/map-panel';

interface Props {
    combat: Combat;
    selected: boolean;
    setSelection: (combat: Combat) => void;
}

export default class CombatListItem extends React.Component<Props> {
    render() {
        try {
            var map = null;
            if (this.props.combat.map) {
                map = (
                    <MapPanel
                        map={this.props.combat.map}
                        mode="thumbnail"
                        combatants={this.props.combat.combatants}
                    />
                );
            }

            return (
                <div className={this.props.selected ? "list-item selected" : "list-item"} onClick={() => this.props.setSelection(this.props.combat)}>
                    <div className="heading">{this.props.combat.name || "unnamed combat"}</div>
                    <div className="text">paused at {this.props.combat.timestamp}</div>
                    {map}
                </div>
            );
        } catch (e) {
            console.error(e);
        }
    }
}