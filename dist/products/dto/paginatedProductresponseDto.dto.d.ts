export declare class PaginatedProductResponseDto<T> {
    product: T[];
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
    constructor(product: T[], total: number, currentPage: number, totalPages: number, limit: number);
}
