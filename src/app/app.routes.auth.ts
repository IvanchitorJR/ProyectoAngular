import { Routes } from '@angular/router';
import { CatalogoComponent } from './catalogo/catalogo';
import { CarritoComponent } from './carrito/carrito';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { authGuard } from './servicios/auth.guard';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'catalogo', component: CatalogoComponent, canActivate: [authGuard] },
    { path: 'carrito', component: CarritoComponent, canActivate: [authGuard] },
    { path: '', redirectTo: 'catalogo', pathMatch: 'full' }
];