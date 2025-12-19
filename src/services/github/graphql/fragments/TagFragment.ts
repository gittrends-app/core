import { Tag, TagSchema } from '../../../../entities/Tag';
import { Tag as GsTag } from '../../graphql-schema';
import { ActorFragment } from './ActorFragment';
import { AbstractFragment, FragmentFactory } from './Fragment';

/**
 *  A fragment to get a tag.
 */
export class TagFragment extends AbstractFragment<Tag> {
  constructor(alias = 'TagFrag', opts: { factory: FragmentFactory }) {
    super(alias, opts);
    this.fragments.push(opts.factory.create(ActorFragment));
  }

  toString(): string {
    return `
      fragment ${this.alias} on Tag {
        __typename
        id
        message
        name
        oid
        repository { id }
        tagger {
          date
          email
          name
          user { ...${this.fragments[0].alias} }
        }
        target { id }
      }
    `;
  }

  parse(data: GsTag): Tag {
    return TagSchema.parse({
      __typename: data.__typename,
      id: data.id,
      message: data.message,
      name: data.name,
      oid: data.oid,
      repository: data.repository.id,
      tagger: data.tagger && {
        ...data.tagger,
        user: data.tagger.user && this.fragments[0].parse(data.tagger.user)
      },
      target: data.target?.id
    });
  }
}
