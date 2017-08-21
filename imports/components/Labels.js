/** @jsx h */

import {Component, h} from 'preact';

class Label extends Component {
    render (props) {
        return (
            <a class={`${props.label.active ? 'bg-near-white bl bw2 b--dark-gray ' : ''}dark-gray flex hover-bg-near-white hover-black items-center link ph2${props.label.active ? ' pl1' : ''} pointer`} href={props.label.href}>
                <div class="flex-auto truncate">
                    {props.label.name}
                </div>
                <div class="ml2">
                    {`${props.label.count}/${props.label.total}`}
                </div>
            </a>
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
