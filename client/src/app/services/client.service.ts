import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Client {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  // Autres champs si nécessaires
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:5000/api/clients';

  constructor(private http: HttpClient) {
    console.log('✅ ClientService initialized');
  }

  // Récupérer tous les clients (pour l'admin)
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  // Récupérer le profil du client connecté
  getProfile(): Observable<Client> {
    const token = localStorage.getItem('token');
    console.log('🔹 Sending Token:', token); // ✅ Debug Log
    return this.http.get<Client>(`${this.apiUrl}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }


  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, { oldPassword, newPassword }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }


  // Mettre à jour le profil du client
  updateProfile(clientId: number, updatedData: { name?: string; email?: string; password?: string }): Observable<Client> {
    const token = localStorage.getItem('token'); // ✅ Retrieve token
    console.log('🔹 Sending Token for Profile Update:', token); // ✅ Debugging

    return this.http.put<Client>(`${this.apiUrl}/${clientId}`, updatedData, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
  }


  // Supprimer un client (fonctionnalité admin)
  deleteClient(clientId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${clientId}`);
  }

  // (Optionnel) Créer un client (pour l'administration)
  createClient(clientData: { name: string; email: string; password: string; is_admin?: boolean }): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, clientData);
  }
}
