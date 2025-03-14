import { Component, OnInit } from '@angular/core';
import { TableService, Table } from '../services/table.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
  ],
  styleUrls: ['./tables.component.scss']
})
export class TablesComponent implements OnInit {
  tables: Table[] = [];
  newTable: Partial<Table> = { seats: 0 }; // ✅ Nouvelle table initialisée

  constructor(private tableService: TableService, private router: Router) {}

  ngOnInit(): void {
    this.loadTables();
  }

  // Charge la liste des tables existantes
  loadTables(): void {
    this.tableService.getTables().subscribe((tables) => {
      this.tables = tables;
    });
  }

  // Ouvre le formulaire d'édition pour une table existante
  editTable(table: Table): void {
    this.router.navigate(['/tables/form'], { state: { table } });
  }

  // Supprime une table après confirmation
  deleteTable(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette table ?')) {
      this.tableService.deleteTable(id).subscribe(() => {
        this.loadTables();
      });
    }
  }

  // Crée une nouvelle table après validation du formulaire
  createTable(): void {
    if (!this.newTable.seats || this.newTable.seats <= 0) {
      alert('Veuillez entrer un nombre valide de sièges.');
      return;
    }

    this.tableService.createTable({ seats: this.newTable.seats }).subscribe(() => {
      this.loadTables();
      this.newTable.seats = 0; // ✅ Réinitialise le formulaire après création
    });
  }
}
