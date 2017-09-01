// @flow

import {WebAppInternals} from 'meteor/webapp';

export const optimizeOptions = {allowed: ['asset', 'js']};
export const optimize = () => {
  // NOTE: This package requires manifest.json.
  // eslint-disable-next-line no-undef
  if (global.Package['bundle-visualizer'])
    return;

  for (const path in WebAppInternals.staticFiles)
    if (!optimizeOptions.allowed.includes(WebAppInternals.staticFiles[path].type))
      delete WebAppInternals.staticFiles[path];
};
