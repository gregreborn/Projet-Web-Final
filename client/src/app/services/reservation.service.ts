import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:5000/api/reservations';

  constructor(private http: HttpClient) {}

  // ✅ Function to get the auth token
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ✅ Function to get headers with the token
  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}` // ✅ Send the token in the Authorization header
    });
  }

  // ✅ Fetch reservations with authentication
  getReservations(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    console.log('Request Headers:', headers.keys()); // ✅ Check what Angular sends
    console.log('Request Token:', token); // ✅ Ensure correct token is stored

    return this.http.get('http://localhost:5000/api/reservations', { headers });
  }


  // ✅ Create a reservation with authentication
  createReservation(reservationData: any): Observable<any> {
    return this.http.post(this.apiUrl, reservationData, { headers: this.getHeaders() });
  }
}
