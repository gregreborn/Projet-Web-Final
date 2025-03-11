import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ClientService } from '../services/client.service';
import { ReservationService } from '../services/reservation.service';
import {Router, RouterLink} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [
    RouterLink,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  isAdmin = false;
  totalClients = 0;
  totalReservations = 0;
  userReservations: any[] = [];
  clients: any[] = [];

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();

    if (this.isAdmin) {
      this.loadClients();
    }
  }

  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.isAdmin = this.currentUser.is_admin ?? false;
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    if (this.isAdmin) {
      this.loadAdminData();
    } else {
      this.loadClientData();
    }
  }

  loadAdminData(): void {
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.totalClients = clients.length;
      },
      error: (err) => console.error('❌ Erreur lors du chargement des clients', err)
    });

    this.reservationService.fetchReservations();
    this.reservationService.reservations$.subscribe({
      next: (reservations) => {
        this.totalReservations = reservations.length;
      },
      error: (err) => console.error('❌ Erreur lors du chargement des réservations', err)
    });
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (err) => console.error('❌ Erreur lors du chargement des clients', err)
    });
  }

  loadClientData(): void {
    this.reservationService.fetchReservations();
    this.reservationService.reservations$.subscribe({
      next: (reservations) => {
        this.userReservations = reservations.filter(res => res.client_id === this.currentUser.id);
        this.totalReservations = this.userReservations.length;
      },
      error: (err) => console.error('❌ Erreur lors du chargement des réservations client', err)
    });
  }

  openClientForm(client?: any): void {
    this.router.navigate(['/clients/form'], { state: { client } });
  }

  editClient(client: any): void {
    this.openClientForm(client);
  }

  deleteClient(clientId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      this.clientService.deleteClient(clientId).subscribe(() => {
        this.loadClients(); // Refresh the list after deletion
      });
    }
  }

  createReservationForClient(client: any): void {
    this.router.navigate(['/reservations/form'], { state: { client } });
  }
}
