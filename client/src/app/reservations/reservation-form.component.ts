import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ReservationService } from '../services/reservation.service';
import { ClientService } from '../services/client.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-reservation-form',
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.scss'],
  standalone: true, // Mark as standalone component
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgIf,
    NgClass
  ],
})
export class ReservationFormComponent implements OnInit {
  reservationForm: FormGroup;
  autoPassword: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isEditMode = false;
  reservationId: number | null = null;
  selectedClient: any = null;
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private clientService: ClientService,
    protected authService: AuthService,
    private router: Router
  ) {
    this.reservationForm = this.fb.group({
      date: ['', Validators.required],
      timeSlot: ['', Validators.required],
      numPeople: [1, [Validators.required, Validators.min(1), Validators.max(6)]],
    });
  }


  ngOnInit(): void {
    const state = history.state;
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.is_admin || false;

    if (state.client) {
      this.selectedClient = state.client;
    }

    if (state.reservation) {
      this.isEditMode = true;
      this.reservationId = state.reservation.id;

      this.selectedClient = {
        id: state.reservation.client_id,
        name: state.reservation.client_name,
        email: state.reservation.email
      };

      const [date, time] = state.reservation.datetime.split('T');

      this.reservationForm.patchValue({
        date: date,
        timeSlot: time.substring(0, 5),
        numPeople: state.reservation.num_people
      });
    }
  }


  // ✅ Getters for Form Controls
  get date() {
    return this.reservationForm.get('date');
  }

  get timeSlot() {
    return this.reservationForm.get('timeSlot');
  }

  get numPeople() {
    return this.reservationForm.get('numPeople');
  }


  submitReservation(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.reservationForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    const { date, timeSlot, numPeople } = this.reservationForm.value;
    const datetime = `${date}T${timeSlot}:00Z`;

    const clientId = this.isAdmin ? this.selectedClient?.id : this.authService.getCurrentUser()?.id;

    if (!clientId) {
      this.errorMessage = 'Client ID is missing.';
      return;
    }

    if (this.isEditMode && this.reservationId) {
      this.updateReservation(this.reservationId, numPeople, datetime);
    } else {
      this.createReservation(clientId, numPeople, datetime);
    }
  }




  private createReservation(clientId: number, numPeople: number, datetime: string): void {
    this.reservationService.createReservation({
      client_id: clientId,
      num_people: numPeople,
      datetime: datetime
    }).subscribe({
      next: () => {
        this.successMessage = '✅ Réservation créée avec succès!';
        setTimeout(() => {
          const redirectPath = this.isAdmin ? '/reservations' : '/dashboard';
          this.router.navigate([redirectPath]);
        }, 2000);
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
        setTimeout(() => this.router.navigate(['/reservations']), 2000);
      },
      error: (error: { error: { message: string; }; }) => {
        this.errorMessage = error.error.message || 'Erreur lors de la mise à jour de la réservation.';
      }
    });
  }

  // Helper method to check for control errors
  hasError(controlName: string, errorName: string): boolean {
    const control = this.reservationForm.get(controlName);
    return control ? control.hasError(errorName) && (control.dirty || control.touched) : false;
  }

}
