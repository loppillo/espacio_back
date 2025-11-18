import { ThemeService } from './theme.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { Theme } from './entities/theme.entity';
export declare class ThemeController {
    private readonly service;
    constructor(service: ThemeService);
    findAll(): Promise<Theme[]>;
    findDefault(): Promise<Theme>;
    findOne(id: number): Promise<Theme>;
    create(body: CreateThemeDto): Promise<Theme>;
    update(id: number, body: UpdateThemeDto): Promise<Theme>;
    activate(id: number): Promise<Theme>;
    uploadBackground(id: number, file: Express.Multer.File): Promise<Theme>;
}
