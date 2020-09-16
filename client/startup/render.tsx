import { h, render } from 'preact';

import { Application } from '../components/Application';

render(
  <Application view="" />,
  document.body,
  document.body.firstChild as Element,
);
