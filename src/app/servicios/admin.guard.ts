import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AdminGuard - verificando acceso a:', state.url);
    
    if (!this.authService.isAuthenticated()) {
      console.log('AdminGuard - Usuario no autenticado, redirigiendo a login');
      this.router.navigate(['/login']);
      return false;
    }
    
    const user = this.authService.getCurrentUser();
    console.log('AdminGuard - Usuario actual:', user);
    
    // Verificar que tipo sea exactamente 1 para admin
    if (user && user.tipo === 1) {
      console.log('AdminGuard - Usuario es admin, permitiendo acceso');
      return true;
    }
    
    console.log('AdminGuard - Usuario no es admin, redirigiendo a catálogo');
    this.router.navigate(['/catalogo']);
    return false;
  }
}