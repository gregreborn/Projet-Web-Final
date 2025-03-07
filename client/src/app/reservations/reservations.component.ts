import {Component, OnInit, NgZone, ChangeDetectorRef} from '@angular/core';
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
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, CalendarModule, FormsModule],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss'],
  providers: [
    CalendarUtils,
    CalendarA11y,
    CalendarDateFormatter,
    { provide: DateAdapter, useFactory: adapterFactory },
    ReservationService, AuthService
  ]
})
export class ReservationsComponent implements OnInit {
  view: 'month' | 'week' | 'day' = 'month';
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  reservations: any[] = []; // ✅ Live reservation updates
  currentUser: { name: string; email: string; id: number; isAdmin?: boolean } | null = null;

  selectedReservation: any = null;
  updatedTable: number = 1;
  selectedDate: Date | null = null;
  newName = '';
  newEmail = '';
  numPeople = 1;
  newTable: number = 1;
  isLoggedIn = false;

  availableTimeSlots: { label: string, value: string }[] = [
    { label: "11:30 AM - 1:30 PM", value: "11:30" },
    { label: "5:30 PM - 8:00 PM", value: "17:30" },
    { label: "8:00 PM - 10:30 PM", value: "20:00" }
  ];

  selectedTimeSlot = '';
  updatedTimeSlot = '';
  occupiedTimeSlots: string[] = [];
  occupiedTimeSlotsByDate: { [date: string]: string[] } = {};

  // Add ChangeDetectorRef to the constructor
  constructor(
    private reservationService: ReservationService,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdRef: ChangeDetectorRef // ✅ Ensure UI updates instantly
  ) {}



  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
      this.loadCurrentUser();
    });

    // ✅ Subscribe to reservations & force UI updates correctly
    this.reservationService.reservations$.subscribe(reservations => {
      this.ngZone.run(() => {
        console.log("🔹 Before update:", this.events);

        this.reservations = reservations;
        this.updateCalendarEvents();

        console.log("🔹 After update:", this.events);
        this.cdRef.detectChanges(); // ✅ Ensure UI updates
      });
    });

    this.reservationService.fetchReservations(); // ✅ Fetch initial reservations
  }



  /** ✅ Switch calendar view */
  setView(view: 'month' | 'week' | 'day'): void {
    this.view = view;
  }

  /** ✅ Update an existing reservation */
  updateReservation(): void {
    if (!this.selectedReservation || !this.updatedTimeSlot) {
      alert("Veuillez sélectionner un créneau horaire.");
      return;
    }

    const formattedDate = `${this.selectedReservation.datetime.split('T')[0]}T${this.updatedTimeSlot}`;
    const updatedData = {
      table_id: this.updatedTable,
      datetime: formattedDate
    };

    console.log("📤 Envoi de la mise à jour:", updatedData);

    this.reservationService.updateReservation(this.selectedReservation.id, updatedData).subscribe({
      next: () => {
        alert('Réservation mise à jour avec succès !');
        this.reservationService.fetchReservations();
        this.selectedReservation = null;
      },
      error: (err) => {
        console.error('❌ Erreur lors de la mise à jour :', err);
        alert('Erreur : ' + err.error.error);
      }
    });
  }

  loadCurrentUser(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      console.log("🔹 No user logged in.");
      this.currentUser = null;
      return;
    }
    console.log("✅ Current User:", user);
    this.currentUser = user;
  }

  updateCalendarEvents(): void {
    const now = new Date().toISOString();

    const filteredReservations = this.currentUser?.isAdmin
      ? this.reservations
      : this.reservations.filter(res => new Date(res.datetime).getTime() >= new Date(now).getTime());

    this.events = [...filteredReservations.map(res => ({
      id: res.id,
      start: new Date(res.datetime),
      title: `Réservé - Table ${res.table_id}`,
      color: { primary: '#FF5733', secondary: '#D1E8FF' },
      meta: res
    }))];

    console.log("✅ Final events sent to calendar:", this.events);

    this.occupiedTimeSlotsByDate = {};
    filteredReservations.forEach(res => {
      const dateStr = new Date(res.datetime).toISOString().split('T')[0];
      const timeStr = new Date(res.datetime).toISOString().substring(11, 16);
      if (!this.occupiedTimeSlotsByDate[dateStr]) this.occupiedTimeSlotsByDate[dateStr] = [];
      this.occupiedTimeSlotsByDate[dateStr].push(timeStr);
    });

    console.log("📌 Reservations loaded:", this.events);

    // ✅ Force Angular to detect changes
    this.cdRef.detectChanges();
  }

  onEventClick(event: CalendarEvent): void {
    console.log("📌 Modification de la réservation:", event);
    this.selectedReservation = event.meta;
    this.updatedTable = event.meta.table_id;

    const currentTime = new Date(event.meta.datetime).toISOString().substring(11, 16);
    this.updatedTimeSlot = this.availableTimeSlots.find(slot => slot.value === currentTime)?.value || '';
    this.selectedDate = null;
  }

  onDayClick(day: { date: Date }): void {
    console.log("📅 Date sélectionnée:", day.date);
    this.selectedDate = day.date;
    this.selectedTimeSlot = '';
    this.selectedReservation = null;

    if (!this.isLoggedIn) {
      this.newName = '';
      this.newEmail = '';
    }

    const selectedDateStr = day.date.toISOString().split('T')[0];
    this.occupiedTimeSlots = this.occupiedTimeSlotsByDate[selectedDateStr] || [];
    console.log("🔹 Occupied times for this date:", this.occupiedTimeSlots);
  }

  createReservation(): void {
    if (!this.selectedDate || (!this.isLoggedIn && (!this.newName || !this.newEmail))) {
      alert("Données de réservation invalides.");
      return;
    }
    if (this.numPeople < 1 || this.numPeople > 6) {
      alert("Le nombre de personnes doit être entre 1 et 6.");
      return;
    }
    if (!this.selectedTimeSlot) {
      alert("Veuillez sélectionner un créneau horaire.");
      return;
    }

    const selectedDateStr = this.selectedDate.toISOString().split('T')[0];
    if (this.occupiedTimeSlotsByDate[selectedDateStr]?.includes(this.selectedTimeSlot)) {
      alert("❌ Ce créneau horaire est déjà réservé. Veuillez en choisir un autre.");
      return;
    }

    const formattedDate = `${selectedDateStr}T${this.selectedTimeSlot}`;

    if (this.isLoggedIn) {
      this.reservationService.createReservation({
        table_id: this.newTable,
        datetime: formattedDate,
        client_id: this.currentUser!.id,
        num_people: this.numPeople
      }).subscribe(() => this.selectedDate = null);
    } else {
      this.handleNonUserReservation(formattedDate);
    }
  }

  handleNonUserReservation(formattedDate: string): void {
    this.authService.createOrGetClient(this.newName, this.newEmail).subscribe((clientResponse: any) => {
      console.log("✅ Réponse du backend :", clientResponse);

      if (!clientResponse.user?.id) {
        console.error("❌ Error: Client ID missing, cannot create reservation.");
        return;
      }

      // ✅ Avoid duplicate calls if user is already in local storage
      if (localStorage.getItem('user')) {
        console.log("🔹 User already exists in storage, skipping duplicate login.");
        this.currentUser = clientResponse.user;
        return;
      }

      if (clientResponse.autoPassword) {
        alert(`Votre compte a été créé avec le mot de passe : ${clientResponse.autoPassword}\nVeuillez le modifier.`);
        this.authService.login({ email: this.newEmail, password: clientResponse.autoPassword }).subscribe(() => {
          this.currentUser = clientResponse.user;
          this.isLoggedIn = true;

          // ✅ Delay reservation creation to ensure auth is fully set
          setTimeout(() => this.createReservation(), 500);
        });
      } else {
        this.currentUser = clientResponse.user;
        this.createReservation(); // ✅ Ensure this only happens ONCE
      }
    });
  }


  deleteReservation(reservationId: number): void {
    if (!confirm('Voulez-vous vraiment annuler cette réservation ?')) return;
    this.reservationService.deleteReservation(reservationId).subscribe();
  }
}
