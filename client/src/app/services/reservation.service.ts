import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = '/api/reservations'; // Use proxy path
  private reservationsSubject = new BehaviorSubject<any[]>([]);
  reservations$ = this.reservationsSubject.asObservable();

  constructor(private http: HttpClient, private ngZone: NgZone) {
    console.log('✅ ReservationService initialized');
  }

  // Get auth token
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Get headers with token
  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Fetch reservations & update BehaviorSubject
  fetchReservations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      tap(reservations => {
        this.ngZone.run(() => {
          this.reservationsSubject.next(reservations);
          console.log("📌 Reservations updated:", reservations);
        });
      })
    );
  }

  // Create reservation with required fields
  createReservation(reservationData: { client_id: number; num_people: number; datetime: string }): Observable<any> {
    return this.http.post(this.apiUrl, reservationData, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      tap(() => {
        console.log("✅ Reservation created, refreshing...");
        this.fetchReservations().subscribe(); // Trigger refresh after creation
      })
    );
  }

  // Update a reservation
  updateReservation(reservationId: number, updatedData: { datetime: string; num_people: number }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reservationId}`, updatedData, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      tap(() => {
        console.log("✅ Reservation updated, refreshing...");
        this.fetchReservations().subscribe(); // Trigger refresh after update
      })
    );
  }

  // Delete a reservation
  deleteReservation(reservationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reservationId}`, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      tap(() => {
        console.log("✅ Reservation deleted, refreshing...");
        this.fetchReservations().subscribe(); // Trigger refresh after deletion
      })
    );
  }
}
