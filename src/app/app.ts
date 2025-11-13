import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CatalogoComponent } from './catalogo/catalogo';
import { CarritoComponent } from './carrito/carrito';
import { CommonModule } from '@angular/common';
import { AuthService } from './servicios/auth.service';

@Component({
  selector: 'app-root',
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('ProyectoAngular');
  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // Escuchar cambios en el estado de autenticación
    this.auth.getAuthState().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        // Si se autentica, redirigir según el tipo de usuario
        setTimeout(() => {
          const user = this.auth.getCurrentUser();
          console.log('App - Usuario autenticado:', user);
          
          if (user && this.router.url === '/login') {
            if (user.tipo === 1) {
              console.log('App - Redirigiendo admin a admpanel');
              this.router.navigate(['/admpanel']);
            } else if (user.tipo === 0) {
              console.log('App - Redirigiendo cliente a catalogo');
              this.router.navigate(['/catalogo']);
            }
          }
        }, 300);
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isClient(): boolean {
    return this.auth.isClient();
  }

  getCurrentUser() {
    return this.auth.getCurrentUser();
  }
}