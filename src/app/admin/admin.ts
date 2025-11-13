import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../servicios/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  usuario: any = null;

  ngOnInit() {
    // Obtener información del usuario desde el servicio de autenticación
    this.usuario = this.authService.getCurrentUser();
    
    // Verificar que sea administrador, si no, redirigir
    if (!this.usuario || this.usuario.tipo !== 1) {
      this.router.navigate(['/catalogo']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}