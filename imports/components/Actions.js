// @flow
// @jsx h

import {h} from 'preact';

import {iconAdd} from '/imports/components/Icon';
import {iconMinus} from '/imports/components/Icon';
import {iconNo} from '/imports/components/Icon';
import {iconOk} from '/imports/components/Icon';
import {iconPen} from '/imports/components/Icon';
import {iconRefresh} from '/imports/components/Icon';
import {onAdd} from '/imports/lib/stateActions';
import {onEdit} from '/imports/lib/stateActions';
import {onRefresh} from '/imports/lib/stateActions';
import {onRemove} from '/imports/lib/stateActions';
import {onSave} from '/imports/lib/stateActions';
import {onSettingsReset} from '/imports/lib/stateActions';
import {onSettingsSave} from '/imports/lib/stateActions';

import type {TUser} from '/imports/types.flow';

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
