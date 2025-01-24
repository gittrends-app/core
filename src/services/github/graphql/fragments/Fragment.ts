import { Class } from 'type-fest';
import { Booleanify, NullableFields } from '../../../../helpers/types.js';

/**
 *  Fragment interface
 */
export interface Fragment<R = any> {
  readonly alias: string;
  readonly fragments: Fragment[];
  toString(): string;
  parse(data: any): R;
}

/**
 * Abstract fragment
 */
export abstract class AbstractFragment<R = any> implements Fragment<R> {
  readonly fragments: Fragment[] = [];

  constructor(
    readonly alias: string,
    protected opts?: { factory?: FragmentFactory }
  ) {}

  abstract toString(): string;
  abstract parse(data: any): R;
}

/**
 * Custom fragment
 */
export abstract class CustomizableFragment<R = any> extends AbstractFragment<R> {
  constructor(
    readonly alias: string,
    protected readonly opts?: { factory?: FragmentFactory; fields?: boolean | Booleanify<NullableFields<R>> }
  ) {
    super(alias, opts);
  }

  public includes(field: string, query: string): string {
    return this.opts?.fields === true ||
      (typeof this.opts?.fields === 'object' && (this.opts?.fields as Record<string, any>)[field])
      ? query
      : '';
  }
}

/**
 *  Partial fragment factory
 */
export interface FragmentFactory {
  create<T extends Fragment>(Ref: Class<T>): T;
}

/**
 * Base fragment factory
 */
export class BaseFragmentFactory implements FragmentFactory {
  constructor(protected full = false) {}

  create<T extends Fragment>(Ref: Class<T>): T {
    return new Ref(Ref.name, { factory: this, fields: this.full });
  }
}
