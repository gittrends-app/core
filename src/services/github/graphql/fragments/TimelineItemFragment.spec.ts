import { describe, expect, it } from 'vitest';

import { BaseFragmentFactory } from './Fragment';
import { IssueTimelineItemFragment } from './TimelineItemFragment';

describe('IssueTimelineItemFragment', () => {
  it('selects multi-select fields and timeline options', () => {
    const fragment = new IssueTimelineItemFragment('TimelineTest', { factory: new BaseFragmentFactory() });
    const query = fragment.toString();

    expect(query).toContain('... on IssueFieldMultiSelect { id name }');
    expect(query).toContain('options { color name }');
    expect(query).toContain('newOptions { color name }');
    expect(query).toContain('previousOptions { color name }');
  });

  it('maps issue-field timeline options', () => {
    const fragment = new IssueTimelineItemFragment('TimelineTest', { factory: new BaseFragmentFactory() });
    const result = fragment.parse({
      __typename: 'IssueFieldChangedEvent',
      actor: null,
      createdAt: '2026-07-13T00:00:00Z',
      id: 'event-id',
      issueField: { __typename: 'IssueFieldMultiSelect', id: 'field-id', name: 'Priority' },
      newColor: null,
      newOptions: [{ color: 'ff0000', name: 'High' }],
      newValue: 'High',
      previousColor: null,
      previousOptions: [{ color: '00ff00', name: 'Low' }],
      previousValue: 'Low'
    });

    expect(result).toMatchObject({
      __typename: 'IssueFieldChangedEvent',
      issue_field: 'Priority',
      new_options: [{ color: 'ff0000', name: 'High' }],
      previous_options: [{ color: '00ff00', name: 'Low' }]
    });
  });
});
