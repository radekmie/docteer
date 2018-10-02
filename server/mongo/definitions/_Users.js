// @flow

export const Users = {
  name: 'users',
  indexes: [
    [
      {'emails.address': 1},
      {collation: {locale: 'en', strength: 2}, unique: true}
    ]
  ],
  schema: {
    bsonType: 'object',
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId'
      },
      createdAt: {
        bsonType: 'date'
      },
      services: {
        bsonType: 'object',
        additionalProperties: false,
        properties: {
          password: {
            bsonType: 'object',
            additionalProperties: false,
            properties: {
              bcrypt: {
                bsonType: 'string'
              }
            },
            required: ['bcrypt']
          }
        },
        required: ['password']
      },
      emails: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          additionalProperties: false,
          properties: {
            address: {
              bsonType: 'string'
            }
          },
          required: ['address']
        }
      },
      schemas: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          additionalProperties: false,
          properties: {
            name: {
              bsonType: 'string'
            },
            fields: {
              bsonType: 'object',
              additionalProperties: false,
              patternProperties: {
                '^[^$_][^.]*$': {
                  bsonType: 'string',
                  enum: ['div', 'ol', 'textarea', 'ul']
                }
              }
            }
          },
          required: ['name', 'fields']
        }
      }
    },
    required: ['_id', 'createdAt', 'services', 'emails', 'schemas']
  }
};
