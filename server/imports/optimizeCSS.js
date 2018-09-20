// @flow

import cssnano from 'cssnano';
import env from 'postcss-preset-env';
import postcss from 'postcss';

import {cache} from '../../imports/lib';

const processor = postcss([
  env({browsers: ['>1%'], preserve: false, stage: 0}),
  cssnano({preset: ['advanced', {discardComments: {removeAll: true}}]})
]);

export const optimize = cache(
  (css: string) =>
    processor
      .process(css, {from: undefined})
      .then()
      .await().css
);
