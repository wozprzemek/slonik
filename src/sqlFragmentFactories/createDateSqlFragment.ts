import { InvalidInputError } from '../errors';
import { BindValueExpression, type DateSqlToken, type SqlFragment } from '../types';

export const createDateSqlFragment = (
  token: DateSqlToken,
  bindValues: BindValueExpression[],
): SqlFragment => {
  if (!(token.date instanceof Date)) {
    throw new InvalidInputError(
      'Date parameter value must be an instance of Date.',
    );
  }

  const dateValue = token.date.toISOString().slice(0, 10);
  bindValues.push(dateValue);

  return {
    sql: '$' + String(bindValues.length) + '::date',
    values: [dateValue],
  };
};
