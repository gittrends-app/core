import type { PageMetadata } from './Service';

export type AdjustPageOptions = {
  hasMore: boolean;
  perPage?: number;
};

/**
 * Build a page result from a single QueryRunner iterator result, enforcing the
 * cursor-only-when-has_more invariant.
 *
 * @param res   A single result from QueryRunner.iterator()
 * @param extra Additional fields to merge into metadata (e.g. { since, until } for commits)
 */
export function toPage<T, Extra extends object = Record<string, never>>(
  res: { data: T[]; next?: unknown; params: { cursor?: string } },
  extra?: Extra
): { data: T[]; metadata: PageMetadata & Extra } {
  const hasMore = !!res.next;
  const { cursor } = res.params;
  return {
    data: res.data,
    metadata: {
      ...(extra as object),
      per_page: res.data.length,
      has_more: hasMore,
      ...(hasMore && cursor ? { cursor } : {})
    } as PageMetadata & Extra
  };
}

/**
 * Rebuild page metadata with an updated has_more flag, enforcing the
 * cursor-only-when-has_more invariant. Used by caching and buffering layers that
 * re-emit upstream metadata with a narrowed continuation signal.
 *
 * @param metadata The upstream metadata to normalise
 * @param options  The continuation state and optional per_page override
 */
export function adjustPage<P extends object = object>(
  metadata: PageMetadata<P>,
  { hasMore, perPage }: AdjustPageOptions
): PageMetadata<P> {
  const { cursor, ...rest } = metadata as Record<string, unknown>;
  return {
    ...rest,
    ...(perPage !== undefined ? { per_page: perPage } : {}),
    has_more: hasMore,
    ...(hasMore && cursor ? { cursor } : {})
  } as PageMetadata<P>;
}
