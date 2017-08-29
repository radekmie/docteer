/** @jsx h */

import {Component} from 'preact';
import {h}         from 'preact';

import {onChange}      from '/imports/lib/stateActions';
import {onTypeAhead}   from '/imports/lib/stateActions';
import {schemaIsArray} from '/imports/lib/schemas';
import {schemaKey}     from '/imports/lib/schemas';

import {Editable} from './Editable';

export class Note extends Component {
    onChangeMap = {};
    onChange = key => {
      return this.onChangeMap[key] = this.onChangeMap[key] || (html => {
        onChange(this.props.note._id, key, schemaIsArray(this.props.note._outline[key]) ? listToSteps(html) : html);
      });
    };

    onFocusMap = {};
    onFocus = key => {
      if (!schemaIsArray(this.props.note._outline[key])) {
        return undefined;
      }

      return this.onFocusMap[key] = this.onFocusMap[key] || (() => {
        if (!this.props.note[key].length) {
          onChange(this.props.note._id, key, ['']);
        }
      });
    };

    transform = (key, html) => schemaIsArray(this.props.note._outline[key]) ? stepsToList(html) : html;

    render (props) {
      return (
        <dl class="flex-1 h-100 ma0 overflow-auto pa3">
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
  const  steps = html.split('<li>').slice(1).map(element => element.slice(0, -5));
  return steps.length ? steps : [''];
}

function stepsToList (steps) {
  return steps.map(step => `<li>${step}</li>`).join('');
}
