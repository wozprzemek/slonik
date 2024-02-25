import { InvalidInputError } from '../errors';
import { createPrimitiveValueExpressions } from '../factories/createPrimitiveValueExpressions';
import { createSqlTokenSqlFragment } from '../factories/createSqlTokenSqlFragment';
import {
  BindValueExpression,
  type ListSqlToken,
  type PrimitiveValueExpression,
  type SqlFragment,
} from '../types';
import { isPrimitiveValueExpression } from '../utilities/isPrimitiveValueExpression';
import { isSqlBindValue } from '../utilities/isSqlBindValue';
import { isSqlToken } from '../utilities/isSqlToken';

export const createListSqlFragment = (
  token: ListSqlToken,
  bindValues: BindValueExpression[],
): SqlFragment => {
  const values: PrimitiveValueExpression[] = [];
  const placeholders: Array<PrimitiveValueExpression | null> = [];

  if (token.members.length === 0) {
    throw new InvalidInputError('Value list must have at least 1 member.');
  }

  for (const member of token.members) {
    if (isSqlToken(member)) {
      const sqlFragment = createSqlTokenSqlFragment(member, bindValues.length, bindValues);
      
      placeholders.push(sqlFragment.sql);
      values.push(...sqlFragment.values);
    } else if (isPrimitiveValueExpression(member)) {
      bindValues.push(member);
      placeholders.push('$' + String(bindValues.length));
      values.push(member);
    } else if (isSqlBindValue(member)) {
      if (!bindValues.includes(member)) {
        bindValues.push(member)
      }
      const globalBindValueIndex = bindValues?.indexOf(member);
      placeholders.push('$' + String(globalBindValueIndex+1));
      values.push(member.value);
    } else {
      throw new InvalidInputError(
        'Invalid list member type. Must be a SQL token or a primitive value expression.',
      );
    }
  }

  return {
    sql: placeholders.join(token.glue.sql),
    values: createPrimitiveValueExpressions(values),
  };
};
