/** @jsx h */

import {h} from 'preact';

import {
    iconAdd,
    iconMinus,
    iconNo,
    iconOk,
    iconPen,
    iconRefresh
} from '/imports/components/Icon';
import {
    onAdd,
    onEdit,
    onRefresh,
    onRemove,
    onSave,
    onSettingsReset,
    onSettingsSave
} from '/imports/state/actions';

export function Actions (props) {
    return (
        <div class="bottom-1 fixed right-1 w2">
            {props.view === 'd' && (
                <div class={button('dark-pink')} key="Create" onClick={onAdd} tabIndex="0" title="Create">
                    {iconAdd}
                </div>
            )}

            {props.view === 'd' && props.edit && props.doc && (
                <div class={button('red')} key="Remove" onClick={onRemove} tabIndex="0" title="Remove">
                    {iconMinus}
                </div>
            )}

            {props.view === 'd' && props.edit && (
                <div class={button('green')} key="Save" onClick={onSave} tabIndex="0" title="Save">
                    {iconOk}
                </div>
            )}

            {props.view === 'd' && !props.edit && (
                <div class={button('dark-blue')} key="Edit" onClick={onEdit} tabIndex="0" title="Edit">
                    {iconPen}
                </div>
            )}

            {props.view === 'd' && props.edit && (
                <div class={button('blue')} key="Cancel" onClick={onEdit} tabIndex="0" title="Cancel">
                    {iconNo}
                </div>
            )}

            {props.view === 'd' && (
                <div class={button('orange')} key="Refresh" onClick={onRefresh} tabIndex="0" title="Refresh">
                    {iconRefresh}
                </div>
            )}

            {props.view === 's' && (
                <div class={button('green', !props.user._changed)} key="Save" onClick={onSettingsSave} tabIndex="0" title="Save">
                    {iconOk}
                </div>
            )}

            {props.view === 's' && (
                <div class={button('red')} key="Cancel" onClick={onSettingsReset} tabIndex="0" title="Cancel">
                    {iconNo}
                </div>
            )}
        </div>
    );
}

function button (color, disabled) {
    return `b--dark-gray ba bg${disabled ? '-near' : ''}-white br-100 bw1 h2 ${disabled ? '' : `hover-${color}`} link mb1 pa1${disabled ? '' : ' pointer'} shadow-4`;
}
