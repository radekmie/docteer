// @flow

export const Notes = {
  name: 'notes',
  indexes: [
    [{_id_user: 1, _id_slug: 1}, {unique: true}],
    [{_id_user: 1, _updated: 1}],
    [{_removed: 1}]
  ],
  schema: {
    bsonType: 'object',
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId'
      },
      _id_user: {
        bsonType: 'objectId'
      },
      _id_slug: {
        bsonType: 'string'
      },
      _created: {
        bsonType: 'date'
      },
      _removed: {
        bsonType: 'null'
      },
      _updated: {
        bsonType: 'date'
      },
      _objects: {
        bsonType: 'object',
        additionalProperties: false,
        patternProperties: {
          '^[^$_][^.]*$': {
            bsonType: ['array', 'string'],
            items: {
              bsonType: 'string'
            }
          }
        }
      },
      _outname: {
        bsonType: 'string'
      },
      _outline: {
        bsonType: 'object',
        additionalProperties: false,
        patternProperties: {
          '^[^$_][^.]*$': {
            bsonType: 'string',
            enum: ['div', 'ol', 'textarea', 'ul']
          }
        }
      },
      _version: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          additionalProperties: false,
          properties: {
            _updated: {
              bsonType: 'date'
            },
            _objects: {
              bsonType: 'object',
              additionalProperties: false,
              patternProperties: {
                '^[^$_][^.]*$': {
                  bsonType: ['array', 'string'],
                  items: {
                    bsonType: 'string'
                  }
                }
              }
            },
            _outname: {
              bsonType: 'string'
            },
            _outline: {
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
          required: ['_updated', '_outname']
        }
      }
    },
    required: [
      '_id',
      '_id_user',
      '_id_slug',
      '_created',
      '_removed',
      '_updated',
      '_objects',
      '_outname',
      '_outline',
      '_version'
    ]
  }
};
