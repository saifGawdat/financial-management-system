export interface PaginationQueryDTO {
  page?: string;
  limit?: string;
}

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponseDTO<T> {
  data: T[];
  pagination: PaginationMetadata;
}
