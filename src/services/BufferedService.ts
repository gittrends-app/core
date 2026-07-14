import { Commit } from '../entities/Commit';
import { Discussion } from '../entities/Discussion';
import { Issue } from '../entities/Issue';
import { PullRequest } from '../entities/PullRequest';
import { Release } from '../entities/Release';
import { Repository } from '../entities/Repository';
import { Stargazer } from '../entities/Stargazer';
import { Tag } from '../entities/Tag';
import { Watcher } from '../entities/Watcher';
import { PassThroughService } from './PassThroughService';
import { Iterable, SearchParams, ServiceCommitsParams, ServiceResourceParams } from './Service';

/**
 * A service decorator that buffers multiple iterations before yielding results to the caller.
 * This improves efficiency by reducing the number of yield operations while maintaining
 * the Service interface contract.
 *
 * The buffer is applied only to methods that return iterables (search, resources).
 * Non-iterator methods (user, repository) are passed through unchanged.
 */
export class BufferedService extends PassThroughService {
  /** The number of iterations to buffer before yielding. */
  private readonly bufferSize: number = 1;

  /**
   * Creates a new BufferedService.
   * @param service The underlying service to wrap.
   * @param bufferSize The number of iterations to buffer before yielding.
   */
  constructor(service: PassThroughService['service'], bufferSize: number) {
    super(service);

    if (!Number.isInteger(bufferSize) || bufferSize < 1) {
      throw new Error('Buffer size must be at least 1');
    }

    this.bufferSize = bufferSize;
  }

  /**
   * Searches for repositories with buffered iteration.
   * @param total The total number of repositories to search for.
   * @param opts The search options.
   * @returns An iterable of repositories with buffered results.
   */
  search(total: number, opts?: SearchParams): Iterable<Repository> {
    const { service, bufferSize } = this;

    return {
      async *[Symbol.asyncIterator]() {
        if (total <= 0) return;

        const iterator = service.search(total, opts)[Symbol.asyncIterator]();
        let buffer: Repository[] = [];
        let lastMetadata: any = null;
        let totalPerPage = 0;
        let bufferedIterations = 0;
        let remaining = total;

        for await (const { data: pageData, metadata } of { [Symbol.asyncIterator]: () => iterator }) {
          const data = pageData.slice(0, remaining);
          buffer.push(...data);
          lastMetadata = metadata;
          totalPerPage += data.length;
          remaining -= data.length;
          bufferedIterations++;
          const hasMore = remaining > 0 && metadata.has_more;

          // Check if we've accumulated enough iterations or if there are no more results
          if (bufferedIterations >= bufferSize || !hasMore) {
            yield {
              data: buffer,
              metadata: bufferedMetadata(lastMetadata, totalPerPage, hasMore)
            };

            // Reset buffer for next batch
            buffer = [];
            totalPerPage = 0;
            bufferedIterations = 0;

            // If no more results, stop iterating
            if (!hasMore) {
              break;
            }
          }
        }

        // Yield any remaining buffered items (partial buffer)
        if (buffer.length > 0) {
          yield {
            data: buffer,
            metadata: bufferedMetadata(lastMetadata, totalPerPage, false)
          };
        }
      }
    };
  }

  /**
   * Fetches resources from a repository with buffered iteration.
   * @param resource The resource to fetch.
   * @param opts The fetch options.
   * @returns An iterable of the resource with buffered results.
   */
  resources(resource: 'commits', opts: ServiceCommitsParams): Iterable<Commit, { since?: Date; until?: Date }>;
  resources(resource: 'discussions', opts: ServiceResourceParams): Iterable<Discussion>;
  resources(resource: 'issues', opts: ServiceResourceParams): Iterable<Issue>;
  resources(resource: 'pull_requests', opts: ServiceResourceParams): Iterable<PullRequest>;
  resources(resource: 'releases', opts: ServiceResourceParams): Iterable<Release>;
  resources(resource: 'stargazers', opts: ServiceResourceParams): Iterable<Stargazer>;
  resources(resource: 'tags', opts: ServiceResourceParams): Iterable<Tag>;
  resources(resource: 'watchers', opts: ServiceResourceParams): Iterable<Watcher>;
  resources<T, P extends object = object>(resource: any, opts: any): Iterable<T, P> {
    const { service, bufferSize } = this;

    return {
      async *[Symbol.asyncIterator]() {
        const iterator = service.resources(resource, opts)[Symbol.asyncIterator]();
        let buffer: T[] = [];
        let lastMetadata: any = null;
        let totalPerPage = 0;
        let bufferedIterations = 0;

        for await (const { data, metadata } of { [Symbol.asyncIterator]: () => iterator }) {
          buffer.push(...(data as T[]));
          lastMetadata = metadata;
          totalPerPage += data.length;
          bufferedIterations++;
          const hasMore = metadata.has_more && !!metadata.cursor;

          // Check if we've accumulated enough iterations or if there are no more results
          if (bufferedIterations >= bufferSize || !hasMore) {
            yield {
              data: buffer,
              metadata: bufferedMetadata(lastMetadata, totalPerPage, hasMore)
            };

            // Reset buffer for next batch
            buffer = [];
            totalPerPage = 0;
            bufferedIterations = 0;

            // If no more results, stop iterating
            if (!hasMore) {
              break;
            }
          }
        }

        // Yield any remaining buffered items (partial buffer)
        if (buffer.length > 0) {
          yield {
            data: buffer,
            metadata: bufferedMetadata(lastMetadata, totalPerPage, false)
          };
        }
      }
    } as Iterable<T, P>;
  }
}

function bufferedMetadata(metadata: any, perPage: number, hasMore: boolean) {
  const { cursor, ...rest } = metadata || {};
  return {
    ...rest,
    per_page: perPage,
    has_more: hasMore,
    ...(hasMore && cursor ? { cursor } : {})
  };
}
