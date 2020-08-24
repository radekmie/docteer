import { Component, VNode, h } from 'preact';

import { UserType } from '../../types';
import {
  onAdd,
  onClone,
  onEdit,
  onRefresh,
  onRemove,
  onSave,
  onSettingsReset,
  onSettingsSave,
} from '../actions';
import {
  iconAdd,
  iconClone,
  iconMinus,
  iconNo,
  iconOk,
  iconPen,
  iconRefresh,
} from './Icon';

type Action = [boolean, string, boolean, string, () => void, VNode];

type Actions$Props = {
  note: boolean;
  edit: boolean;
  user: UserType | null | undefined;
  view: string | null | undefined;
};

export class Actions extends Component<Actions$Props> {
  shouldComponentUpdate(props: Actions$Props) {
    return (
      this.props.edit !== props.edit ||
      this.props.note !== props.note ||
      this.props.user !== props.user ||
      this.props.view !== props.view
    );
  }

  // eslint-disable-next-line complexity
  render({ note, edit, user, view }: Actions$Props) {
    if (view !== 'notes' && view !== 'settings') {
      return null;
    }

    // prettier-ignore
    const buttons: Action[] = [
      [view === 'notes', 'dark-pink', false, 'Create', onAdd, iconAdd],
      [view === 'notes' && edit && note, 'lavender', false, 'Clone', onClone, iconClone],
      [view === 'notes' && edit && note, 'red', false, 'Remove', onRemove, iconMinus],
      [view === 'notes' && edit, 'green', false, 'Save', onSave, iconOk],
      [view === 'notes' && !edit, 'dark-blue', false, 'Edit', onEdit, iconPen],
      [view === 'notes' && edit, 'blue', false, 'Cancel', onEdit, iconNo],
      [view === 'notes', 'orange', false, 'Refresh', onRefresh, iconRefresh],
      [view === 'settings' && !!user, 'green', !!user && !user._changed, 'Save', onSettingsSave, iconOk],
      [view === 'settings' && !!user, 'red', !!user && !user._changed, 'Cancel', onSettingsReset, iconNo],
    ];

    return (
      <div className="bottom-1 fixed right-1 w2">{buttons.map(button)}</div>
    );
  }
}

function button(props: Action) {
  return !props[0] ? null : (
    <button
      className={buttonClass(props[1], props[2])}
      data-test-notes-action={props[3].toLowerCase()}
      key={props[3]}
      onClick={props[4]}
      tabIndex={0}
      title={props[3]}
    >
      {props[5]}
    </button>
  );
}

function buttonClass(color: string, disabled: boolean) {
  return `b--dark-gray ba bg${disabled ? '-near' : ''}-white br-100 bw1 h2 ${
    disabled ? '' : `hover-${color}`
  } link mb1 pa1${disabled ? '' : ' pointer'} shadow-4`;
}
