import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query, ParseIntPipe, Put, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import { PaginationDto } from './dto/PaginationDto.dto';
import { ProductDto } from './dto/productDTO.dto';
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

@Put(':id')
@UseInterceptors(
  FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }),
)
async updateProduct(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateProductDto: UpdateProductDto,
  @UploadedFile() file?: Express.Multer.File,
) {
  let imagePath: string | undefined;

  if (file) {
    // Guardamos solo la ruta relativa
    imagePath = `/uploads/${file.filename}`;
  }

  const product = await this.productsService.updateImage(id, updateProductDto, imagePath);

  // Evitar errores si no hay imagen
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




 @Get('buscar')
buscarProductos(
  @Query('nombre') nombre?: string,
  @Query('categoria') categoriaId?: string,
  @Query('page') page: string = '1',
  @Query('limit') limit: string = '10',
) {
  return this.productsService.buscarPorNombre(
    nombre,
    categoriaId ? parseInt(categoriaId, 10) : undefined,
    parseInt(page, 10),
    parseInt(limit, 10),
  );
}





  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads', // Carpeta donde se guardarán las imágenes
      filename: (req, file, callback) => {
        const fileExt = extname(file.originalname);
        const filename = `${uuidv4()}${fileExt}`;
        callback(null, filename);
      },
    }),
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string, // Obtener otros campos si es necesario
  ) {
    const fileUrl = `/uploads/${file.filename}`;

    // Guardar el producto junto con la ruta de la imagen en la base de datos
    const product = await this.productsService.createProductWithImage(name, fileUrl);

    return {
      message: 'Imagen subida y producto guardado exitosamente',
      product,
    };
  }
  


  @Get('find')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<PaginationDto<ProductDto>> {
    const validPage = Math.max(1, Number(page) || 1);
    const validLimit = Math.max(1, Number(limit) || 10);
    return this.productsService.findAll(validPage, validLimit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }


 @Post('crear')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async create(@Body() createProductDto: CreateProductDto, @UploadedFile() file: Express.Multer.File) {
    if (file) {
      // Guardar solo ruta relativa
      createProductDto.imageUrl = `/uploads/${file.filename}`;
    }

    const product = await this.productsService.create(createProductDto);

    // Devolver URL completa al frontend
    return {
      ...product,
      imageUrl: product.imageUrl ? `https://espacioboulevard.com${product.imageUrl}` : null,
    };
  }

  @Patch('update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsService.update(id, updateProductDto);

    return {
      ...product,
      imageUrl: product.imageUrl ? `https://espacioboulevard.com${product.imageUrl}` : null,
    };
  }

  


}





