import { Issue, IssueSchema } from '../../../../entities/Issue';
import { Issue as GsIssue } from '../../graphql-schema';
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
        assignedActors(first: 100) { nodes { ...${this.fragments[0].alias} } }
        assignees(first: 100) { nodes { ...${this.fragments[0].alias} } }
        author { ...${this.fragments[0].alias} }
        authorAssociation
        blockedBy(first: 100) { totalCount nodes { id } }
        blocking(first: 100) { totalCount nodes { id } }
        body
        closed
        closedAt
        comments { totalCount }
        createdAt
        createdViaEmail
        databaseId
        duplicateOf { id }
        editor { ...${this.fragments[0].alias} }
        fullDatabaseId
        id
        includesCreatedEdit
        isPinned
        issueType { name }
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
        timelineItems { totalCount }
        title
        updatedAt
      }
    `;
  }

  parse(data: GsIssue): Issue {
    return IssueSchema.parse({
      active_lock_reason: data.activeLockReason,
      assigned_actors: data.assignedActors?.nodes?.map((node) => this.fragments[0].parse(node)),
      assignees: data.assignees?.nodes?.map((node) => this.fragments[0].parse(node)),
      author: data.author && this.fragments[0].parse(data.author),
      author_association: data.authorAssociation,
      blocked_by: data.blockedBy?.nodes?.map((node) => node!.id),
      blocked_by_count: data.blockedBy?.totalCount,
      blocking: data.blocking?.nodes?.map((node) => node!.id),
      blocking_count: data.blocking?.totalCount,
      body: data.body,
      closed: data.closed,
      closed_at: data.closedAt,
      comments_count: data.comments.totalCount,
      created_at: data.createdAt,
      created_via_email: data.createdViaEmail,
      database_id: data.databaseId,
      duplicate_of: data.duplicateOf?.id,
      editor: data.editor && this.fragments[0].parse(data.editor),
      full_database_id: data.fullDatabaseId,
      id: data.id,
      includes_created_edit: data.includesCreatedEdit,
      is_pinned: data.isPinned,
      issue_type: data.issueType?.name,
      labels: data.labels?.nodes?.map((node) => node!.name),
      last_edited_at: data.lastEditedAt,
      linked_branches: data.linkedBranches?.nodes?.map((node) => node!.ref?.name).filter((name) => name !== undefined),
      locked: data.locked,
      milestone: data.milestone?.title,
      number: data.number,
      parent: data.parent?.id,
      participants_count: data.participants.totalCount,
      published_at: data.publishedAt,
      reactions_count: data.reactions.totalCount,
      repository: data.repository.id,
      state: data.state,
      timeline_items_count: data.timelineItems.totalCount,
      title: data.title,
      updated_at: data.updatedAt,
      __typename: data.__typename
    });
  }
}
