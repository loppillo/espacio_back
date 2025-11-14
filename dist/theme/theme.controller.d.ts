import { ThemeService } from './theme.service';
import { Theme } from './entities/theme.entity';
export declare class ThemeController {
    private readonly service;
    constructor(service: ThemeService);
    findAll(): Promise<Theme[]>;
    findDefault(): Promise<Theme>;
    findOne(id: number): Promise<Theme>;
    create(body: Partial<Theme>): Promise<Theme>;
    update(id: number, body: Partial<Theme>): Promise<Theme>;
    activate(id: number): Promise<Theme>;
    uploadBackground(id: number, file: Express.Multer.File): Promise<Theme>;
}
