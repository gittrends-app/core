import { Bot, EnterpriseUserAccount, Mannequin, Maybe, Node, Organization, Scalars, User } from '../../graphql-schema';

/** Represents a 'issue_type_changed' event on a given issue. */
export type IssueTypeChangedEvent = Node & {
  __typename?: 'IssueTypeChangedEvent';
  /** Identifies the actor who performed the event. */
  actor?: Maybe<Bot | EnterpriseUserAccount | Mannequin | Organization | User>;
  /** Identifies the date and time when the object was created. */
  createdAt: Scalars['DateTime']['output'];
  /** The issue type added. */
  issueType?: Maybe<{ name: string }>;
  /** The issue type removed. */
  prevIssueType?: Maybe<{ name: string }>;
};
