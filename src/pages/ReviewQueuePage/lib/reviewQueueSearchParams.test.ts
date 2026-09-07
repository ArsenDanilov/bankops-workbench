import { describe, expect, it } from 'vitest';
import {
  clearReviewQueueSearchParams,
  createReviewQueueSearchParams,
  parseReviewQueueSearchParams,
} from './reviewQueueSearchParams';

describe('Review Queue URL contract', () => {
  it('defaults to an unrestricted first page without rewriting an absent page', () => {
    expect(parseReviewQueueSearchParams(new URLSearchParams())).toEqual({
      state: {
        search: '',
        scopes: [],
        slaBreached: false,
        riskSignals: [],
        page: 1,
      },
      pageParamNeedsNormalization: false,
    });
  });

  it('parses known values, deduplicates multi-selects and ignores unsupported values', () => {
    const params = new URLSearchParams(
      'q=%20Елена%20&scope=other_analyst&scope=unknown&scope=queued&scope=queued&scope=my_reviews' +
        '&sla=breached&risk=device_change&risk=unknown&risk=new_recipient&risk=device_change&page=3',
    );
    expect(parseReviewQueueSearchParams(params)).toEqual({
      state: {
        search: ' Елена ',
        scopes: ['queued', 'my_reviews', 'other_analyst'],
        slaBreached: true,
        riskSignals: ['new_recipient', 'device_change'],
        page: 3,
      },
      pageParamNeedsNormalization: false,
    });
    expect(
      parseReviewQueueSearchParams(new URLSearchParams('sla=due_soon')).state
        .slaBreached,
    ).toBe(false);
  });

  it.each(['', '0', '-1', '1.5', 'abc', '02', '9007199254740992', '1'])(
    'normalizes invalid or redundant page=%s to the default',
    (page) => {
      const parsed = parseReviewQueueSearchParams(
        new URLSearchParams({ page }),
      );
      expect(parsed.state.page).toBe(1);
      expect(parsed.pageParamNeedsNormalization).toBe(true);
    },
  );

  it('serializes canonically while retaining unrelated params and nonblank search text', () => {
    const original = new URLSearchParams(
      'view=compact&view=team&scope=unknown&page=8&q=old&risk=bad',
    );
    const before = original.toString();
    const result = createReviewQueueSearchParams(original, {
      search: ' Елена ',
      scopes: ['other_analyst', 'queued', 'queued'],
      slaBreached: true,
      riskSignals: ['device_change', 'new_recipient', 'device_change'],
      page: 2,
    });
    expect([...result]).toEqual([
      ['view', 'compact'],
      ['view', 'team'],
      ['q', ' Елена '],
      ['scope', 'queued'],
      ['scope', 'other_analyst'],
      ['sla', 'breached'],
      ['risk', 'new_recipient'],
      ['risk', 'device_change'],
      ['page', '2'],
    ]);
    expect(original.toString()).toBe(before);
    expect(
      createReviewQueueSearchParams(
        result,
        parseReviewQueueSearchParams(result).state,
      ).toString(),
    ).toBe(result.toString());
  });

  it('omits defaults/blank search and Reset clears only Queue-owned keys', () => {
    const original = new URLSearchParams(
      'view=compact&q=foo&scope=queued&sla=breached&risk=high_velocity&page=2',
    );
    const defaults = {
      search: '   ',
      scopes: [],
      slaBreached: false,
      riskSignals: [],
      page: 1,
    };
    expect(createReviewQueueSearchParams(original, defaults).toString()).toBe(
      'view=compact',
    );
    expect(clearReviewQueueSearchParams(original).toString()).toBe(
      'view=compact',
    );
    expect(original.get('q')).toBe('foo');
    expect(original.get('page')).toBe('2');
  });
});
