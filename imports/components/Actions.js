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

import type {UserType} from '../types.flow';

type Actions$Props = {|
  note: boolean,
  edit: boolean,
  user: ?UserType,
  view: ?string
|};

export function Actions(props: Actions$Props) {
  if (props.view !== 'd' && props.view !== 's') return null;

  return (
    <div class="bottom-1 fixed right-1 w2">
      {props.view === 'd' && (
        <div
          class={button('dark-pink')}
          data-test-notes-action="create"
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
            data-test-notes-action="remove"
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
            data-test-notes-action="save"
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
            data-test-notes-action="edit"
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
            data-test-notes-action="cancel"
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
          data-test-notes-action="refresh"
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
            data-test-settings-action="save"
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
            data-test-settings-action="cancel"
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
  return `b--dark-gray ba bg${disabled ? '-near' : ''}-white br-100 bw1 h2 ${
    disabled ? '' : `hover-${color}`
  } link mb1 pa1${disabled ? '' : ' pointer'} shadow-4`;
}
