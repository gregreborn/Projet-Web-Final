import { Component, OnInit } from '@angular/core';
import { ClientService } from '../services/client.service';
import { AuthService } from '../services/auth.service';
import {NgForOf, NgIf} from '@angular/common';
import { Router } from '@angular/router';
import {ReservationService} from '../services/reservation.service';
import {TableService} from '../services/table.service';

interface Client {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

@Component({
  selector: 'app-admin-clients',
  templateUrl: './admin-clients.component.html',
  imports: [
    NgForOf,
    NgIf
  ],
  styleUrls: ['./admin-clients.component.scss']
})
export class AdminClientsComponent implements OnInit {
  clients: Client[] = [];
  errorMessage = '';
  totalClients: number = 0;
  totalReservations: number = 0;
  totalTables: number = 0; // For managing tables
  constructor(
    private router: Router,
    private authService: AuthService,
    private clientService: ClientService,
    private reservationService: ReservationService,
    private tableService: TableService  // Remove or comment out if not available
  ) {}
  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user.is_admin) {
      // If not admin, redirect to the normal client dashboard
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load clients and set total
    this.clientService.getClients().subscribe({
      next: (data: Client[]) => {
        this.clients = data;
        this.totalClients = data.length;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des clients', err);
        this.errorMessage = 'Erreur lors du chargement des clients';
      }
    });

    // Load reservations count
    this.reservationService.fetchReservations(); // Assuming this populates reservations$
    this.reservationService.reservations$.subscribe((reservations) => {
      this.totalReservations = reservations.length;
    });

    // Load tables count if TableService exists
    this.tableService.getTables().subscribe({
      next: (tables: any[]) => {
        this.totalTables = tables.length;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des tables', err);
        // Optionally handle the error if table data is critical
      }
    });
  }

  // For deleting a client (if needed)
  deleteClient(clientId: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce client ?')) {
      this.clientService.deleteClient(clientId).subscribe({
        next: () => this.loadDashboardData(), // Reload dashboard data
        error: (err: any) => {
          console.error('Erreur lors de la suppression du client', err);
          this.errorMessage = 'Erreur lors de la suppression du client';
        }
      });
    }
  }
  // Navigation methods for each admin action
  manageClients(): void {
    this.router.navigate(['/admin/clients']);
  }

  manageTables(): void {
    this.router.navigate(['/tables']);
  }

  manageReservations(): void {
    this.router.navigate(['/reservations']);
  }

  exitAdminDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
