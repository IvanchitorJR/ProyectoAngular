import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CatalogoComponent } from './catalogo/catalogo';
import { CarritoComponent } from './carrito/carrito';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CatalogoComponent, RouterLink, ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('ProyectoAngular');
}