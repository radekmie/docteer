import { text } from 'body-parser';
import connect from 'connect';

export const server = connect();

server.use(text({ type: 'application/json' }));
