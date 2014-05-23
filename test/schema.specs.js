/*jshint expr: true*/
/*global describe, it, beforeEach */
'use strict';
var schema = require('../index');

describe('schema', function () {
  describe('validate', function () {
    var testSchema;
    beforeEach(function () {
      testSchema = schema.tighten({
        properties: {
          prop1: { minLength: 5 },
          prop2: { enum: ['a', 'b'] },
          prop3: { $ref: '/MongoDB#ObjectID' },
          prop4: {
            properties: {
              prop1: { type: 'number' },
              prop2: {
                items: { type: 'number' }
              }
            }
          }
        }
      });
    });

    it('valid examples', function () {
      schema.validate({
        prop1: 'abcde',
        prop2: 'b',
        prop3: '123456789012345678901234',
        prop4: {
          prop1: 123,
          prop2: [1, 2, 3]
        }
      }, testSchema).valid.should.be.true;

      schema.validate({
        prop1: 'abcdeabcdeabcdeabcde',
        prop2: 'a',
        prop3: 'FFFFFFFFFFFFFFFFFFFFFFFF',
        prop4: {
          prop1: 1900,
          prop2: []
        }
      }, testSchema).valid.should.be.true;
    });

    it('invalid examples', function () {
      schema.validate({
        prop1: 'abc',
        prop2: 'a',
        prop3: '123456789012345678901234',
        prop4: {
          prop1: 123,
          prop2: [1, 2, 3]
        }
      }, testSchema).valid.should.be.false;
      schema.validate({
        prop1: 'abcde',
        prop2: 'c',
        prop3: '123456789012345678901234',
        prop4: {
          prop1: 123,
          prop2: [1, 2, 3]
        }
      }, testSchema).valid.should.be.false;
      schema.validate({
        prop1: 'abcde',
        prop2: 'b',
        prop3: '12345678901234567890123X',
        prop4: {
          prop1: 123,
          prop2: [1, 2, 3]
        }
      }, testSchema).valid.should.be.false;
      schema.validate({
        prop1: 'abcde',
        prop2: 'b',
        prop3: '12345678901234567890123X',
        prop4: {
          prop1: '123',
          prop2: [1, 2, 3]
        }
      }, testSchema).valid.should.be.false;
      schema.validate({
        prop1: 'abcde',
        prop2: 'b',
        prop3: '12345678901234567890123X',
        prop4: {
          prop1: 123,
          prop2: ['ahhh']
        }
      }, testSchema).valid.should.be.false;
      schema.validate({
        prop1: 'abcde',
        prop2: 'b',
        prop3: '12345678901234567890123X',
        prop4: {
          prop1: 123,
          prop2: ['ahhh'],
          prop3: 'foo'
        }
      }, testSchema).valid.should.be.false;
    });
  });

  describe('tighten', function () {
    it('should set type: \'object\' where not appropriate', function () {
      schema.tighten({
        properties: {
          foo: { type: 'string' }
        }
      }).type.should.equal('object');
    });

    it('should set type: \'string\' where pattern defined', function () {
      schema.tighten({
        pattern: /abc/
      }).type.should.equal('string');
    });

    it('should set type: \'string\' where enum string values', function () {
      schema.tighten({
        enum: ['a', 'b']
      }).type.should.equal('string');
    });

    it('should set type: \'string\' where minLength or maxLength', function () {
      schema.tighten({
        minLength: 5
      }).type.should.equal('string');
      schema.tighten({
        maxLength: 5
      }).type.should.equal('string');
    });

    it('should set type: \'array\' where items', function () {
      schema.tighten({
        items: { type: 'string' }
      }).type.should.equal('array');
    });

    it('should set required: true where not defined', function () {
      schema.tighten({
        pattern: /abc/
      }).required.should.be.true;
    });

    it('should set additionalProperties: false where not defined', function () {
      schema.tighten({
        properties: {
          foo: { type: 'string' }
        }
      }).additionalProperties.should.be.false;
    });

    it('should tighten union types', function () {
      schema.tighten({
        type: [
          { enum: ['test'] },
          { type: 'number' }
        ]
      }).should.eql({
        type: [
          { type: 'string', enum: ['test'], required: true },
          { type: 'number', required: true }
        ],
        required: true
      });
    });

    it('should tighten positional array schemas', function () {
      schema.tighten({
        items: [{ type: 'number' }, { type: 'object' }]
      }).should.eql({
        type: 'array',
        items: [{ type: 'number', required: true }, { type: 'object', required: true }],
        additionalItems: false,
        required: true
      });
    });

    it('complete example', function () {
      var testSchema = {
        properties: {
          prop1: { pattern: /abc/ },
          prop2: { type: 'number', required: false },
          prop3: {
            properties: {
              prop1: { pattern: /123/ },
              prop2: { enum: ['a', 'b'] },
              prop3: { minLength: 10 }
            }
          },
          prop4: {
            items: { minLength: 1 }
          }
        },
        additionalProperties: true
      };
      var expected = {
        type:  'object',
        properties: {
          prop1: { type: 'string', pattern: /abc/, required: true },
          prop2: { type: 'number', required: false },
          prop3: {
            type: 'object',
            properties: {
              prop1: { type: 'string', pattern: /123/, required: true },
              prop2: { type: 'string', enum: ['a', 'b'], required: true },
              prop3: { type: 'string', minLength: 10, required: true }
            },
            additionalProperties: false,
            required: true
          },
          prop4: {
            type: 'array',
            required: true,
            items: { type: 'string', minLength: 1, required: true }
          }
        },
        additionalProperties: true,
        required: true
      };
      schema.tighten(testSchema).should.eql(expected);
    });
  });
});
