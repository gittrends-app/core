import cloneDeepWith from 'lodash/cloneDeepWith.js';
import isPlainObject from 'lodash/isPlainObject.js';
import mapValues from 'lodash/mapValues.js';
import omitBy from 'lodash/omitBy.js';
import { PartialDeep } from 'type-fest';
import { z, ZodType } from 'zod';

const defaultRemotionCriteria = (v: any) =>
  v === null ||
  v === undefined ||
  (Array.isArray(v) && v.length === 0) ||
  (isPlainObject(v) && Object.keys(v).length === 0);

/**
 * Function to sanitize data by removing null values, empty objects and empty arrays.
 */
export default function sanitize<T extends object>(
  data: T,
  criteria: (v: any) => boolean = defaultRemotionCriteria,
  applyOnArrays = false
): PartialDeep<T> {
  return cloneDeepWith(data, (value) => {
    if (isPlainObject(value)) {
      return mapValues(
        omitBy(value, (v) => criteria(v)),
        (v) => sanitize(v, criteria, applyOnArrays)
      );
    } else if (Array.isArray(value) && applyOnArrays) {
      return value.filter((v) => criteria(v) === false).map((v) => sanitize(v, criteria, applyOnArrays));
    } else {
      return undefined;
    }
  });
}

/**
 * Zod preprocessor to sanitize data by removing null values, empty objects and empty arrays.
 */
export function zodSanitize<Z extends ZodType>(schema: Z) {
  return z.preprocess<Z>((data: any) => sanitize(data), schema);
}
