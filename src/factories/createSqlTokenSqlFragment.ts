import { UnexpectedStateError } from '../errors';
import { createArraySqlFragment } from '../sqlFragmentFactories/createArraySqlFragment';
import { createBinarySqlFragment } from '../sqlFragmentFactories/createBinarySqlFragment';
import { createDateSqlFragment } from '../sqlFragmentFactories/createDateSqlFragment';
import { createFragmentSqlFragment } from '../sqlFragmentFactories/createFragmentSqlFragment';
import { createIdentifierSqlFragment } from '../sqlFragmentFactories/createIdentifierSqlFragment';
import { createIntervalSqlFragment } from '../sqlFragmentFactories/createIntervalSqlFragment';
import { createJsonSqlFragment } from '../sqlFragmentFactories/createJsonSqlFragment';
import { createListSqlFragment } from '../sqlFragmentFactories/createListSqlFragment';
import { createQuerySqlFragment } from '../sqlFragmentFactories/createQuerySqlFragment';
import { createTimestampSqlFragment } from '../sqlFragmentFactories/createTimestampSqlFragment';
import { createUnnestSqlFragment } from '../sqlFragmentFactories/createUnnestSqlFragment';
import {
  ArrayToken,
  BinaryToken,
  DateToken,
  FragmentToken,
  IdentifierToken,
  IntervalToken,
  JsonBinaryToken,
  JsonToken,
  ListToken,
  QueryToken,
  TimestampToken,
  UnnestToken
} from '../tokens';
import { BindValueExpression, type SqlFragment, type SqlToken as SqlTokenType } from '../types';

export const createSqlTokenSqlFragment = (
  token: SqlTokenType,
  greatestParameterPosition: number,
  bindValues?: BindValueExpression[],
): SqlFragment => {
  if (token.type === ArrayToken) {
    return createArraySqlFragment(token, bindValues!);
  } else if (token.type === BinaryToken) {
    return createBinarySqlFragment(token, bindValues!);
  } else if (token.type === DateToken) {
    return createDateSqlFragment(token, bindValues!);
  } else if (token.type === FragmentToken) {
    return createFragmentSqlFragment(token, bindValues!);
  } else if (token.type === IdentifierToken) {
    return createIdentifierSqlFragment(token);
  } else if (token.type === IntervalToken) {
    return createIntervalSqlFragment(token, bindValues!);
  } else if (token.type === JsonBinaryToken) {
    return createJsonSqlFragment(token, bindValues!, true);
  } else if (token.type === JsonToken) {
    return createJsonSqlFragment(token, bindValues!, false);
  } else if (token.type === ListToken) {
    return createListSqlFragment(token, bindValues!);
  } else if (token.type === QueryToken) {
    return createQuerySqlFragment(token, bindValues!);
  } else if (token.type === TimestampToken) {
    return createTimestampSqlFragment(token, bindValues!);
  } else if (token.type === UnnestToken) {
    return createUnnestSqlFragment(token, bindValues!);
  }

  throw new UnexpectedStateError('Unexpected token type.');
};
