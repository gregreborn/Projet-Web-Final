import { Router, RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from './services/auth.service';
import {NgbCollapse} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterModule, NgIf, NgbCollapse]
})
export class AppComponent implements OnInit {
  title = 'Projet-Web-Final';
  isLoggedIn = false;
  isAdmin = false;
  isCollapsed = true;

  constructor(private authService: AuthService, private router: Router, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(status => {
      this.ngZone.run(() => { // ✅ Ensure UI refreshes
        this.isLoggedIn = status;
        this.updateUserStatus();
      });
    });

    window.addEventListener('auth-changed', () => {
      this.ngZone.run(() => { // ✅ Force UI update when auth changes
        this.updateUserStatus();
      });
    });
  }

  updateUserStatus(): void {
    const user = this.authService.getCurrentUser();
    this.isLoggedIn = !!user;
    this.isAdmin = user?.is_admin ?? false; // ✅ Ensure `is_admin` is used (not `isAdmin`)

    console.log(`🔹 Navigation updated: isLoggedIn = ${this.isLoggedIn}, isAdmin = ${this.isAdmin}`);
  }



  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.router.navigate(['/home']); // ✅ Redirect to home after logout
  }
}
