import { endpoint } from '..';
import * as notes from '../../services/notes';

declare module '../../../types' {
  export interface APIEndpoints {
    'GET /notes': typeof notes.getMine;
    'POST /notes': typeof notes.patchMine;
  }
}

endpoint('GET /notes', notes.getMine, { authorize: true });
endpoint('POST /notes', notes.patchMine, { authorize: true });
