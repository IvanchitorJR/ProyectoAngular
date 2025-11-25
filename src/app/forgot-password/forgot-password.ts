import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent implements OnDestroy {
  private http = inject(HttpClient);
  private resendTimer?: any;

  // Datos del formulario
  email = '';
  token = '';
  newPassword = '';
  confirmPassword = '';

  // Estado de la aplicación
  step: 'request' | 'reset' | 'done' = 'request';
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' | 'info' = 'info';

  // Control de reenvío
  resendCooldown = 0;

  // Iconos para mensajes
  get messageIcon() {
    switch (this.messageType) {
      case 'success': return 'icon-check';
      case 'error': return 'icon-alert';
      default: return 'icon-info';
    }
  }

  ngOnDestroy() {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
  }

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

  private showMessage(text: string, type: 'success' | 'error' | 'info' = 'info') {
    this.message = text;
    this.messageType = type;

    // Auto-ocultar mensajes después de 5 segundos
    setTimeout(() => {
      if (this.message === text) {
        this.message = '';
      }
    }, 5000);
  }

  private startResendCooldown() {
    this.resendCooldown = 60; // 60 segundos
    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendTimer);
        this.resendTimer = undefined;
      }
    }, 1000);
  }

  requestToken() {
    if (!this.email || this.isLoading) return;

    this.isLoading = true;
    this.message = '';

    this.http.post<any>(this.apiUrl('/api/auth/forgot-password'), { correo: this.email })
      .subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response); 
          this.isLoading = false;
          this.step = 'reset'; 
          this.showMessage(response.message || 'Código enviado', 'success');
          this.startResendCooldown();
        },
        error: (err) => {
          console.error('Error:', err); 
          this.isLoading = false;
          this.showMessage(err.error?.message || 'Error al enviar código', 'error');
        }
      });
  }

  resetPassword() {
    if (!this.token || !this.newPassword || !this.confirmPassword || this.isLoading) return;

    if (this.newPassword !== this.confirmPassword) {
      this.showMessage('Las contraseñas no coinciden', 'error');
      return;
    }

    this.isLoading = true;
    this.message = '';

    this.http.post<any>(this.apiUrl('/api/auth/reset-password'), {
      token: this.token,
      newPassword: this.newPassword
    })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.step = 'done';
          this.showMessage('¡Contraseña actualizada exitosamente!', 'success');
        },
        error: (err) => {
          this.isLoading = false;
          const errorMessage = err.error?.message || 'Error al cambiar la contraseña. Verifica el código.';
          this.showMessage(errorMessage, 'error');
        }
      });
  }

  resendCode() {
    if (this.resendCooldown > 0) return;

    this.requestToken();
  }

  goBackToRequest() {
    this.step = 'request';
    this.token = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.message = '';

    if (this.resendTimer) {
      clearInterval(this.resendTimer);
      this.resendTimer = undefined;
      this.resendCooldown = 0;
    }
  }
}
