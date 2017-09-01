// @flow
// @jsx h

import {h} from 'preact';

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
        <button class="w-100" onClick={onSchemaAdd}>
          +
        </button>

        {Object.keys(props.user.schemas[0]).map((key, index, array) =>
          <div class="flex hover-bg-near-white mt1" data-index={index} key={key}>
            <button class="pa1" data-order="-1" disabled={index === 0} onClick={onSchemaOrder}>
              ↑
            </button>

            <button class="pa1" data-order="+1" disabled={index === array.length - 1} onClick={onSchemaOrder}>
              ↓
            </button>

            <input class="flex-1 pa1" disabled={key === 'labels' || key === 'name'} onChange={onSchemaKey} value={key} />

            <select disabled={key === 'labels' || key === 'name'} onChange={onSchemaType} value={props.user.schemas[0][key]}>
              <option value="ol">List</option>
              <option value="ul">Tags</option>
              <option value="div">Text</option>
            </select>

            <button class="pa1" disabled={key === 'labels' || key === 'name'} onClick={onSchemaDelete}>
              ×
            </button>
          </div>
        )}
      </dd>
    </dl>
  );
}
