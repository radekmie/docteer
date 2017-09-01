// @flow
// @jsx h

import {h} from 'preact';

export const iconAdd     = icon('M12 5v14m-7-7h14');
export const iconMinus   = icon('M5 12h14');
export const iconNo      = icon('M18 6L6 18M6 6l12 12');
export const iconLock    = icon('M3 13q0-2 2-2h14q2 0 2 2v7q0 2-2 2H5q-2 0-2-2v-7m4-2V7a5 5 0 0 1 10 0v4');
export const iconOk      = icon('M20 6L9 17l-5-5');
export const iconPen     = icon('M16 3l5 5L8 21H3v-5L16 3z');
export const iconRefresh = icon('M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15');
export const iconUser    = icon('M8,7a4,4 0 1,0 8,0a4,4 0 1,0 -8,0M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2');

function icon (d) {
  return (
    <svg class="icon" viewBox="0 0 24 24">
      <path d={d} />
    </svg>
  );
}
