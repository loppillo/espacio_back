import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('role', context.getHandler());
    if (!requiredRoles) return true; // si el endpoint no tiene @Roles, lo deja pasar

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user?.role);
  }
}