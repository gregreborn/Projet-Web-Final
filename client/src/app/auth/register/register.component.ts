import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Vérification de l'état entrant
    const state = history.state;
    console.log('État entrant :', state);
  }

  register(): void {
    // Vérifie que tous les champs sont remplis
    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Tous les champs sont requis !';
      return;
    }

    // Enregistrement via AuthService
    this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        // Connexion automatique après l'inscription réussie
        this.authService.login({ email: this.email, password: this.password }).subscribe({
          next: (response) => {
            this.authService.saveToken(response.token);

            const state = history.state;

            // Redirection vers le formulaire de réservation si des données existent
            if (state && state.reservation) {
              this.router.navigate(['/reservations/form'], { state: { reservation: state.reservation } });
            } else {
              this.router.navigate(['/dashboard']);
            }
          },
          error: (err) => {
            console.error('Échec de la connexion automatique :', err);
            this.errorMessage = 'Connexion automatique échouée. Veuillez vous connecter manuellement.';
          }
        });
      },
      error: (err) => {
        console.error('Échec de l’inscription :', err);
        this.errorMessage = err.error?.error || 'Une erreur est survenue. Veuillez réessayer.';
      }
    });
  }
}
