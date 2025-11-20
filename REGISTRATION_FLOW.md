# Sistema de Registro Mejorado - Selección de Rol

## 📋 Descripción General

Se ha implementado un sistema de registro mejorado donde los nuevos usuarios pueden elegir su tipo de cuenta durante el registro:

- **👤 Comprador (Cliente)**: Usuarios que solo quieren comprar productos
- **🏪 Administrador (Vendedor)**: Usuarios que quieren gestionar productos e inventario

---

## 🔄 Flujo de Registro

### Paso 1: Acceso a Registro
1. Usuario sin cuenta accede a `http://localhost:4200/register`
2. Se muestra formulario de registro con campos:
   - ✏️ Nombre Completo
   - ✏️ Email
   - ✏️ Contraseña
   - 🎯 **Selección de Tipo de Cuenta** (NUEVO)

### Paso 2: Selección de Cuenta

#### Opción A: Comprador
```
┌─────────────────────────┐
│       👤 Comprador      │
│                         │
│  Compra y gestiona      │
│   tus pedidos           │
└─────────────────────────┘
```
- Acceso a catálogo de productos
- Carrito de compras
- Pagos con PayPal
- Ver historial de pedidos

#### Opción B: Administrador
```
┌─────────────────────────┐
│   🏪 Administrador      │
│                         │
│  Vende y gestiona tu    │
│      inventario         │
└─────────────────────────┘
```
- Agregar productos nuevos
- Editar descripción y cantidad
- Eliminar productos
- Ver estadísticas de ventas (próximo)
- Gestionar inventario

### Paso 3: Registro y Redirección

**Si selecciona "Comprador":**
```
1. Haz clic en "Registrar"
   ↓
2. Se valida en backend (tipo = 0)
   ↓
3. Se crea usuario en BD con tipo = 0
   ↓
4. Login automático
   ↓
5. Redirección a /catalogo 🛍️
```

**Si selecciona "Administrador":**
```
1. Haz clic en "Registrar"
   ↓
2. Se valida en backend (tipo = 1)
   ↓
3. Se crea usuario en BD con tipo = 1
   ↓
4. Login automático
   ↓
5. Redirección a /admpanel 🏢
```

---

## 📝 Cambios Implementados

### Backend (Node.js/Express)

#### 1. **authController.js** - `register` endpoint
```javascript
export const register = async (req, res) => {
    const { nombre, correo, password, tipo } = req.body;
    
    // Validación
    const tipoUsuario = tipo === 1 ? 1 : 0; // 0=cliente, 1=admin
    
    // Crear usuario con tipo
    await User.create({ nombre, correo, password, tipo: tipoUsuario });
    
    res.status(201).json({ message: 'Usuario registrado', tipo: tipoUsuario });
};
```

#### 2. **user.js** - Modelo `create`
```javascript
create: (userData) => {
    const insertTemplate = 'INSERT INTO {table} (nombre, correo, password, tipo) VALUES (?, ?, ?, ?)';
    const params = [userData.nombre, userData.correo, userData.password, userData.tipo ?? 0];
}
```

### Frontend (Angular)

#### 1. **auth.service.ts** - Interface `User`
```typescript
export interface User {
  id?: number;
  nombre?: string;
  correo: string;
  password: string;
  tipo?: number;  // NUEVO: 0=cliente, 1=admin
}
```

#### 2. **register.ts** - Componente
```typescript
export class RegisterComponent {
  nombre: string = '';
  correo: string = '';
  password: string = '';
  tipo: number = 0; // NUEVO: selector de rol
  error: string | null = null;
  loading: boolean = false;

  submit() {
    // Pasar tipo al registro
    this.auth.register({ 
      nombre: this.nombre, 
      correo: this.correo, 
      password: this.password,
      tipo: this.tipo  // NUEVO
    }).subscribe({...});
  }
}
```

#### 3. **register.html** - UI mejorada
```html
<!-- Selección de Rol -->
<div class="role-options">
  <div class="role-card" [class.selected]="tipo === 0" (click)="tipo = 0">
    <div class="role-icon">👤</div>
    <div class="role-title">Comprador</div>
    <div class="role-description">Compra y gestiona tus pedidos</div>
  </div>
  
  <div class="role-card" [class.selected]="tipo === 1" (click)="tipo = 1">
    <div class="role-icon">🏪</div>
    <div class="role-title">Administrador</div>
    <div class="role-description">Vende y gestiona tu inventario</div>
  </div>
</div>
```

#### 4. **register.css** - Estilos mejorados
- Tarjetas interactivas para selección de rol
- Efectos hover y animaciones
- Estado "selected" visual
- Diseño responsivo

---

## 🔑 Lógica de Redirección

### En `register.ts`
```typescript
submit() {
    this.auth.register({ tipo: this.tipo }).subscribe({
        next: () => {
            // Login automático
            this.auth.login(this.correo, this.password).subscribe({
                next: (success) => {
                    if (success) {
                        // Redirigir según tipo
                        if (this.auth.isAdmin()) {
                            this.router.navigateByUrl('/admpanel');  // Admin
                        } else {
                            this.router.navigateByUrl('/catalogo');  // Cliente
                        }
                    }
                }
            });
        }
    });
}
```

---

## 📊 Matriz de Accesos

| Funcionalidad | Comprador | Admin |
|---|---|---|
| Ver catálogo | ✅ | ✅ |
| Agregar al carrito | ✅ | ✅ |
| Comprar (PayPal) | ✅ | ✅ |
| Gestionar productos | ❌ | ✅ |
| Editar inventario | ❌ | ✅ |
| Ver panel admin | ❌ | ✅ |
| Panel gestor de productos | ❌ | ✅ |

---

## 🧪 Cómo Probar

### 1. Arrancar Servidores
```powershell
# Terminal 1: API
cd c:\Users\ivand\OneDrive\Escritorio\PruebasAngular\ProyectoAngular\api
npm start

# Terminal 2: Angular
cd c:\Users\ivand\OneDrive\Escritorio\PruebasAngular\ProyectoAngular
npm start
```

### 2. Prueba 1: Registrarse como Comprador
1. Ve a `http://localhost:4200/register`
2. Rellena el formulario:
   - Nombre: "Juan García"
   - Email: "juan@example.com"
   - Contraseña: "password123"
3. Haz clic en tarjeta **"👤 Comprador"** (debe resaltarse)
4. Haz clic en **"Registrar"**
5. **Resultado esperado**: Redirección automática a `/catalogo`
6. Debería verse el catálogo de productos

### 3. Prueba 2: Registrarse como Administrador
1. Ve a `http://localhost:4200/register`
2. Rellena el formulario:
   - Nombre: "María López"
   - Email: "maria@example.com"
   - Contraseña: "admin123"
3. Haz clic en tarjeta **"🏪 Administrador"** (debe resaltarse)
4. Haz clic en **"Registrar"**
5. **Resultado esperado**: Redirección automática a `/admpanel`
6. Debería verse el panel de bienvenida del administrador
7. Haz clic en **"Ir al Gestor de Productos"** → `/admin`
8. Deberías poder agregar, editar y eliminar productos

### 4. Verificar en BD

```sql
-- Conectar a ecommerce_bd
SELECT id, nombre, correo, tipo FROM usuarios;

-- Resultado esperado:
-- id | nombre | correo | tipo
-- 1  | Juan García | juan@example.com | 0
-- 2  | María López | maria@example.com | 1
```

---

## 🔐 Validaciones

### Frontend
- ✅ Nombre, email y contraseña requeridos
- ✅ Tipo por defecto es 0 (cliente)
- ✅ Tipo solo puede ser 0 o 1
- ✅ Loading state durante registro

### Backend
```javascript
// Validación de entrada
if (!nombre || !correo || !password) {
    return res.status(400).json({ 
        message: 'Nombre, correo y contraseña son requeridos' 
    });
}

// Validación de tipo
const tipoUsuario = tipo === 1 ? 1 : 0;

// Verificar email duplicado
const existingUser = await User.findByEmail(correo);
if (existingUser) {
    return res.status(400).json({ 
        message: 'El correo ya está registrado' 
    });
}
```

---

## 🎨 UI/UX Mejorada

### Características de Diseño
- **Tarjetas Interactivas**: Click en la tarjeta para seleccionar rol
- **Estado Visual**: Tarjeta seleccionada cambia color y sombra
- **Iconos Descriptivos**: 👤 para comprador, 🏪 para admin
- **Descripciones Claras**: Texto explicativo de cada rol
- **Efectos Hover**: Animación al pasar el mouse
- **Botón Unificado**: "Registrar" realiza acción basada en rol seleccionado
- **Mensajes de Error**: Claros y estilizados
- **Estado de Carga**: Desactiva botón durante registro

---

## 📱 Responsividad

- ✅ Diseño adaptado para móviles
- ✅ Tarjetas de rol apiladas en pantallas pequeñas
- ✅ Inputs con padding y bordes claros
- ✅ Botones accesibles en todos los tamaños

---

## 🚀 Próximas Mejoras

1. **Verificación de Email**: Enviar email de confirmación antes de crear cuenta
2. **Política de Privacidad**: Aceptación de términos durante registro
3. **Avatar del Usuario**: Seleccionar avatar durante registro
4. **2FA (Autenticación de dos factores)**: Para cuentas admin
5. **Logs de Auditoría**: Registrar quién y cuándo se registró
6. **Roles Específicos**: Más opciones (vendedor, gerente, etc.)

---

## 📞 Soporte

Si tienes problemas:

1. **Error "El correo ya está registrado"**
   - Usa un email diferente o limpia la tabla `usuarios` en la BD

2. **No redirige después del registro**
   - Abre la consola (F12) y revisa errores de red
   - Verifica que el servidor API está corriendo

3. **Tipo no se guarda en BD**
   - Comprueba que la tabla `usuarios` tiene columna `tipo`
   - Verifica `api/models/user.js` incluye `tipo` en INSERT

---

¡Sistema de registro mejorado listo! 🎉
