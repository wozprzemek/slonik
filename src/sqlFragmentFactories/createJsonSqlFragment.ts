import { InvalidInputError } from '../errors';
import { Logger } from '../Logger';
import {
  BindValueExpression,
  type JsonBinarySqlToken,
  type JsonSqlToken,
  type SqlFragment,
} from '../types';
import { isPlainObject } from '../utilities/isPlainObject';
import { safeStringify } from '../utilities/safeStringify';
import { serializeError } from 'serialize-error';

const log = Logger.child({
  namespace: 'createJsonSqlFragment',
});

export const createJsonSqlFragment = (
  token: JsonBinarySqlToken | JsonSqlToken,
  bindValues: BindValueExpression[],
  binary: boolean,
): SqlFragment => {
  let value;

  if (token.value === undefined) {
    throw new InvalidInputError('JSON payload must not be undefined.');
  } else if (token.value === null) {
    value = 'null';

    // @todo Deep check Array.
  } else if (
    !isPlainObject(token.value) &&
    !Array.isArray(token.value) &&
    !['number', 'string', 'boolean'].includes(typeof token.value)
  ) {
    throw new InvalidInputError(
      'JSON payload must be a primitive value or a plain object.',
    );
  } else {
    try {
      value = safeStringify(token.value);
      bindValues.push(value);
    } catch (error) {
      log.error(
        {
          error: serializeError(error),
        },
        'payload cannot be stringified',
      );

      throw new InvalidInputError('JSON payload cannot be stringified.');
    }

    if (value === undefined) {
      throw new InvalidInputError(
        'JSON payload cannot be stringified. The resulting value is undefined.',
      );
    }
  }

  return {
    sql:
      '$' +
      String(bindValues.length) +
      '::' +
      (binary ? 'jsonb' : 'json'),
    values: [value],
  };
};
