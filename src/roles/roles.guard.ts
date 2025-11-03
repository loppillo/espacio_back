import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
  const request = context.switchToHttp().getRequest();
  const user = request.user;
  if (!user) return false; // nadie logeado no entra

  // Admin solo /admin
  if (request.route.path.startsWith('/admin') && user.role !== 'admin') return false;

  // Garzon o admin solo /garzon
  if (request.route.path.startsWith('/garzon') && !['garzon', 'admin'].includes(user.role)) return false;

  return true;
}
}