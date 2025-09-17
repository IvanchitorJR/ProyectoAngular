import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Producto } from '../modelos/producto';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private xmlUrl = 'assets/catalogoProductos.xml';

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
  }
}