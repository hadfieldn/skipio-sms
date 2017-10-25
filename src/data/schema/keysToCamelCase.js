import _ from 'lodash';

function keysToCamelCase(object) {
  let camelCaseObject = _.cloneDeep(object);

  if (_.isArray(camelCaseObject)) {
    return _.map(camelCaseObject, keysToCamelCase);
  } else if (_.isPlainObject(camelCaseObject)) {
    camelCaseObject = _.mapKeys(camelCaseObject, (value, key) => {
      return _.camelCase(key);
    });

    // Recursively apply throughout object
    return _.mapValues(camelCaseObject, value => {
      if (_.isPlainObject(value)) {
        return keysToCamelCase(value);
      } else if (_.isArray(value)) {
        return _.map(value, keysToCamelCase);
      } else {
        return value;
      }
    });
  } else {
    return object;
  }
}

export default keysToCamelCase;
