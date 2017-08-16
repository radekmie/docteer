/** @jsx h */

import {Component, h} from 'preact';

export class Splashscreen extends Component {
    render (props) {
        return (
            <div class={['fl pt3 tc', props.class].filter(Boolean).join(' ')}>
                Some description should be placed here!
            </div>
        );
    }
}
