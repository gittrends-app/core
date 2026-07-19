import { Issue } from '../../../../entities/Issue';
import { IssueFragment } from '../fragments/IssueFragment';
import { ConnectionDescriptor, ConnectionLookup } from './ConnectionLookup';

/**
 *  A lookup to get repository issues.
 */
export class IssuesLookup extends ConnectionLookup<Issue> {
  protected get descriptor(): ConnectionDescriptor {
    return {
      field: 'issues',
      typeCondition: 'Repository',
      args: ['orderBy: { field: UPDATED_AT direction: ASC }'],
      missingDataError: 'Failed to parse tags.'
    };
  }

  protected entriesSelection(): string {
    return `nodes { ...${this.fragments[0].alias} }`;
  }

  protected mapEntry(entry: any): Issue {
    return this.fragments[0].parse(entry);
  }

  get fragments(): [IssueFragment] {
    return [this.params.factory.create(IssueFragment)];
  }
}
