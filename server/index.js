import '/imports/api/proofs/server';
import '/imports/api/users/server';
import '/imports/server/graphql';

if (process.env.NODE_ENV === 'production') {
    require('/imports/server/optimize');
}
