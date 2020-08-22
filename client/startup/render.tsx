import { h, render } from 'preact';

import { Application } from '../components/Application';
render(<Application />, document.body, document.body.firstChild as Element);

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
