// @flow

import {WebAppInternals} from 'meteor/webapp';

export const optimizeOptions = {allowed: ['asset', 'js']};
export const optimize = () => {
  // NOTE: This package requires manifest.json.
  // eslint-disable-next-line no-undef
  if (global.Package['bundle-visualizer']) return;

  const staticFiles = WebAppInternals.staticFiles;

  for (const path in staticFiles) {
    if (!optimizeOptions.allowed.includes(staticFiles[path].type))
      delete staticFiles[path];
  }
};
