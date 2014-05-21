# @coinative/jsonschema

Implicit schema support (tightened) for [jsonschema](https://github.com/tdegrunt/jsonschema)

## Install

Not currently hosted on npmjs.org. Take this module as a git dependency via:

```
npm install coinative/jsonschema
```
## Usage

```js
var jsonschema = require('jsonschema');
var result = jsonschema.validate(jsonObject, schema); // { name: 'dan' }, { properties: { name: { type: 'string' }}}

// result.errors;
// result.isValid;

```
## Schema Examples

### Objects

```js
var schema = {
  // type: object is not required - properties attribute implies object.
  // required: true is not required - implied by definition.
  // additionalProperties: false is not required - implied by definition.
  properties: {
    name: { type: 'string' }
  }
}
```
### Strings

```js
var patternSchema = {
  // type: string is not required - pattern attribute implies string.
  // required: true is not required - implied by definition.
  pattern: /abc/
}

var enumSchema = {
  // type: string is not required - enum attribute implies string.
  // required: true is not required - implied by definition.
  enum: ['a','b','c']
}

var minMaxLengthSchema = {
  // type: string is not required - minLength OR maxLength implies string.
  // required: true is not required - implied by definition.
  minLength: 2,
  maxLength: 5
}

```
### Arrays
```js
var arraySchema = {
  toys: {
    // type: array is not required - items property implies array.
    // required: true is not required - implied by definition.
    items: {
      type: 'string'
    }
  }
}

```

## Tests
```
npm test
```


## License

MIT
