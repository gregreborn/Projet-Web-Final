import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    // Vérifie si l'utilisateur est connecté via le service d'autorisation
    if (this.authService.getCurrentUser()) {
      return true;
    } else {
      // Redirige vers la page de connexion si l'utilisateur n'est pas authentifié
      return this.router.parseUrl('/login');
    }
  }
}
