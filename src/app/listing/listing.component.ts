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
  displayedColumns: string[] = ['userId','name', 'ic', 'passport','mobileNo','ongoing',
    'completed',
    'badDebt',
    'badDebtCompleted', 'actions'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);
  searchQuery: any;
  userDetails: any;
  userRole: any;
  totalRecords = 0;
  isFiltered = false;

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
    this.dataSource.paginator = this.paginator;
    this.paginator.page.subscribe(() => {
      if (this.isFiltered) {
        // If filtered, we're showing all results on one page
        return;
      }
      this.fetchData(this.paginator.pageIndex + 1, this.paginator.pageSize);
    });
  }

  fetchData(page: number = 1, limit: number = 10): void {
    const payload = { page, limit };
    this.dataService.getCustomer(payload).subscribe((response: any) => {
      this.dataSource.data = response.data;
      this.totalRecords = response.totalCount || response.data.length;
      this.paginator.length = this.totalRecords;
    });
  }

  filterTable(): void {
    const searchValue = this.searchQuery;
    
    if (!searchValue || searchValue.trim() === '') {
      this.isFiltered = false;
      this.fetchData();
      return;
    }

    this.isFiltered = true;
    this.dataService.getCustomerSearch(searchValue).subscribe((response: any) => {
      if (response && response.length > 0) {
        this.dataSource.data = response;
        this.paginator.length = response.length;
        this.paginator.pageSize = response.length; // Show all filtered results on one page
      } else {
        this.snackbar.open('No Data Found', 'Close', { duration: 2000 });
        this.dataSource.data = [];
        this.paginator.length = 0;
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
      this.router.navigate(['/details'], { state: { data: row } });

      //this.router.navigate(['/details', row]);
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

clearFilter(): void {
  this.searchQuery = '';
  this.isFiltered = false;
  this.fetchData();
}
}
