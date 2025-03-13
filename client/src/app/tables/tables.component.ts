import { Component, OnInit } from '@angular/core';
import { TableService, Table } from '../services/table.service';
import {Router, RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  imports: [
    FormsModule,
    NgForOf,
    RouterLink,
  ],
  styleUrls: ['./tables.component.scss']
})
export class TablesComponent implements OnInit {
  tables: Table[] = [];

  constructor(private tableService: TableService, private router: Router) {}

  ngOnInit(): void {
    this.loadTables();
  }

  loadTables(): void {
    this.tableService.getTables().subscribe((tables) => {
      this.tables = tables;
    });
  }

  editTable(table: Table): void {
    this.router.navigate(['/tables/form'], { state: { table } });
  }

  deleteTable(id: number): void {
    if (confirm('Are you sure you want to delete this table?')) {
      this.tableService.deleteTable(id).subscribe(() => {
        this.loadTables();
      });
    }
  }

  createTable(): void {
    this.router.navigate(['/tables/form']);
  }

}
