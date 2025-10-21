import { Routes } from '@angular/router';
import { CatalogoComponent } from './catalogo/catalogo';
import { CarritoComponent } from './carrito/carrito';


export const routes: Routes = [
    {path: 'catalogo', component: CatalogoComponent },
    {path: 'carrito', component: CarritoComponent },
    {path: '', redirectTo: 'catalogo', pathMatch: 'full' }
];