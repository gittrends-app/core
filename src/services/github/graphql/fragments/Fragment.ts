import { Class } from 'type-fest';
import { Booleanify, NullableFields } from '../../../../helpers/types';

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
 * A GraphQL field and its corresponding entity value.
 */
export type FragmentField<T> = {
  readonly key: string;
  readonly selection: string | ((fragment: Fragment) => string);
  readonly value: (data: T, fragment: Fragment) => unknown;
  readonly additional?: readonly {
    readonly key: string;
    readonly value: (data: T, fragment: Fragment) => unknown;
  }[];
  /**
   * Optional predicate deciding whether the field is selected and mapped.
   * When it returns false, the field contributes neither selection nor value.
   */
  readonly include?: (fragment: Fragment) => boolean;
};

/**
 * Fragment implementation that keeps field selection and entity mapping together.
 */
export abstract class DeclarativeFragment<T, R = any> extends AbstractFragment<R> {
  protected abstract readonly fieldMap: readonly FragmentField<T>[];

  private included(field: FragmentField<T>): boolean {
    return field.include ? field.include(this) : true;
  }

  protected selection(): string {
    return this.fieldMap
      .filter((field) => this.included(field))
      .map(({ selection }) => (typeof selection === 'function' ? selection(this) : selection))
      .join('\n');
  }

  protected values(data: T): Record<string, unknown> {
    return Object.fromEntries(
      this.fieldMap
        .filter((field) => this.included(field))
        .flatMap(({ key, value, additional }) => [
          [key, value(data, this)],
          ...(additional || []).map(({ key: additionalKey, value: additionalValue }) => [
            additionalKey,
            additionalValue(data, this)
          ])
        ])
    );
  }
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
