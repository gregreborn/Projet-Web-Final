import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [
    RouterLink
  ],
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {}
