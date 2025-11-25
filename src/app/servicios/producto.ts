import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Producto } from '../modelos/producto';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl = 'http://localhost:4000/api';
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  constructor() { }

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
  }

  // Admin: agregar producto
  addProducto(product: Partial<Producto>): Observable<any> {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.post(`${this.apiUrl}/productos`, product, { headers });
  }

  // Admin: eliminar producto
  deleteProducto(id: number): Observable<any> {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.delete(`${this.apiUrl}/productos/${id}`, { headers });
  }

  // Admin: actualizar producto (descripcion / cantidad)
  updateProducto(id: number, data: { descripcion?: string; cantidad?: number }): Observable<any> {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.put(`${this.apiUrl}/productos/${id}`, data, { headers });
  }

  // Decrementar stock tras compra
  decrementStock(items: { id: number; cantidad: number }[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/productos/reducir-stock`, { items });
  }

  /*private xmlUrl = 'assets/catalogoProductos.xml';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  getProductos(): Observable<Producto[]> {
    return this.http.get(this.xmlUrl, { responseType: 'text' }).pipe(
      map((xmlString) => {
        if (isPlatformBrowser(this.platformId)) {
          return this.parseXML(xmlString);
        } else {
          return [];
        }
      })
    );
  }

  private parseXML(xmlString: string): Producto[] {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, 'application/xml');
    const productos: Producto[] = [];
    const nodes = xml.getElementsByTagName('producto');

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      productos.push({
        id: Number(node.getElementsByTagName('id')[0].textContent),
        nombre: node.getElementsByTagName('nombre')[0].textContent || '',
        precio: Number(node.getElementsByTagName('precio')[0].textContent),
        imagen: node.getElementsByTagName('imagen')[0].textContent || '',
        descripcion: node.getElementsByTagName('descripcion')[0].textContent || ''
      });
    }

    return productos;
  }*/
}