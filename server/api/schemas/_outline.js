// @flow

export const outline = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    properties: {
      name: {
        type: 'string',
        pattern: '^[^$_][^.]*$'
      },
      type: {
        type: 'string',
        enum: ['div', 'ol', 'textarea', 'ul']
      }
    }
  }
};
