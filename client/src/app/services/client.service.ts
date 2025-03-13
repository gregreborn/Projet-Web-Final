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
  private apiUrl = '/api/clients'; // Use proxy path

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

  // Create or get client for reservation
  createOrGetClient(clientData: { name: string; email: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-or-get-client`, clientData, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Get all clients (admin)
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Get a specific client by ID
  getClientById(clientId: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${clientId}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Get profile of the logged-in client
  getProfile(): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/profile`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Update client profile (for both admin and client)
  updateProfile(clientId: number, updatedData: { name?: string; email?: string; password?: string }): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${clientId}`, updatedData, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Change client password
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, { oldPassword, newPassword }, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Update client (admin specific)
  updateClient(clientId: number, updatedData: { name?: string; email?: string; password?: string; is_admin?: boolean }): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${clientId}`, updatedData, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Delete a client (admin)
  deleteClient(clientId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${clientId}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Create a new client (admin)
  createClient(clientData: { name: string; email: string; password: string; is_admin?: boolean }): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, clientData, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }
}
