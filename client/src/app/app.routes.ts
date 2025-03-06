import { Routes } from '@angular/router';
import { HomeComponent } from './dashboard/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { ProfileComponent } from './profile/profile.component';
import { AdminClientsComponent } from './admin/admin-clients.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // ✅ Set Home as default
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'reservations', component: ReservationsComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin/clients', component: AdminClientsComponent },
  { path: '**', redirectTo: 'dashboard' } // ✅ Redirect unknown routes to home
];
