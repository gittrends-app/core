import { z } from 'zod';
import { errorMap } from 'zod-validation-error';

z.setErrorMap(errorMap);

export * from './base/index.js';

export * from './Actor.js';
export * from './Commit.js';
export * from './Discussion.js';
export * from './DiscussionComment.js';
export * from './Issue.js';
export * from './PullRequest.js';
export * from './Reaction.js';
export * from './Release.js';
export * from './Repository.js';
export * from './Stargazer.js';
export * from './Tag.js';
export * from './TimelineItem.js';
export * from './Watcher.js';
