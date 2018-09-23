// @flow
// @jsx h

import {h} from 'preact';

import {iconAdd} from './Icon';
import {iconMinus} from './Icon';
import {iconNo} from './Icon';
import {iconOk} from './Icon';
import {iconPen} from './Icon';
import {iconRefresh} from './Icon';
import {onAdd} from '@client/actions';
import {onEdit} from '@client/actions';
import {onRefresh} from '@client/actions';
import {onRemove} from '@client/actions';
import {onSave} from '@client/actions';
import {onSettingsReset} from '@client/actions';
import {onSettingsSave} from '@client/actions';

import type {UserType} from '@types';

type Actions$Props = {|
  note: boolean,
  edit: boolean,
  user: ?UserType,
  view: ?string
|};

export function Actions(props: Actions$Props) {
  if (props.view !== 'notes' && props.view !== 'settings') return null;

  return (
    <div class="bottom-1 fixed right-1 w2">
      {props.view === 'notes' && (
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

      {props.view === 'notes' &&
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

      {props.view === 'notes' &&
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

      {props.view === 'notes' &&
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

      {props.view === 'notes' &&
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

      {props.view === 'notes' && (
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

      {props.view === 'settings' &&
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

      {props.view === 'settings' &&
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
