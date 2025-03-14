import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = '/api/reservations'; // URL de base de l'API des réservations
  private reservationsSubject = new BehaviorSubject<any[]>([]);
  reservations$ = this.reservationsSubject.asObservable();

  constructor(private http: HttpClient, private ngZone: NgZone) {
    console.log('✅ ReservationService initialisé');
  }

  // Récupère le token d'authentification
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Configure les en-têtes HTTP avec le token
  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Récupère la liste des réservations et met à jour le BehaviorSubject
  fetchReservations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      tap(reservations => {
        this.ngZone.run(() => {
          this.reservationsSubject.next(reservations);
          console.log("📌 Réservations actualisées :", reservations);
        });
      })
    );
  }

  // Crée une nouvelle réservation
  createReservation(reservationData: { client_id: number; num_people: number; datetime: string }): Observable<any> {
    return this.http.post(this.apiUrl, reservationData, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      tap(() => {
        console.log("✅ Réservation créée, actualisation...");
        this.fetchReservations().subscribe(); // Actualise la liste après création
      })
    );
  }

  // Met à jour une réservation existante
  updateReservation(reservationId: number, updatedData: { datetime: string; num_people: number }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reservationId}`, updatedData, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      tap(() => {
        console.log("✅ Réservation mise à jour, actualisation...");
        this.fetchReservations().subscribe(); // Actualise la liste après mise à jour
      })
    );
  }

  // Supprime une réservation
  deleteReservation(reservationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reservationId}`, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      tap(() => {
        console.log("✅ Réservation supprimée, actualisation...");
        this.fetchReservations().subscribe(); // Actualise la liste après suppression
      })
    );
  }
}
