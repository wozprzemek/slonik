import { BindValueExpression, type FragmentSqlToken, type SqlFragment } from '../types';
import { isPrimitiveValueExpression } from '../utilities/isPrimitiveValueExpression';

export const createFragmentSqlFragment = (
  token: FragmentSqlToken,
  bindValues: BindValueExpression[]
): SqlFragment => {
  let sql = '';
  let greatestMatchedParameterPosition = bindValues.length;

  if ('bindValues' in token) {    
    token.bindValues.forEach(tokenBindValue => {
      if (isPrimitiveValueExpression(tokenBindValue)) {
        bindValues.push(tokenBindValue)
      } else if (!bindValues.includes(tokenBindValue)) {
        bindValues.push(tokenBindValue)
      }
    })
  }
  sql += token.sql.replaceAll(/\$(\d+)/gu, (match, g1) => {
    const parameterPosition = Number.parseInt(g1, 10);
    let globalBindValueIndex: number;

    const matchedTokenBindValue = token.bindValues[parameterPosition - 1];
    
    if (isPrimitiveValueExpression(matchedTokenBindValue)) {
      globalBindValueIndex = greatestMatchedParameterPosition + 1;
    } else {
      globalBindValueIndex = bindValues?.indexOf(matchedTokenBindValue) + 1;
    }

    if (globalBindValueIndex > greatestMatchedParameterPosition) {
      greatestMatchedParameterPosition = globalBindValueIndex;
    }
    return '$' + String(globalBindValueIndex);
  });

  return {
    sql,
    values: token.values,
  };
};
