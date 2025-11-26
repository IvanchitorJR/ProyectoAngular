import { Injectable, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Producto } from '../modelos/producto';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private productosSignal = signal<Producto[]>([]);
  productos = this.productosSignal.asReadonly();

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const guardado = localStorage.getItem('carrito');
      
      if (guardado) {
        this.productosSignal.set(JSON.parse(guardado));
      }

      effect(() => {
        const productos = this.productosSignal();
        localStorage.setItem('carrito', JSON.stringify(productos));
      });
    }
  }

  agregar(producto: any) {
    const productosActuales = this.productos();
    const existente = productosActuales.find(p => p.id === producto.id);

    if (existente) {
      existente.cantidad = (existente.cantidad || 1) + 1;
      this.productosSignal.set([...productosActuales]);
    } 
    else {
      this.productosSignal.set([...productosActuales, { ...producto, cantidad: 1 }]);
    }
  }

  actualizarCantidad(id: number, cantidad: number) {
    this.productosSignal.update(arr =>
      arr.map(p => p.id === id ? { ...p, cantidad } : p)
    );
  }

  quitar(id: number) {
    this.productosSignal.update(lista =>
      lista.filter(p => p.id !== id)
    );
  }

  vaciar() {
    this.productosSignal.set([]);
    if (this.isBrowser) {
      localStorage.removeItem('carrito');
    }
  }

  total(): number {
    return this.productosSignal().reduce((acc, p) => acc + (p.precio * (p.cantidad || 1)), 0);
  }

  totalConIVA(): number {
    return this.total() * 1.16;
  }

  iva(): number {
    return this.total() * 0.16;
  }

  exportarXML() {
    const productos = this.productosSignal();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;

    for (const p of productos) {
      xml += `  <producto>\n`;
      xml += `    <id>${p.id}</id>\n`;
      xml += `    <nombre>${p.nombre}</nombre>\n`;
      xml += `    <precio>${p.precio}</precio>\n`;
      xml += `    <cantidad>${p.cantidad || 1}</cantidad>\n`;
      xml += `    <subtotal>${p.precio * (p.cantidad || 1)}</subtotal>\n`;
      if (p.descripcion) {
        xml += `    <descripcion>${p.descripcion}</descripcion>\n`;
      }
      xml += `  </producto>\n`;
    }

    const subtotal = this.total();
    const iva = this.iva();
    const totalConIVA = this.totalConIVA();

    xml += `  <subtotal>${subtotal.toFixed(2)}</subtotal>\n`;
    xml += `  <iva>${iva.toFixed(2)}</iva>\n`;
    xml += `  <totalConIVA>${totalConIVA.toFixed(2)}</totalConIVA>\n`;
    xml += `</recibo>`;

    if (this.isBrowser) {
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recibo.xml';
      a.click();
      URL.revokeObjectURL(url);
    }
  }
}