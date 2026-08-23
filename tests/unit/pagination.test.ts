import { normalizePagination, buildPaginatedResponse } from '../../src/utils/pagination';

describe('normalizePagination', () => {
  it('applies defaults when no input is given', () => {
    const result = normalizePagination({});
    expect(result).toEqual({ page: 1, limit: 20, skip: 0, take: 20 });
  });

  it('computes skip/take correctly for a given page and limit', () => {
    const result = normalizePagination({ page: 3, limit: 10 });
    expect(result).toEqual({ page: 3, limit: 10, skip: 20, take: 10 });
  });

  it('parses string query params', () => {
    const result = normalizePagination({ page: '2', limit: '5' });
    expect(result).toEqual({ page: 2, limit: 5, skip: 5, take: 5 });
  });

  it('falls back to defaults for invalid page values', () => {
    expect(normalizePagination({ page: 0 }).page).toBe(1);
    expect(normalizePagination({ page: -5 }).page).toBe(1);
    expect(normalizePagination({ page: 'not-a-number' }).page).toBe(1);
    expect(normalizePagination({ page: 1.5 }).page).toBe(1);
  });

  it('falls back to defaults for invalid limit values', () => {
    expect(normalizePagination({ limit: 0 }).limit).toBe(20);
    expect(normalizePagination({ limit: -1 }).limit).toBe(20);
    expect(normalizePagination({ limit: 'abc' }).limit).toBe(20);
  });

  it('caps limit at the maximum allowed value', () => {
    expect(normalizePagination({ limit: 1000 }).limit).toBe(100);
  });
});

describe('buildPaginatedResponse', () => {
  it('shapes the response per the required { data, total, page, limit } contract', () => {
    const pagination = normalizePagination({ page: 2, limit: 5 });
    const response = buildPaginatedResponse(['a', 'b'], 12, pagination);
    expect(response).toEqual({ data: ['a', 'b'], total: 12, page: 2, limit: 5 });
  });
});
