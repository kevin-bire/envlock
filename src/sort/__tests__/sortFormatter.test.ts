import { formatSortResult, formatSortSummary, formatSortChange } from '../sortFormatter';
import { SortResult } from '../envSort';

describe('sortFormatter', () => {
  const unchanged: SortResult = {
    original: { APPLE: 'a', MANGO: 'm' },
    sorted: { APPLE: 'a', MANGO: 'm' },
    changed: false,
    movedKeys: [],
  };

  const changed: SortResult = {
    original: { ZEBRA: 'z', APPLE: 'a', MANGO: 'm' },
    sorted: { APPLE: 'a', MANGO: 'm', ZEBRA: 'z' },
    changed: true,
    movedKeys: ['ZEBRA', 'APPLE'],
  };

  describe('formatSortChange', () => {
    it('formats a key position change', () => {
      const output = formatSortChange('ZEBRA', 0, 2);
      expect(output).toContain('ZEBRA');
      expect(output).toContain('1');
      expect(output).toContain('3');
    });
  });

  describe('formatSortResult', () => {
    it('returns no-change message when already sorted', () => {
      const output = formatSortResult(unchanged);
      expect(output).toMatch(/already sorted/i);
    });

    it('lists moved keys when changes occurred', () => {
      const output = formatSortResult(changed);
      expect(output).toContain('ZEBRA');
      expect(output).toContain('APPLE');
    });

    it('includes Sorted keys header', () => {
      const output = formatSortResult(changed);
      expect(output).toMatch(/sorted keys/i);
    });
  });

  describe('formatSortSummary', () => {
    it('reports no changes when already sorted', () => {
      const output = formatSortSummary(unchanged);
      expect(output).toMatch(/no changes/i);
      expect(output).toContain('2 keys');
    });

    it('reports repositioned count when changed', () => {
      const output = formatSortSummary(changed);
      expect(output).toContain('3 keys');
      expect(output).toContain('2 repositioned');
    });
  });
});
