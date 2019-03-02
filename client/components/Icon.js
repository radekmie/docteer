// @flow
// @jsx h

import {h} from 'preact';

export const iconAdd = icon('M12 5v14m-7-7h14', 1);
export const iconClone = icon(
  'M9.7 11.3v7.2a1.6 1.6 0 0 0 1.6 1.6h7.2a1.6 1.6 0 0 0 1.6-1.6v-7.2a1.6 1.6 0 0 0-1.6-1.6h-7.2a1.6 1.6 0 0 0-1.6 1.6zm-3.2 3.2h-.8a1.6 1.6 0 0 1-1.6-1.6V5.7a1.6 1.6 0 0 1 1.6-1.6h7.2a1.6 1.6 0 0 1 1.6 1.6v.8',
  1
);
export const iconCog = icon(
  'M9,12a3,3 0 1,0 6,0a3,3 0 1,0 -6,0M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'
);
export const iconLock = icon(
  'M3 13q0-2 2-2h14q2 0 2 2v7q0 2-2 2H5q-2 0-2-2v-7m4-2V7a5 5 0 0 1 10 0v4',
  2
);
export const iconLogIn = icon(
  'M14 22h5a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-5M11 16l4-4-4-4m4 4H3'
);
export const iconLogOut = icon(
  'M10 22H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h5m7 14l4-4-4-4m4 4H9'
);
export const iconMinus = icon('M5 12h14', 1);
export const iconNo = icon('M18 6L6 18M6 6l12 12', 1);
export const iconNote = icon(
  'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6m-4 5H8m8 4H8m2-8H8'
);
export const iconOk = icon('M20 6L9 17l-5-5', 1);
export const iconPen = icon('M16 3l5 5L8 21H3v-5L16 3z', 1);
export const iconRefresh = icon(
  'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  1
);
export const iconSearch = icon(
  'M3 10.5a7.5 7.5 0 1 0 15 0 7.5 7.5 0 1 0-15 0zM21 21l-5.2-5.2',
  1
);
export const iconUser = icon(
  'M8,7a4,4 0 1,0 8,0a4,4 0 1,0 -8,0M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
  2
);

function icon(d, type) {
  return (
    <svg
      class={`icon${['', ' small', ' wide'][type || 0]}`}
      viewBox="0 0 24 24"
    >
      <path d={d} />
    </svg>
  );
}
