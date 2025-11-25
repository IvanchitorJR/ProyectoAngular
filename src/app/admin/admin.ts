import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../servicios/auth.service';
import { Router } from '@angular/router';
import { ProductoService } from '../servicios/producto';
import { Producto } from '../modelos/producto';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private productoService = inject(ProductoService);
  
  usuario: any = null;
  productos: Producto[] = [];
  nuevo: Partial<Producto> = { nombre: '', precio: 0, imagen: '', descripcion: '', cantidad: 0 };
  editingId: number | null = null;

  ngOnInit() {
    // Obtener información del usuario desde el servicio de autenticación
    this.usuario = this.authService.getCurrentUser();
    
    // Verificar que sea administrador, si no, redirigir
    if (!this.usuario || this.usuario.tipo !== 1) {
      this.router.navigate(['/catalogo']);
      return;
    }
    this.loadProductos();
  }

  loadProductos() {
    this.productoService.getProductos().subscribe({
      next: (p) => this.productos = p,
      error: (err) => console.error('Error cargando productos para admin:', err)
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  addProducto() {
    if (!this.nuevo.nombre || this.nuevo.precio == null) {
      alert('El nombre y precio son requeridos');
      return;
    }
    const payload = {
      nombre: this.nuevo.nombre,
      precio: this.nuevo.precio,
      imagen: this.nuevo.imagen || '',
      descripcion: this.nuevo.descripcion || '',
      cantidad: this.nuevo.cantidad || 0
    };
    this.productoService.addProducto(payload).subscribe({
      next: () => {
        alert('Producto agregado correctamente');
        this.nuevo = { nombre: '', precio: 0, imagen: '', descripcion: '', cantidad: 0 };
        this.loadProductos();
      },
      error: (err) => {
        console.error('Error añadiendo producto:', err);
        alert('Error al agregar producto');
      }
    });
  }

  startEdit(p: Producto) {
    this.editingId = p.id;
  }

  saveEdit(p: Producto) {
    const data: any = {};
    if (p.descripcion !== undefined) data.descripcion = p.descripcion;
    if (p.cantidad !== undefined) data.cantidad = p.cantidad;

    this.productoService.updateProducto(p.id, data).subscribe({
      next: () => {
        alert('Producto actualizado correctamente');
        this.editingId = null;
        this.loadProductos();
      },
      error: (err) => {
        console.error('Error actualizando producto:', err);
        alert('Error al actualizar producto');
      }
    });
  }

  cancelarEdit() {
    this.editingId = null;
    this.loadProductos();
  }

  eliminar(id: number) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    this.productoService.deleteProducto(id).subscribe({
      next: () => {
        alert('Producto eliminado correctamente');
        this.loadProductos();
      },
      error: (err) => {
        console.error('Error eliminando producto:', err);
        alert('Error al eliminar producto');
      }
    });
  }

  // Incrementar cantidad en 1
  incrementar(p: Producto) {
    const nueva = (p.cantidad ?? 0) + 1;
    this.productoService.updateProducto(p.id, { cantidad: nueva }).subscribe({
      next: () => this.loadProductos(),
      error: (err) => {
        console.error('Error incrementando stock:', err);
        alert('Error al incrementar stock');
      }
    });
  }

  // Decrementar cantidad en 1 (no permite negativo)
  decrementar(p: Producto) {
    const actual = (p.cantidad ?? 0);
    if (actual <= 0) return;
    const nueva = actual - 1;
    this.productoService.updateProducto(p.id, { cantidad: nueva }).subscribe({
      next: () => this.loadProductos(),
      error: (err) => {
        console.error('Error decrementando stock:', err);
        alert('Error al decrementar stock');
      }
    });
  }
}