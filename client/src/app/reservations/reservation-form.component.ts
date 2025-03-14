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
  standalone: true,
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
    // Initialisation du formulaire avec validation
    this.reservationForm = this.fb.group({
      date: ['', Validators.required],
      timeSlot: ['', Validators.required],
      numPeople: [1, [Validators.required, Validators.min(1), Validators.max(6)]]
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
      // Remplit le formulaire avec les données existantes
      this.reservationForm.patchValue({
        date: state.reservation.date,
        timeSlot: state.reservation.timeSlot,
        numPeople: state.reservation.numPeople
      });

      // Confirme automatiquement la réservation si l'utilisateur est maintenant connecté
      if (currentUser?.id && !this.isEditMode) {
        const { date, timeSlot, numPeople } = state.reservation;
        const datetime = `${date}T${timeSlot}:00Z`;
        this.createReservation(currentUser.id, numPeople, datetime);
      }

      if (state.reservation.id) {
        this.isEditMode = true;
        this.reservationId = state.reservation.id;
      }
    }
  }

  // Getters pour faciliter l'accès aux contrôles du formulaire
  get date() {
    return this.reservationForm.get('date');
  }

  get timeSlot() {
    return this.reservationForm.get('timeSlot');
  }

  get numPeople() {
    return this.reservationForm.get('numPeople');
  }

  // Soumission du formulaire de réservation
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
      // Redirige vers la connexion avec conservation des données de réservation
      this.router.navigate(['/login'], { state: { reservation: { date, timeSlot, numPeople } } });
      return;
    }

    if (this.isEditMode && this.reservationId) {
      this.updateReservation(this.reservationId, numPeople, datetime);
    } else {
      this.createReservation(clientId, numPeople, datetime);
    }
  }

  // Création d'une nouvelle réservation
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
      error: (error: { error: { message: string; } }) => {
        this.errorMessage = error.error.message || 'Erreur lors de la création de la réservation.';
      }
    });
  }

  // Mise à jour d'une réservation existante
  private updateReservation(reservationId: number, numPeople: number, datetime: string): void {
    this.reservationService.updateReservation(reservationId, {
      datetime: datetime,
      num_people: numPeople
    }).subscribe({
      next: () => {
        this.successMessage = '✅ Réservation mise à jour!';
        setTimeout(() => this.router.navigate(['/reservations']), 2000);
      },
      error: (error: { error: { message: string; } }) => {
        this.errorMessage = error.error.message || 'Erreur lors de la mise à jour de la réservation.';
      }
    });
  }

  // Vérifie les erreurs de validation sur les champs du formulaire
  hasError(controlName: string, errorName: string): boolean {
    const control = this.reservationForm.get(controlName);
    return control ? control.hasError(errorName) && (control.dirty || control.touched) : false;
  }
}
