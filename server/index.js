import '/imports/api/proofs/server';
import '/imports/api/users/server';

if (process.env.NODE_ENV === 'production')
    require('/imports/server/optimize');
