import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Client {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:5000/api/clients';

  constructor(private http: HttpClient) {
    console.log('✅ ClientService initialized');
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ✅ Create or get client for reservation
  createOrGetClient(clientData: { name: string; email: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-or-get-client`, clientData);
  }

  // ✅ Get all clients (admin)
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  // ✅ Get a specific client by ID
  getClientById(clientId: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${clientId}`, {
      headers: this.getHeaders()
    });
  }

  // ✅ Get profile of the logged-in client
  getProfile(): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/profile`, {
      headers: this.getHeaders()
    });
  }

  // ✅ Update client profile
  updateProfile(clientId: number, updatedData: { name?: string; email?: string; password?: string }): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${clientId}`, updatedData, {
      headers: this.getHeaders()
    });
  }


  // ✅ Change client password
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, { oldPassword, newPassword }, {
      headers: this.getHeaders()
    });
  }

  // ✅ Update client profile (admin and client can use this)
  updateClient(clientId: number, updatedData: { name?: string; email?: string; password?: string }): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${clientId}`, updatedData, {
      headers: this.getHeaders()
    });
  }

  // ✅ Delete a client (admin)
  deleteClient(clientId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${clientId}`, {
      headers: this.getHeaders()
    });
  }

  // ✅ Create a new client (admin)
  createClient(clientData: { name: string; email: string; password: string; is_admin?: boolean }): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, clientData, {
      headers: this.getHeaders()
    });
  }
}
