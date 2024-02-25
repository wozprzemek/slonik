import { InvalidInputError, UnexpectedStateError } from '../errors';
import { createSqlTokenSqlFragment } from '../factories/createSqlTokenSqlFragment';
import { BindValueExpression, type ArraySqlToken, type SqlFragment } from '../types';
import { escapeIdentifier } from '../utilities/escapeIdentifier';
import { isPrimitiveValueExpression } from '../utilities/isPrimitiveValueExpression';
import { isSqlBindValue } from '../utilities/isSqlBindValue';
import { isSqlToken } from '../utilities/isSqlToken';

export const createArraySqlFragment = (
  token: ArraySqlToken,
  bindValues: BindValueExpression[],
): SqlFragment => {
  for (const value of token.values) {
    if (token.memberType === 'bytea') {
      if (Buffer.isBuffer(value)) {
        continue;
      } else {
        throw new InvalidInputError(
          'Invalid array member type. Non-buffer value bound to bytea type.',
        );
      }
    }

    if (isSqlBindValue(value)) {
      continue;
    } else if (!isPrimitiveValueExpression(value)) {
      throw new InvalidInputError(
        'Invalid array member type. Must be a primitive value expression.',
      );
    }
  }

  const values = [token.values];

  if ('bindValues' in token) {
    const arrayBindValues: BindValueExpression[] = [];
    token.bindValues.forEach(tokenBindValue => {
      arrayBindValues.push(tokenBindValue)
    })

    bindValues.push(arrayBindValues);
  }
  let sql = '$' + String(bindValues.length) + '::';

  if (
    isSqlToken(token.memberType) &&
    token.memberType.type === 'SLONIK_TOKEN_FRAGMENT'
  ) {
    const sqlFragment = createSqlTokenSqlFragment(
      token.memberType,
      bindValues.length,
      bindValues
    );

    if (sqlFragment.values.length > 0) {
      throw new UnexpectedStateError(
        'Type is not expected to have a value binding.',
      );
    }

    sql += sqlFragment.sql;
  } else if (typeof token.memberType === 'string') {
    sql += escapeIdentifier(token.memberType) + '[]';
  } else {
    throw new InvalidInputError(
      'Unsupported `memberType`. `memberType` must be a string or SqlToken of "SLONIK_TOKEN_FRAGMENT" type.',
    );
  }

  return {
    sql,
    values,
  };
};
