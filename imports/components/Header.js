/** @jsx h */

import {h} from 'preact';

import {Logo} from './Logo';

export function Header (props) {
    return (
        <header class="b--dark-gray bb bw1">
            <a class="dark-gray flex link pt1" href={`#/${props.user ? 'd' : ''}`}>
                <Logo class={`${props.pend ? '' : 'freeze '}h3 w3`} />

                <h1 class="f4">
                    DocTear
                </h1>
            </a>
        </header>
    );
}