// @flow
// @jsx h

import {h} from 'preact';

import {iconAdd} from './Icon';
import {iconMinus} from './Icon';
import {iconNo} from './Icon';
import {iconOk} from './Icon';
import {iconPen} from './Icon';
import {iconRefresh} from './Icon';
import {onAdd} from '../actions';
import {onEdit} from '../actions';
import {onRefresh} from '../actions';
import {onRemove} from '../actions';
import {onSave} from '../actions';
import {onSettingsReset} from '../actions';
import {onSettingsSave} from '../actions';

class TUser {
  _changed: boolean;
  emails: {address: string, verified: boolean}[];
  schemas: {name: string, fields: {[string]: 'div' | 'ol' | 'ul'}}[];
}

type Actions$Props = {
  note: boolean,
  edit: boolean,
  user: ?TUser,
  view: ?string
};

export function Actions(props: Actions$Props) {
  return (
    <div class="bottom-1 fixed right-1 w2">
      {props.view === 'd' && (
        <div
          class={button('dark-pink')}
          key="Create"
          onClick={onAdd}
          tabIndex="0"
          title="Create"
        >
          {iconAdd}
        </div>
      )}

      {props.view === 'd' &&
        props.edit &&
        props.note && (
          <div
            class={button('red')}
            key="Remove"
            onClick={onRemove}
            tabIndex="0"
            title="Remove"
          >
            {iconMinus}
          </div>
        )}

      {props.view === 'd' &&
        props.edit && (
          <div
            class={button('green')}
            key="Save"
            onClick={onSave}
            tabIndex="0"
            title="Save"
          >
            {iconOk}
          </div>
        )}

      {props.view === 'd' &&
        !props.edit && (
          <div
            class={button('dark-blue')}
            key="Edit"
            onClick={onEdit}
            tabIndex="0"
            title="Edit"
          >
            {iconPen}
          </div>
        )}

      {props.view === 'd' &&
        props.edit && (
          <div
            class={button('blue')}
            key="Cancel"
            onClick={onEdit}
            tabIndex="0"
            title="Cancel"
          >
            {iconNo}
          </div>
        )}

      {props.view === 'd' && (
        <div
          class={button('orange')}
          key="Refresh"
          onClick={onRefresh}
          tabIndex="0"
          title="Refresh"
        >
          {iconRefresh}
        </div>
      )}

      {props.view === 's' &&
        props.user && (
          <div
            class={button('green', !props.user._changed)}
            key="Save"
            onClick={onSettingsSave}
            tabIndex="0"
            title="Save"
          >
            {iconOk}
          </div>
        )}

      {props.view === 's' &&
        props.user && (
          <div
            class={button('red', !props.user._changed)}
            key="Cancel"
            onClick={onSettingsReset}
            tabIndex="0"
            title="Cancel"
          >
            {iconNo}
          </div>
        )}
    </div>
  );
}

function button(color, disabled) {
  return `b--dark-gray ba bg${disabled
    ? '-near'
    : ''}-white br-100 bw1 h2 ${disabled
    ? ''
    : `hover-${color}`} link mb1 pa1${disabled ? '' : ' pointer'} shadow-4`;
}
