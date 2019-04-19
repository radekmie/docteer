// @flow

import {createElement} from 'react';
import {Component} from 'react';

import type {Node} from 'react';

declare module 'preact' {
  declare module.exports: {
    Component: typeof Component,
    h: typeof createElement,
    render: (vnode: Node, parent: Element, toReplace?: Element) => Element
  };
}
