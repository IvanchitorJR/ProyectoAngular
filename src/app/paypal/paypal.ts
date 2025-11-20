import { Component, OnInit, Input, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import { NgxPayPalModule } from 'ngx-paypal';
import { Producto } from '../modelos/producto';
import { CarritoService } from '../servicios/carrito';
import { ProductoService } from '../servicios/producto';

@Component({
  selector: 'app-paypal',
  standalone: true,
  imports: [CommonModule, NgxPayPalModule],
  templateUrl: './paypal.html',
  styleUrls: ['./paypal.css']
})
export class Paypal implements OnInit {
  @Input() total: number = 0;      
  @Input() productos: Producto[] = [];

  public payPalConfig?: IPayPalConfig;
  public isBrowser = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, 
    public carritoService: CarritoService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.initConfig();
    }
  }

  private initConfig(): void {
    if (!this.productos.length || !this.total) return;

    const items = this.productos.map(p => ({
      name: p.nombre,
      quantity: String(p.cantidad || 1),
      category: 'PHYSICAL_GOODS',
      unit_amount: {
        currency_code: 'MXN',
        value: (p.precio * 1.16).toFixed(2) 
      }
    }));

    this.payPalConfig = {
      currency: 'MXN',
      clientId: 'AcxeK-Q6ukxO8MY1dev1zfZfz_ZVqaoAYWrwk1iwMUyiEwaSallBYATXkPfQhlMd3cpRJ4LjnmYNXVhl',
      createOrderOnClient: () => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'MXN',
            value: this.total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'MXN',
                value: this.total.toFixed(2)
              }
            }
          },
          items
        }]
      },
      advanced: { commit: 'true' },
      style: { label: 'paypal', layout: 'vertical' },
      onApprove: (data, actions) => {
        actions.order.get().then((details: any) => {
          console.log('Detalles del pago:', details);
        });
      },
      onClientAuthorization: (data: any) => {
        console.log('Pago completado', data);
        // Llamar al backend para decrementar stock
        const items = this.productos.map(p => ({ id: p.id, cantidad: p.cantidad || 1 }));
        this.productoService.decrementStock(items).subscribe({
          next: (resp) => {
            console.log('Respuesta reducción stock:', resp);
            this.carritoService.exportarXML();
            this.carritoService.vaciar();
          },
          error: (err) => {
            console.error('Error al decrementar stock:', err);
            this.carritoService.exportarXML();
            this.carritoService.vaciar();
          }
        });
      },
      onCancel: (data: any, actions: any) => console.log('Cancelado', data, actions),
      onError: (err: any) => console.error('Error PayPal', err),
      onClick: (data: any, actions: any) => console.log('Click', data, actions)
    };
  }
}