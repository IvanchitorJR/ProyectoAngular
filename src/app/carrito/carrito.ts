import { Component, computed, inject } from '@angular/core';
import { CarritoService } from '../servicios/carrito';
import { ProductoService } from '../servicios/producto';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { Paypal } from '../paypal/paypal';
@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, CommonModule, Paypal],
  templateUrl: './car.html',
  styleUrls: ['./car.css']
})
export class CarritoComponent {
  private carritoService = inject(CarritoService);
  private productoService = inject(ProductoService);

  mostrarPaypal = false;
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

  cambiarCantidad(id: number, cantidad: string) {
    this.carritoService.actualizarCantidad(id, Number(cantidad));
  }

  trackById(index: number, producto: any): number {
    return producto.id;
  }
}