import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface User {
  id?: number;
  nombre?: string;
  correo: string;
  password: string;
  tipo?: number;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    nombre: string;
    correo: string;
    tipo: number;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:4000/api/auth';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private authState = new BehaviorSubject<boolean>(this.isAuthenticated());

  constructor(private http: HttpClient) {}


  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      catchError(error => {
        console.error('Error en registro:', error);
        return throwError(() => error.error?.message || 'Error al registrar usuario');
      })
    );
  }

  login(correo: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { correo, password }).pipe(
      tap(response => {
        console.log('Respuesta del servidor:', response);
        if (typeof window !== 'undefined') {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          console.log('Usuario guardado:', response.user);
        }
        this.authState.next(true);
      }),
      map(() => true),
      catchError(error => {
        console.error('Error en login:', error);
        return of(false);
      })
    );
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.authState.next(false);
  }

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem(this.tokenKey);
    }
    return false;
  }

  getCurrentUser(): { id?: number; nombre?: string; correo?: string; tipo?: number } | null {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(this.userKey);
      return raw ? JSON.parse(raw) : null;
    }
    return null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    console.log('isAdmin() - Usuario actual:', user);
    const isAdminResult = user?.tipo === 1;
    console.log('isAdmin() - Resultado:', isAdminResult);
    return isAdminResult;
  }

  isClient(): boolean {
    const user = this.getCurrentUser();
    console.log('isClient() - Usuario actual:', user);
    const isClientResult = user?.tipo === 0;
    console.log('isClient() - Resultado:', isClientResult);
    return isClientResult;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  getAuthState(): Observable<boolean> {
    return this.authState.asObservable();
  }
}
