import { Tag, TagSchema } from '../../../../entities/Tag';
import { Tag as GsTag } from '../../graphql-schema';
import { ActorFragment } from './ActorFragment';
import { DeclarativeFragment, FragmentFactory, FragmentField } from './Fragment';

/**
 *  A fragment to get a tag.
 */
export class TagFragment extends DeclarativeFragment<GsTag, Tag> {
  protected readonly fieldMap: readonly FragmentField<GsTag>[] = [];

  constructor(alias = 'TagFrag', opts: { factory: FragmentFactory }) {
    super(alias, opts);
    this.fragments.push(opts.factory.create(ActorFragment));
    this.fieldMap = [
      { key: '__typename', selection: '__typename', value: (data) => data.__typename },
      { key: 'id', selection: 'id', value: (data) => data.id },
      { key: 'message', selection: 'message', value: (data) => data.message },
      { key: 'name', selection: 'name', value: (data) => data.name },
      { key: 'oid', selection: 'oid', value: (data) => data.oid },
      { key: 'repository', selection: 'repository { id }', value: (data) => data.repository.id },
      {
        key: 'tagger',
        selection: (fragment) => `tagger {
          date
          email
          name
          user { ...${fragment.fragments[0].alias} }
        }`,
        value: (data, fragment) =>
          data.tagger && {
            ...data.tagger,
            user: data.tagger.user && fragment.fragments[0].parse(data.tagger.user)
          }
      },
      { key: 'target', selection: 'target { id }', value: (data) => data.target?.id }
    ];
  }

  toString(): string {
    return `
      fragment ${this.alias} on Tag {
        ${this.selection()}
      }
    `;
  }

  parse(data: GsTag): Tag {
    return TagSchema.parse(this.values(data));
  }
}
