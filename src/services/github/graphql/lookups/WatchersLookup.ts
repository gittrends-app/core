import { Watcher, WatcherSchema } from '../../../../entities/Watcher';
import { ActorFragment } from '../fragments/ActorFragment';
import { ConnectionDescriptor, ConnectionLookup } from './ConnectionLookup';

/**
 *  A lookup to get repository watchers.
 */
export class WatchersLookup extends ConnectionLookup<Watcher> {
  protected get descriptor(): ConnectionDescriptor {
    return { field: 'watchers', typeCondition: 'Repository' };
  }

  protected entriesSelection(): string {
    return `nodes { ...${this.fragments[0].alias} }`;
  }

  protected mapEntry(entry: any): Watcher {
    return WatcherSchema.parse({
      __typename: 'Watcher',
      user: this.fragments[0].parse(entry),
      repository: this.params.id
    });
  }

  get fragments(): [ActorFragment] {
    return [this.params.factory.create(ActorFragment)];
  }
}
