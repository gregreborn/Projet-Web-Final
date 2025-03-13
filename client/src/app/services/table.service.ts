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
  private apiUrl = 'http://localhost:5000/api/tables'; // Ensure this is correct

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getTables(): Observable<Table[]> {
    return this.http.get<Table[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createTable(table: { seats: number }): Observable<Table> {
    return this.http.post<Table>(this.apiUrl, table, { headers: this.getHeaders() });
  }


  updateTable(id: number, updatedData: Partial<Table>): Observable<Table> {
    return this.http.put<Table>(`${this.apiUrl}/${id}`, updatedData, { headers: this.getHeaders() });
  }

  deleteTable(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
