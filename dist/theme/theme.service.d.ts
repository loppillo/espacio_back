import { Repository } from 'typeorm';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { Theme } from './entities/theme.entity';
export declare class ThemeService {
    private repo;
    constructor(repo: Repository<Theme>);
    create(dto: CreateThemeDto): Promise<Theme>;
    findAll(): Promise<Theme[]>;
    findOne(id: number): Promise<Theme>;
    update(id: number, dto: UpdateThemeDto): Promise<Theme>;
    remove(id: number): Promise<Theme>;
    getDefaultPreset(): Promise<Theme>;
}
