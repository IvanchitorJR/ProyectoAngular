import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);

  correo: string = '';
  password: string = '';
  error: string | null = null;

  submit() {
    this.error = null;
    if (!this.correo || !this.password) {
      this.error = 'Rellena email y contraseña';
      return;
    }

    this.auth.login(this.correo, this.password).subscribe({
      next: (success) => {
        if (success) {
          console.log('Login exitoso, verificando tipo de usuario...');
          
          // Usar un timeout más largo y verificar múltiples veces si es necesario
          setTimeout(() => {
            const user = this.auth.getCurrentUser();
            console.log('Usuario después del login:', user);
            
            if (user && user.tipo !== undefined) {
              // Redirigir según el tipo de usuario
              if (user.tipo === 1) {
                console.log('Usuario es administrador, redirigiendo a admpanel');
                this.router.navigate(['/admpanel']).then(success => {
                  console.log('Navegación a admpanel:', success);
                });
              } else if (user.tipo === 0) {
                console.log('Usuario es cliente, redirigiendo a catálogo');
                this.router.navigate(['/catalogo']).then(success => {
                  console.log('Navegación a catálogo:', success);
                });
              } else {
                console.log('Tipo de usuario desconocido:', user.tipo);
                this.error = 'Tipo de usuario no válido';
              }
            } else {
              console.log('No se pudo obtener información del usuario');
              this.error = 'Error al obtener información del usuario';
            }
          }, 200);
        } else {
          this.error = 'Credenciales inválidas';
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.error = err.error?.message || 'Error al iniciar sesión';
      }
    });
  }
}
