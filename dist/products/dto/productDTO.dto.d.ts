import { Category } from "src/categories/entities/category.entity";
export declare class ProductDto {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category: Category;
}
