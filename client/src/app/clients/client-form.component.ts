import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ClientService } from '../services/client.service';
import { Router } from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
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
      this.clientForm.patchValue({
        name: state.name,
        email: state.email,
        is_admin: state.is_admin
      });

      // Remove password validation for edit unless modified
      this.clientForm.get('password')?.clearValidators();
      this.clientForm.get('confirmPassword')?.clearValidators();
    }
  }

  submitClient(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.clientForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    const { name, email, password, confirmPassword, is_admin } = this.clientForm.value;

    if (!this.isEditMode && password !== confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    const clientData = {
      name,
      email,
      is_admin: !!is_admin, // Force boolean conversion,
      ...(password && { password })
    };

    if (this.isEditMode && this.clientId) {
      this.clientService.updateProfile(this.clientId, clientData).subscribe(() => {
        this.successMessage = '✅ Client mis à jour avec succès!';
        setTimeout(() => this.router.navigate(['/dashboard']), 2000);
      });
    } else {
      this.clientService.createClient(clientData).subscribe(() => {
        this.successMessage = '✅ Client créé avec succès!';
        setTimeout(() => this.router.navigate(['/dashboard']), 2000);
      });
    }
  }

}
