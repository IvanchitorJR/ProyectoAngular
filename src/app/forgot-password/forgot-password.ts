import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  private http = inject(HttpClient);

  email = '';
  token = '';
  newPassword = '';
  step: 'request' | 'reset' | 'done' = 'request';
  message = '';

  // Build API URL for local development
  private apiUrl(path: string) {
    try {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        return `http://localhost:4000${path}`;
      }
    } catch (e) {
      // ignore
    }
    return path;
  }

  requestToken() {
    this.http.post<any>(this.apiUrl('/api/auth/forgot-password'), { correo: this.email })
      .subscribe({
        next: () => {
          // No mostrar token en UI por seguridad. El usuario debe recibirlo por correo.
          this.step = 'reset';
          this.message = 'Se ha generado un token y se ha enviado al correo. Introduce el token recibido para continuar.';
        },
        error: err => {
          this.message = err.error?.message || 'Error al solicitar token';
        }
      });
  }

  resetPassword() {
    this.http.post<any>(this.apiUrl('/api/auth/reset-password'), { token: this.token, newPassword: this.newPassword })
      .subscribe({
        next: () => {
          this.step = 'done';
          this.message = 'Contraseña actualizada correctamente.';
        },
        error: err => {
          this.message = err.error?.message || 'Error al resetear contraseña';
        }
      });
  }
}
