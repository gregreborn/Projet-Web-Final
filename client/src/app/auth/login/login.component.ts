import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    // Vérifie si l'email et le mot de passe sont renseignés
    if (!this.email || !this.password) {
      this.errorMessage = 'Email et mot de passe requis !';
      return;
    }

    // Tentative de connexion via AuthService
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);

        const state = history.state;

        // Si des données de réservation existent, redirige vers le formulaire de réservation
        if (state && state.reservation) {
          this.router.navigate(['/reservations/form'], { state: { reservation: state.reservation } });
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Échec de la connexion :', err);
        this.errorMessage = err.error?.error || 'Email ou mot de passe invalide';
      }
    });
  }

  protected readonly history = history;
}
