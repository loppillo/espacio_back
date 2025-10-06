export declare class CategoryDto {
    id: number;
    nombre: string;
    icono?: string;
}
export declare class ProductDto {
    id: number;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    categories: CategoryDto[];
}
