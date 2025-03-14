import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/clients'; // URL de l'API pour les clients

  // Observable pour suivre l'état de connexion de l'utilisateur
  isLoggedInSubject = new BehaviorSubject<boolean>(!!this.getToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private ngZone: NgZone) {
    console.log('✅ AuthService initialized');
    // Récupère initialement le token CSRF nécessaire aux futures requêtes sécurisées
    this.fetchCsrfToken().subscribe({
      next: () => console.log('✅ CSRF token fetched'),
      error: (err) => console.error('❌ Error fetching CSRF token:', err)
    });
  }

  // Récupère le token CSRF pour les requêtes sécurisées
  fetchCsrfToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/csrf-token`, { withCredentials: true });
  }

  // Inscription d'un nouvel utilisateur
  register(userData: { name: string; email: string; password: string; isAdmin?: boolean }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData, { withCredentials: true });
  }

  // Connexion de l'utilisateur
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<{ token: string; user: any }>(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap(response => {
        this.handleLogin(response.token, response.user);
      })
    );
  }

  // Gère la connexion utilisateur et le stockage de la session
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

  // Obtient l'utilisateur actuellement connecté
  getCurrentUser(): { id: number; name: string; email: string; is_admin: boolean } | null {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  // sauvegarde le token depuis le stockage local
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Récupère le token depuis le stockage local
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Déconnecte l'utilisateur et supprime la session
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
