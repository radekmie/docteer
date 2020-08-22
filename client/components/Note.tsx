// @flow
// @jsx h

import {Component, h} from 'preact';

import {Editable} from '@client/components/Editable';
import {cache, compareDocs, schemaIsArray, schemaKey} from '@shared';
import {onChangeSchema, onChange, onTypeAhead} from '@client/actions';

import type {EventType, NoteType, UserType} from '@types';

type Note$Props = {|
  edit: boolean,
  note: NoteType<>,
  user: UserType
|};

export class Note extends Component<Note$Props> {
  isArray = (key: string) => {
    const field = this.props.note._outline.find(field => field.name === key);
    return !!field && schemaIsArray(field.type);
  };

  onChange = cache<string, _>((key: string) => (html: string) => {
    onChange(
      this.props.note._id,
      key,
      this.isArray(key) ? listToSteps(html) : html
    );
  });

  onFocus = cache<string, _>((key: string) => {
    if (!this.isArray(key)) return undefined;

    return () => {
      if (!this.props.note[key].length) {
        onChange(this.props.note._id, key, ['']);

        // FIXME: Firefox has problems with selection when DOM is changing.
        setTimeout(() => {
          const selection = window.getSelection();
          if (selection.focusNode && selection.focusNode.firstChild)
            selection.setPosition(selection.focusNode.firstChild);
        });
      }
    };
  });

  onSchema = (event: EventType) => {
    const schema = this.props.user.schemas.find(
      schema => schema.name === event.target.value
    );

    if (schema) onChangeSchema(this.props.note._id, schema);
  };

  // NOTE: Keys with 'ol' or 'ul' in outline are arrays.
  transform = (key: string, html: string | string[]) =>
    this.isArray(key)
      ? // $FlowFixMe: Look up.
        stepsToList(html)
      : // $FlowFixMe: Look up.
        (html: string);

  render(props: Note$Props) {
    if (!props.note) return null;

    return (
      <dl class="h-100 ma0 overflow-auto strict pa3 pr w-100">
        {props.user.schemas.length > 1 && (
          <select
            class={`b--dark-gray ba bg-white br-0 bw1 h2 mb1${
              props.edit ? ' pointer' : ''
            } tc w-100`}
            data-test-note-schema
            disabled={!props.edit}
            onChange={this.onSchema}
            title="Schema"
            value={props.note._outname}
          >
            {props.user.schemas
              .slice()
              .sort(compareDocs)
              .map((schema, index) => (
                <option key={index} value={schema.name}>
                  {schema.name}
                </option>
              ))}
          </select>
        )}

        {props.note._outline.reduce((fields, {name, type}, index) => {
          if (props.edit || name === 'name' || props.note[name].length) {
            fields.push(
              <dt
                key={`${name}-dt`}
                class={index === 0 ? null : 'mt3'}
                data-test-note-label={schemaKey(name)}
              >
                <b>{`${schemaKey(name)}:`}</b>
              </dt>
            );

            fields.push(
              <dd
                key={`${name}-dd`}
                class="ml4"
                data-test-note-field={schemaKey(name)}
              >
                <Editable
                  class={schemaIsArray(type) ? 'mv0 pl0' : null}
                  disabled={!props.edit}
                  html={this.transform(name, props.note[name])}
                  onChange={this.onChange(name)}
                  onFocus={this.onFocus(name)}
                  onInput={name === 'labels' ? onTypeAhead : undefined}
                  onKeyDown={name === 'labels' ? onTypeAhead.pre : undefined}
                  onKeyUp={name === 'labels' ? onTypeAhead.post : undefined}
                  tag={type}
                />
              </dd>
            );
          }

          return fields;
        }, [])}
      </dl>
    );
  }
}

function listToSteps(html) {
  return html.indexOf('<li>') === 0
    ? html
        .split('<li>')
        .slice(1)
        .map(element => element.slice(0, -5).replace(/(<br>)+$/, ''))
    : html
    ? [html]
    : [];
}

function stepsToList(steps: string[]) {
  return steps.map(step => `<li>${step}</li>`).join('');
}
