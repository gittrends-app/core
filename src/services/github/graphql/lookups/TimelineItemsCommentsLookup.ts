import { Commentable } from '../../../../entities/base/Commentable';
import { IssueTimelineItems } from '../../graphql-schema';
import { TimelineItemCommentsFragment } from '../fragments/TimelineItemCommentsFragment';
import { QueryLookup } from './Lookup';

/**
 *  A lookup to get repository issues.
 */
export class TimelineItemsCommentsLookup extends QueryLookup<Commentable> {
  toString(): string {
    return `
    ${this.alias}:node(id: "${this.params.id}") {
      ...${this.fragments[0].alias}
    }
    `;
  }

  parse(data: any) {
    const _data: IssueTimelineItems = data[this.alias] || data;
    if (!_data) throw Object.assign(new Error('Failed to parse timeline item.'), { data, query: this.toString() });
    return {
      next: undefined,
      data: this.fragments[0].parse(_data),
      params: { ...this.params }
    };
  }

  get fragments(): [TimelineItemCommentsFragment] {
    return [this.params.factory.create(TimelineItemCommentsFragment)];
  }
}
