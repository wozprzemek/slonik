import { InvalidInputError } from '../errors';
import { BindValueExpression, type BinarySqlToken, type SqlFragment } from '../types';

export const createBinarySqlFragment = (
  token: BinarySqlToken,
  bindValues: BindValueExpression[],
): SqlFragment => {
  if (!Buffer.isBuffer(token.data)) {
    throw new InvalidInputError('Binary value must be a buffer.');
  }
  bindValues.push(token.data);

  return {
    sql: '$' + String(bindValues.length),
    values: [token.data],
  };
};
