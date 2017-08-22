/** @jsx h */

import {Component, h} from 'preact';

import {onSearch} from '/imports/state/actions';

class Doc extends Component {
    render (props) {
        const active = props.doc._id === props.docId;

        return (
            <a
                class={`${active ? 'bg-near-white bl bw2 b--dark-gray ' : ''}db ${color(props.doc)} hover-bg-near-white link ph2${active ? ' pl1' : ''} truncate`}
                dangerouslySetInnerHTML={{__html: props.doc.name || '(untitled)'}}
                href={[`/${active ? '' : props.doc._id}`, props.filter].filter(Boolean).join('')}
            />
        );
    }
}

export class Docs extends Component {
    onSearch = event => {
        onSearch(event.target.value);
    };

    render (props) {
        return (
            <div class="b--dark-gray br bw1 fl flex flex-column h-100 mv0 w-30">
                <div class="b--dark-gray bb bw1">
                    <label class="flex" htmlFor="search" title="Search">
                        <input class="bg-near-white bw0 flex-auto pa2" id="search" name="search" placeholder="Search..." onInput={this.onSearch} type="search" value={props.search} />
                    </label>
                </div>

                {props.docs.length ? (
                    <div class="flex-auto ma0 overflow-auto">
                        {props.docs.map(doc =>
                            <Doc docId={props.docId} filter={props.filter} key={doc._id} doc={doc} />
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
}

function color (doc) {
    return doc._created
        ? doc._removed
            ? 'gray hover-light-gray'
            : 'green hover-light-green'
        : doc._removed
            ? 'hover-light-red red'
            : doc._updated
                ? 'blue hover-light-blue'
                : 'dark-gray'
    ;
}
