import { Component, OnInit } from '@angular/core';
import { ClientService } from '../services/client.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

interface Client {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    FormsModule,
    NgIf
  ]
})
export class ProfileComponent implements OnInit {
  client: Client | null = null;
  errorMessage: string | null = null;
  updatedName = '';
  updatedEmail = '';
  currentUser: any = null;
  usingAutoPassword = false;
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false; // ✅ Show loading state

  constructor(private clientService: ClientService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.clientService.getProfile().subscribe({
      next: (data: Client) => {
        this.client = data;
        this.updatedName = data.name;
        this.updatedEmail = data.email;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('❌ Erreur lors du chargement du profil', err);
        this.errorMessage = 'Erreur lors du chargement du profil';
        this.isLoading = false;
      }
    });
  }

  updateProfile(): void {
    if (!this.client) return;

    // Reset previous error message
    this.errorMessage = null;

    if (!this.updatedName.trim() || !this.updatedEmail.trim()) {
      this.errorMessage = "⚠️ Veuillez remplir tous les champs.";
      return;
    }

    if (!this.validateEmail(this.updatedEmail)) {
      this.errorMessage = "⚠️ Veuillez entrer un email valide.";
      return;
    }

    const updatedData: any = {};
    if (this.updatedName !== this.client.name) updatedData.name = this.updatedName;
    if (this.updatedEmail !== this.client.email) updatedData.email = this.updatedEmail;

    this.clientService.updateProfile(this.client.id, updatedData).subscribe({
      next: (data: Client) => {
        this.client = data;
        this.errorMessage = null; // ✅ Clear error message if successful
        alert('✅ Profil mis à jour avec succès!');
      },
      error: (err: any) => {
        console.error('❌ Erreur lors de la mise à jour du profil', err);

        if (err.error?.error?.includes("Cet email ne peut pas être utilisé")) {
          this.errorMessage = "⚠️ Cet email est déjà utilisé. Veuillez en choisir un autre.";
        } else {
          this.errorMessage = "❌ Une erreur s'est produite. Veuillez réessayer plus tard.";
        }
      }
    });
  }

  changePassword(): void {
    this.errorMessage = null; // Reset error message

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = '⚠️ Veuillez remplir tous les champs.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = '⚠️ Les nouveaux mots de passe ne correspondent pas.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = "⚠️ Le mot de passe doit contenir au moins 6 caractères.";
      return;
    }

    this.clientService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.errorMessage = null; // ✅ Clear error message if successful
        alert('✅ Mot de passe changé avec succès !');
        this.usingAutoPassword = false;
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err: { error: { error: string; }; }) => {
        this.errorMessage = '❌ Erreur : ' + err.error.error;
      }
    });
  }


  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
