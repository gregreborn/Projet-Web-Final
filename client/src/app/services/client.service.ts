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
  private apiUrl = '/api/clients'; // URL de base de l'API des clients

  constructor(private http: HttpClient) {
    console.log('✅ ClientService initialisé');
  }


  // Récupère tous les clients (réservé aux administrateurs)
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Récupère un client spécifique par son ID
  getClient(clientId: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${clientId}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Récupère le profil de l'utilisateur connecté
  getProfile(): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/profile`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Met à jour le profil d'un client existant
  updateProfile(clientId: number, updatedData: any): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${clientId}`, updatedData, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Change le mot de passe du client
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, { oldPassword, newPassword }, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Supprime un client (réservé aux administrateurs)
  deleteClient(clientId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${clientId}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Crée un nouveau client (réservé aux administrateurs)
  createClient(clientData: { name: string; email: string; password: string; is_admin?: boolean }): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, clientData, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Méthode interne pour récupérer les en-têtes HTTP nécessaires
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
  }
}
