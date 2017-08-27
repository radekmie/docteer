/** @jsx h */

import {h} from 'preact';

function Label (props) {
    const label = props.label;

    return (
        <a class={`${label.active ? 'bg-near-white bl bw2 b--dark-gray ' : ''}dark-gray flex hover-bg-near-white items-center link ph2${label.active ? ' pl1' : ''} pointer`} href={label.href}>
            <div class="flex-1 truncate">
                {label.name}
            </div>
            <div class="ml2">
                {`${label.count}/${label.total}`}
            </div>
        </a>
    );
}

export function Labels (props) {
    if (props.labels.length === 0) {
        return (
            <div class="flex-1 pa3 tc">
                (no labels)
            </div>
        );
    }

    return (
        <div class="flex-1 overflow-auto">
            {props.labels.map(label =>
                <Label key={label.name} label={label} />
            )}
        </div>
    );
}
