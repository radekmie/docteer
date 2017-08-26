/** @jsx h */

import {h} from 'preact';

import {
    onAdd,
    onBack,
    onEdit,
    onRefresh,
    onRemove,
    onSave,
    onSaveSettings
} from '/imports/state/actions';

/* eslint-disable max-len */
const iconAdd     = icon('M12 5v14m-7-7h14');
const iconMinus   = icon('M5 12h14');
const iconNo      = icon('M18 6L6 18M6 6l12 12');
const iconOk      = icon('M20 6L9 17l-5-5');
const iconPen     = icon('M16 3l5 5L8 21H3v-5L16 3z');
const iconRefresh = icon('M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15');
/* eslint-enable max-len */

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
                <div class={button('green')} key="Save" onClick={onSaveSettings} tabIndex="0" title="Save">
                    {iconOk}
                </div>
            )}

            {props.view === 's' && (
                <div class={button('red')} key="Cancel" onClick={onBack} tabIndex="0" title="Cancel">
                    {iconNo}
                </div>
            )}
        </div>
    );
}

function button (color) {
    return `b--dark-gray ba bg-white br-100 bw1 h2 hover-${color} link mb1 pointer shadow-4`;
}

function icon (d) {
    return (
        <svg class="ma1" viewBox="0 0 24 24">
            <path d={d} />
        </svg>
    );
}
