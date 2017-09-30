// @flow

import shrinkRay from 'shrink-ray';

import {WebApp} from 'meteor/webapp';

const compression = {handle: shrinkRay(), route: ''};

WebApp.connectHandlers.stack.splice(1, 1);
WebApp.connectHandlers.stack.unshift(compression);
WebApp.rawConnectHandlers.stack.unshift(compression);
