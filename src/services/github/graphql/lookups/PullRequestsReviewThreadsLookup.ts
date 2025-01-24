import { PullRequestReviewThreadConnection } from '@octokit/graphql-schema';
import {
  PullRequestReviewThread,
  PullRequestReviewThreadSchema
} from '../../../../entities/base/PullRequestReviewThread.js';
import { zodSanitize } from '../../../../helpers/sanitize.js';
import { ActorFragment } from '../fragments/ActorFragment.js';
import { PullRequestReviewCommentFragment } from '../fragments/PullRequestReviewCommentFragment.js';
import { QueryLookup } from './Lookup.js';

/**
 *  A lookup to get repository prs threads.
 */
export class PullRequestsReviewThreadsLookup extends QueryLookup<PullRequestReviewThread[]> {
  toString(): string {
    const params = [`first: ${this.params.per_page || 100}`];
    if (this.params.cursor) params.push(`after: "${this.params.cursor}"`);

    return `
    ${this.alias}:node(id: "${this.params.id}") {
      ... on PullRequest {
        reviewThreads(${params.join(', ')}) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            __typename
            comments(first: 100) { 
              totalCount
              nodes { ...${this.fragments[1].alias} }
            }
            diffSide
            isCollapsed
            isOutdated
            isResolved
            line
            originalLine
            originalStartLine
            path
            resolvedBy { ...${this.fragments[0].alias} }
            startDiffSide
            startLine
            subjectType
          }
        }
      }
    }
    `;
  }

  parse(data: any) {
    const _data: PullRequestReviewThreadConnection = (data[this.alias] || data).reviewThreads;
    if (!_data) throw Object.assign(new Error('Failed to parse data.'), { data, query: this.toString() });
    return {
      next: _data.pageInfo.hasNextPage
        ? new PullRequestsReviewThreadsLookup({
            ...this.params,
            cursor: _data.pageInfo.endCursor || this.params.cursor
          })
        : undefined,
      data: (_data.nodes || []).map((data) =>
        zodSanitize(PullRequestReviewThreadSchema).parse({
          id: data!.id,
          __typename: data!.__typename,
          comments_count: data!.comments?.totalCount,
          comments: (data!.comments?.nodes || []).map((node) => this.fragments[1].parse(node!)),
          diff_side: data!.diffSide,
          is_collapsed: data!.isCollapsed,
          is_outdated: data!.isOutdated,
          is_resolved: data!.isResolved,
          line: data!.line,
          original_line: data!.originalLine,
          original_start_line: data!.originalStartLine,
          path: data!.path,
          resolved_by: data!.resolvedBy && this.fragments[0].parse(data!.resolvedBy),
          start_diff_side: data!.startDiffSide,
          start_line: data!.startLine,
          subject_type: data!.subjectType
        })
      ),
      params: { ...this.params, cursor: _data.pageInfo.endCursor || this.params.cursor }
    };
  }

  get fragments(): [ActorFragment, PullRequestReviewCommentFragment] {
    return [this.params.factory.create(ActorFragment), this.params.factory.create(PullRequestReviewCommentFragment)];
  }
}
