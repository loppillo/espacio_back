import { AuthService } from './auth.service';
import { AuthCredentialsDto } from '../dto/AuthCredentialsDto.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: AuthCredentialsDto): Promise<{
        access_token: string;
        role: any;
    } | {
        message: string;
    }>;
    register(dto: CreateUserDto): Promise<import("../../users/entities/user.entity").User>;
}
