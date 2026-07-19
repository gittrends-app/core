import { QueryLookup, QueryLookupParams } from './Lookup';

/**
 *  Declarative description of a GitHub GraphQL connection selection.
 */
export type ConnectionDescriptor = {
  /** Connection field selection, e.g. `issues` or `tags:refs`. */
  field: string;
  /** GraphQL type condition the node is cast to, e.g. `Repository`. */
  typeCondition: string;
  /** Extra connection arguments, e.g. `orderBy: { field: UPDATED_AT direction: ASC }`. */
  args?: string[];
  /** Error message thrown when the connection is missing from the response. When omitted, no guard is applied. */
  missingDataError?: string;
};

/**
 *  Base lookup for paginated GitHub GraphQL connections.
 *
 *  Owns pagination argument assembly, `pageInfo` cursor threading, and construction of the
 *  continuation lookup. Subclasses declare a {@link ConnectionDescriptor} and how to select
 *  and map connection nodes.
 */
export abstract class ConnectionLookup<T, P = object> extends QueryLookup<T[], P> {
  /** The connection being selected. */
  protected abstract get descriptor(): ConnectionDescriptor;

  /** GraphQL selection for the connection entries (inside the connection braces, after `pageInfo`). */
  protected abstract entriesSelection(): string;

  /** Maps one connection entry (node or edge) to a parsed entity. */
  protected abstract mapEntry(entry: any): T;

  /** Extracts the raw entries array from the connection. Defaults to `nodes`. */
  protected extractEntries(connection: any): any[] {
    return connection.nodes || [];
  }

  /** Resolves the connection object from the aliased response payload. */
  protected extractConnection(data: any): any {
    const fieldAlias = this.descriptor.field.split(':')[0];
    return (data[this.alias] || data)[fieldAlias];
  }

  /** Additional resume metadata derived from the parsed page, reported on the returned `params` only. */
  protected nextParams(_parsed: T[]): Partial<QueryLookupParams & P> {
    return {};
  }

  toString(): string {
    const { field, typeCondition, args } = this.descriptor;
    const params = [`first: ${this.params.per_page || 100}`, ...(args || [])];
    if (this.params.cursor) params.push(`after: "${this.params.cursor}"`);

    return `
    ${this.alias}:node(id: "${this.params.id}") {
      ... on ${typeCondition} {
        ${field}(${params.join(', ')}) {
          pageInfo { hasNextPage endCursor }
          ${this.entriesSelection()}
        }
      }
    }
    `;
  }

  parse(data: any): { next?: QueryLookup<T[], P>; data: T[]; params: QueryLookupParams & P } {
    const connection = this.extractConnection(data);
    if (!connection && this.descriptor.missingDataError) {
      throw Object.assign(new Error(this.descriptor.missingDataError), { data, query: this.toString() });
    }

    const parsed = this.extractEntries(connection).map((entry) => this.mapEntry(entry));
    const cursor = connection.pageInfo.endCursor || this.params.cursor;
    const Ctor = this.constructor as new (params: QueryLookupParams & P) => this;

    return {
      next: connection.pageInfo.hasNextPage ? new Ctor({ ...this.params, cursor }) : undefined,
      data: parsed,
      params: { ...this.params, cursor, ...this.nextParams(parsed) }
    };
  }
}
