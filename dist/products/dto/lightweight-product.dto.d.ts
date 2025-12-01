export declare class LightweightProductDto {
    id: number;
    name: string;
    price: number;
    thumbnailUrl?: string;
    categoryIds?: number[];
}
export declare class LightweightProductResponse {
    data: LightweightProductDto[];
    total: number;
    currentPage: number;
    totalPages?: number;
    limit?: number;
}
