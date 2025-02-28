import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { SignalService } from '../signal.service';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-loan-management',
  templateUrl: './loan-management.component.html',
  styleUrls: ['./loan-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class LoanManagementComponent implements OnInit {
  displayedColumns: string[] = [
    'loanId',
    'customerName',
    'agentName',
    'principleAmount',
    'amountGiven',
    'paymentTerm',
    'interest',
    'paymentPerTerm',
    'status',
    'actions',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);
  searchQuery: any;
  signalData = signal({});
  userDetails: any
  userRole: any;

  constructor(
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
    this.fetchData();
  }

  ngAfterViewInit(): void {
    
    this.dataSource.paginator = this.paginator;
    this.paginator.page.subscribe(() => {
      this.fetchData(this.paginator.pageIndex, this.paginator.pageSize);
    });

  }

  fetchData(page: number = 0, limit: number = 5): void {
    const payload = { page, limit };
    this.dataService.getLoan(payload).subscribe((response: any) => {
      console.log(response);
      this.dataSource.data = response
    });
  }

  onAddEdit() {
    this.router.navigateByUrl('loan-add');
  }

  onRowClick(row: any, action: string): void {
    if (!row.id) {
      return;
    }
    console.log(row, 'row');

    // Add the action to the row object
    row.action = action;

    // Trigger action with the modified row object
    this.signalService.triggerAction(row);

    // Navigate to the loan-add route, passing the modified row object
    this.router.navigate(['/loan-add', row]);
  }

  filterTable(): void {
    if (this.searchQuery != null || this.searchQuery != undefined) {
      this.dataSource.filter = this.searchQuery as string;
      return;
    }
    this.dataSource.filter = '';
  }

  onDelete(row: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: 'Are you sure you want to delete this user?' },
      width: '400px',
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Call the delete API
        this.dataService.deleteLoan(row.id).subscribe(
          () => {
            this.snackbar.open('User deleted successfully', 'Close', { duration: 2000 });
            this.fetchData(); // Reload data after deletion
          },
          (error: any) => {
            this.snackbar.open('Error deleting user', 'Close', { duration: 2000 });
          }
        );
      }
    });
}
}
