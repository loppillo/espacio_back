import { Category } from 'src/categories/entities/category.entity';

export class CategoryDto {
  id: number;
  nombre: string;
  icono: string;
}


export class ProductDto {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categories: CategoryDto[]; // ahora usa DTO, no la entidad completa
}