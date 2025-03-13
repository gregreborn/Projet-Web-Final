import { Routes } from '@angular/router';
import { HomeComponent } from './dashboard/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { ReservationFormComponent } from './reservations/reservation-form.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClientFormComponent } from './clients/client-form.component';
import { TablesComponent } from './tables/tables.component';
import { TableFormComponent } from './tables/table-form.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Exemple de protection d'une route (accès uniquement si connecté)
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },

  // Routes de réservation
  { path: 'reservations', component: ReservationsComponent, canActivate: [AuthGuard] },
  { path: 'reservations/form', component: ReservationFormComponent, canActivate: [AuthGuard] },

  // Routes CRUD pour Clients (protection selon le besoin)
  { path: 'clients/form', component: ClientFormComponent, canActivate: [AuthGuard] },
  { path: 'clients/form/:id', component: ClientFormComponent, canActivate: [AuthGuard] },

  { path: 'tables', component: TablesComponent, canActivate: [AuthGuard] },
  { path: 'tables/form', component: TableFormComponent, canActivate: [AuthGuard] },

  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },

  // Wildcard pour rediriger vers le dashboard ou la page de login
  { path: '**', redirectTo: 'dashboard' }
];
