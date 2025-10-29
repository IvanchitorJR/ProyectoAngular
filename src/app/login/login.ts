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
          this.router.navigateByUrl('/catalogo');
        } else {
          this.error = 'Credenciales inválidas';
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al iniciar sesión';
      }
    });
  }
}
