export type PaginatedResponse<T> = {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  data: T;
  error: null;
} | {
  data: null;
  error: string;
};

export type SortDirection = "asc" | "desc";

export type SortConfig = {
  column: string;
  direction: SortDirection;
};
