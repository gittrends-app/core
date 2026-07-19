# GitHub Repository Activity

This context describes GitHub repositories and the records of activity associated with them. The library presents these records as stable domain data for consumers that analyze repository history.

## Language

**Repository**:
A GitHub project that owns code, discussions, issues, pull requests, releases, commits, and related records.

**Actor**:
A person, organization, bot, or other GitHub identity that owns or participates in repository activity.
_Avoid_: User when the identity may be an organization or bot.

**Issue**:
A tracked problem, request, or task associated with a repository.

**Pull request**:
A proposed change to a repository, including its commits, reviews, comments, and review discussion.
_Avoid_: PR in domain-facing descriptions.

**Discussion**:
A repository conversation that is not necessarily a proposed code change or tracked issue.

**Timeline item**:
A dated record in the history of an issue or pull request, including events, comments, commits, reviews, and review threads.

**Reaction**:
 An emoji response attached to a record that accepts reactions, such as an issue, comment, or review.

**Resource**:
A named collection of repository records available to a consumer, such as issues, commits, releases, stargazers, tags, or watchers.

**Page**:
A finite portion of a resource returned together with enough continuation information to request the following portion.
