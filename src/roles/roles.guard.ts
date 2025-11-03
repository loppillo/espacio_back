import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // cargado por JwtAuthGuard

    const path = request.route.path; // ruta actual
    const method = request.method;

    // ejemplo simple: bloquea /admin si no es admin
    if (path.startsWith('/admin') && user?.role !== 'admin') {
      return false;
    }

    // bloquea /garzon si no es garzon o admin
    if (path.startsWith('/garzon') && !['garzon', 'admin'].includes(user?.role)) {
      return false;
    }

    // el resto de rutas son accesibles
    return true;
  }
}