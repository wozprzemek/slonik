import { InvalidInputError } from '../errors';
import {
  BindValueExpression,
  type PrimitiveValueExpression,
  type SqlFragment,
  type UnnestSqlToken,
} from '../types';
import { countArrayDimensions } from '../utilities/countArrayDimensions';
import { escapeIdentifier } from '../utilities/escapeIdentifier';
import { isPrimitiveValueExpression } from '../utilities/isPrimitiveValueExpression';
import { stripArrayNotation } from '../utilities/stripArrayNotation';

export const createUnnestSqlFragment = (
  token: UnnestSqlToken,
  bindValues: BindValueExpression[],
): SqlFragment => {
  const { columnTypes } = token;

  const values: PrimitiveValueExpression[] = [];

  const unnestBindings: PrimitiveValueExpression[][] = [];
  const unnestSqlTokens: string[] = [];

  let columnIndex = 0;

  let placeholderIndex = bindValues.length;

  while (columnIndex < columnTypes.length) {
    const typeMember = columnTypes[columnIndex];

    let columnType = columnTypes[columnIndex];
    let columnTypeIsIdentifier;

    if (typeof typeMember === 'string') {
      columnType = typeMember;
      columnTypeIsIdentifier = false;
    } else if (Array.isArray(typeMember)) {
      columnType = typeMember
        .map((identifierName) => {
          if (typeof identifierName !== 'string') {
            throw new InvalidInputError(
              'sql.unnest column identifier name array member type must be a string (type name identifier) or a SQL token.',
            );
          }

          return escapeIdentifier(identifierName);
        })
        .join('.');
      columnTypeIsIdentifier = true;
    } else {
      columnType = typeMember.sql;
      columnTypeIsIdentifier = true;
    }

    unnestSqlTokens.push(
      '$' +
        String(++placeholderIndex) +
        '::' +
        (columnTypeIsIdentifier
          ? stripArrayNotation(columnType)
          : escapeIdentifier(stripArrayNotation(columnType))) +
        '[]'.repeat(countArrayDimensions(columnType) + 1),
    );

    unnestBindings[columnIndex] = [];

    columnIndex++;
  }

  let lastTupleSize;

  for (const tupleValues of token.tuples) {
    if (
      typeof lastTupleSize === 'number' &&
      lastTupleSize !== tupleValues.length
    ) {
      throw new Error(
        'Each tuple in a list of tuples must have an equal number of members.',
      );
    }

    if (tupleValues.length !== columnTypes.length) {
      throw new Error('Column types length must match tuple member length.');
    }

    lastTupleSize = tupleValues.length;

    let tupleColumnIndex = 0;

    for (const tupleValue of tupleValues) {
      if (
        !Array.isArray(tupleValue) &&
        !isPrimitiveValueExpression(tupleValue) &&
        !Buffer.isBuffer(tupleValue)
      ) {
        throw new InvalidInputError(
          'Invalid unnest tuple member type. Must be a primitive value expression.',
        );
      }

      const tupleBindings = unnestBindings[tupleColumnIndex++];

      if (!tupleBindings) {
        throw new Error('test');
      }

      tupleBindings.push(tupleValue);
    }
  }

  values.push(...unnestBindings);
  bindValues.push(...values)
  const sql = 'unnest(' + unnestSqlTokens.join(', ') + ')';

  return {
    sql,
    values,
  };
};
