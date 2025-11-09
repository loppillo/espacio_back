import { ThemeService } from './theme.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
export declare class ThemeController {
    private readonly service;
    constructor(service: ThemeService);
    create(dto: CreateThemeDto): Promise<import("./entities/theme.entity").Theme>;
    findAll(): Promise<import("./entities/theme.entity").Theme[]>;
    getDefault(): Promise<import("./entities/theme.entity").Theme>;
    findOne(id: number): Promise<import("./entities/theme.entity").Theme>;
    update(id: number, dto: UpdateThemeDto): Promise<import("./entities/theme.entity").Theme>;
    remove(id: number): Promise<import("./entities/theme.entity").Theme>;
}
