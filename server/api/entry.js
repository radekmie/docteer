// @flow

import connect from 'connect';
import text from 'body-parser/lib/types/text';

export const server = connect();

server.use(text({type: 'application/json'}));
