import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class RolesGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
