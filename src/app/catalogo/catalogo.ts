import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Producto } from '../modelos/producto';
import { ProductoService } from '../servicios/producto';
import { CarritoService } from '../servicios/carrito';
import { CarritoComponent } from '../carrito/carrito';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.css'],
  imports: [CommonModule, CarritoComponent],
})
export class CatalogoComponent implements OnInit {
  private carritoService = inject(CarritoService);
  private productoService = inject(ProductoService);
  private cdr = inject(ChangeDetectorRef);

  productos: Producto[] = [];
  loading: boolean = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productoService.getProductos().subscribe({
      next: (productos: Producto[]) => {
        this.productos = productos;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Error al cargar los productos';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading products:', error);
      }
    });
  }

  agregar(producto: Producto) {
    this.carritoService.agregar(producto);
  }
}