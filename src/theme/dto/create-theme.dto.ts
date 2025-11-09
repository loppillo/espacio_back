import { IsNotEmpty, IsHexColor, IsOptional, IsIn } from 'class-validator';

export class CreateThemeDto {
  @IsNotEmpty()
  name: string;

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
}
