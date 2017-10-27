// @flow
// @jsx h

import {Component} from 'preact';
import {h} from 'preact';

import {Button} from './Button';
import {onChangePassword} from '../actions';
import {onExport} from '../actions';
import {onImport} from '../actions';
import {onSchemaAdd} from '../actions';
import {onSchemaDelete} from '../actions';
import {onSchemaField} from '../actions';
import {onSchemaKey} from '../actions';
import {onSchemaName} from '../actions';
import {onSchemaOrder} from '../actions';
import {onSchemaRemove} from '../actions';
import {onSchemaType} from '../actions';

class TUser {
  _changed: boolean;
  emails: {address: string, verified: boolean}[];
  schemas: {name: string, fields: {[string]: 'div' | 'ol' | 'ul'}}[];
}

class Credentials$Props {
  user: TUser;
}

class Credentials extends Component<Credentials$Props> {
  current: ?HTMLInputElement;
  new1: ?HTMLInputElement;
  new2: ?HTMLInputElement;

  onCurrent = (ref: ?HTMLInputElement) => {
    this.current = ref;
  };

  onNew1 = (ref: ?HTMLInputElement) => {
    this.new1 = ref;
  };

  onNew2 = (ref: ?HTMLInputElement) => {
    this.new2 = ref;
  };

  onChangePassword = event => {
    event.preventDefault();

    if (this.current && this.new1 && this.new2) {
      onChangePassword(
        this.current.value,
        this.new1.value,
        this.new2.value
      ).then(() => {
        if (this.current) this.current.value = '';
        if (this.new1) this.new1.value = '';
        if (this.new2) this.new2.value = '';
      });
    }
  };

  render(props) {
    return (
      <details class="pointer">
        <summary>Change password</summary>

        <form onSubmit={this.onChangePassword}>
          <label class="flex flex-column mt1" for="email" title="Email">
            <b>Email</b>
            <input
              autocomplete="email username"
              class="ba bg-near-white br-0 bw1 ph1"
              disabled
              id="email"
              name="email"
              type="email"
              value={props.user.emails[0].address}
            />
          </label>

          <label
            class="flex flex-column mt1"
            for="current"
            title="Current password"
          >
            <b>Current password</b>
            <input
              autocomplete="current-password"
              class="ba br-0 bw1 ph1"
              id="current"
              name="current"
              ref={this.onCurrent}
              type="password"
            />
          </label>

          <label class="flex flex-column mt1" for="new1" title="New password">
            <b>New password</b>
            <input
              autocomplete="new-password"
              class="ba br-0 bw1 ph1"
              id="new1"
              minlength={5}
              name="new1"
              ref={this.onNew1}
              type="password"
            />
          </label>

          <label
            class="flex flex-column mt1"
            for="new2"
            title="New password (again)"
          >
            <b>New password (again)</b>
            <input
              autocomplete="new-password"
              class="ba br-0 bw1 ph1"
              id="new2"
              minlength={5}
              name="new2"
              ref={this.onNew2}
              type="password"
            />
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

export function Settings(props: Settings$Props) {
  return (
    <dl class="ma0 w10 w-100">
      <dt class="mt3">
        <b>Credentials:</b>
      </dt>

      <dd class="ml4">
        <Credentials user={props.user} />
      </dd>

      <dt class="mt3">
        <b>Schemas:</b>
      </dt>

      <dd class="ml4">
        <Button class="w-100" onClick={onSchemaAdd} title="Add schema">
          Add schema
        </Button>

        {props.user.schemas.map((schema, index) => (
          <details class="mt1" key={index}>
            <summary class="pointer">{schema.name}</summary>

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
                <div
                  class="flex mt1"
                  data-field={key}
                  data-index={index}
                  data-name={schema.name}
                  key={key}
                >
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
                    class={`b--dark-gray ${disabled
                      ? 'bg-near-white '
                      : ''}br-0 bw1 ml1 flex-1 ph1`}
                    disabled={disabled}
                    onChange={onSchemaKey}
                    title="Field name"
                    value={key}
                  />

                  <select
                    class={`b--dark-gray ba bg-${disabled
                      ? 'near-'
                      : ''}white br-0 bw1${disabled
                      ? ''
                      : ' dim'} ml1 ph1${disabled ? '' : ' pointer'} tc`}
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
              <Button class="flex-1" onClick={onSchemaField} title="Add field">
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
        ))}
      </dd>

      <dt class="mt3">
        <b>Import / Export:</b>
      </dt>

      <dd class="ml4">
        <div class="flex mt1">
          <Button class="flex-1" onClick={onImport} title="Import">
            Import
          </Button>

          <Button class="flex-1 ml1" onClick={onExport} title="Export">
            Export
          </Button>
        </div>
      </dd>
    </dl>
  );
}
