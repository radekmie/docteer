/** @jsx h */

import {h} from 'preact';

import {
    onAdd,
    onEdit,
    onRefresh,
    onRemove,
    onSave,
    onSaveSettings
} from '/imports/state/actions';

/* eslint-disable max-len */
const iconAdd     = icon(512,  'M417.4 224H288V94.6c0-16.9-14.3-30.6-32-30.6s-32 13.7-32 30.6V224H94.6C77.7 224 64 238.3 64 256s13.7 32 30.6 32H224v129.4c0 16.9 14.3 30.6 32 30.6s32-13.7 32-30.6V288h129.4c16.9 0 30.6-14.3 30.6-32s-13.7-32-30.6-32z');
const iconMinus   = icon(512,  'M417.4 224H94.6C77.7 224 64 238.3 64 256s13.7 32 30.6 32h322.8c16.9 0 30.6-14.3 30.6-32s-13.7-32-30.6-32z');
const iconNo      = icon(512,  'M443.6 387.1L312.4 255.4l131.5-130c5.4-5.4 5.4-14.2 0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4-3.7 0-7.2 1.5-9.8 4L256 197.8 124.9 68.3c-2.6-2.6-6.1-4-9.8-4-3.7 0-7.2 1.5-9.8 4L68 105.9c-5.4 5.4-5.4 14.2 0 19.6l131.5 130L68.4 387.1c-2.6 2.6-4.1 6.1-4.1 9.8 0 3.7 1.4 7.2 4.1 9.8l37.4 37.6c2.7 2.7 6.2 4.1 9.8 4.1 3.5 0 7.1-1.3 9.8-4.1L256 313.1l130.7 131.1c2.7 2.7 6.2 4.1 9.8 4.1 3.5 0 7.1-1.3 9.8-4.1l37.4-37.6c2.6-2.6 4.1-6.1 4.1-9.8-.1-3.6-1.6-7.1-4.2-9.7z');
const iconOk      = icon(512,  'M448 71.9c-17.3-13.4-41.5-9.3-54.1 9.1L214 344.2l-99.1-107.3c-14.6-16.6-39.1-17.4-54.7-1.8-15.6 15.5-16.4 41.6-1.7 58.1 0 0 120.4 133.6 137.7 147 17.3 13.4 41.5 9.3 54.1-9.1l206.3-301.7c12.6-18.5 8.7-44.2-8.6-57.5z');
const iconPen     = icon(128,  'M36.108 110.473l70.436-70.436-18.581-18.58-70.437 70.436c-.378.302-.671.716-.803 1.22l-5.476 20.803c-.01.04-.01.082-.019.121-.018.082-.029.162-.039.247-.007.075-.009.147-.009.222-.001.077.001.147.009.225.01.084.021.166.039.246.008.04.008.082.019.121.007.029.021.055.031.083.023.078.053.154.086.23.029.067.057.134.09.196.037.066.077.127.121.189.041.063.083.126.13.184.047.059.1.109.152.162.053.054.105.105.163.152.056.048.119.09.182.131.063.043.124.084.192.12.062.033.128.062.195.09.076.033.151.063.23.087.028.009.054.023.083.031.04.01.081.01.121.02.081.017.162.028.246.037.077.009.148.011.224.01.075 0 .147-.001.223-.008.084-.011.166-.022.247-.039.04-.01.082-.01.121-.02l20.804-5.475c.505-.132.92-.425 1.22-.805zm-16.457-2.124c-.535-.535-1.267-.746-1.964-.649l3.183-12.094 11.526 11.525-12.096 3.182c.098-.697-.112-1.429-.649-1.964zm90.051-71.47l-18.58-18.581 7.117-7.117s12.656 4.514 18.58 18.582l-7.117 7.116z');
const iconRefresh = icon(1792, 'M1639 1056q0 5-1 7-64 268-268 434.5T892 1664q-146 0-282.5-55T366 1452l-129 129q-19 19-45 19t-45-19-19-45v-448q0-26 19-45t45-19h448q26 0 45 19t19 45-19 45l-137 137q71 66 161 102t187 36q134 0 250-65t186-179q11-17 53-117 8-23 30-23h192q13 0 22.5 9.5t9.5 22.5zm25-800v448q0 26-19 45t-45 19h-448q-26 0-45-19t-19-45 19-45l138-138q-148-137-349-137-134 0-250 65T460 628q-11 17-53 117-8 23-30 23H178q-13 0-22.5-9.5T146 736v-7q65-268 270-434.5T896 128q146 0 284 55.5T1425 340l130-129q19-19 45-19t45 19 19 45z');
/* eslint-enable max-len */

export function Actions (props) {
    return (
        <div class="bottom-1 fixed right-1">
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
        </div>
    );
}

function button (color) {
    return `b--dark-gray ba bg-white br-100 bw1 h2 hover-${color} link mb1 pointer shadow-4 tc w2`;
}

function icon (size, d) {
    return (
        <svg class="ma1" viewBox={`0 0 ${size} ${size}`}>
            <path d={d} />
        </svg>
    );
}
