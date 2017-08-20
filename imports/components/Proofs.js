/** @jsx h */

import {Component, h} from 'preact';

import {onSearch} from '/imports/state/actions';

class Proof extends Component {
    render (props) {
        return (
            <a
                class={`db ${color(props.proof)} link ph2 truncate`}
                dangerouslySetInnerHTML={{__html: props.proof.name || '(untitled)'}}
                href={[`/${props.proof._id}`, props.filter].filter(Boolean).join('')}
            />
        );
    }
}

export class Proofs extends Component {
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

                {props.proofs.length ? (
                    <div class="flex-auto ma0 overflow-auto pv1">
                        {props.proofs.map(proof =>
                            <Proof filter={props.filter} key={proof._id} proof={proof} />
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

function color (proof) {
    return proof._created
        ? proof._removed
            ? 'gray hover-light-gray'
            : 'green hover-light-green'
        : proof._removed
            ? 'hover-light-red red'
            : proof._updated
                ? 'blue hover-light-blue'
                : 'dark-gray hover-gray'
    ;
}
