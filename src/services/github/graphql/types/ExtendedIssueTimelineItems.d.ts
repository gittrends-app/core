import { IssueTimelineItems } from '@octokit/graphql-schema';
import { ParentIssueAddedEvent } from './ParentIssueAddedEvent';
import { ParentIssueRemovedEvent } from './ParentIssueRemovedEvent';
import { SubIssueAddedEvent } from './SubIssueAddedEvent';
import { SubIssueRemovedEvent } from './SubIssueRemovedEvent';

export type ExtendedIssueTimelineItems =
  | IssueTimelineItems
  | ParentIssueAddedEvent
  | ParentIssueRemovedEvent
  | SubIssueAddedEvent
  | SubIssueRemovedEvent;
