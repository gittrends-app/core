/**
 * Get non-nullable fields from a type
 */
export type NonNullableFields<T> = Pick<T, { [K in keyof T]: T[K] extends NonNullable<T[K]> ? K : never }[keyof T]>;

/**
 *  Get nullable fields from a type
 */
export type NullableFields<T> = Pick<
  T,
  { [K in keyof T]: undefined extends T[K] ? K : T[K] extends null ? K : never }[keyof T]
>;

/**
 *  Booleanify a type
 */
export type Booleanify<T> = Partial<Record<keyof T, boolean | 0 | 1>>;
