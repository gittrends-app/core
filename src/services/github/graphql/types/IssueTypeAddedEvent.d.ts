import {
  Bot,
  EnterpriseUserAccount,
  Mannequin,
  Maybe,
  Node,
  Organization,
  Scalars,
  User
} from '@octokit/graphql-schema';

/** Represents a 'issue_type_added' event on a given issue. */
export type IssueTypeAddedEvent = Node & {
  __typename?: 'IssueTypeAddedEvent';
  /** Identifies the actor who performed the event. */
  actor?: Maybe<Bot | EnterpriseUserAccount | Mannequin | Organization | User>;
  /** Identifies the date and time when the object was created. */
  createdAt: Scalars['DateTime']['output'];
  /** The issue type added. */
  issueType?: Maybe<{ name: string }>;
};
