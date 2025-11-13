import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ClientGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    if (this.authService.isAuthenticated() && this.authService.isClient()) {
      return true;
    }
    
    // Si no es cliente autenticado, redirigir al login
    this.router.navigate(['/login']);
    return false;
  }
}