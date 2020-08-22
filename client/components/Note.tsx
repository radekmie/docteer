import { Component, h } from 'preact';

import { cache, compareDocs, schemaIsArray, schemaKey } from '../../shared';
import { NoteType, UserType } from '../../types';
import { onChangeSchema, onChange, onTypeAhead } from '../actions';
import { Editable } from './Editable';

type Note$Props = {
  edit: boolean;
  note: NoteType;
  user: UserType;
};

export class Note extends Component<Note$Props> {
  isArray = (key: string) => {
    const field = this.props.note._outline.find(field => field.name === key);
    return !!field && schemaIsArray(field.type);
  };

  onChange = cache(key => (html: string) => {
    onChange(
      this.props.note._id,
      key,
      this.isArray(key) ? listToSteps(html) : html,
    );
  });

  onFocus = cache(key => {
    if (!this.isArray(key)) {
      return undefined;
    }

    return () => {
      // @ts-expect-error Unknown object.
      if (!this.props.note[key].length) {
        onChange(this.props.note._id, key, ['']);

        // FIXME: Firefox has problems with selection when DOM is changing.
        setTimeout(() => {
          const selection = window.getSelection()!;
          if (selection.focusNode && selection.focusNode.firstChild) {
            selection.setPosition(selection.focusNode.firstChild);
          }
        });
      }
    };
  });

  onSchema = (event: Event) => {
    const schema = this.props.user.schemas.find(
      schema => schema.name === event.target!.value,
    );

    if (schema) {
      onChangeSchema(this.props.note._id, schema);
    }
  };

  // NOTE: Keys with 'ol' or 'ul' in outline are arrays.
  transform = (key: string, html: string | string[]) =>
    this.isArray(key) ? stepsToList(html as string[]) : (html as string);

  render(props: Note$Props) {
    if (!props.note) {
      return null;
    }

    return (
      <dl className="h-100 ma0 overflow-auto strict pa3 pr w-100">
        {props.user.schemas.length > 1 && (
          <select
            className={`b--dark-gray ba bg-white br-0 bw1 h2 mb1${
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

        {props.note._outline.reduce((fields, { name, type }, index) => {
          // @ts-expect-error Unknown object.
          if (props.edit || name === 'name' || props.note[name].length) {
            fields.push(
              // @ts-expect-error Incorrect typings of `dt` tag.
              <dt
                key={`${name}-dt`}
                // @ts-expect-error `className` is not nullable?
                className={index === 0 ? null : 'mt3'}
                data-test-note-label={schemaKey(name)}
              >
                <b>{`${schemaKey(name)}:`}</b>
              </dt>,
            );
            fields.push(
              // @ts-expect-error Incorrect typings of `dd` tag.
              <dd
                key={`${name}-dd`}
                className="ml4"
                data-test-note-field={schemaKey(name)}
              >
                <Editable
                  className={schemaIsArray(type) ? 'mv0 pl0' : null}
                  disabled={!props.edit}
                  // @ts-expect-error Unknown object.
                  html={this.transform(name, props.note[name])}
                  onChange={this.onChange(name)}
                  onFocus={this.onFocus(name)}
                  onInput={name === 'labels' ? onTypeAhead : undefined}
                  onKeyDown={name === 'labels' ? onTypeAhead.pre : undefined}
                  onKeyUp={name === 'labels' ? onTypeAhead.post : undefined}
                  tag={type}
                />
              </dd>,
            );
          }

          return fields;
        }, [])}
      </dl>
    );
  }
}

function listToSteps(html: string) {
  return html.startsWith('<li>')
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
