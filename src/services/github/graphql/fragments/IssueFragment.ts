import { Issue as GsIssue } from '@octokit/graphql-schema';
import { Issue, IssueSchema } from '../../../../entities/Issue';
import { ActorFragment } from './ActorFragment';
import { AbstractFragment, FragmentFactory } from './Fragment';

/**
 *  A fragment to get a issue.
 */
export class IssueFragment extends AbstractFragment {
  constructor(alias = 'IssueFrag', opts: { factory: FragmentFactory }) {
    super(alias, opts);
    this.fragments.push(opts.factory.create(ActorFragment));
  }

  toString(): string {
    return `
      fragment ${this.alias} on Issue {
        __typename
        activeLockReason
        assignees(first: 100) { nodes { ...${this.fragments[0].alias} } }
        author { ...${this.fragments[0].alias} }
        authorAssociation
        body
        closed
        closedAt
        comments { totalCount }
        createdAt
        createdViaEmail
        databaseId
        editor { ...${this.fragments[0].alias} }
        fullDatabaseId
        id
        includesCreatedEdit
        isPinned
        labels(first: 100) { nodes { name } }
        lastEditedAt
        linkedBranches(first: 100) { nodes { ref { name } } }
        locked
        milestone { title }
        number
        parent { id }
        participants { totalCount }
        publishedAt
        reactions { totalCount }
        repository { id }
        state
        stateReason
        timelineItems { totalCount }
        title
        updatedAt
      }
    `;
  }

  // TODO: @octokit/graphql-schema does not include the `parent` field in the Issue type, but it is available in the GraphQL API.
  parse(data: GsIssue & { parent?: GsIssue }): Issue {
    return IssueSchema.parse({
      active_lock_reason: data.activeLockReason,
      assignees: data.assignees?.nodes?.map((node) => this.fragments[0].parse(node)),
      author: data.author && this.fragments[0].parse(data.author),
      author_association: data.authorAssociation,
      body: data.body,
      closed: data.closed,
      closed_at: data.closedAt,
      comments_count: data.comments.totalCount,
      created_at: data.createdAt,
      created_via_email: data.createdViaEmail,
      database_id: data.databaseId,
      editor: data.editor && this.fragments[0].parse(data.editor),
      full_database_id: data.fullDatabaseId,
      id: data.id,
      includes_created_edit: data.includesCreatedEdit,
      is_pinned: data.isPinned,
      labels: data.labels?.nodes?.map((node) => node!.name),
      last_edited_at: data.lastEditedAt,
      linked_branches: data.linkedBranches?.nodes?.map((node) => node!.ref?.name),
      locked: data.locked,
      milestone: data.milestone?.title,
      number: data.number,
      parent: data.parent?.id,
      participants_count: data.participants.totalCount,
      published_at: data.publishedAt,
      reactions_count: data.reactions.totalCount,
      repository: data.repository.id,
      state: data.state,
      state_reason: data.stateReason,
      timeline_items_count: data.timelineItems.totalCount,
      title: data.title,
      updated_at: data.updatedAt,
      __typename: data.__typename
    });
  }
}
