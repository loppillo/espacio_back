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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const platform_express_1 = require("@nestjs/platform-express");
const path_1 = require("path");
const uuid_1 = require("uuid");
const multer_1 = require("multer");
let ProductsController = class ProductsController {
    constructor(productsService) {
        this.productsService = productsService;
    }
    async updateProduct(id, updateProductDto, file) {
        let imagePath;
        if (file) {
            imagePath = `/uploads/${file.filename}`;
        }
        const product = await this.productsService.updateImage(id, updateProductDto, imagePath);
        const imageUrl = product.imageUrl
            ? product.imageUrl.startsWith('http')
                ? product.imageUrl + `?t=${Date.now()}`
                : `https://espacioboulevard.com${product.imageUrl}?t=${Date.now()}`
            : 'https://espacioboulevard.com/uploads/default-image.png';
        return {
            ...product,
            imageUrl,
        };
    }
    buscarProductos(nombre, categoriaId, page = '1', limit = '10') {
        return this.productsService.buscarPorNombre(nombre, categoriaId ? parseInt(categoriaId, 10) : undefined, parseInt(page, 10), parseInt(limit, 10));
    }
    async uploadFile(file, name) {
        const fileUrl = `/uploads/${file.filename}`;
        const product = await this.productsService.createProductWithImage(name, fileUrl);
        return {
            message: 'Imagen subida y producto guardado exitosamente',
            product,
        };
    }
    async findAll(page = 1, limit = 10) {
        const validPage = Math.max(1, Number(page) || 1);
        const validLimit = Math.max(1, Number(limit) || 10);
        return this.productsService.findAll(validPage, validLimit);
    }
    findOne(id) {
        return this.productsService.findOne(+id);
    }
    remove(id) {
        return this.productsService.remove(+id);
    }
    async create(createProductDto, file) {
        if (file) {
            createProductDto.imageUrl = `/uploads/${file.filename}`;
        }
        const product = await this.productsService.create(createProductDto);
        return {
            ...product,
            imageUrl: product.imageUrl ? `https://espacioboulevard.com${product.imageUrl}` : null,
        };
    }
    async update(id, updateProductDto) {
        const product = await this.productsService.update(id, updateProductDto);
        return {
            ...product,
            imageUrl: product.imageUrl ? `https://espacioboulevard.com${product.imageUrl}` : null,
        };
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                callback(null, file.fieldname + '-' + uniqueSuffix + (0, path_1.extname)(file.originalname));
            },
        }),
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_dto_1.UpdateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Get)('buscar'),
    __param(0, (0, common_1.Query)('nombre')),
    __param(1, (0, common_1.Query)('categoria')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "buscarProductos", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, callback) => {
                const fileExt = (0, path_1.extname)(file.originalname);
                const filename = `${(0, uuid_1.v4)()}${fileExt}`;
                callback(null, filename);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('find'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('crear'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                callback(null, file.fieldname + '-' + uniqueSuffix + (0, path_1.extname)(file.originalname));
            },
        }),
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('update/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map