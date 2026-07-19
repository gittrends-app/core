import { Actor } from '../entities/Actor';
import { Repository } from '../entities/Repository';
import {
  Iterable,
  SearchParams,
  Service,
  ServiceResource,
  ServiceResourceIterable,
  ServiceResourceParamsFor
} from './Service';

/**
 * A service that passes all requests through to the underlying service.
 */
export class PassThroughService implements Service {
  /**
   * Creates a new PassThroughService.
   * @param service The underlying service.
   */
  constructor(public readonly service: Service) {}

  search(total: number, opts?: SearchParams): Iterable<Repository> {
    return this.service.search(total, opts);
  }

  user(id: string, opts?: { byLogin: boolean }): Promise<Actor | null>;
  user(id: string[], opts?: { byLogin: boolean }): Promise<(Actor | null)[]>;
  user(id: any, opts?: any): Promise<any> {
    return this.service.user(id, opts);
  }

  repository(ownerOrId: string, name?: string): Promise<Repository | null> {
    return this.service.repository(ownerOrId, name);
  }

  resources<R extends ServiceResource>(resource: R, opts: ServiceResourceParamsFor<R>): ServiceResourceIterable<R> {
    return this.service.resources(resource, opts);
  }
}
