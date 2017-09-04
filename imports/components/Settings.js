// @flow
// @jsx h

import {h} from 'preact';

import {Button}         from '/imports/components/Button';
import {onSchemaAdd}    from '/imports/lib/stateActions';
import {onSchemaDelete} from '/imports/lib/stateActions';
import {onSchemaKey}    from '/imports/lib/stateActions';
import {onSchemaOrder}  from '/imports/lib/stateActions';
import {onSchemaType}   from '/imports/lib/stateActions';

import type {TUser} from '/imports/types.flow';

type Settings$Props = {
  user: TUser
};

export function Settings (props: Settings$Props) {
  return (
    <dl class="flex-1 h-100 ma0 overflow-auto pa3">
      <dt>
        <b>Login:</b>
      </dt>

      <dd class="ml4">
        {props.user.emails[0].address}
      </dd>

      <dt class="mt3">
        <b>Schema:</b>
      </dt>

      <dd class="ml4">
        <Button class="w-100" onClick={onSchemaAdd}>
          +
        </Button>

        {Object.keys(props.user.schemas[0]).map((key, index, array) => {
          const disabled = key === 'labels' || key === 'name';

          return (
            <div class="flex mt1" data-index={index} key={key}>
              <Button class="pa1" data-order="-1" disabled={index === 0} onClick={onSchemaOrder}>
                ↑
              </Button>

              <Button class="ml1 pa1" data-order="+1" disabled={index === array.length - 1} onClick={onSchemaOrder}>
                ↓
              </Button>

              <input
                class={`b--dark-gray ${disabled ? 'bg-near-white ' : ''}bw1 ml1 flex-1 pa1`}
                disabled={disabled}
                onChange={onSchemaKey}
                value={key}
              />

              <select
                class={`b--dark-gray ba bg-${disabled ? 'near-' : ''}white bw1${disabled ? '' : ' dim'} ml1${disabled ? '' : ' pointer'} tc`}
                disabled={disabled}
                onChange={onSchemaType}
                value={props.user.schemas[0][key]}
              >
                <option value="ol">List</option>
                <option value="ul">Tags</option>
                <option value="div">Text</option>
              </select>

              <Button class="ml1 pa1" disabled={disabled} onClick={onSchemaDelete}>
                ×
              </Button>
            </div>
          );
        })}
      </dd>
    </dl>
  );
}
