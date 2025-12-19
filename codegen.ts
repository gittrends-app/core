import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'https://docs.github.com/public/fpt/schema.docs.graphql',
  documents: ['src/**/*.ts'],
  ignoreNoDocuments: true,
  generates: {
    './src/services/github/schema.d.ts': {
      plugins: ['typescript']
    }
  }
};

export default config;
