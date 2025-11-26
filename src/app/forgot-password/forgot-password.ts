import { Component, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
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
  private cd = inject(ChangeDetectorRef);
  private resendTimer?: any;
  private loadingWatchdog?: any;

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
    this.cd.detectChanges();

    // Auto-ocultar mensajes después de 5 segundos
    setTimeout(() => {
      if (this.message === text) {
        this.message = '';
        this.cd.detectChanges();
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
      this.cd.detectChanges();
    }, 1000);
  }

  requestToken() {
    if (!this.email || this.isLoading) return;

    this.isLoading = true;
    // watchdog: si la petición queda colgada, desbloquear UI después de 15s
    if (this.loadingWatchdog) clearTimeout(this.loadingWatchdog);
    this.loadingWatchdog = setTimeout(() => {
      if (this.isLoading) {
        console.warn('requestToken watchdog: clearing isLoading');
        this.isLoading = false;
        this.showMessage('La petición tardó demasiado. Intenta de nuevo.', 'error');
        this.cd.detectChanges();
      }
    }, 15000);
    this.message = '';

    this.http.post<any>(this.apiUrl('/api/auth/forgot-password'), { correo: this.email })
      .pipe(finalize(() => {
        console.log('requestToken finalize - isLoading -> false');
        if (this.loadingWatchdog) { clearTimeout(this.loadingWatchdog); this.loadingWatchdog = undefined; }
        this.isLoading = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          // asegurarse de desbloquear UI por si acaso finalize no se ejecuta
          if (this.loadingWatchdog) { clearTimeout(this.loadingWatchdog); this.loadingWatchdog = undefined; }
          this.isLoading = false;
          this.step = 'reset';
          this.showMessage(response.message || 'Código enviado', 'success');
          this.startResendCooldown();
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error:', err);
          // asegurarse de desbloquear UI
          if (this.loadingWatchdog) { clearTimeout(this.loadingWatchdog); this.loadingWatchdog = undefined; }
          this.isLoading = false;
          this.showMessage(err.error?.message || 'Error al enviar código', 'error');
          this.cd.detectChanges();
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
    // watchdog para resetPassword
    if (this.loadingWatchdog) clearTimeout(this.loadingWatchdog);
    this.loadingWatchdog = setTimeout(() => {
      if (this.isLoading) {
        console.warn('resetPassword watchdog: clearing isLoading');
        this.isLoading = false;
        this.showMessage('La petición tardó demasiado. Intenta de nuevo.', 'error');
        this.cd.detectChanges();
      }
    }, 15000);
    this.message = '';

    this.http.post<any>(this.apiUrl('/api/auth/reset-password'), {
      token: this.token,
      newPassword: this.newPassword
    })
      .pipe(finalize(() => {
        console.log('resetPassword finalize - isLoading -> false');
        if (this.loadingWatchdog) { clearTimeout(this.loadingWatchdog); this.loadingWatchdog = undefined; }
        this.isLoading = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: () => {
          // desbloquear UI por si finalize no se ejecuta
          if (this.loadingWatchdog) { clearTimeout(this.loadingWatchdog); this.loadingWatchdog = undefined; }
          this.isLoading = false;
          this.step = 'done';
          this.showMessage('¡Contraseña actualizada exitosamente!', 'success');
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('resetPassword error:', err);
          // desbloquear UI
          if (this.loadingWatchdog) { clearTimeout(this.loadingWatchdog); this.loadingWatchdog = undefined; }
          this.isLoading = false;
          const errorMessage = err.error?.message || 'Error al cambiar la contraseña. Verifica el código.';
          this.showMessage(errorMessage, 'error');
          this.cd.detectChanges();
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
