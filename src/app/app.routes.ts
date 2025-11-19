import { Routes } from '@angular/router';
import { CatalogoComponent } from './catalogo/catalogo';
import { CarritoComponent } from './carrito/carrito';
import { AdminComponent } from './admin/admin';
import { AdmpanelComponent } from './admpanel/admpanel';
import { AdminGuard } from './servicios/admin.guard';
import { ClientGuard } from './servicios/client.guard';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';


export const routes: Routes = [
    {path: 'login', component: LoginComponent },
    {path: 'register', component: RegisterComponent },
    {path: 'catalogo', component: CatalogoComponent },
    {path: 'carrito', component: CarritoComponent },
    {path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
    {path: 'admpanel', component: AdmpanelComponent, canActivate: [AdminGuard] },
    {path: '', redirectTo: 'login', pathMatch: 'full' }
];