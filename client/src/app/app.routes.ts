import { Routes } from '@angular/router';
import { HomeComponent } from './dashboard/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { ReservationFormComponent } from './reservations/reservation-form.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClientFormComponent } from './clients/client-form.component';  // ✅ Import Client Form
import { TablesComponent } from './tables/tables.component';
import { TableFormComponent } from './tables/table-form.component';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },

  // ✅ Reservation Routes
  { path: 'reservations', component: ReservationsComponent },
  { path: 'reservations/form', component: ReservationFormComponent },

  // ✅ Client CRUD Routes
  { path: 'clients/form', component: ClientFormComponent },           // Create Client
  { path: 'clients/form/:id', component: ClientFormComponent },       // Edit Client
  { path: 'tables', component: TablesComponent },
  { path: 'tables/form', component: TableFormComponent },
  { path: 'dashboard', component: DashboardComponent },

  // ✅ Wildcard to redirect to dashboard
  { path: '**', redirectTo: 'dashboard' }
];
