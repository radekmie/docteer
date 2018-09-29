// @flow

export const outline = {
  type: 'object',
  patternProperties: {
    '^[^$_][^.]*$': {
      type: 'string',
      enum: ['div', 'ol', 'ul', 'textarea']
    }
  },
  additionalProperties: false
};
