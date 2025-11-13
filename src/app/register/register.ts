import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  auth = inject(AuthService);
  router = inject(Router);

  nombre: string = '';
  correo: string = '';
  password: string = '';
  error: string | null = null;

  submit() {
    this.error = null;
    if (!this.correo || !this.password) {
      this.error = 'Rellena email y contraseña';
      return;
    }

    this.auth.register({ 
      nombre: this.nombre, 
      correo: this.correo, 
      password: this.password 
    }).subscribe({
      next: () => {
        // Después del registro exitoso, intentar hacer login
        this.auth.login(this.correo, this.password).subscribe({
          next: (success) => {
            if (success) {
              // Redirigir según el tipo de usuario
              if (this.auth.isAdmin()) {
                this.router.navigateByUrl('/admpanel');
              } else {
                this.router.navigateByUrl('/catalogo');
              }
            } else {
              this.error = 'Error al iniciar sesión después del registro';
            }
          },
          error: (err) => {
            this.error = err.error?.message || 'Error al iniciar sesión';
          }
        });
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al registrar';
      }
    });
  }
}
