import { Component, OnInit } from '@angular/core';
import { ClientService } from '../services/client.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

interface Client {
  id: number;
  name: string;
  email: string;
  is_admin?: boolean;
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
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  usingAutoPassword = false;
  isLoading = false;

  constructor(private clientService: ClientService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  // Charge les données du profil utilisateur depuis le serveur
  loadProfile(): void {
    this.isLoading = true;
    this.clientService.getProfile().subscribe({
      next: (data: Client) => {
        this.client = data;
        this.updatedName = data.name;
        this.updatedEmail = data.email;
        this.detectAutoPassword();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('❌ Erreur lors du chargement du profil', err);
        this.errorMessage = 'Erreur lors du chargement du profil';
        this.isLoading = false;
      }
    });
  }

  // Vérifie si l'utilisateur utilise un mot de passe généré automatiquement
  detectAutoPassword(): void {
    const autoPassword = localStorage.getItem('autoPassword');
    this.usingAutoPassword = !!autoPassword;
  }

  // Met à jour les informations du profil
  updateProfile(): void {
    if (!this.client) return;

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

  // Change le mot de passe de l'utilisateur
  changePassword(): void {
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
        alert('✅ Mot de passe changé avec succès !');
        this.usingAutoPassword = false;
        localStorage.removeItem('autoPassword');
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err: { error: { error: string; }; }) => {
        this.errorMessage = '❌ Erreur : ' + err.error.error;
      }
    });
  }

  // Vérifie si l'email est valide
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
