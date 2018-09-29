// @flow

import './startup/render';
import './startup/triggers';
import './startup/wysiwyg';

// $FlowFixMe: Untyped import.
if (process.env.NODE_ENV === 'development') require('preact/devtools');
