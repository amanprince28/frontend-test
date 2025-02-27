import { Routes } from '@angular/router';
import { ListingComponent } from './listing/listing.component';
import { DetailsComponent } from './details/details.component';
import { LoginComponent } from './login/login.component';
import { MainLayoutComponent } from './main-layout/main-layout.component'; // Import the new layout component
import { UsersListingComponent } from './users-listing/users-listing.component';
import { UserDetailsComponent } from './users-listing/user-details/user-details.component';
import { LoanManagementComponent } from './loan-management/loan-management.component';
import { LoanAddEditComponent } from './loan-management/loan-add-edit/loan-add-edit.component';
import { PasswordChangeComponent } from './password-change/password-change.component';
import { CustomerCheckComponent } from './customer-check/customer-check.component';
import { PaymentComponent } from './payment/payment.component';
import { RoleGuard } from './common/auth.guard';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'listing', component: ListingComponent,canActivate:[RoleGuard]  },
      { path: 'users', component: UsersListingComponent,canActivate:[RoleGuard]  },
      { path: 'users-details', component: UserDetailsComponent,canActivate:[RoleGuard]  },
      { path: 'users-details/:id', component: UserDetailsComponent ,canActivate:[RoleGuard] },
      { path: 'details/:id', component: DetailsComponent ,canActivate:[RoleGuard] },
      { path: 'details', component: DetailsComponent ,canActivate:[RoleGuard] }, // Route for adding new details
      {path:'loan',component:LoanManagementComponent,canActivate:[RoleGuard] },
      {path:'loan-add',component:LoanAddEditComponent,canActivate:[RoleGuard] },
      {path:'change-password',component:PasswordChangeComponent,canActivate:[RoleGuard] },
      {path:'customer-check',component:CustomerCheckComponent,canActivate:[RoleGuard] },
      {path:'payment',component:PaymentComponent,canActivate:[RoleGuard] },
    ]
  }
];
