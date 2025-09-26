import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { Like, Repository } from 'typeorm';
import { PaginationDto } from './dto/PaginationDto.dto';
import { ProductDto } from './dto/productDTO.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly proRepository: Repository<Product>,
  ) {}


  async createProductWithImage(name: string, imageUrl: string): Promise<Product> {
    const newProduct = this.proRepository.create({
      name,
      imageUrl,
    });
    return await this.proRepository.save(newProduct);
  }




 // products.service.ts
async create(createProductDto: CreateProductDto) {
    const category = await this.categoryRepository.findOneBy({ id: createProductDto.categoryId });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    const product = this.proRepository.create({
      ...createProductDto,
      category,
    });
   
    return await this.proRepository.save(product);
  }
async update(id: number, updateProductDto: UpdateProductDto) {
  const product = await this.proRepository.findOne({ where: { id } });
  if (!product) throw new NotFoundException(`Producto con id ${id} no encontrado`);

  this.proRepository.merge(product, updateProductDto);
  return await this.proRepository.save(product); // 🔥 aquí devuelve la entidad
}

async updateImage( id: number,
  updateProductDto: UpdateProductDto,
  imagePath?: string,
) {
  const product = await this.proRepository.findOne({ where: { id } });
  if (!product) throw new NotFoundException(`Producto con id ${id} no encontrado`);

  // Actualizar campos
  Object.assign(product, updateProductDto);

  // Actualizar imagen si hay archivo
  if (imagePath) {
    product.imageUrl = imagePath;
  }

  return await this.proRepository.save(product);
}

  async findAll(page: number = 1, limit: number = 10): Promise<PaginationDto<ProductDto>> {
    // Validar que page y limit sean números enteros positivos
    page = Math.max(1, Number(page) || 1);
    limit = Math.max(1, Number(limit) || 10);
  
    const skip = (page - 1) * limit; // Cálculo seguro
  
    const [products, total] = await this.proRepository.findAndCount({
      take: limit,
      skip: skip, // Garantiza que skip sea un número válido
      relations: ['category'],
      order: { id: 'DESC' },
    });
  
    return {
      total,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      limit,
      data: products.map(({ id, name, description, price, imageUrl, category }) => {
       
        return {
          id,
          name,
          description,
          price,
          imageUrl: imageUrl
            ? `https://espacioboulevard.com/${imageUrl.replace(/^\/+/, '')}`
            : null,
          category,
        };
      }),
    };
    
  }
  
  

  async buscarPorNombre(nombre?: string,
  categoryId?: number,
  page = 1,
  limit = 10,
): Promise<{ data: ProductDto[]; total: number; currentPage: number }> {
  const baseUrl = 'https://espacioboulevard.com';

  const where: any = {};

  if (nombre) {
    where.name = Like(`%${nombre}%`);
  }

  if (categoryId) {
    where.category = { id: categoryId };
  }

  const [productos, total] = await this.proRepository.findAndCount({
    where,
    relations: ['category'],
    order: { id: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });

  const data = productos.map((producto) => ({
    id: producto.id,
    name: producto.name,
    description: producto.description,
    price: producto.price,
    imageUrl: producto.imageUrl
      ? `${baseUrl}${producto.imageUrl.replace(/^products\//, '')}`
      : null,
    category: producto.category,
  }));

  return {
    data,
    total,
    currentPage: page,
  };
}
  
  


  async findOne(id: number) {
    return await this.proRepository.findOneBy({id}); 
  }

  async remove(id: number) {
    return await this.proRepository.delete(id);
  }
}
