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
  tipo: number = 0; // 0 = cliente, 1 = administrador
  error: string | null = null;
  loading: boolean = false;

  submit() {
    this.error = null;
    this.loading = true;
    if (!this.nombre || !this.correo || !this.password) {
      this.error = 'Rellena nombre, email y contraseña';
      this.loading = false;
      return;
    }

    this.auth.register({ 
      nombre: this.nombre, 
      correo: this.correo, 
      password: this.password,
      tipo: this.tipo
    }).subscribe({
      next: () => {
        // Después del registro exitoso, intentar hacer login
        this.auth.login(this.correo, this.password).subscribe({
          next: (success) => {
            this.loading = false;
            if (success) {
              // Redirigir según el tipo de usuario que seleccionó (más confiable)
              if (this.tipo === 1) {
                this.router.navigate(['/admpanel']);
              } else {
                this.router.navigate(['/catalogo']);
              }
            } else {
              this.error = 'Error al iniciar sesión después del registro';
            }
          },
          error: (err) => {
            this.loading = false;
            this.error = err.error?.message || 'Error al iniciar sesión';
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al registrar';
      }
    });
  }
}
