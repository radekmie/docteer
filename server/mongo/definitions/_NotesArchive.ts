// @flow

export const NotesArchive = {
  name: 'notes-archive',
  indexes: [],
  schema: {
    bsonType: 'object',
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId'
      },
      _id_user: {
        bsonType: ['objectId', 'string']
      },
      _id_slug: {
        bsonType: 'string'
      },
      _created: {
        bsonType: 'date'
      },
      _removed: {
        bsonType: 'date'
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
        bsonType: 'array',
        items: {
          bsonType: 'object',
          additionalProperties: false,
          properties: {
            name: {
              bsonType: 'string',
              pattern: '^[^$_][^.]*$'
            },
            type: {
              bsonType: 'string',
              enum: ['div', 'ol', 'textarea', 'ul']
            }
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
              bsonType: 'array',
              items: {
                bsonType: 'object',
                additionalProperties: false,
                properties: {
                  name: {
                    bsonType: 'string',
                    pattern: '^[^$_][^.]*$'
                  },
                  type: {
                    bsonType: 'string',
                    enum: ['div', 'ol', 'textarea', 'ul']
                  }
                }
              }
            }
          },
          required: ['_updated', '_objects']
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
