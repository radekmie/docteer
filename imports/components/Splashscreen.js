/** @jsx h */

import {h} from 'preact';

export function Splashscreen (props) {
    return (
        <div class={['fl pt3 tc', props.class].filter(Boolean).join(' ')}>
            Some description should be placed here!
        </div>
    );
}
