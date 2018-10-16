// @flow
// @jsx h

import {h} from 'preact';

import type {LabelType} from '@types';

type Label$Props = {|
  label: LabelType
|};

function Label({label}: Label$Props) {
  return (
    <a
      class={`${
        label.active ? 'bg-near-white bl bw2 b--dark-gray ' : ''
      }dark-gray flex hover-bg-near-white link ph2${
        label.active ? ' pl1' : ''
      } pointer`}
      data-item
      href={label.href}
    >
      <div class="flex-1 truncate">{label.name}</div>
      <div class="ml2">{`${label.count}/${label.total}`}</div>
    </a>
  );
}

type Labels$Props = {|
  labels: LabelType[]
|};

export function Labels(props: Labels$Props) {
  return (
    <div class="flex-1 overflow-auto strict">
      {props.labels.length === 0 && <div className="pa3 tc">(no labels)</div>}
      {props.labels.map(label => (
        <Label key={label.name} label={label} />
      ))}
    </div>
  );
}
