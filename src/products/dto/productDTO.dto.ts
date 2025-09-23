import { Category } from "src/categories/entities/category.entity";

export class ProductDto {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category: Category;
  }