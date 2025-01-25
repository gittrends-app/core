import { Fragment, FragmentFactory } from '../fragments/Fragment';

/**
 *  The parameters to lookup data from the GitHub API.
 */
export type QueryLookupParams = {
  id: string;
  factory: FragmentFactory;
  alias?: string;
  per_page?: number;
  cursor?: string;
};

/**
 *  A lookup to get data from the GitHub API.
 */
export abstract class QueryLookup<R = any, P = object> {
  readonly alias: string;
  readonly params: QueryLookupParams & P;

  constructor(params: QueryLookupParams & P) {
    this.alias = (params.alias || params.id).replace(/[^a-zA-Z0-9]/g, '');
    this.params = params;
  }

  abstract get fragments(): Fragment[];
  abstract toString(): string;
  abstract parse(data: any): { next?: QueryLookup<R, P>; data: R; params: QueryLookupParams & P };
}
