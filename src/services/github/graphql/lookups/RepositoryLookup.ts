import { Repository } from '../../../../entities/Repository';
import { RepositoryFragment } from '../fragments/RepositoryFragment';
import { QueryLookup } from './Lookup';

/**
 *  A lookup to get a user by ID.
 */
export class RepositoryLookup extends QueryLookup<Repository | null, { byName?: boolean }> {
  toString(): string {
    if (this.params.byName) {
      const [owner, name] = this.params.id.split('/');
      return `${this.alias}:repository(owner: "${owner}", name: "${name}") { ...${this.fragments[0].alias} }`;
    } else {
      return `${this.alias}:node(id: "${this.params.id}") { ...${this.fragments[0].alias} }`;
    }
  }

  parse(data: any) {
    return {
      data: data ? this.fragments[0].parse(data[this.alias] || data) : null,
      params: this.params
    };
  }

  get fragments() {
    return [this.params.factory.create(RepositoryFragment)];
  }
}
