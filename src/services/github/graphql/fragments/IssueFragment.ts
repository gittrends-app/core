import { Issue, IssueSchema } from '../../../../entities/Issue';
import { Issue as GsIssue } from '../../graphql-schema';
import { ActorFragment } from './ActorFragment';
import { DeclarativeFragment, FragmentFactory, FragmentField } from './Fragment';

/**
 *  A fragment to get a issue.
 */
export class IssueFragment extends DeclarativeFragment<GsIssue, Issue> {
  protected readonly fieldMap: readonly FragmentField<GsIssue>[] = [];

  constructor(alias = 'IssueFrag', opts: { factory: FragmentFactory }) {
    super(alias, opts);
    this.fragments.push(opts.factory.create(ActorFragment));
    this.fieldMap = [
      { key: '__typename', selection: '__typename', value: (data) => data.__typename },
      { key: 'active_lock_reason', selection: 'activeLockReason', value: (data) => data.activeLockReason },
      {
        key: 'assigned_actors',
        selection: (fragment) => `assignedActors(first: 100) { nodes { ...${fragment.fragments[0].alias} } }`,
        value: (data, fragment) => data.assignedActors?.nodes?.map((node) => fragment.fragments[0].parse(node))
      },
      {
        key: 'assignees',
        selection: (fragment) => `assignees(first: 100) { nodes { ...${fragment.fragments[0].alias} } }`,
        value: (data, fragment) => data.assignees?.nodes?.map((node) => fragment.fragments[0].parse(node))
      },
      {
        key: 'author',
        selection: (fragment) => `author { ...${fragment.fragments[0].alias} }`,
        value: (data, fragment) => data.author && fragment.fragments[0].parse(data.author)
      },
      { key: 'author_association', selection: 'authorAssociation', value: (data) => data.authorAssociation },
      {
        key: 'blocked_by',
        selection: 'blockedBy(first: 100) { totalCount nodes { id } }',
        value: (data) => data.blockedBy?.nodes?.map((node) => node!.id),
        additional: [{ key: 'blocked_by_count', value: (data) => data.blockedBy?.totalCount }]
      },
      {
        key: 'blocking',
        selection: 'blocking(first: 100) { totalCount nodes { id } }',
        value: (data) => data.blocking?.nodes?.map((node) => node!.id),
        additional: [{ key: 'blocking_count', value: (data) => data.blocking?.totalCount }]
      },
      { key: 'body', selection: 'body', value: (data) => data.body },
      { key: 'closed', selection: 'closed', value: (data) => data.closed },
      { key: 'closed_at', selection: 'closedAt', value: (data) => data.closedAt },
      { key: 'comments_count', selection: 'comments { totalCount }', value: (data) => data.comments.totalCount },
      { key: 'created_at', selection: 'createdAt', value: (data) => data.createdAt },
      { key: 'created_via_email', selection: 'createdViaEmail', value: (data) => data.createdViaEmail },
      { key: 'database_id', selection: 'databaseId', value: (data) => data.databaseId },
      {
        key: 'duplicate_of',
        selection: 'duplicateOf { id }',
        value: (data) => data.duplicateOf?.id
      },
      {
        key: 'editor',
        selection: (fragment) => `editor { ...${fragment.fragments[0].alias} }`,
        value: (data, fragment) => data.editor && fragment.fragments[0].parse(data.editor)
      },
      { key: 'full_database_id', selection: 'fullDatabaseId', value: (data) => data.fullDatabaseId },
      { key: 'id', selection: 'id', value: (data) => data.id },
      { key: 'includes_created_edit', selection: 'includesCreatedEdit', value: (data) => data.includesCreatedEdit },
      { key: 'is_pinned', selection: 'isPinned', value: (data) => data.isPinned },
      { key: 'issue_type', selection: 'issueType { name }', value: (data) => data.issueType?.name },
      {
        key: 'issue_field_values_count',
        selection: 'issueFieldValues(first: 100) { totalCount }',
        value: (data) => data.issueFieldValues?.totalCount
      },
      {
        key: 'labels',
        selection: 'labels(first: 100) { nodes { name } }',
        value: (data) => data.labels?.nodes?.map((node) => node!.name)
      },
      { key: 'last_edited_at', selection: 'lastEditedAt', value: (data) => data.lastEditedAt },
      {
        key: 'linked_branches',
        selection: 'linkedBranches(first: 100) { nodes { ref { name } } }',
        value: (data) => data.linkedBranches?.nodes?.map((node) => node!.ref?.name).filter((name) => name !== undefined)
      },
      { key: 'locked', selection: 'locked', value: (data) => data.locked },
      { key: 'milestone', selection: 'milestone { title }', value: (data) => data.milestone?.title },
      { key: 'number', selection: 'number', value: (data) => data.number },
      { key: 'parent', selection: 'parent { id }', value: (data) => data.parent?.id },
      {
        key: 'participants_count',
        selection: 'participants { totalCount }',
        value: (data) => data.participants.totalCount
      },
      {
        key: 'pinned_issue_comment',
        selection: 'pinnedIssueComment { id }',
        value: (data) => data.pinnedIssueComment?.id
      },
      { key: 'published_at', selection: 'publishedAt', value: (data) => data.publishedAt },
      { key: 'reactions_count', selection: 'reactions { totalCount }', value: (data) => data.reactions.totalCount },
      { key: 'repository', selection: 'repository { id }', value: (data) => data.repository.id },
      { key: 'state', selection: 'state', value: (data) => data.state },
      {
        key: 'timeline_items_count',
        selection: 'timelineItems { totalCount }',
        value: (data) => data.timelineItems.totalCount
      },
      { key: 'title', selection: 'title', value: (data) => data.title },
      { key: 'updated_at', selection: 'updatedAt', value: (data) => data.updatedAt }
    ];
  }

  toString(): string {
    return `
      fragment ${this.alias} on Issue {
        ${this.selection()}
      }
    `;
  }

  parse(data: GsIssue): Issue {
    return IssueSchema.parse(this.values(data));
  }
}
