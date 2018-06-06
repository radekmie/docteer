// @flow

import cssnext from 'postcss-cssnext';
import cssnano from 'cssnano';
import postcss from 'postcss';

import {cache} from '../../imports/lib';

const processor = postcss([
  cssnext({browsers: ['>1%']}),
  cssnano({preset: ['advanced', {discardComments: {removeAll: true}}]})
]);

export const optimize = cache(
  (css: string) =>
    processor
      .process(css, {from: undefined})
      .then()
      .await().css
);
