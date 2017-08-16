/** @jsx h */

import {Component, h} from 'preact';

export class Logo extends Component {
    render (props) {
        return (
            <svg viewBox="0 0 32 32" {...props}>
                <path d="M7 21v4h1v-4zm10 0v4h1v-4" />
                <path d="M9 21v3h1v-3zm16 0v3h1v-3" />
                <path d="M11 21v6h1v-6zm10 0v6h1v-6" />
                <path d="M13 21v2h1v-2zm6 0v2h1v-2" />
                <path d="M15 21v5h1v-5zm8 0v5h1v-5" />
                <path d="M27 20H6v2H5v-5h1v2h21v-2h1v5h-1v-2zm-1-2v-8l-6-7H9C7 3 7 4 7 5v13h1V5c0-1 0-1 1-1h10v5c0 1 1 2 2 2h4v7z" />
            </svg>
        );
    }
}
