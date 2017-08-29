import {WebAppInternals} from 'meteor/webapp';

export function optimize () {
  // NOTE: This package requires manifest.json.
  // eslint-disable-next-line no-undef
  if (Package['bundle-visualizer']) {
    return;
  }

  const js = 'js';

  for (const path in WebAppInternals.staticFiles) {
    if (js !== WebAppInternals.staticFiles[path].type) {
      delete WebAppInternals.staticFiles[path];
    }
  }
}
