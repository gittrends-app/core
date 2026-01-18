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

    if (bufferSize < 1) {
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
        const iterator = service.search(total, opts)[Symbol.asyncIterator]();
        let buffer: Repository[] = [];
        let lastMetadata: any = null;
        let totalPerPage = 0;

        for await (const { data, metadata } of { [Symbol.asyncIterator]: () => iterator }) {
          buffer.push(...data);
          lastMetadata = metadata;
          totalPerPage += metadata.per_page || data.length;

          // Check if we've accumulated enough iterations or if there are no more results
          const bufferCount = buffer.length / (metadata.per_page || 1);
          if (bufferCount >= bufferSize || !metadata.has_more) {
            yield {
              data: buffer,
              metadata: {
                ...lastMetadata,
                per_page: totalPerPage,
                has_more: metadata.has_more
              }
            };

            // Reset buffer for next batch
            buffer = [];
            totalPerPage = 0;

            // If no more results, stop iterating
            if (!metadata.has_more) {
              break;
            }
          }
        }

        // Yield any remaining buffered items (partial buffer)
        if (buffer.length > 0) {
          yield {
            data: buffer,
            metadata: {
              ...lastMetadata,
              per_page: totalPerPage,
              has_more: lastMetadata?.has_more || false
            }
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

        for await (const { data, metadata } of { [Symbol.asyncIterator]: () => iterator }) {
          buffer.push(...(data as T[]));
          lastMetadata = metadata;
          totalPerPage += metadata.per_page || data.length;

          // Check if we've accumulated enough iterations or if there are no more results
          const bufferCount = buffer.length / (metadata.per_page || 1);
          if (bufferCount >= bufferSize || !metadata.has_more) {
            yield {
              data: buffer,
              metadata: {
                ...lastMetadata,
                per_page: totalPerPage,
                has_more: metadata.has_more
              }
            };

            // Reset buffer for next batch
            buffer = [];
            totalPerPage = 0;

            // If no more results, stop iterating
            if (!metadata.has_more) {
              break;
            }
          }
        }

        // Yield any remaining buffered items (partial buffer)
        if (buffer.length > 0) {
          yield {
            data: buffer,
            metadata: {
              ...lastMetadata,
              per_page: totalPerPage,
              has_more: lastMetadata?.has_more || false
            }
          };
        }
      }
    } as Iterable<T, P>;
  }
}
