import { Routes } from '@angular/router';
import { HomeComponent } from './dashboard/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { ReservationFormComponent } from './reservations/reservation-form.component';
import { ProfileComponent } from './profile/profile.component';
import { ClientFormComponent } from './clients/client-form.component';
import { TablesComponent } from './tables/tables.component';
import { TableFormComponent } from './tables/table-form.component';
import { AuthGuard } from './auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'reservations', component: ReservationsComponent, canActivate: [AuthGuard] },
  { path: 'reservations/form', component: ReservationFormComponent, canActivate: [AuthGuard] },
  { path: 'clients/form', component: ClientFormComponent, canActivate: [AuthGuard] },
  { path: 'clients/form/:id', component: ClientFormComponent, canActivate: [AuthGuard] },
  { path: 'tables', component: TablesComponent, canActivate: [AuthGuard] },
  { path: 'tables/form', component: TableFormComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'home' } // Redirection par défaut vers la page d'accueil
];
