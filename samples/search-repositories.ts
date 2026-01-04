/* eslint-disable require-jsdoc */
import { input, number } from '@inquirer/prompts';
import consola from 'consola';
import { createStream } from 'table';
import { GithubClient, GithubService, Service } from '../src/index.js';

// This file demonstrates how to search for repositories using the Github service.
(async function main() {
  {
    // First, we need to create a Github client to interact with the Github API.
    consola.info('Creating Github client ...');
    const client = new GithubClient('https://api.github.com', { apiToken: process.env.GH_TOKEN });

    // Next, we need to create a Github service to interact with the Github API.
    consola.info('Preparing Github service example ...');
    const service: Service = new GithubService(client);

    // We need to define the number of repositories to search.
    const total = await number({
      message: 'Number of repositories to search:',
      default: 10,
      required: true
    });

    // We can filter the repositories by name.
    const name = await input({
      message: 'Would you like to filter by name:',
      required: false
    });

    // We can filter the repositories language.
    const language = await input({
      message: 'Which language would you like to search:',
      required: false
    });

    // We can filter the repositories by organization.
    const org = await input({
      message: 'Would you like to filter by organization:',
      required: false
    });

    // Now, we can search for the repositories using the selected parameters.
    const it = service.search(total!, { per_page: 50, language, name, org });
    const stream = createStream({
      columns: [{ width: 4 }, {}, { width: 7 }, { width: 16 }],
      columnDefault: { width: 50, truncate: 50 },
      columnCount: 4
    });

    consola.info('Repositories found: ');
    stream.write(['#', 'Repository', 'Stars', 'Language']);

    let count = 0;
    for await (const { data } of it) {
      for (const repo of data) {
        stream.write([`${++count}`, repo.name_with_owner, `${repo.stargazers_count!}`, repo.primary_language || '']);
      }
    }

    process.stdout.write('\n');
    consola.success('Done.');
  }
})();
