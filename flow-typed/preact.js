// @flow

import {Component, createElement, type Node} from 'react';

declare module 'preact' {
  declare module.exports: {
    Component: typeof Component,
    h: typeof createElement,
    render: (vnode: Node, parent: Element, toReplace?: Element) => Element
  };
}

declare module 'preact/debug' {
  declare module.exports: {};
}
