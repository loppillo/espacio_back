"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedProductResponseDto = void 0;
class PaginatedProductResponseDto {
    constructor(product, total, currentPage, totalPages, limit) {
        this.product = product;
        this.total = total;
        this.currentPage = currentPage;
        this.totalPages = totalPages;
        this.limit = limit;
    }
}
exports.PaginatedProductResponseDto = PaginatedProductResponseDto;
//# sourceMappingURL=paginatedProductresponseDto.dto.js.map