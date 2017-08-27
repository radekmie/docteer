/** @jsx h */

import {h} from 'preact';

import {onSearch} from '/imports/state/actions';

function Doc (props) {
    const doc = props.doc;
    const color = doc._created
        ? doc._removed
            ? 'gray hover-light-gray'
            : 'green hover-light-green'
        : doc._removed
            ? 'hover-light-red red'
            : doc._updated
                ? 'blue hover-light-blue'
                : 'dark-gray'
    ;

    return (
        <a
            class={`${doc._active ? 'bg-near-white bl bw2 b--dark-gray ' : ''}db ${color} hover-bg-near-white link ph2${doc._active ? ' pl1' : ''} truncate`}
            dangerouslySetInnerHTML={{__html: doc.name || '(untitled)'}}
            href={doc._href}
        />
    );
}

export function Docs (props) {
    return (
        <div class="b--dark-gray br bw1 column flex flex-1 flex-column h-100">
            <div class="b--dark-gray bb bw1">
                <label class="flex" for="search" title="Search">
                    <input class="bg-near-white bw0 flex-1 pa2" id="search" name="search" placeholder="Search..." onInput={onSearch} type="search" value={props.search} />
                </label>
            </div>

            {props.docs.length ? (
                <div class="flex-1 ma0 overflow-auto">
                    {props.docs.map(doc =>
                        <Doc doc={doc} key={doc._id} />
                    )}
                </div>
            ) : (
                <div class="pa3 tc">
                    {`(no test cases${props.search ? ' found' : ''})`}
                </div>
            )}
        </div>
    );
}
