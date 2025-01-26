import { Actor } from '../../../../entities/Actor';
import { ActorFragment } from '../fragments/ActorFragment';
import { QueryLookup } from './Lookup';

/**
 *  A lookup to get a user by ID.
 */
export class UserLookup extends QueryLookup<Actor | null, { byLogin?: boolean }> {
  constructor(params: ConstructorParameters<typeof QueryLookup>[0] & { byLogin?: boolean }) {
    super({ ...params, alias: params.id === '' ? 'me' : params.alias });
  }

  toString(): string {
    // If the ID is empty, return the viewer.
    if (this.params.id === '') return `${this.alias}:viewer { ...${this.fragments[0].alias} }`;

    return this.params.byLogin
      ? `${this.alias}:repositoryOwner(login: "${this.params.id}") { ...${this.fragments[0].alias} }`
      : `${this.alias}:node(id: "${this.params.id}") { ...${this.fragments[0].alias} }`;
  }

  parse(data: any) {
    return {
      data: data && this.fragments[0].parse(data[this.alias] || data),
      params: this.params
    };
  }

  get fragments(): [ActorFragment] {
    return [this.params.factory.create(ActorFragment)];
  }
}
