"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const product_entity_1 = require("./entities/product.entity");
const typeorm_1 = require("@nestjs/typeorm");
const category_entity_1 = require("../categories/entities/category.entity");
const typeorm_2 = require("typeorm");
const cache_service_1 = require("../common/cache.service");
let ProductsService = class ProductsService {
    constructor(categoryRepository, proRepository, cacheService) {
        this.categoryRepository = categoryRepository;
        this.proRepository = proRepository;
        this.cacheService = cacheService;
    }
    async createProductWithImage(name, imageUrl) {
        const newProduct = this.proRepository.create({
            name,
            imageUrl,
        });
        return await this.proRepository.save(newProduct);
    }
    async create(createProductDto) {
        const { categoryIds, ...rest } = createProductDto;
        const categories = await this.categoryRepository.findBy({
            id: (0, typeorm_2.In)(categoryIds),
        });
        if (!categories.length) {
            throw new common_1.NotFoundException('No se encontraron las categorías seleccionadas');
        }
        const product = this.proRepository.create({
            ...rest,
            categories,
        });
        const saved = await this.proRepository.save(product);
        this.cacheService.invalidatePattern('products:search:.*');
        return saved;
    }
    async updateImage(id, body, imagePath) {
        if (body.categories && typeof body.categories === 'string') {
            try {
                body.categories = JSON.parse(body.categories);
            }
            catch {
                body.categories = [];
            }
        }
        const product = await this.proRepository.findOne({
            where: { id },
            relations: ['categories'],
        });
        if (!product) {
            throw new common_1.NotFoundException('Producto no encontrado');
        }
        const updatedData = { ...body };
        if (updatedData.price)
            updatedData.price = Number(updatedData.price);
        updatedData.cantidad = updatedData.cantidad ?? product.cantidad ?? 0;
        if (Array.isArray(updatedData.categories)) {
            const nuevasCategorias = await this.categoryRepository.find({
                where: { id: (0, typeorm_2.In)(updatedData.categories) },
            });
            product.categories = [];
            await this.proRepository.save(product);
            product.categories = nuevasCategorias;
        }
        if (updatedData.imageUrl && updatedData.imageUrl.startsWith('http')) {
            updatedData.imageUrl = updatedData.imageUrl.replace('https://espacioboulevard.com', '');
        }
        Object.assign(product, {
            ...updatedData,
            categories: product.categories,
        });
        if (imagePath && !imagePath.includes('undefined')) {
            product.imageUrl = imagePath;
        }
        const saved = await this.proRepository.save(product);
        this.cacheService.invalidatePattern('products:search:.*');
        return this.normalizeProduct(saved);
    }
    normalizeProduct(product) {
        return {
            ...product,
            imageUrl: product.imageUrl && product.imageUrl.includes('/uploads/')
                ? product.imageUrl.startsWith('http')
                    ? product.imageUrl
                    : `https://espacioboulevard.com${product.imageUrl}`
                : null,
        };
    }
    async findAll(page = 1, limit = 10) {
        page = Math.max(1, Number(page) || 1);
        limit = Math.max(1, Number(limit) || 10);
        const skip = (page - 1) * limit;
        const [products, total] = await this.proRepository.findAndCount({
            take: limit,
            skip: skip,
            relations: ['categories'],
            order: { id: 'DESC' },
        });
        return {
            total,
            currentPage: page,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            limit,
            data: products.map(({ id, name, description, price, imageUrl, categories }) => {
                return {
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
                };
            }),
        };
    }
    async findAlls() {
        const products = await this.proRepository.find({
            relations: ['categories'],
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
    async buscarPorNombre(nombre, categoryIds, page = 1, limit = 10, includeImages = true, lightweight = false) {
        const cacheKey = `products:search:${nombre || 'all'}:${categoryIds?.join(',') || 'all'}:${page}:${limit}:${includeImages}:${lightweight}`;
        const cached = this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const baseUrl = 'https://espacioboulevard.com';
        page = Math.max(1, page);
        limit = Math.max(1, limit);
        const skip = (page - 1) * limit;
        const query = this.proRepository.createQueryBuilder('product');
        if (!lightweight || (categoryIds && categoryIds.length > 0)) {
            query.leftJoinAndSelect('product.categories', 'category');
        }
        else {
            query.leftJoin('product.categories', 'category');
        }
        if (nombre) {
            query.andWhere('product.name LIKE :nombre', { nombre: `%${nombre}%` });
        }
        if (categoryIds && categoryIds.length > 0) {
            query.andWhere('category.id IN (:...categoryIds)', { categoryIds });
        }
        const total = await query.getCount();
        if (lightweight) {
            query.select(['product.id', 'product.name', 'product.price']);
            if (categoryIds && categoryIds.length > 0) {
                query.addSelect(['category.id']);
            }
        }
        const productos = await query
            .skip(skip)
            .take(limit)
            .orderBy('product.id', 'DESC')
            .getMany();
        let data;
        if (lightweight) {
            data = productos.map((producto) => ({
                id: producto.id,
                name: producto.name,
                price: producto.price,
                categoryIds: producto.categories?.map(cat => cat.id) || [],
            }));
        }
        else {
            data = productos.map((producto) => ({
                id: producto.id,
                name: producto.name,
                description: producto.description,
                price: producto.price,
                imageUrl: includeImages && producto.imageUrl
                    ? `${baseUrl}/${producto.imageUrl.replace(/^\/+/, '')}`
                    : null,
                categories: producto.categories?.map((cat) => ({
                    id: cat.id,
                    nombre: cat.nombre,
                    icono: cat.icono,
                })) || [],
            }));
        }
        const result = {
            data,
            total,
            currentPage: page,
        };
        const ttl = lightweight ? 5 * 60 * 1000 : 2 * 60 * 1000;
        this.cacheService.set(cacheKey, result, ttl);
        return result;
    }
    async buscarPorNombres(nombre, categoryIds) {
        const baseUrl = 'https://espacioboulevard.com';
        const query = this.proRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.categories', 'category');
        if (nombre) {
            query.andWhere('product.name LIKE :nombre', { nombre: `%${nombre}%` });
        }
        if (categoryIds && categoryIds.length > 0) {
            query.andWhere('category.id IN (:...categoryIds)', { categoryIds });
        }
        const productos = await query
            .orderBy('product.price', 'ASC')
            .addOrderBy('product.id', 'DESC')
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
    async findOne(id) {
        return await this.proRepository.findOneBy({ id });
    }
    async remove(id) {
        const result = await this.proRepository.delete(id);
        this.cacheService.invalidatePattern('products:search:.*');
        return result;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        cache_service_1.CacheService])
], ProductsService);
//# sourceMappingURL=products.service.js.map