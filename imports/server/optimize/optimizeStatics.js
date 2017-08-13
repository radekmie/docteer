import {WebAppInternals} from 'meteor/webapp';

export function optimize () {
    const js = 'js';

    for (const path in WebAppInternals.staticFiles) {
        if (js !== WebAppInternals.staticFiles[path].type) {
            delete WebAppInternals.staticFiles[path];
        }
    }
}
