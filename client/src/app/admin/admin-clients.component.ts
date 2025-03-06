import { Component, OnInit } from '@angular/core';
import { ClientService } from '../services/client.service';
import { AuthService } from '../services/auth.service';
import {NgForOf, NgIf} from '@angular/common';
import { Router } from '@angular/router';

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

  constructor(private router: Router, private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (data: Client[]) => {
        this.clients = data;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des clients', err);
        this.errorMessage = 'Erreur lors du chargement des clients';
      }
    });
  }

  deleteClient(clientId: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce client ?')) {
      this.clientService.deleteClient(clientId).subscribe({
        next: () => this.loadClients(),
        error: (err: any) => {
          console.error('Erreur lors de la suppression du client', err);
          this.errorMessage = 'Erreur lors de la suppression du client';
        }
      });
    }
  }
  exitAdminClients(): void {
    this.router.navigate(['/dashboard']);
  }
}
