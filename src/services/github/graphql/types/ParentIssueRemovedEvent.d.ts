import {
  Bot,
  EnterpriseUserAccount,
  Issue,
  Mannequin,
  Maybe,
  Node,
  Organization,
  Scalars,
  User
} from '../../graphql-schema';

/** Represents a 'parent_issue_removed' event on a given issue. */
export type ParentIssueRemovedEvent = Node & {
  __typename?: 'ParentIssueRemovedEvent';
  /** Identifies the actor who performed the event. */
  actor?: Maybe<Bot | EnterpriseUserAccount | Mannequin | Organization | User>;
  /** Identifies the date and time when the object was created. */
  createdAt: Scalars['DateTime']['output'];
  /** The parent issue removed. */
  parent?: Maybe<Issue>;
};
