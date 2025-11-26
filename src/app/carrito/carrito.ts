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
  totalConIVA = computed(() => this.carritoService.totalConIVA());
  subtotal = computed(() => this.carritoService.total());
  iva = computed(() => this.carritoService.iva());
  
  stockMap: { [key: number]: number } = {};
  errorMessage: string = '';

  constructor() {
    // Cargar stock de todos los productos al inicializar
    this.cargarStock();
  }

  cargarStock() {
    this.productoService.getProductos().subscribe({
      next: (productos) => {
        this.stockMap = {};
        productos.forEach(p => {
          this.stockMap[p.id] = p.cantidad || 0;
        });
      },
      error: (err) => console.error('Error cargando stock:', err)
    });
  }

  quitar(id: number) {
    this.carritoService.quitar(id);
    this.errorMessage = '';
  }

  vaciar() {
    this.carritoService.vaciar();
    this.errorMessage = '';
  }

  exportarXML() {
    this.carritoService.exportarXML();
  }

  cambiarCantidad(id: number, cantidad: string) {
    this.carritoService.actualizarCantidad(id, Number(cantidad));
    this.errorMessage = '';
  }

  incrementarCantidad(producto: any) {
    const stockDisponible = this.stockMap[producto.id] || 0;
    const cantidadActual = producto.cantidad || 1;
    
    if (cantidadActual + 1 > stockDisponible) {
      this.errorMessage = `❌ No hay suficiente stock. Disponible: ${stockDisponible}, solicitado: ${cantidadActual + 1}`;
      return;
    }
    
    this.errorMessage = '';
    this.carritoService.actualizarCantidad(producto.id, cantidadActual + 1);
  }

  decrementarCantidad(producto: any) {
    const cantidadActual = producto.cantidad || 1;
    
    if (cantidadActual <= 1) {
      this.quitar(producto.id);
      return;
    }
    
    this.errorMessage = '';
    this.carritoService.actualizarCantidad(producto.id, cantidadActual - 1);
  }

  trackById(index: number, producto: any): number {
    return producto.id;
  }
}