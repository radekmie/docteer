// @flow

import {h} from 'preact';
import {render} from 'preact';

import {Application} from '@client/components/Application';

// $FlowFixMe: Is body really nullable?
render(h(Application), document.body, document.body.firstChild);

// Manual children reordering to make HMR work.
if (process.env.NODE_ENV === 'development') {
  const application = document.querySelector('[data-application]');
  if (application) {
    const parent = application.parentElement;
    if (parent) {
      parent.removeChild(application);
      parent.insertBefore(application, parent.firstChild);
    }
  }
}
