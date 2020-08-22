import * as notes from '../../services/notes';
import { endpoint } from './..';

endpoint('GET', '/notes', notes.getMine, { authorize: true });
endpoint('POST', '/notes', notes.patchMine, { authorize: true });
