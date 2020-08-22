export const password = {
  type: 'object',
  properties: {
    algorithm: {
      type: 'string',
      const: 'sha-256',
    },
    digest: {
      type: 'string',
    },
  },
  required: ['algorithm', 'digest'],
  additionalProperties: false,
};
