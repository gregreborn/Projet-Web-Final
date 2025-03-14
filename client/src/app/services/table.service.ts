import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Table {
  id: number;
  seats: number;
}

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private apiUrl = '/api/tables'; // URL relative vers l'API des tables

  constructor(private http: HttpClient) {}

  // Récupère les en-têtes HTTP avec le token d'authentification
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Récupère la liste des tables
  getTables(): Observable<Table[]> {
    return this.http.get<Table[]>(this.apiUrl, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Crée une nouvelle table
  createTable(table: { seats: number }): Observable<Table> {
    return this.http.post<Table>(this.apiUrl, table, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Met à jour une table existante
  updateTable(id: number, updatedData: Partial<Table>): Observable<Table> {
    return this.http.put<Table>(`${this.apiUrl}/${id}`, updatedData, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // Supprime une table existante
  deleteTable(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }
}
