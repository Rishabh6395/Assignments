export interface PaginationInput {
  page?: number | string;
  limit?: number | string;
}

export interface NormalizedPagination {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function normalizePagination(input: PaginationInput): NormalizedPagination {
  let page = Number(input.page);
  let limit = Number(input.limit);

  if (!Number.isInteger(page) || page < 1) {
    page = DEFAULT_PAGE;
  }
  if (!Number.isInteger(limit) || limit < 1) {
    limit = DEFAULT_LIMIT;
  }
  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit
  };
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  pagination: NormalizedPagination
): PaginatedResult<T> {
  return {
    data,
    total,
    page: pagination.page,
    limit: pagination.limit
  };
}
