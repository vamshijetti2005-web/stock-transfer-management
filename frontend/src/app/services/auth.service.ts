import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, AuthPayload, AuthUser } from '../models/api.models';

const TOKEN_KEY = 'stm_token';
const USER_KEY = 'stm_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  readonly currentUser = signal<AuthUser | null>(this.readUser());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return Boolean(this.token);
  }

  login(email: string, password: string): Observable<AuthPayload> {
    return this.http
      .post<ApiResponse<AuthPayload>>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        map((res) => res.data),
        tap((data) => this.persistSession(data))
      );
  }

  register(name: string, email: string, password: string): Observable<AuthPayload> {
    return this.http
      .post<ApiResponse<AuthPayload>>(`${this.baseUrl}/register`, {
        name,
        email,
        password,
      })
      .pipe(
        map((res) => res.data),
        tap((data) => this.persistSession(data))
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigateByUrl('/login');
  }

  private persistSession(data: AuthPayload): void {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    this.currentUser.set(data.user);
  }

  private readUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
