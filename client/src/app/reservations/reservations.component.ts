import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../services/reservation.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  imports: [
    NgIf,
    NgForOf,
    FormsModule
  ],
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements OnInit {
  reservations: any[] = [];
  filteredReservations: any[] = [];

  currentUser: any;
  isAdmin = false;
  searchQuery = '';

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.is_admin || false;

    this.reservationService.reservations$.subscribe(reservations => {
      if (this.isAdmin) {
        this.reservations = reservations;
      } else if (this.currentUser) {
        this.reservations = reservations.filter(res => res.client_id === this.currentUser.id);
      }
      this.triggerSearch();
    });

    this.reservationService.fetchReservations().subscribe();
  }

  formatDate(datetime: string): string {
    const date = new Date(datetime);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getTimeSlot(datetime: string): string {
    const time = datetime.substring(11, 16);

    if (time >= '11:30' && time < '13:30') return '11:30 - 13:30';
    if (time >= '17:30' && time < '20:00') return '17:30 - 20:00';
    if (time >= '20:00' && time <= '22:30') return '20:00 - 22:30';

    return 'Créneau inconnu';
  }

  triggerSearch(): void {
    this.filteredReservations = this.filterReservations();
  }

  openReservationForm(reservation?: any): void {
    this.router.navigate(['/reservations/form'], { state: { reservation } });
  }

  deleteReservation(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      this.reservationService.deleteReservation(id).subscribe();
    }
  }

  filterReservations(): any[] {
    return this.reservations.filter(reservation =>
      reservation.client_name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      reservation.datetime.includes(this.searchQuery)
    );
  }
}
