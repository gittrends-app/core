import { TimelineItem } from '../../../../entities/TimelineItem';
import { IssueTimelineItemFragment, PullRequestTimelineItemFragment } from '../fragments/TimelineItemFragment';
import { ConnectionDescriptor, ConnectionLookup } from './ConnectionLookup';

/**
 *  A lookup to get issue/pull request timeline items.
 */
export class TimelineItemsLookup extends ConnectionLookup<TimelineItem, { type?: 'Issue' | 'PullRequest' }> {
  protected get descriptor(): ConnectionDescriptor {
    return {
      field: 'timelineItems',
      typeCondition: this.params.type || 'Issue',
      missingDataError: 'Failed to parse timeline items.'
    };
  }

  protected entriesSelection(): string {
    return `nodes { ...${this.fragments[0].alias} }`;
  }

  protected mapEntry(entry: any): TimelineItem {
    return this.fragments[0].parse(entry);
  }

  get fragments() {
    return [
      this.params.factory.create(
        this.params.type === 'PullRequest' ? PullRequestTimelineItemFragment : IssueTimelineItemFragment
      )
    ];
  }
}
