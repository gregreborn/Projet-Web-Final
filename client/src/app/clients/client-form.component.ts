import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../services/client.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  imports: [ReactiveFormsModule, NgIf],
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isEditMode = false;
  clientId: number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router
  ) {
    // Initialisation du formulaire avec validation
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: [''],
      is_admin: [false]
    });
  }

  ngOnInit(): void {
    const state = history.state.client;
    if (state) {
      this.isEditMode = true;
      this.clientId = state.id;
      // Remplit les champs du formulaire avec les données existantes du client
      this.clientForm.patchValue({
        name: state.name,
        email: state.email,
        is_admin: state.is_admin
      });

      // Retire les validations de mot de passe si aucun changement n'est fait
      this.clientForm.get('password')?.clearValidators();
      this.clientForm.get('confirmPassword')?.clearValidators();
    }
  }

  submitClient(): void {
    this.errorMessage = null;
    this.successMessage = null;

    // Vérifie la validité du formulaire
    if (this.clientForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    const { name, email, password, confirmPassword, is_admin } = this.clientForm.value;

    // Vérifie la correspondance des mots de passe en création
    if (!this.isEditMode && password !== confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    const clientData = {
      name,
      email,
      is_admin: !!is_admin, // Conversion forcée en booléen
      ...(password && { password })
    };

    if (this.isEditMode && this.clientId) {
      // Mise à jour du client existant
      this.clientService.updateProfile(this.clientId, clientData).subscribe(() => {
        this.successMessage = '✅ Client mis à jour avec succès!';
        setTimeout(() => this.router.navigate(['/dashboard']), 2000);
      });
    } else {
      // Création d'un nouveau client
      this.clientService.createClient(clientData).subscribe(() => {
        this.successMessage = '✅ Client créé avec succès!';
        setTimeout(() => this.router.navigate(['/dashboard']), 2000);
      });
    }
  }
}
