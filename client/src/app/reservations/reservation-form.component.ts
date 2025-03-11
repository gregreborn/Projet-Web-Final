import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ReservationService } from '../services/reservation.service';
import { ClientService } from '../services/client.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-reservation-form',
  templateUrl: './reservation-form.component.html',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  styleUrls: ['./reservation-form.component.scss']
})
export class ReservationFormComponent implements OnInit {
  reservationForm: FormGroup;
  autoPassword: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isEditMode = false;
  reservationId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private clientService: ClientService,
    private authService: AuthService,
    private router: Router
  ) {
    this.reservationForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      numPeople: [1, [Validators.required, Validators.min(1), Validators.max(6)]],
      datetime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const state = history.state.reservation;

    if (state) {
      this.isEditMode = true;
      this.reservationId = state.id;

      const [date, time] = state.datetime.split('T');

      this.reservationForm.patchValue({
        name: state.client_name,
        email: state.email,
        date: date,
        timeSlot: time.substring(0, 5),
        numPeople: state.num_people
      });
    }
  }


  prefillForm(reservation: any): void {
    this.reservationForm.patchValue({
      name: reservation.client_name || '',
      email: reservation.email || '', // ✅ Fixed key
      numPeople: reservation.num_people || 1,
      datetime: reservation.datetime ? reservation.datetime.substring(0, 16) : ''
    });

    // Manually mark controls as touched to trigger validation
    Object.keys(this.reservationForm.controls).forEach(field => {
      const control = this.reservationForm.get(field);
      control?.markAsTouched();
    });
  }

  submitReservation(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.reservationForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    const { name, email, numPeople, date, timeSlot } = this.reservationForm.value;
    const datetime = `${date}T${timeSlot}:00Z`;

    if (this.isEditMode && this.reservationId) {
      this.updateReservation(this.reservationId, numPeople, datetime);
    } else {
      this.createOrGetClientAndReservation(name, email, numPeople, datetime);
    }
  }

  private createOrGetClientAndReservation(name: string, email: string, numPeople: number, datetime: string): void {
    this.clientService.createOrGetClient({ name, email }).subscribe({
      next: (response: any) => {
        if (response.token) {
          this.authService.saveToken(response.token);
          this.autoPassword = response.autoPassword;
        }
        this.createReservation(response.user.id, numPeople, datetime);
      },
      error: (error: { error: { message: string; }; }) => {
        this.errorMessage = error.error.message || 'Erreur lors de la création du client.';
      }
    });
  }

  private createReservation(clientId: number, numPeople: number, datetime: string): void {
    this.reservationService.createReservation({
      client_id: clientId,
      num_people: numPeople,
      datetime: datetime
    }).subscribe({
      next: () => {
        this.successMessage = '✅ Réservation réussie!';
        if (this.autoPassword) {
          this.successMessage += ` Votre mot de passe temporaire est: ${this.autoPassword}`;
        }
        setTimeout(() => this.router.navigate(['/dashboard']), 2000);
      },
      error: (error: { error: { message: string; }; }) => {
        this.errorMessage = error.error.message || 'Erreur lors de la création de la réservation.';
      }
    });
  }

  private updateReservation(reservationId: number, numPeople: number, datetime: string): void {
    this.reservationService.updateReservation(reservationId, {
      datetime: datetime,
      num_people: numPeople
    }).subscribe({
      next: () => {
        this.successMessage = '✅ Réservation mise à jour!';
        setTimeout(() => this.router.navigate(['/dashboard']), 2000);
      },
      error: (error: { error: { message: string; }; }) => {
        this.errorMessage = error.error.message || 'Erreur lors de la mise à jour de la réservation.';
      }
    });
  }
}
