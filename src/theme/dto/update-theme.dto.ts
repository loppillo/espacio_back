import { IsHexColor, IsIn, IsOptional } from 'class-validator';

export class UpdateThemeDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @IsOptional()
  @IsHexColor()
  backgroundColor?: string;

  @IsOptional()
  @IsIn(['light', 'dark'])
  mode?: 'light' | 'dark';

  @IsOptional()
  isDefault?: boolean;
}
