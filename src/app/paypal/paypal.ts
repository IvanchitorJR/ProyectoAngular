import {
  Component,
  OnInit,
  Input
} from '@angular/core';
import {
  IPayPalConfig,
  ICreateOrderRequest
} from 'ngx-paypal';

import { NgxPayPalModule } from 'ngx-paypal';
import { Producto } from '../modelos/producto';

@Component({
  selector: 'app-paypal',
  imports: [NgxPayPalModule],
  templateUrl: './paypal.html',
  styleUrl: './paypal.css'
})
export class Paypal implements OnInit {
  @Input() total: number = 0;
  @Input() productos: Producto[] = [];
  public payPalConfig?: IPayPalConfig;


  ngOnInit(): void {
    this.initConfig();
  }

  private initConfig(): void {

    const items = this.productos.map(p => ({
      name: p.nombre,
      quantity: String(p.cantidad || 1),
      category: 'PHYSICAL_GOODS',
      unit_amount: {
        currency_code: 'EUR',
        value: String(p.precio)
      }
    }));

    const total = this.productos.reduce((acc, p) => acc + (p.precio * (p.cantidad || 1)), 0);


    this.payPalConfig = {
      currency: 'EUR',
      clientId: 'AcxeK-Q6ukxO8MY1dev1zfZfz_ZVqaoAYWrwk1iwMUyiEwaSallBYATXkPfQhlMd3cpRJ4LjnmYNXVhl',
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'EUR',
            value: String(total),
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: String(total)
              }
            }
          },
          items
          
        }]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {
        console.log('onApprove - transaction was approved, but not authorized', data, actions);
        actions.order.get().then((details: any) => {
          console.log('onApprove - you can get full order details inside onApprove: ', details);
        });

      },
      onClientAuthorization: (data) => {
        console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);

      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);


      },
      onError: err => {
        console.log('OnError', err);

      },
      onClick: (data, actions) => {
        console.log('onClick', data, actions);

      }
    };
  }
}
