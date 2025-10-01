import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
export declare class AuthService {
    private userService;
    private jwtService;
    constructor(userService: UsersService, jwtService: JwtService);
    validateUser(username: string, password: string): Promise<{
        id: number;
        name: string;
        profileImage: string;
        role: string;
        order: import("../../orders/entities/order.entity").Order[];
    }>;
    login(user: any): Promise<{
        access_token: string;
        role: any;
    }>;
    register(dto: CreateUserDto): Promise<import("../../users/entities/user.entity").User>;
}
