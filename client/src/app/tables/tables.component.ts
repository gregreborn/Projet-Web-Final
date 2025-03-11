// tables.component.ts
import { Component, OnInit } from '@angular/core';
import { TableService, Table } from '../services/table.service';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./tables.component.scss']
})
export class TablesComponent implements OnInit {
  tables: Table[] = [];
  newSeats: number = 2;
  editTableId: number | null = null;
  editSeats: number = 2;

  constructor(private tableService: TableService) {}

  ngOnInit(): void {
    this.loadTables();
  }

  loadTables(): void {
    this.tableService.getTables().subscribe((tables) => {
      this.tables = tables;
    });
  }

  createTable(): void {
    if (this.newSeats < 2 || this.newSeats > 6) {
      alert('Seats must be between 2 and 6');
      return;
    }
    this.tableService.createTable({ seats: this.newSeats }).subscribe(() => {
      this.loadTables();
      this.newSeats = 2;
    });
  }

  updateTable(): void {
    if (this.editSeats < 2 || this.editSeats > 6) {
      alert('Seats must be between 2 and 6');
      return;
    }
    if (this.editTableId !== null) {
      this.tableService.updateTable(this.editTableId, { seats: this.editSeats }).subscribe(() => {
        this.loadTables();
        this.editTableId = null;
      });
    }
  }

  deleteTable(id: number): void {
    if (confirm('Are you sure you want to delete this table?')) {
      this.tableService.deleteTable(id).subscribe(() => {
        this.loadTables();
      });
    }
  }

  startEdit(table: Table): void {
    this.editTableId = table.id;
    this.editSeats = table.seats;
  }
}
