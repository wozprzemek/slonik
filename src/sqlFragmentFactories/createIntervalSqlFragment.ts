import { z } from 'zod';
import { InvalidInputError } from '../errors';
import { BindValueExpression, type IntervalSqlToken, type SqlFragment } from '../types';
import { isPrimitiveValueExpression } from '../utilities/isPrimitiveValueExpression';

const IntervalInput = z
  .object({
    days: z.number().optional(),
    hours: z.number().optional(),
    minutes: z.number().optional(),
    months: z.number().optional(),
    seconds: z.number().optional(),
    weeks: z.number().optional(),
    years: z.number().optional(),
  })
  .strict();

const intervalFragments = [
  'years',
  'months',
  'weeks',
  'days',
  'hours',
  'minutes',
  'seconds',
];

const tokenMap = {
  minutes: 'mins',
  seconds: 'secs',
};

export const createIntervalSqlFragment = (
  token: IntervalSqlToken,
  bindValues: BindValueExpression[],
): SqlFragment => {
  let intervalInput;

  try {
    intervalInput = IntervalInput.parse(token.interval);
  } catch {
    throw new InvalidInputError(
      'Interval input must not contain unknown properties.',
    );
  }

  const values: number[] = [];

  const intervalTokens: string[] = [];

  for (const intervalFragment of intervalFragments) {
    const value = intervalInput[intervalFragment];

    if (value !== undefined) {
      values.push(value);

      const mappedToken = tokenMap[intervalFragment] ?? intervalFragment;
      if (isPrimitiveValueExpression(value)) {
        bindValues.push(value)
      } else if (!bindValues.includes(value)) {
        bindValues.push(value)
      }
      
      intervalTokens.push(
        mappedToken +
          ' => $' +
          String(bindValues.length),
      );

    }
  }

  return {
    sql: 'make_interval(' + intervalTokens.join(', ') + ')',
    values,
  };
};
