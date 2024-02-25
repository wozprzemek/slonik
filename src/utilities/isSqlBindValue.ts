import { PrimitiveValueExpression } from "../types";

export const isSqlBindValue = (maybe: unknown): maybe is { value: PrimitiveValueExpression } => {
    return (
        typeof maybe === 'object' && 
        maybe !== null && 
        'value' in maybe &&
        typeof maybe.value === 'string'
    );
};
  