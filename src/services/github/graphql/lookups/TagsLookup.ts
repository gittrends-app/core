import { Tag } from '../../../../entities/Tag';
import { CommitFragment } from '../fragments/CommitFragment';
import { TagFragment } from '../fragments/TagFragment';
import { ConnectionDescriptor, ConnectionLookup } from './ConnectionLookup';

/**
 *  A lookup to get repository tags.
 */
export class TagsLookup extends ConnectionLookup<Tag> {
  protected get descriptor(): ConnectionDescriptor {
    return {
      field: 'tags:refs',
      typeCondition: 'Repository',
      args: ['refPrefix: "refs/tags/"'],
      missingDataError: 'Failed to parse tags.'
    };
  }

  protected entriesSelection(): string {
    return `nodes {
            id
            name
            repository { id }
            target {
              __typename
              ...${this.fragments[0].alias}
              ...${this.fragments[1].alias}
            }
          }`;
  }

  protected mapEntry(entry: any): Tag {
    const isTag = entry.target && '__typename' in entry.target && entry.target?.__typename === 'Tag';
    return this.fragments[0].parse({ ...(isTag ? entry.target : entry), __typename: 'Tag' });
  }

  get fragments(): [TagFragment, CommitFragment] {
    return [this.params.factory.create(TagFragment), this.params.factory.create(CommitFragment)];
  }
}
