import { IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  full_name: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  profileImage: string;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  tipo_usuario: string;
}