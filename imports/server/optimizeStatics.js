import {WebAppInternals} from 'meteor/webapp';

export function optimize () {
  // NOTE: This package requires manifest.json.
  // eslint-disable-next-line no-undef
  if (Package['bundle-visualizer'])
    return;

  for (const path in WebAppInternals.staticFiles)
    if (WebAppInternals.staticFiles[path].type !== 'js')
      delete WebAppInternals.staticFiles[path];
}
