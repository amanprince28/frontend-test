import { Routes } from '@angular/router';
import { ListingComponent } from './listing/listing.component';
import { DetailsComponent } from './details/details.component';

export const routes: Routes = [
    { path:'', component:ListingComponent},
    { path:'details/:id', component:DetailsComponent}
];
