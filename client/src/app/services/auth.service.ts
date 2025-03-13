import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/clients'; // Use proxy for API

  isLoggedInSubject = new BehaviorSubject<boolean>(!!this.getToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private ngZone: NgZone) {
    console.log('✅ AuthService initialized');
    // Make an initial GET request to fetch CSRF token and set the cookie
    this.fetchCsrfToken().subscribe({
      next: () => console.log('✅ CSRF token fetched'),
      error: (err) => console.error('❌ Error fetching CSRF token:', err)
    });
  }

  /**
   * Fetch the CSRF token to ensure the cookie is set.
   * (Your backend should have an endpoint like `/api/clients/csrf-token`.)
   */
  fetchCsrfToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/csrf-token`, { withCredentials: true });
  }

  // Register a new user
  register(userData: { name: string; email: string; password: string; isAdmin?: boolean }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData, { withCredentials: true });
  }

  // Login the user
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<{ token: string; user: any }>(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap(response => {
        this.handleLogin(response.token, response.user);
      })
    );
  }

  // Automatically create or get client
  createOrGetClient(name: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-or-get-client`, { name, email }, { withCredentials: true }).pipe(
      tap((response: any) => {
        if (response.token && response.user) {
          console.log("✅ Account created, logging in automatically...");
          this.handleLogin(response.token, response.user);
        }
      })
    );
  }

  // Handle user login and session storage
  private handleLogin(token: string, user: any): void {
    if (!user || !token) return;

    const existingUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (existingUser && existingUser.id === user.id) {
      console.log("🔹 User already logged in, skipping redundant login process.");
      return;
    }

    this.saveToken(token);
    localStorage.setItem('user', JSON.stringify(user));

    this.ngZone.run(() => {
      this.isLoggedInSubject.next(true);
      window.dispatchEvent(new Event('auth-changed')); // Notify UI components
    });

    console.log("✅ User logged in successfully:", user);
  }

  // Get current user details from local storage
  getCurrentUser(): { id: number; name: string; email: string; is_admin: boolean } | null {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  // Save the authentication token
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Retrieve the token from local storage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Logout and clear session
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.ngZone.run(() => {
      this.isLoggedInSubject.next(false);
      window.dispatchEvent(new Event('auth-changed')); // Notify UI components
    });

    console.log("🚪 User logged out successfully.");
  }
}
