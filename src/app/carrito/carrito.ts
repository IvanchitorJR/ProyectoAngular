import { Component, computed, inject } from '@angular/core';
import { CarritoService } from '../servicios/carrito';
import { ProductoService } from '../servicios/producto';
import { CurrencyPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, CommonModule],
  templateUrl: './carrito.html',
})
export class CarritoComponent {
  private carritoService = inject(CarritoService);
  private productoService = inject(ProductoService);

  carrito = this.carritoService.productos;
  total = computed(() => this.carritoService.total());

  quitar(id: number) {
    this.carritoService.quitar(id);
  }

  vaciar() {
    this.carritoService.vaciar();
  }

  exportarXML() {
    this.carritoService.exportarXML();
  }

  trackById(index: number, producto: any): number {
    return producto.id;
  }
}