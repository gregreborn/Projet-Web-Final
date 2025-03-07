import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/clients';

  isLoggedInSubject = new BehaviorSubject<boolean>(!!this.getToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private ngZone: NgZone) {
    console.log('✅ AuthService initialized');
  }

  register(userData: { name: string; email: string; password: string , isAdmin?: boolean}): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<{ token: string; user: any }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.handleLogin(response.token, response.user);
      })
    );
  }



  createOrGetClient(name: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-or-get-client`, { name, email }).pipe(
      tap((response: any) => {
        if (response.token && response.user) {
          console.log("✅ Account created, logging in automatically...");
          this.handleLogin(response.token, response.user);
        }
      })
    );
  }

  private handleLogin(token: string, user: any): void {
    if (!user || !token) return; // ✅ Ensure user and token exist

    const existingUser = JSON.parse(localStorage.getItem('user') || 'null');

    if (existingUser && existingUser.id === user.id) {
      console.log("🔹 User already logged in, skipping redundant login process.");
      return; // ✅ Prevent unnecessary re-authentication loop
    }

    this.saveToken(token);
    localStorage.setItem('user', JSON.stringify(user));

    this.ngZone.run(() => {
      this.isLoggedInSubject.next(true);
      window.dispatchEvent(new Event('auth-changed')); // ✅ Notify navbar update
    });

    console.log("✅ User logged in successfully:", user);
  }


  getCurrentUser(): { id: number; name: string; email: string; is_admin: boolean } | null {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.ngZone.run(() => { // ✅ Force UI update on logout
      this.isLoggedInSubject.next(false);
      window.dispatchEvent(new Event('auth-changed'));
    });
  }
}
