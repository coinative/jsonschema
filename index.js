'use strict';

var _ = require('lodash');
var Validator = require('jsonschema').Validator;
var validator = new Validator();

function isDefined(value) {
  return typeof value !== 'undefined';
}

/**
 * Tightens a schema by:
 *
 *   * Setting `type: 'object'` for instances where `properties` is defined and
 *     `type` is not.
 *   * Setting `type: 'string'` where `pattern` is defined and `type` is not.
 *   * Setting `type: 'string'` where `minLength` or `maxLength` are defined.
 *   * Setting `type: 'string'` where `enum` values are all strings.
 *   * Setting `type: 'array'` where `items` is defined.
 *   * Setting `required: true` for properties where `required` is not defined.
 *   * Setting `additionalProperties: false` where `additionalProperties` is
 *     not defined.
 */
function tighten(schema) {
  if (!isDefined(schema.type)) {
    if (isDefined(schema.properties)) {
      schema.type = 'object';
    }
    if (isDefined(schema.pattern)) {
      schema.type = 'string';
    }
    if (isDefined(schema.minLength) || isDefined(schema.maxLength)) {
      schema.type = 'string';
    }
    if (isDefined(schema.enum)) {
      var allStrings = _(schema.enum).all(function (item) {
        return typeof item === 'string';
      });
      if (allStrings) {
        schema.type = 'string';
      }
    }
    if (isDefined(schema.items)) {
      schema.type = 'array';
    }
  } else {
    if (_.isArray(schema.type)) {
      _.each(schema.type, function (unionType) {
        tighten(unionType);
      });
    }
  }
  if (!isDefined(schema.required)) {
    schema.required = true;
  }
  if (isDefined(schema.properties)) {
    _(schema.properties).each(function (propertySchema) {
      tighten(propertySchema);
    });
    if (!isDefined(schema.additionalProperties)) {
      schema.additionalProperties = false;
    }
  }
  if (isDefined(schema.items)) {
    if (_.isArray(schema.items)) {
      _.each(schema.items, function (item) {
        tighten(item);
      });
      if (!isDefined(schema.additionalItems)) {
        schema.additionalItems = false;
      }
    } else {
      tighten(schema.items);
    }
  }
  return schema;
}

validator.addSchema(tighten({
  type: 'string',
  pattern: /^[0-9a-fA-F]{24}$/
}), '/MongoDB#ObjectID');

/**
 * Validate an instance against a JSON Schema.
 */
function validate(instance, schema, tightenSchema) {
  if (!schema || !_.isObject(schema)) {
    return {
      valid: false,
      errors: [
        'Invalid schema.'
      ]
    };
  }

  if (_.isUndefined(tightenSchema) || tightenSchema) {
    schema = tighten(schema);
  }

  if (!instance || !_.isObject(instance)) {
    return {
      valid: false,
      errors: [
        'Invalid instance.'
      ]
    };
  }
  return validator.validate(instance, schema);
}

exports.validator = validator;
exports.validate = validate;
exports.tighten = tighten;
