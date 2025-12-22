import { z } from 'zod';
import { createErrorMap } from 'zod-validation-error';

z.config({ customError: createErrorMap() });

export * from './Actor';
export * from './base';
export * from './Commit';
export * from './Discussion';
export * from './DiscussionComment';
export * from './Issue';
export * from './PullRequest';
export * from './Reaction';
export * from './Release';
export * from './Repository';
export * from './Stargazer';
export * from './Tag';
export * from './TimelineItem';
export * from './Watcher';
