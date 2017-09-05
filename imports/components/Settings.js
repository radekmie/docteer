// @flow
// @jsx h

import {h} from 'preact';

import {Button}         from '/imports/components/Button';
import {onSchemaAdd}    from '/imports/lib/stateActions';
import {onSchemaDelete} from '/imports/lib/stateActions';
import {onSchemaField}  from '/imports/lib/stateActions';
import {onSchemaKey}    from '/imports/lib/stateActions';
import {onSchemaName}   from '/imports/lib/stateActions';
import {onSchemaOrder}  from '/imports/lib/stateActions';
import {onSchemaRemove} from '/imports/lib/stateActions';
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
        <b>Schemas:</b>
      </dt>

      <dd class="ml4">
        <Button class="w-100" onClick={onSchemaAdd} title="Add schema">
          Add schema
        </Button>

        {props.user.schemas.map((schema, index) =>
          <details class="mt1" key={index}>
            <summary class="pointer">
              {schema.name}
            </summary>

            <div class="flex mt1" data-name={schema.name}>
              <input
                class="b--dark-gray bw1 flex-1 pa1"
                onChange={onSchemaName}
                type="Schema name"
                value={schema.name}
              />
            </div>

            {Object.keys(schema.fields).map((key, index, array) => {
              const disabled = key === 'labels' || key === 'name';

              return (
                <div class="flex mt1" data-field={key} data-index={index} data-name={schema.name} key={key}>
                  <Button
                    class="pa1"
                    data-order="-1"
                    disabled={index === 0}
                    onClick={onSchemaOrder}
                    title="Move up"
                  >
                    ↑
                  </Button>

                  <Button
                    class="ml1 pa1"
                    data-order="+1"
                    disabled={index === array.length - 1}
                    onClick={onSchemaOrder}
                    title="Move down"
                  >
                    ↓
                  </Button>

                  <input
                    class={`b--dark-gray ${disabled ? 'bg-near-white ' : ''}bw1 ml1 flex-1 pa1`}
                    disabled={disabled}
                    onChange={onSchemaKey}
                    title="Field name"
                    value={key}
                  />

                  <select
                    class={`b--dark-gray ba bg-${disabled ? 'near-' : ''}white bw1${disabled ? '' : ' dim'} ml1${disabled ? '' : ' pointer'} tc`}
                    disabled={disabled}
                    onChange={onSchemaType}
                    title="Field type"
                    value={schema.fields[key]}
                  >
                    <option value="ol">List</option>
                    <option value="ul">Tags</option>
                    <option value="div">Text</option>
                  </select>

                  <Button
                    class="ml1 pa1"
                    disabled={disabled}
                    onClick={onSchemaDelete}
                    title="Remove field"
                  >
                    ×
                  </Button>
                </div>
              );
            })}

            <div class="flex mt1" data-name={schema.name}>
              <Button
                class="flex-1"
                onClick={onSchemaField}
                title="Add field"
              >
                Add field
              </Button>

              <Button
                class="flex-1 ml1"
                disabled={props.user.schemas.length === 1}
                onClick={onSchemaRemove}
                title="Remove schema"
              >
                Remove schema
              </Button>
            </div>
          </details>
        )}
      </dd>
    </dl>
  );
}
