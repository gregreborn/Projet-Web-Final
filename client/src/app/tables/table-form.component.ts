import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TableService } from '../services/table.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table-form',
  templateUrl: './table-form.component.html',
  imports: [
    ReactiveFormsModule,
  ],
  styleUrls: ['./table-form.component.scss']
})
export class TableFormComponent implements OnInit {
  tableForm: FormGroup;
  isEditMode = false;
  tableId: number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private tableService: TableService,
    private router: Router
  ) {
    this.tableForm = this.fb.group({
      seats: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    const state = history.state.table;
    if (state) {
      // Mode édition : remplit le formulaire avec les données existantes
      this.isEditMode = true;
      this.tableId = state.id;
      this.tableForm.patchValue({
        seats: state.seats
      });
    }
  }

  // Soumission du formulaire pour créer ou modifier une table
  submitTable(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.tableForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    const tableData = this.tableForm.value;

    if (this.isEditMode && this.tableId) {
      // Mise à jour d'une table existante
      this.tableService.updateTable(this.tableId, tableData).subscribe({
        next: () => {
          this.successMessage = '✅ Table mise à jour avec succès!';
          setTimeout(() => this.router.navigate(['/tables']), 2000);
        },
        error: (error) => {
          this.errorMessage = error.error.message || 'Erreur lors de la mise à jour de la table.';
        }
      });
    } else {
      // Création d'une nouvelle table
      this.tableService.createTable(tableData).subscribe({
        next: () => {
          this.successMessage = '✅ Table créée avec succès!';
          setTimeout(() => this.router.navigate(['/tables']), 2000);
        },
        error: (error) => {
          this.errorMessage = error.error.message || 'Erreur lors de la création de la table.';
        }
      });
    }
  }
}
