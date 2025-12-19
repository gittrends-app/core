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

/** Represents a 'sub_issue_added' event on a given issue. */
export type SubIssueAddedEvent = Node & {
  __typename?: 'SubIssueAddedEvent';
  /** Identifies the actor who performed the event. */
  actor?: Maybe<Bot | EnterpriseUserAccount | Mannequin | Organization | User>;
  /** Identifies the date and time when the object was created. */
  createdAt: Scalars['DateTime']['output'];
  /** The subIssue issue added. */
  subIssue?: Maybe<Issue>;
};
