import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CalendarModule,
  CalendarView,
  CalendarEvent,
  CalendarUtils,
  DateAdapter,
  CalendarA11y,
  CalendarDateFormatter
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ReservationService } from '../services/reservation.service';
import { AuthService } from '../services/auth.service'; // ✅ Import AuthService

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, CalendarModule],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss'],
  providers: [
    CalendarUtils,
    CalendarA11y,
    CalendarDateFormatter,
    { provide: DateAdapter, useFactory: adapterFactory }
  ]
})
export class ReservationsComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  currentUser: { name: string; email: string } | null = null; // ✅ Store logged-in user

  constructor(private reservationService: ReservationService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.fetchReservations();
  }

  // ✅ Load the logged-in user
  loadCurrentUser(): void {
    const token = this.authService.getToken();
    if (token) {
      // Simulate fetching user data (Normally, the backend should return this in the token)
      this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    }
  }

  // ✅ Fetch reservations from API and convert to calendar events
  fetchReservations(): void {
    this.reservationService.getReservations().subscribe({
      next: (reservations) => {
        console.log('Fetched Reservations:', reservations); // ✅ Debugging

        this.events = reservations.map((reservation: { datetime: string; table_id: number; client_id: number }) => ({
          start: new Date(reservation.datetime), // ✅ Ensure the date is correctly parsed
          title: `Table ${reservation.table_id} - Client ${reservation.client_id}`, // ✅ Display table & client
          color: { primary: '#1e90ff', secondary: '#D1E8FF' }, // ✅ Customize event color
          meta: reservation // ✅ Store reservation data in meta
        }));

        console.log('Mapped Calendar Events:', this.events); // ✅ Debugging
      },
      error: (err) => console.error('Error fetching reservations:', err)
    });
  }


  // ✅ Create a reservation dynamically for the logged-in user
  createReservation(): void {
    if (!this.currentUser) {
      console.error('User not logged in.');
      return;
    }

    const newReservation = {
      date: this.viewDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      tableNumber: Math.floor(Math.random() * 10) + 1, // Random table for testing
      name: this.currentUser.name // ✅ Use logged-in user’s name
    };

    this.reservationService.createReservation(newReservation).subscribe({
      next: (response) => {
        console.log('Reservation created:', response);
        this.fetchReservations(); // Refresh events
      },
      error: (err) => console.error('Error creating reservation:', err)
    });
  }
}
