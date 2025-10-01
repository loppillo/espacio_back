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
let ProductsService = class ProductsService {
    constructor(categoryRepository, proRepository) {
        this.categoryRepository = categoryRepository;
        this.proRepository = proRepository;
    }
    async createProductWithImage(name, imageUrl) {
        const newProduct = this.proRepository.create({
            name,
            imageUrl,
        });
        return await this.proRepository.save(newProduct);
    }
    async create(createProductDto) {
        const category = await this.categoryRepository.findOneBy({ id: createProductDto.categoryId });
        if (!category)
            throw new common_1.NotFoundException('Categoría no encontrada');
        const product = this.proRepository.create({
            ...createProductDto,
            category,
        });
        return await this.proRepository.save(product);
    }
    async update(id, updateProductDto) {
        const product = await this.proRepository.findOne({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException(`Producto con id ${id} no encontrado`);
        this.proRepository.merge(product, updateProductDto);
        return await this.proRepository.save(product);
    }
    async updateImage(id, updateProductDto, imagePath) {
        const product = await this.proRepository.findOne({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException(`Producto con id ${id} no encontrado`);
        Object.assign(product, updateProductDto);
        if (imagePath) {
            product.imageUrl = imagePath;
        }
        return await this.proRepository.save(product);
    }
    async findAll(page = 1, limit = 10) {
        page = Math.max(1, Number(page) || 1);
        limit = Math.max(1, Number(limit) || 10);
        const skip = (page - 1) * limit;
        const [products, total] = await this.proRepository.findAndCount({
            take: limit,
            skip: skip,
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
    async buscarPorNombre(nombre, categoryId, page = 1, limit = 10) {
        const baseUrl = 'https://espacioboulevard.com';
        const where = {};
        if (nombre) {
            where.name = (0, typeorm_2.Like)(`%${nombre}%`);
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
    async findOne(id) {
        return await this.proRepository.findOneBy({ id });
    }
    async remove(id) {
        return await this.proRepository.delete(id);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map