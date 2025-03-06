import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:5000/api/reservations';
  private reservationsSubject = new Subject<any[]>(); // Instead of BehaviorSubject
  reservations$ = this.reservationsSubject.asObservable();
  constructor(private http: HttpClient, private ngZone: NgZone) {
    console.log('✅ ReservationService initialized');
  }

  // ✅ Function to get auth token
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ✅ Function to get headers with token
  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Fetch reservations & update UI in real-time
  fetchReservations(): void {
    this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() }).subscribe(reservations => {
      this.ngZone.run(() => {
        this.reservationsSubject.next(reservations);
        console.log("📌 Reservations updated:", reservations);
      });
    });
  }





  // ✅ Create reservation & refresh UI automatically
  createReservation(reservationData: { table_id: number; datetime: string; client_id: number; num_people: number }): Observable<any> {
    return this.http.post(this.apiUrl, reservationData, { headers: this.getHeaders() }).pipe(
      tap(() => {
        console.log("✅ Reservation created, refreshing calendar...");
        this.fetchReservations(); // ✅ Refresh UI immediately
      })
    );
  }

  // ✅ Update a reservation & refresh UI
  updateReservation(reservationId: number, updatedData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reservationId}`, updatedData, { headers: this.getHeaders() }).pipe(
      tap(() => this.fetchReservations())
    );
  }

  // ✅ Delete a reservation & refresh UI
  deleteReservation(reservationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reservationId}`, { headers: this.getHeaders() }).pipe(
      tap(() => this.fetchReservations())
    );
  }
}
