import chunk from 'lodash/chunk.js';
import { Actor } from '../../../entities/Actor';
import { GithubClient } from '../GithubClient';
import { FragmentFactory } from '../graphql/fragments/Fragment';
import { UserLookup } from '../graphql/lookups/UserLookup';
import { QueryRunner } from '../graphql/QueryRunner';
import { GraphqlResponseError } from '@octokit/graphql';

type Params = { factory: FragmentFactory; client: GithubClient; byLogin?: boolean };

async function users(idsArr: string[], params: Params): Promise<(Actor | null)[]> {
  if (idsArr.length === 0) return [];

  const result = await QueryRunner.create(params.client)
    .fetch(idsArr.map((id) => new UserLookup({ id, byLogin: params.byLogin, factory: params.factory })))
    .then((result) => result.map((d) => d?.data as Actor | undefined))
    .catch((error) => {
      if ([500, 502, 504].includes(error.status) || error instanceof GraphqlResponseError) {
        if (idsArr.length === 1) return [null];
        else return Promise.all(chunk(idsArr, 1).map((chunk) => users(chunk, params))).then((data) => data.flat());
      }
      throw error;
    });

  return idsArr.map((_, index) => result[index] || null);
}

/**
 *  Retrieves users by their ID.
 */
export default async function (id: string, params: Params): Promise<Actor | null>;
export default async function (id: string[], params: Params): Promise<(Actor | null)[]>;
export default async function (id: string | string[], params: Params): Promise<any> {
  const ids = Array.isArray(id) ? id : [id];
  const resData = await Promise.all(chunk(ids, 10).map((c) => users(c, params))).then((data) => data.flat());
  return Array.isArray(id) ? resData : resData[0];
}
