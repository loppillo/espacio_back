import { IsString } from "class-validator";

export class AuthCredentialsDto {
  @IsString()
  name: string;
  @IsString()
  password: string;
}
