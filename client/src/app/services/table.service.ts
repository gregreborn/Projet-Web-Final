import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Table {
  id: number;
  table_number: number;
  capacity: number;
  // Add any other fields as needed
}

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private apiUrl = 'http://localhost:5000/api/tables';

  constructor(private http: HttpClient) {
    console.log('✅ TableService initialized');
  }

  // Retrieve all tables from the backend
  getTables(): Observable<Table[]> {
    const token = localStorage.getItem('token');
    console.log('🔹 TableService token:', token);
    return this.http.get<Table[]>(this.apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Optionally add more methods for table operations:
  // createTable, updateTable, deleteTable, etc.
}
