/** @jsx h */

import {Component, h} from 'preact';

import {onFilter} from '/imports/state/actions';

class Label extends Component {
    onFilter = () => {
        onFilter(this.props.label.name);
    };

    render (props) {
        return (
            <label class="flex hover-gray items-center link ph2 pointer" htmlFor={props.label.name}>
                <input checked={props.label.active} id={props.label.name} onChange={this.onFilter} type="checkbox" />
                <div class="flex-auto mh2 truncate">
                    {props.label.name}
                </div>
                <div>
                    {`${props.label.count}/${props.label.total}`}
                </div>
            </label>
        );
    }
}

export class Labels extends Component {
    render (props) {
        if (props.labels.length === 0) {
            return (
                <div class="flex-auto pa3 tc">
                    (no labels)
                </div>
            );
        }

        return (
            <div class="flex-auto overflow-auto">
                {props.labels.map(label =>
                    <Label key={label.name} label={label} />
                )}
            </div>
        );
    }
}
