import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
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
    const state = history.state;
    console.log('Incoming State:', state);
  }

  register(): void {
    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'All fields are required!';
      return;
    }

    this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        // Automatically log in after registration
        this.authService.login({ email: this.email, password: this.password }).subscribe({
          next: (response) => {
            this.authService.saveToken(response.token);

            const state = history.state;

            // Redirect to reservation form if reservation data exists
            if (state && state.reservation) {
              this.router.navigate(['/reservations/form'], { state: { reservation: state.reservation } });
            } else {
              this.router.navigate(['/dashboard']);
            }
          },
          error: (err) => {
            console.error('Auto-login after registration failed:', err);
            this.errorMessage = 'Auto-login failed. Please try logging in manually.';
          }
        });
      },
      error: (err) => {
        console.error('Registration failed:', err);
        this.errorMessage = err.error?.error || 'Something went wrong. Please try again.';
      }
    });
  }

}
