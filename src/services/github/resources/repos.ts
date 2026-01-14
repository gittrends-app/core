import { Repository } from '../../../entities/Repository';
import { GithubClient } from '../GithubClient';
import { FragmentFactory } from '../graphql/fragments/Fragment';
import { RepositoryLookup } from '../graphql/lookups/RepositoryLookup';
import { QueryRunner } from '../graphql/QueryRunner';

type Params = { factory: FragmentFactory; client: GithubClient; byName?: boolean };

/**
 *  Retrieves repositories by their ID.
 */
export default async function (id: string, params: Params): Promise<Repository | null>;
export default async function (id: string[], params: Params): Promise<(Repository | null)[]>;
export default async function (id: string | string[], params: Params): Promise<any> {
  const idsArr = Array.isArray(id) ? id : [id];

  const result = await QueryRunner.create(params.client).fetch(
    idsArr.map((id) => new RepositoryLookup({ id, byName: params.byName, factory: params.factory }))
  );

  const resData = idsArr.map((_, index) => result[index]?.data || null);

  return Array.isArray(id) ? resData : resData[0];
}
