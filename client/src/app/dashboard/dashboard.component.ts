import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ClientService } from '../services/client.service';
import { ReservationService } from '../services/reservation.service';
import {Router, RouterLink} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [
    RouterLink,
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

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.is_admin ?? false;

    if (this.isAdmin) {
      console.log("🔹 Redirecting to admin dashboard...");
      this.router.navigate(['/admin/clients']);
    } else {
      this.loadCurrentUser(); // Load data for non-admin clients
    }
  }


  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.isAdmin = this.currentUser.isAdmin;
      this.fetchDashboardData();
    }
  }

  fetchDashboardData(): void {
    if (this.isAdmin) {
      this.clientService.getClients().subscribe((clients) => {
        this.totalClients = clients.length;
      });
      this.reservationService.fetchReservations();
    } else {
      this.reservationService.reservations$.subscribe((reservations) => {
        this.userReservations = reservations.filter(res => res.client_id === this.currentUser.id);
        this.totalReservations = this.userReservations.length;
      });
    }
  }
}
