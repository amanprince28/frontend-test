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


export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'listing', component: ListingComponent },
      { path: 'users', component: UsersListingComponent },
      { path: 'users-details', component: UserDetailsComponent },
      { path: 'users-details/:id', component: UserDetailsComponent },
      { path: 'details/:id', component: DetailsComponent },
      { path: 'details', component: DetailsComponent }, // Route for adding new details
      {path:'loan',component:LoanManagementComponent},
      {path:'loan-add',component:LoanAddEditComponent},
      {path:'change-password',component:PasswordChangeComponent},
      {path:'customer-check',component:CustomerCheckComponent}
    ]
  }
];
