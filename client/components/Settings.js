// @flow
// @jsx h

import {Component} from 'preact';
import {h} from 'preact';

import {Button} from './Button';
import {onChangePassword} from '@client/actions';
import {onExport} from '@client/actions';
import {onImport} from '@client/actions';
import {onSchemaAdd} from '@client/actions';
import {onSchemaDelete} from '@client/actions';
import {onSchemaField} from '@client/actions';
import {onSchemaKey} from '@client/actions';
import {onSchemaName} from '@client/actions';
import {onSchemaOrder} from '@client/actions';
import {onSchemaRemove} from '@client/actions';
import {onSchemaType} from '@client/actions';

import type {UserType} from '@types';

type Credentials$Props = {|
  user: UserType
|};

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

  // $FlowFixMe
  render(props: Credentials$Props) {
    return (
      <details class="pointer">
        <summary>Change password</summary>

        <form action="#" onSubmit={this.onChangePassword}>
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
              minlength={4}
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
              minlength={4}
              name="new2"
              ref={this.onNew2}
              type="password"
            />
          </label>

          <Button class="mt1 w-100" title="Change password" type="submit">
            Change password
          </Button>
        </form>
      </details>
    );
  }
}

type Settings$Props = {|
  user: UserType
|};

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
        <Button
          class="w-100"
          data-test-schema-add
          onClick={onSchemaAdd}
          title="Add schema"
        >
          Add schema
        </Button>

        {props.user.schemas.map((schema, index) => (
          <details class="mt1" data-test-schema={schema.name} key={index}>
            <summary class="pointer">{schema.name}</summary>

            <div class="flex mt1" data-name={schema.name}>
              <input
                class="b--dark-gray br-0 bw1 flex-1 ph1"
                data-test-schema-name
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
                    data-test-schema-field-up
                    disabled={index === 0}
                    onClick={onSchemaOrder}
                    title="Move up"
                  >
                    ↑
                  </Button>

                  <Button
                    class="ml1 ph1"
                    data-order="+1"
                    data-test-schema-field-down
                    disabled={index === array.length - 1}
                    onClick={onSchemaOrder}
                    title="Move down"
                  >
                    ↓
                  </Button>

                  <input
                    class={`b--dark-gray ${
                      disabled ? 'bg-near-white ' : ''
                    }br-0 bw1 ml1 flex-1 ph1`}
                    data-test-schema-field-name
                    disabled={disabled}
                    onChange={onSchemaKey}
                    title="Field name"
                    value={key}
                  />

                  <select
                    class={`b--dark-gray ba bg-${
                      disabled ? 'near-' : ''
                    }white br-0 bw1${disabled ? '' : ' dim'} ml1${
                      disabled ? '' : ' pointer'
                    } trans`}
                    data-test-schema-field-type
                    disabled={key === 'labels'}
                    onChange={onSchemaType}
                    title="Field type"
                    value={schema.fields[key]}
                  >
                    {key !== 'name' && <option value="ol">List</option>}
                    {key !== 'name' && <option value="ul">Tags</option>}
                    <option value="textarea">Text</option>
                    <option value="div">Snippet</option>
                  </select>

                  <Button
                    class="ml1 ph1"
                    data-test-schema-field-remove
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
                data-test-schema-field-add
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