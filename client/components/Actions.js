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

export function Actions({note, edit, user, view}: Actions$Props) {
  if (view !== 'notes' && view !== 'settings') return null;

  // prettier-ignore
  const buttons = [
    [view === 'notes',                 'dark-pink', false,                  'Create',  onAdd,           iconAdd],
    [view === 'notes' && edit && note, 'red',       false,                  'Remove',  onRemove,        iconMinus],
    [view === 'notes' && edit,         'green',     false,                  'Save',    onSave,          iconOk],
    [view === 'notes' && !edit,        'dark-blue', false,                  'Edit',    onEdit,          iconPen],
    [view === 'notes' && edit,         'blue',      false,                  'Cancel',  onEdit,          iconNo],
    [view === 'notes',                 'orange',    false,                  'Refresh', onRefresh,       iconRefresh],
    [view === 'settings' && user,      'green',     user && !user._changed, 'Save',    onSettingsSave,  iconOk],
    [view === 'settings' && user,      'red',       user && !user._changed, 'Cancel',  onSettingsReset, iconNo]
  ];

  return (
    <div class="bottom-1 fixed right-1 w2">
      {buttons.filter(props => props[0]).map(props => (
        <div
          class={button(props[1], props[2])}
          data-test-notes-action={props[3].toLowerCase()}
          key={props[3]}
          onClick={props[4]}
          tabIndex="0"
          title={props[3]}
        >
          {props[5]}
        </div>
      ))}
    </div>
  );
}

function button(color, disabled) {
  return `b--dark-gray ba bg${disabled ? '-near' : ''}-white br-100 bw1 h2 ${
    disabled ? '' : `hover-${color}`
  } link mb1 pa1${disabled ? '' : ' pointer'} shadow-4`;
}
