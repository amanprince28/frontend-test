import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { SignalService } from '../signal.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../data.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    HttpClientModule, // Ensure HttpClientModule is imported here
    MatPaginatorModule,
    FormsModule,
    MatIconModule,
    
  ],
  providers: [DataService], // Ensure DataService is provided here
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent implements OnInit {
  displayedColumns: string[] = ['userId','name', 'ic', 'passport', 'actions'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);
  searchQuery: any;
  userDetails: any;
  userRole: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private signalService: SignalService,
    private dataService: DataService,
    private snackbar:MatSnackBar,
    private dialog:MatDialog
  ) {}

  ngOnInit(): void {
    this.userDetails = localStorage.getItem('user-details');
    this.userDetails = JSON.parse(this.userDetails)
    this.userRole = this.userDetails?.role ?? '';
    this.fetchData(); // Initial data fetch
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.filterTable(); // Refetch data when page changes
    });
  }

  fetchData(page: number = 0, limit: number = 5): void {
    const payload = { page, limit };
    this.dataService.getCustomer(payload).subscribe((response: any) => {
      console.log(response);
      this.dataSource.data = response.data;
    });
  }

  filterTable(): void {
    const searchValue = this.searchQuery
    console.log(searchValue, 'Search Value');
    this.dataService.getCustomerSearch(searchValue).subscribe((response: any) => {
      console.log(response);
      if(response.length>0){
      this.dataSource.data = response; // Update table with filtered results
      this.paginator.length = response.totalCount; 
      }// Update total record count
      else{
        this.snackbar.open('No Data Found', 'Close', { duration: 2000 });
      }
    });
  }

  onRowClick(row: any, action: string): void {
    if (!row.id) {
      return;
    }
    row.action = action;
    this.dataService.getCustomerById(row.id).subscribe((response: any) => {
      this.signalService.triggerAction(response);
      this.router.navigate(['/details', row]);
    });
  }

  onAddClick(): void {
    this.router.navigate(['/details']);
  }

  onDelete(row: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: 'Are you sure you want to delete this user?' },
      width: '400px',
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Call the delete API
        this.dataService.deleteCustomer(row.id).subscribe(
          () => {
            this.snackbar.open('Customer deleted successfully', 'Close', { duration: 2000 });
            this.fetchData(); // Reload data after deletion
          },
          (error: any) => {
            this.snackbar.open('Error deleting Customer', 'Close', { duration: 2000 });
          }
        );
      }
    });
}
}
