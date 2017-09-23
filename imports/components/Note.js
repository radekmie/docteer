// @flow
// @jsx h

import {Component} from 'preact';
import {h}         from 'preact';

import {onChangeSchema} from '/imports/lib/stateActions';
import {onChange}       from '/imports/lib/stateActions';
import {onTypeAhead}    from '/imports/lib/stateActions';
import {schemaIsArray}  from '/imports/lib/schemas';
import {schemaKey}      from '/imports/lib/schemas';

import {Editable} from './Editable';

import type {TNote} from '/imports/types.flow';

type Note$Props = {
  edit: bool,
  note: TNote
};

export class Note extends Component<Note$Props> {
  onChangeMap = {};
  onChange = (key: string) => {
    return this.onChangeMap[key] = this.onChangeMap[key] || ((html: string) => {
      onChange(
        this.props.note._id,
        key,
        schemaIsArray(this.props.note._outline[key])
          ? listToSteps(html)
          : html
      );
    });
  };

  onFocusMap = {};
  onFocus = (key: string) => {
    if (!schemaIsArray(this.props.note._outline[key]))
      return undefined;

    return this.onFocusMap[key] = this.onFocusMap[key] || (() => {
      if (!this.props.note[key].length)
        onChange(this.props.note._id, key, ['']);
    });
  };

  onSchema = (event: {target: {value: string}}) => {
    const schema = this.props.user.schemas.find(schema => schema.name === event.target.value);

    if (schema) {
      onChangeSchema(this.props.note._id, schema);
    }
  };

  // NOTE: Keys with 'ol' or 'ul' in outline are arrays.
  transform = (key: string, html: string | string[]) =>
    schemaIsArray(this.props.note._outline[key])
      // $FlowFixMe: Look up.
      ? stepsToList(html)
      // $FlowFixMe: Look up.
      : (html: string)
  ;

  render () {
    const props = this.props;
    const other = props.user.schemas.findIndex(schema => schema.name === props.note._outname) === -1;

    return (
      <dl class="flex-1 h-100 ma0 overflow-auto pa3">
        {props.user.schemas.length > 1 && (
          <select
            class="b--dark-gray ba bg-white bw1 h2 mb1 pointer tc w-100"
            disabled={!props.edit && !props.note._created}
            onChange={this.onSchema}
            title="Schema"
            value={props.note._outname || ''}
          >
            {other && (
              <option value="">
                {props.note._outname || '(unknown)'}
              </option>
            )}

            {props.user.schemas.map((schema, index) =>
              <option key={index} value={schema.name}>
                {schema.name}
              </option>
            )}
          </select>
        )}

        {Object.keys(props.note._outline).reduce((fields, key, index) => {
          if (props.edit || key === 'name' || props.note[key].length) {
            fields.push(
              <dt key={`${key}-dt`} class={index === 0 ? null : 'mt3'}>
                <b>{`${schemaKey(key)}:`}</b>
              </dt>
            );

            fields.push(
              <dd key={`${key}-dd`} class="ml4">
                <Editable
                  class={schemaIsArray(props.note._outline[key]) ? 'mv0 pl0' : null}
                  disabled={!props.edit}
                  html={this.transform(key, props.note[key])}
                  onChange={this.onChange(key)}
                  onFocus={this.onFocus(key)}
                  onInput={key === 'labels' ? onTypeAhead : undefined}
                  onKeyDown={key === 'labels' ? onTypeAhead.pre : undefined}
                  onKeyUp={key === 'labels' ? onTypeAhead.post : undefined}
                  tag={props.note._outline[key]}
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

function listToSteps (html) {
  return html.indexOf('<li>') === 0 ? html.split('<li>').slice(1).map(element => element.slice(0, -5)) : [html];
}

function stepsToList (steps: string[]) {
  return steps.map(step => `<li>${step}</li>`).join('');
}
