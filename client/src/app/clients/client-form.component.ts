import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ClientService } from '../services/client.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  imports: [
    ReactiveFormsModule
  ],
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isEditMode = false;
  clientId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router
  ) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
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
      });
    }
  }

  submitClient(): void {
    if (this.clientForm.invalid) return;

    const clientData = this.clientForm.value;

    if (this.isEditMode && this.clientId) {
      this.clientService.updateClient(this.clientId, clientData).subscribe(() => {
        this.router.navigate(['/dashboard']);
      });
    } else {
      this.clientService.createClient(clientData).subscribe(() => {
        this.router.navigate(['/dashboard']);
      });
    }
  }
}
