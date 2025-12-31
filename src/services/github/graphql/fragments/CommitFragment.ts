import { Commit, CommitSchema } from '../../../../entities/Commit';
import { Commit as GsCommit } from '../../graphql-schema';
import { ActorFragment } from './ActorFragment';
import { AbstractFragment, Fragment, FragmentFactory } from './Fragment';

/**
 *  A fragment to get a commit.
 */
export class CommitFragment extends AbstractFragment<Commit> {
  readonly fragments: Fragment[] = [];

  constructor(alias = 'CommitFrag', opts: { factory: FragmentFactory }) {
    super(alias, opts);
    this.fragments.push(opts.factory.create(ActorFragment));
  }

  toString(): string {
    return `
      fragment ${this.alias} on Commit {
        __typename
        additions
        author {
          date
          email
          name
          user { ...${this.fragments[0].alias} }
        }
        authoredByCommitter
        authoredDate
        changedFilesIfAvailable
        comments { totalCount }
        committedDate
        committedViaWeb
        committer {
          date
          email
          name
          user { ...${this.fragments[0].alias} }
        }
        deletions
        deployments { totalCount }
        id
        message
        messageBody
        messageHeadline
        oid
        parents(first: 100) { nodes { oid } }
        repository { id }
        status { state }
      }
    `;
  }

  parse(data: GsCommit): Commit {
    return CommitSchema.parse({
      __typename: data.__typename,
      additions: data.additions,
      author: data.author && {
        ...data.author,
        user: data.author.user && this.fragments[0].parse(data.author.user)
      },
      authored_by_committer: data.authoredByCommitter,
      authored_date: data.authoredDate,
      changed_files_if_available: data.changedFilesIfAvailable,
      comments_count: data.comments.totalCount,
      committed_date: data.committedDate,
      committed_via_web: data.committedViaWeb,
      committer: data.committer && {
        ...data.committer,
        user: data.committer.user && this.fragments[0].parse(data.committer.user)
      },
      deletions: data.deletions,
      deployments_count: data.deployments!.totalCount,
      id: data.id,
      message: data.message,
      message_body: data.messageBody,
      message_headline: data.messageHeadline,
      oid: data.oid,
      parents: data.parents!.nodes?.map((node) => node!.oid),
      repository: data.repository.id,
      status: data.status && data.status.state
    });
  }
}
