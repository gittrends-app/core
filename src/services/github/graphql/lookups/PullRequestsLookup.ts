import { PullRequest } from '../../../../entities/PullRequest';
import { PullRequestFragment } from '../fragments/PullRequestFragment';
import { ConnectionDescriptor, ConnectionLookup } from './ConnectionLookup';

/**
 *  A lookup to get repository prs.
 */
export class PullRequestsLookup extends ConnectionLookup<PullRequest> {
  protected get descriptor(): ConnectionDescriptor {
    return {
      field: 'pullRequests',
      typeCondition: 'Repository',
      args: ['orderBy: { field: UPDATED_AT direction: ASC }'],
      missingDataError: 'Failed to parse pull requests.'
    };
  }

  protected entriesSelection(): string {
    return `nodes { ...${this.fragments[0].alias} }`;
  }

  protected mapEntry(entry: any): PullRequest {
    return this.fragments[0].parse(entry);
  }

  get fragments(): [PullRequestFragment] {
    return [this.params.factory.create(PullRequestFragment)];
  }
}
