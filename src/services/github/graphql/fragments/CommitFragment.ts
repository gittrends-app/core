import { Commit, CommitSchema } from '../../../../entities/Commit';
import { Commit as GsCommit } from '../../graphql-schema';
import { ActorFragment } from './ActorFragment';
import { DeclarativeFragment, FragmentFactory, FragmentField } from './Fragment';

/**
 *  A fragment to get a commit.
 */
export class CommitFragment extends DeclarativeFragment<GsCommit, Commit> {
  protected readonly fieldMap: readonly FragmentField<GsCommit>[] = [];

  constructor(alias = 'CommitFrag', opts: { factory: FragmentFactory }) {
    super(alias, opts);
    this.fragments.push(opts.factory.create(ActorFragment));
    this.fieldMap = [
      { key: '__typename', selection: '__typename', value: (data) => data.__typename },
      { key: 'additions', selection: 'additions', value: (data) => data.additions },
      {
        key: 'author',
        selection: (fragment) => `author {
          date
          email
          name
          user { ...${fragment.fragments[0].alias} }
        }`,
        value: (data, fragment) =>
          data.author && {
            ...data.author,
            user: data.author.user && fragment.fragments[0].parse(data.author.user)
          }
      },
      { key: 'authored_by_committer', selection: 'authoredByCommitter', value: (data) => data.authoredByCommitter },
      { key: 'authored_date', selection: 'authoredDate', value: (data) => data.authoredDate },
      {
        key: 'changed_files_if_available',
        selection: 'changedFilesIfAvailable',
        value: (data) => data.changedFilesIfAvailable
      },
      { key: 'comments_count', selection: 'comments { totalCount }', value: (data) => data.comments.totalCount },
      { key: 'committed_date', selection: 'committedDate', value: (data) => data.committedDate },
      { key: 'committed_via_web', selection: 'committedViaWeb', value: (data) => data.committedViaWeb },
      {
        key: 'committer',
        selection: (fragment) => `committer {
          date
          email
          name
          user { ...${fragment.fragments[0].alias} }
        }`,
        value: (data, fragment) =>
          data.committer && {
            ...data.committer,
            user: data.committer.user && fragment.fragments[0].parse(data.committer.user)
          }
      },
      { key: 'deletions', selection: 'deletions', value: (data) => data.deletions },
      {
        key: 'deployments_count',
        selection: 'deployments { totalCount }',
        value: (data) => data.deployments!.totalCount
      },
      { key: 'id', selection: 'id', value: (data) => data.id },
      { key: 'message', selection: 'message', value: (data) => data.message },
      { key: 'message_body', selection: 'messageBody', value: (data) => data.messageBody },
      { key: 'message_headline', selection: 'messageHeadline', value: (data) => data.messageHeadline },
      { key: 'oid', selection: 'oid', value: (data) => data.oid },
      {
        key: 'parents',
        selection: 'parents(first: 100) { nodes { oid } }',
        value: (data) => data.parents!.nodes?.map((node) => node!.oid)
      },
      { key: 'repository', selection: 'repository { id }', value: (data) => data.repository.id },
      { key: 'status', selection: 'status { state }', value: (data) => data.status && data.status.state }
    ];
  }

  toString(): string {
    return `
      fragment ${this.alias} on Commit {
        ${this.selection()}
      }
    `;
  }

  parse(data: GsCommit): Commit {
    return CommitSchema.parse(this.values(data));
  }
}
