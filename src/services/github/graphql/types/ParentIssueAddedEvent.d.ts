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

/** Represents a 'parent_issue_added' event on a given issue or pull request. */
export type ParentIssueAddedEvent = Node & {
  __typename?: 'ParentIssueAddedEvent';
  /** Identifies the actor who performed the event. */
  actor?: Maybe<Bot | EnterpriseUserAccount | Mannequin | Organization | User>;
  /** Identifies the date and time when the object was created. */
  createdAt: Scalars['DateTime']['output'];
  /** The parent issue added. */
  parent?: Maybe<Issue>;
};
