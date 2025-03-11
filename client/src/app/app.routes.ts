import { Routes } from '@angular/router';
import { HomeComponent } from './dashboard/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { ReservationFormComponent } from './reservations/reservation-form.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'reservations', component: ReservationsComponent },
  { path: 'reservations/form', component: ReservationFormComponent },  // ✅ Add route for form
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: 'dashboard' }
];
