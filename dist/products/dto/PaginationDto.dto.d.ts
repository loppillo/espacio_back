export declare class PaginationDto<T> {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
    data: T[];
}
