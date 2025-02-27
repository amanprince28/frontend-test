import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

    // Check if the user is logged in
    const accountDetails = localStorage.getItem('user-details');
    if (!accountDetails) {
      // If not logged in, redirect to login page
      this.router.navigate(['/login']);
      return false;
    }

    // Parse the account details
    const userDetails = JSON.parse(accountDetails);
    const userRole = userDetails?.role;

    // Define allowed routes for each role
    const allowedRoutes: { [key: string]: string[] } = {
      'SUPER_ADMIN': ['users', 'users-details', 'loan', 'details', 'listing', 'loan-add', 'change-password', 'payment','customer-check'],
      'ADMIN': ['loan', 'details', 'listing', 'loan-add', 'change-password', 'payment','customer-check'],
      'AGENT': ['loan', 'details', 'listing', 'loan-add', 'change-password', 'payment','customer-check'],
      'LEAD': ['loan', 'details', 'listing', 'loan-add', 'change-password', 'payment','customer-check'],
    };

    // Check if the user has a valid role
    if (!userRole || !allowedRoutes[userRole]) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if the requested route is allowed for the user's role
    const routePath = next.routeConfig?.path;
    if (routePath && allowedRoutes[userRole].includes(routePath)) {
      return true;
    }

    // If the route is not allowed, redirect to login
    this.router.navigate(['/login']);
    return false;
  }
}