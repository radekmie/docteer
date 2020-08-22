if (process.env.NODE_ENV === 'development') {
  require('preact/debug');
}

require('./startup/render');
require('./startup/triggers');
require('./startup/wysiwyg');
