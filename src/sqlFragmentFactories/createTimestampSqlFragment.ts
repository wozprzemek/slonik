import { InvalidInputError } from '../errors';
import { BindValueExpression, type SqlFragment, type TimestampSqlToken } from '../types';

export const createTimestampSqlFragment = (
  token: TimestampSqlToken,
  bindValues: BindValueExpression[],
): SqlFragment => {
  if (!(token.date instanceof Date)) {
    throw new InvalidInputError(
      'Timestamp parameter value must be an instance of Date.',
    );
  }
  
  const timestampValue = String(token.date.getTime() / 1_000);

  bindValues.push(timestampValue);

  return {
    sql: 'to_timestamp($' + String(bindValues.length) + ')',
    values: [String(token.date.getTime() / 1_000)],
  };
};
