// @flow
// @jsx h

import {Component} from 'preact';
import {h}         from 'preact';

import {Button}           from '/imports/components/Button';
import {onChangePassword} from '/imports/lib/stateActions';
import {onExport}         from '/imports/lib/stateActions';
import {onImport}         from '/imports/lib/stateActions';
import {onSchemaAdd}      from '/imports/lib/stateActions';
import {onSchemaDelete}   from '/imports/lib/stateActions';
import {onSchemaField}    from '/imports/lib/stateActions';
import {onSchemaKey}      from '/imports/lib/stateActions';
import {onSchemaName}     from '/imports/lib/stateActions';
import {onSchemaOrder}    from '/imports/lib/stateActions';
import {onSchemaRemove}   from '/imports/lib/stateActions';
import {onSchemaType}     from '/imports/lib/stateActions';

import type {TUser} from '/imports/types.flow';

class ChangePassword extends Component {
  old:  ?HTMLInputElement;
  new1: ?HTMLInputElement;
  new2: ?HTMLInputElement;

  onOld = (ref: ?HTMLInputElement) => {
    this.old = ref;
  };

  onNew1 = (ref: ?HTMLInputElement) => {
    this.new1 = ref;
  };

  onNew2 = (ref: ?HTMLInputElement) => {
    this.new2 = ref;
  };

  onChangePassword = event => {
    event.preventDefault();

    if (this.old && this.new1 && this.new2) {
      onChangePassword(this.old.value, this.new1.value, this.new2.value).then(() => {
        if (this.old)  this.old.value  = '';
        if (this.new1) this.new1.value = '';
        if (this.new2) this.new2.value = '';
      });
    }
  };

  render () {
    return (
      <details class="pointer">
        <summary>
          Change password
        </summary>

        <form onSubmit={this.onChangePassword}>
          <label class="flex flex-column mt1" for="old" title="Old password">
            <b>Old password</b>
            <input class="ba bg-near-white br-0 bw1 ph1" id="old" name="old" ref={this.onOld} type="password" />
          </label>

          <label class="flex flex-column mt1" for="new1" title="New password">
            <b>New password</b>
            <input class="ba bg-near-white br-0 bw1 ph1" id="new1" name="new1" ref={this.onNew1} type="password" />
          </label>

          <label class="flex flex-column mt1" for="new2" title="New password (again)">
            <b>New password (again)</b>
            <input class="ba bg-near-white br-0 bw1 ph1" id="new2" name="new2" ref={this.onNew2} type="password" />
          </label>

          <Button class="mt1 w-100" title="Change password">
            Change password
          </Button>
        </form>
      </details>
    );
  }
}

type Settings$Props = {
  user: TUser
};

export function Settings (props: Settings$Props) {
  return (
    <dl class="ma0 w10 w-100">
      <dt>
        <b>Login:</b>
      </dt>

      <dd class="ml4">
        {props.user.emails[0].address}
      </dd>

      <dt class="mt3">
        <b>Password:</b>
      </dt>

      <dd class="ml4">
        <ChangePassword />
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
                class="b--dark-gray br-0 bw1 flex-1 ph1"
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
                    class="ph1"
                    data-order="-1"
                    disabled={index === 0}
                    onClick={onSchemaOrder}
                    title="Move up"
                  >
                    ↑
                  </Button>

                  <Button
                    class="ml1 ph1"
                    data-order="+1"
                    disabled={index === array.length - 1}
                    onClick={onSchemaOrder}
                    title="Move down"
                  >
                    ↓
                  </Button>

                  <input
                    class={`b--dark-gray ${disabled ? 'bg-near-white ' : ''}br-0 bw1 ml1 flex-1 ph1`}
                    disabled={disabled}
                    onChange={onSchemaKey}
                    title="Field name"
                    value={key}
                  />

                  <select
                    class={`b--dark-gray ba bg-${disabled ? 'near-' : ''}white br-0 bw1${disabled ? '' : ' dim'} ml1 ph1${disabled ? '' : ' pointer'} tc`}
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
                    class="ml1 ph1"
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

      <dt class="mt3">
        <b>Import / Export:</b>
      </dt>

      <dd class="ml4">
        <div class="flex mt1">
          <Button
            class="flex-1"
            onClick={onImport}
            title="Import"
          >
            Import
          </Button>

          <Button
            class="flex-1 ml1"
            onClick={onExport}
            title="Export"
          >
            Export
          </Button>
        </div>
      </dd>
    </dl>
  );
}
