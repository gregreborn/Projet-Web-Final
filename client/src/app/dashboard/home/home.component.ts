import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [
    RouterLink,
    NgIf
  ],
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(public authService: AuthService) {}
}
