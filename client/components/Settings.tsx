import { Component, h } from 'preact';

import { UserType } from '../../types';
import {
  onChangePassword,
  onExportCSV,
  onExportJSON,
  onImport,
  onSchemaAdd,
  onSchemaDelete,
  onSchemaField,
  onSchemaKey,
  onSchemaName,
  onSchemaOrder,
  onSchemaRemove,
  onSchemaType,
} from '../actions';
import { Button } from './Button';

type Credentials$Props = {
  user: UserType;
};

class Credentials extends Component<Credentials$Props> {
  current: HTMLInputElement | null | undefined;
  new1: HTMLInputElement | null | undefined;
  new2: HTMLInputElement | null | undefined;

  onCurrent = (ref: HTMLInputElement | null | undefined) => {
    this.current = ref;
  };

  onNew1 = (ref: HTMLInputElement | null | undefined) => {
    this.new1 = ref;
  };

  onNew2 = (ref: HTMLInputElement | null | undefined) => {
    this.new2 = ref;
  };

  onChangePassword = (event: Event) => {
    event.preventDefault();

    if (this.current && this.new1 && this.new2) {
      onChangePassword(
        this.current.value,
        this.new1.value,
        this.new2.value,
      ).then(() => {
        if (this.current) {
          this.current.value = '';
        }
        if (this.new1) {
          this.new1.value = '';
        }
        if (this.new2) {
          this.new2.value = '';
        }
      });
    }
  };

  render(props: Credentials$Props) {
    return (
      <details>
        <summary className="pointer">Change password</summary>
        <form action="#" onSubmit={this.onChangePassword}>
          <label className="flex flex-column mt1" htmlFor="email" title="Email">
            <b>Email</b>
            <input
              autoComplete="email username"
              className="ba bg-near-white br-0 bw1 ph1 w-100"
              disabled
              id="email"
              name="email"
              type="email"
              value={props.user.emails[0].address}
            />
          </label>
          <label
            className="flex flex-column mt1"
            htmlFor="current"
            title="Current password"
          >
            <b>Current password</b>
            <input
              autoComplete="current-password"
              className="ba br-0 bw1 ph1 w-100"
              id="current"
              name="current"
              ref={this.onCurrent}
              type="password"
            />
          </label>
          <label
            className="flex flex-column mt1"
            htmlFor="new1"
            title="New password"
          >
            <b>New password</b>
            <input
              autoComplete="new-password"
              className="ba br-0 bw1 ph1 w-100"
              id="new1"
              minLength={4}
              name="new1"
              ref={this.onNew1}
              type="password"
            />
          </label>
          <label
            className="flex flex-column mt1"
            htmlFor="new2"
            title="New password (again)"
          >
            <b>New password (again)</b>
            <input
              autoComplete="new-password"
              className="ba br-0 bw1 ph1 w-100"
              id="new2"
              minLength={4}
              name="new2"
              ref={this.onNew2}
              type="password"
            />
          </label>
          <Button className="mt1 w-100" title="Change password" type="submit">
            Change password
          </Button>
        </form>
      </details>
    );
  }
}

type Settings$Props = {
  user: UserType;
};

export function Settings(props: Settings$Props) {
  return (
    <dl className="ma0 w10 w-100">
      <dt className="mt3">
        <b>Credentials:</b>
      </dt>
      <dd className="ml4" data-test-settings="credentials">
        <Credentials user={props.user} />
      </dd>
      <dt className="mt3">
        <b>Schemas:</b>
      </dt>
      <dd className="ml4" data-test-settings="schemas">
        <Button
          className="w-100"
          data-test-schema-add
          onClick={onSchemaAdd}
          title="Add schema"
        >
          Add schema
        </Button>

        {props.user.schemas.map((schema, index) => (
          <details className="mt1" data-test-schema={schema.name} key={index}>
            <summary className="pointer">{schema.name}</summary>
            <div className="flex mt1" data-name={schema.name}>
              <input
                className="b--dark-gray br-0 bw1 flex-1 ph1 w-100"
                data-test-schema-name
                onInput={onSchemaName}
                type="Schema name"
                value={schema.name}
              />
            </div>

            {schema.fields.map(({ name, type }, index, array) => {
              const disabled = name === 'labels' || name === 'name';

              return (
                <div
                  className="flex mt1"
                  data-field={name}
                  data-index={index}
                  data-name={schema.name}
                  key={index}
                >
                  <Button
                    className="ph1"
                    data-order="-1"
                    data-test-schema-field-up
                    disabled={index === 0}
                    onClick={onSchemaOrder}
                    title="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    className="ml1 ph1"
                    data-order="+1"
                    data-test-schema-field-down
                    disabled={index === array.length - 1}
                    onClick={onSchemaOrder}
                    title="Move down"
                  >
                    ↓
                  </Button>
                  <input
                    className={`b--dark-gray ${
                      disabled ? 'bg-near-white ' : ''
                    }br-0 bw1 ml1 flex-1 ph1 w-100`}
                    data-test-schema-field-name
                    disabled={disabled}
                    onInput={onSchemaKey}
                    title="Field name"
                    value={name}
                  />
                  <select
                    className={`b--dark-gray ba bg-${
                      disabled ? 'near-' : ''
                    }white br-0 bw1${disabled ? '' : ' dim'} ml1${
                      disabled ? '' : ' pointer'
                    } trans`}
                    data-test-schema-field-type
                    disabled={name === 'labels'}
                    onChange={onSchemaType}
                    title="Field type"
                    value={type}
                  >
                    {name !== 'name' && <option value="ol">List</option>}
                    {name !== 'name' && <option value="ul">Tags</option>}
                    <option value="textarea">Text</option>
                    <option value="div">Snippet</option>
                  </select>
                  <Button
                    className="ml1 ph1"
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
            <div className="flex mt1" data-name={schema.name}>
              <Button
                className="flex-1"
                data-test-schema-field-add
                onClick={onSchemaField}
                title="Add field"
              >
                Add field
              </Button>
              <Button
                className="flex-1 ml1"
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
      <dt className="mt3">
        <b>Import / Export:</b>
      </dt>
      <dd className="ml4" data-test-settings="import-export">
        <div className="flex mt1">
          <Button
            className="flex-1"
            data-test-export="csv"
            onClick={onExportCSV}
            title="Export CSV"
          >
            Export CSV
          </Button>
          <Button
            className="flex-1 ml1"
            data-test-export="json"
            onClick={onExportJSON}
            title="Export JSON"
          >
            Export JSON
          </Button>
          <Button
            className="flex-1 ml1"
            data-test-import="json"
            onClick={onImport}
            title="Import JSON"
          >
            Import JSON
          </Button>
        </div>
      </dd>
    </dl>
  );
}
