import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { In, Like, Repository } from 'typeorm';
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



async create(createProductDto: CreateProductDto) {
  const { categoryIds, ...rest } = createProductDto;

  const categories = await this.categoryRepository.findBy({
    id: In(categoryIds),
  });

  if (!categories.length) {
    throw new NotFoundException('No se encontraron las categorías seleccionadas');
  }

  const product = this.proRepository.create({
    ...rest,
    categories,
  });

  return await this.proRepository.save(product);
}



async updateImage(id: number, body: any, imagePath?: string) {
  // 1️⃣ Buscar el producto existente
  const product = await this.proRepository.findOne({
    where: { id },
    relations: ['categories'],
  });

  if (!product) {
    throw new NotFoundException('Producto no encontrado');
  }

  // 2️⃣ Preparar datos actualizados
  const updatedData: any = { ...body };

  // 🔹 Convertir precio a número
  if (updatedData.price) {
    updatedData.price = Number(updatedData.price);
  }

  // 🔹 Mantener o inicializar cantidad
  updatedData.cantidad =
    updatedData.cantidad ?? product.cantidad ?? 0;

  // 3️⃣ Manejar categorías (si son IDs)
  if (updatedData.categories && Array.isArray(updatedData.categories)) {
    const categorias = await this.categoryRepository.findByIds(updatedData.categories);
    product.categories = categorias;
  }

  // 4️⃣ Manejar imagen (solo si se subió una nueva)
  if (imagePath && !imagePath.includes('undefined')) {
    product.imageUrl = imagePath;
  }

  // 5️⃣ Evitar duplicar dominio si el backend ya guarda rutas relativas
  if (product.imageUrl?.startsWith('https://espacioboulevard.com/https://')) {
    product.imageUrl = product.imageUrl.replace(
      'https://espacioboulevard.com/https://',
      'https://'
    );
  }

  // 6️⃣ Asignar campos actualizados
  Object.assign(product, {
    ...updatedData,
    categories: product.categories,
  });

  // 7️⃣ Guardar producto
  const saved = await this.proRepository.save(product);

  // 🔹 Normalizar salida (si quieres devolver URL completa)
  return {
    ...saved,
    imageUrl: saved.imageUrl
      ? `https://espacioboulevard.com${saved.imageUrl}`
      : null,
  };
}




 async findAll(
  page: number = 1,
  limit: number = 10,
): Promise<PaginationDto<ProductDto>> {
  // Validar que page y limit sean números enteros positivos
  page = Math.max(1, Number(page) || 1);
  limit = Math.max(1, Number(limit) || 10);

  const skip = (page - 1) * limit;

  const [products, total] = await this.proRepository.findAndCount({
    take: limit,
    skip: skip,
    relations: ['categories'], // 👈 ahora ManyToMany
    order: { id: 'DESC' },
  });

  return {
    total,
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    limit,
    data: products.map(
      ({ id, name, description, price, imageUrl, categories }) => {
        return {
          id,
          name,
          description,
          price,
          imageUrl: imageUrl
            ? `https://espacioboulevard.com/${imageUrl.replace(/^\/+/, '')}`
            : null,
          // 👇 devolver array de categorías en lugar de solo la primera
          categories: categories.map((cat) => ({
            id: cat.id,
            nombre: cat.nombre,
            icono: cat.icono,
          })),
        };
      },
    ),
  };
}

  async findAlls(): Promise<ProductDto[]> {
  const products = await this.proRepository.find({
    relations: ['categories'], // ManyToMany
    order: { id: 'DESC' },
  });

  return products.map(({ id, name, description, price, imageUrl, categories }) => ({
    id,
    name,
    description,
    price,
    imageUrl: imageUrl
      ? `https://espacioboulevard.com/${imageUrl.replace(/^\/+/, '')}`
      : null,
    categories: categories.map((cat) => ({
      id: cat.id,
      nombre: cat.nombre,
      icono: cat.icono,
    })),
  }));
}


async buscarPorNombre(
  nombre?: string,
  categoryIds?: number[],
  page = 1,
  limit = 10,
): Promise<{ data: ProductDto[]; total: number; currentPage: number }> {
  const baseUrl = 'https://espacioboulevard.com';
  page = Math.max(1, page);
  limit = Math.max(1, limit);
  const skip = (page - 1) * limit;

  const query = this.proRepository.createQueryBuilder('product')
    .leftJoinAndSelect('product.categories', 'category');

  if (nombre) {
    query.andWhere('product.name LIKE :nombre', { nombre: `%${nombre}%` });
  }

  if (categoryIds && categoryIds.length > 0) {
    // Filtrar por productos que tengan al menos una categoría dentro de categoryIds
    query.andWhere('category.id IN (:...categoryIds)', { categoryIds });
  }

  // Contar total distinto
  const total = await query.getCount();

  // Obtener productos con paginación
  const productos = await query
    .skip(skip)
    .take(limit)
    .orderBy('product.id', 'DESC')
    .getMany();

  const data: ProductDto[] = productos.map((producto) => ({
    id: producto.id,
    name: producto.name,
    description: producto.description,
    price: producto.price,
    imageUrl: producto.imageUrl
      ? `${baseUrl}/${producto.imageUrl.replace(/^\/+/, '')}`
      : null,
    categories: producto.categories.map((cat) => ({
      id: cat.id,
      nombre: cat.nombre,
      icono: cat.icono,
    })),
  }));

  return {
    data,
    total,
    currentPage: page,
  };
}


async buscarPorNombres(
  nombre?: string,
  categoryIds?: number[]
): Promise<ProductDto[]> {
  const baseUrl = 'https://espacioboulevard.com';

  const query = this.proRepository.createQueryBuilder('product')
    .leftJoinAndSelect('product.categories', 'category');

  if (nombre) {
    query.andWhere('product.name LIKE :nombre', { nombre: `%${nombre}%` });
  }

  if (categoryIds && categoryIds.length > 0) {
    query.andWhere('category.id IN (:...categoryIds)', { categoryIds });
  }

  // Obtener todos los productos filtrados, sin paginación
  const productos = await query
    .orderBy('product.id', 'DESC')
    .getMany();

  return productos.map((producto) => ({
    id: producto.id,
    name: producto.name,
    description: producto.description,
    price: producto.price,
    imageUrl: producto.imageUrl
      ? `${baseUrl}/${producto.imageUrl.replace(/^\/+/, '')}`
      : null,
    categories: producto.categories.map((cat) => ({
      id: cat.id,
      nombre: cat.nombre,
      icono: cat.icono,
    })),
  }));
}



  


  async findOne(id: number) {
    return await this.proRepository.findOneBy({id}); 
  }

  async remove(id: number) {
    return await this.proRepository.delete(id);
  }
}
