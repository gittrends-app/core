import { IssueTimelineItems } from '@octokit/graphql-schema';
import { IssueTypeAddedEvent } from './IssueTypeAddedEvent';
import { IssueTypeChangedEvent } from './IssueTypeChangedEvent';
import { IssueTypeRemovedEvent } from './IssueTypeRemovedEvent';
import { ParentIssueAddedEvent } from './ParentIssueAddedEvent';
import { ParentIssueRemovedEvent } from './ParentIssueRemovedEvent';
import { SubIssueAddedEvent } from './SubIssueAddedEvent';
import { SubIssueRemovedEvent } from './SubIssueRemovedEvent';

export type ExtendedIssueTimelineItems =
  | IssueTimelineItems
  | ParentIssueAddedEvent
  | ParentIssueRemovedEvent
  | SubIssueAddedEvent
  | SubIssueRemovedEvent
  | IssueTypeAddedEvent
  | IssueTypeChangedEvent
  | IssueTypeRemovedEvent;
