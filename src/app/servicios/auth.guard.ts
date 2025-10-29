import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Using functional guard signature available in newer Angular versions
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.parseUrl('/login');
};

// For projects using class-based guards, export one too
@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | import('@angular/router').UrlTree {
    if (this.auth.isAuthenticated()) return true;
    return this.router.parseUrl('/login');
  }
}
