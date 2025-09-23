import { IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  profileImage: string;
  
  @IsString()
  role: string;
  

   @IsOptional()
  @IsString()
  tipo_usuario: string;

}
