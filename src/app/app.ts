import { Component, signal, inject, OnInit } from '@angular/core';
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
    // Verificar si el usuario ya está autenticado al cargar la app
    if (this.auth.isAuthenticated()) {
      const user = this.auth.getCurrentUser();
      if (user) {
        // Solo redirigir si estamos en la página de login o en la raíz
        const currentUrl = this.router.url;
        if (currentUrl === '/login' || currentUrl === '/') {
          if (user.tipo === 1) {
            this.router.navigate(['/admpanel']);
          } else if (user.tipo === 0) {
            this.router.navigate(['/catalogo']);
          }
        }
      }
    }
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