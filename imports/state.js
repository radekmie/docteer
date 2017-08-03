import Baobab        from 'baobab';
import createHistory from 'history/createBrowserHistory';

export const history = window._history = createHistory();
export const tree = window._tree = new Baobab({
    groups: [],
    labels: [],
    proofs: [],

    proofsFilter: [],
    proofsFiltered: Baobab.monkey(
        ['proofs'],
        ['proofsFilter'],
        (proofs, filter) => filter.length
            ? proofs.filter(proof => filter.every(filter => proof.labels.some(label => label._id === filter)))
            : proofs
    )
});

const filterToSearch = filter => filter.length ? `?filter=${filter.join(',')}` : '';
const searchToFilter = search => search ? search.replace(/^\?filter=/, '').split(',') : [];

tree.select('proofsFilter').on('update', event => {
    const search = filterToSearch(event.data.currentData);

    if (history.location.search === search)
        return;

    history.push({pathname: history.location.pathname, search});
});

history.listen(location => tree.set('proofsFilter', searchToFilter(location.search)));
