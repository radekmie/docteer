/** @jsx h */

import {h} from 'preact';

export function Logo (props) {
    return (
        <svg class={['dark-gray logo', props.class].filter(Boolean).join(' ').split(' ').sort().join(' ')} viewBox="0 0 32 32">
            <path d="M7 21v2h1v-2zm10 0v2h1v-2" />
            <path d="M9 21v2h1v-2zm16 0v2h1v-2" />
            <path d="M11 21v2h1v-2zm10 0v2h1v-2" />
            <path d="M13 21v2h1v-2zm6 0v2h1v-2" />
            <path d="M15 21v2h1v-2zm8 0v2h1v-2" />
            <path d="M27 20H6v2H5v-5h1v2h21v-2h1v5h-1v-2zm-1-2v-8l-6-7H9C7 3 7 4 7 5v13h1V5c0-1 0-1 1-1h10v5c0 1 1 2 2 2h4v7z" />
        </svg>
    );
}
