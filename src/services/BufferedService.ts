import { Repository } from '../entities/Repository';
import { PassThroughService } from './PassThroughService';
import { adjustPage } from './pagination';
import {
  Iterable,
  SearchParams,
  ServiceResource,
  ServiceResourceIterable,
  ServiceResourceMap,
  ServiceResourceParamsFor
} from './Service';

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
              metadata: adjustPage(lastMetadata, { hasMore, perPage: totalPerPage })
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
            metadata: adjustPage(lastMetadata, { hasMore: false, perPage: totalPerPage })
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
  resources<R extends ServiceResource>(resource: R, opts: ServiceResourceParamsFor<R>): ServiceResourceIterable<R> {
    const { service, bufferSize } = this;

    return {
      async *[Symbol.asyncIterator]() {
        const iterator = service.resources(resource, opts)[Symbol.asyncIterator]();
        let buffer: ServiceResourceMap[R][] = [];
        let lastMetadata: any = null;
        let totalPerPage = 0;
        let bufferedIterations = 0;

        for await (const { data, metadata } of { [Symbol.asyncIterator]: () => iterator }) {
          buffer.push(...data);
          lastMetadata = metadata;
          totalPerPage += data.length;
          bufferedIterations++;
          const hasMore = metadata.has_more && !!metadata.cursor;

          // Check if we've accumulated enough iterations or if there are no more results
          if (bufferedIterations >= bufferSize || !hasMore) {
            yield {
              data: buffer,
              metadata: adjustPage(lastMetadata, { hasMore, perPage: totalPerPage })
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
            metadata: adjustPage(lastMetadata, { hasMore: false, perPage: totalPerPage })
          };
        }
      }
    } as ServiceResourceIterable<R>;
  }
}
