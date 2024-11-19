export interface ApiError {
  message?: string;
  errors?: Record<string, string[]>;
  code?: string;
  status?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    current_page: number;
    total_pages: number;
    total: number;
    per_page: number;
  };
  stats?: {
    totalCount: number;
    previousCount: number;
    changeRate: number;
    totalSales?: number;
    previousSales?: number;
    salesChangeRate?: number;
  };
}

export interface ApiPaginatedResponse<T> extends ApiResponse<T> {
  meta: {
    current_page: number;
    total_pages: number;
    total: number;
    per_page: number;
  };
}

export interface ApiValidationError extends ApiError {
  errors: Record<string, string[]>;
}

export type ApiErrorResponse = {
  error: ApiError;
};
