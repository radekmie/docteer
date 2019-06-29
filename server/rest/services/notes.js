// @flow

import * as notes from '@server/services/notes';
import {endpoint} from '@server/rest';

endpoint('GET', '/notes', notes.getMine, {authorize: true});
endpoint('POST', '/notes', notes.patchMine, {authorize: true});
