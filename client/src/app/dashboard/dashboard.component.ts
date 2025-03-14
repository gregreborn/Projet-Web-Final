import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ClientService } from '../services/client.service';
import { ReservationService } from '../services/reservation.service';
import { Router, RouterLink } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';

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

  // Charge les informations de l'utilisateur connecté
  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.isAdmin = this.currentUser.is_admin ?? false;
    this.fetchDashboardData();
  }

  // Charge les données spécifiques selon le type d'utilisateur (admin ou client)
  fetchDashboardData(): void {
    if (this.isAdmin) {
      this.loadAdminData();
    } else {
      this.loadClientData();
    }
  }

  // Charge les données nécessaires au tableau de bord administrateur
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

  // Charge la liste des clients pour l'administration
  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (err) => console.error('❌ Erreur lors du chargement des clients', err)
    });
  }

  // Charge les réservations spécifiques au client connecté
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

  // Ouvre le formulaire pour créer ou éditer un client
  openClientForm(client?: any): void {
    this.router.navigate(['/clients/form'], { state: { client } });
  }

  // Édite un client existant
  editClient(client: any): void {
    this.openClientForm(client);
  }

  // Supprime un client après confirmation
  deleteClient(clientId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      this.clientService.deleteClient(clientId).subscribe(() => {
        this.loadClients(); // Rafraîchit la liste après suppression
      });
    }
  }

  // Crée une réservation pour un client sélectionné
  createReservationForClient(client: any): void {
    this.router.navigate(['/reservations/form'], { state: { client } });
  }
}
