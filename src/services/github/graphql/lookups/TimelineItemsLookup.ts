import { TimelineItem } from '../../../../entities/TimelineItem';
import { IssueTimelineItemsConnection } from '../../graphql-schema';
import { IssueTimelineItemFragment, PullRequestTimelineItemFragment } from '../fragments/TimelineItemFragment';
import { QueryLookup } from './Lookup';

/**
 *  A lookup to get repository issues.
 */
export class TimelineItemsLookup extends QueryLookup<TimelineItem[], { type?: 'Issue' | 'PullRequest' }> {
  toString(): string {
    const params = [`first: ${this.params.per_page || 100}`];
    if (this.params.cursor) params.push(`after: "${this.params.cursor}"`);

    return `
    ${this.alias}:node(id: "${this.params.id}") {
      ... on ${this.params.type || 'Issue'} {
        timelineItems(${params.join(', ')}) {
          pageInfo { hasNextPage endCursor }
          nodes { ...${this.fragments[0].alias} }
        }
      }
    }
    `;
  }

  parse(data: any) {
    const _data: IssueTimelineItemsConnection = (data[this.alias] || data).timelineItems;
    if (!_data) throw Object.assign(new Error('Failed to parse timeline items.'), { data, query: this.toString() });
    return {
      next: _data.pageInfo.hasNextPage
        ? new TimelineItemsLookup({
            ...this.params,
            cursor: _data.pageInfo.endCursor || this.params.cursor
          })
        : undefined,
      data: (_data.nodes || []).map((data) => this.fragments[0].parse(data!)),
      params: { ...this.params, cursor: _data.pageInfo.endCursor || this.params.cursor }
    };
  }

  get fragments() {
    return [
      this.params.factory.create(
        this.params.type === 'PullRequest' ? PullRequestTimelineItemFragment : IssueTimelineItemFragment
      )
    ];
  }
}
