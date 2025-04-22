import { Component, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
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
export class LoanManagementComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'loanId',
    'customerName',
    'customerIC',
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
  userDetails: any;
  userRole: any;
  agentName2: boolean = false;
  totalCount: number = 0;
  currentPage: number = 0; // Changed to 0-based index to match Material paginator
  pageSize: number = 10;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private signalService: SignalService,
    private dataService: DataService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userDetails = localStorage.getItem('user-details');
    this.userDetails = JSON.parse(this.userDetails);
    this.userRole = this.userDetails?.role ?? '';
    this.fetchData();
  }

  ngAfterViewInit(): void {
    // Connect the paginator after view init
    this.dataSource.paginator = this.paginator;
    
    // Listen for paginator changes
    this.paginator.page.subscribe(() => {
      this.fetchData(this.paginator.pageIndex, this.paginator.pageSize);
    });
  }

  fetchData(page: number = this.currentPage, limit: number = this.pageSize): void {
    this.isLoading = true;
    const payload = { page: page + 1, limit }; // API expects 1-based index
    
    this.dataService.getLoan(payload).subscribe({
      next: (response: any) => {
        this.dataSource.data = response.data;
        this.totalCount = response.total || response.totalCount; // Handle both response formats
        this.currentPage = page;
        this.pageSize = limit;

        // Update agentNametwo column visibility
        const hasUser2 = response.data.some((item: any) => item.user_2 !== null);
        this.updateAgentNameTwoColumn(hasUser2);

        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.snackbar.open('Error loading data', 'Close', { duration: 2000 });
      }
    });
  }

  private updateAgentNameTwoColumn(hasUser2: boolean): void {
    const agentNameTwoIndex = this.displayedColumns.indexOf('agentNametwo');
    
    if (hasUser2 && agentNameTwoIndex === -1) {
      const agentNameIndex = this.displayedColumns.indexOf('agentName');
      this.displayedColumns.splice(agentNameIndex + 1, 0, 'agentNametwo');
    } else if (!hasUser2 && agentNameTwoIndex !== -1) {
      this.displayedColumns = this.displayedColumns.filter(col => col !== 'agentNametwo');
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchData(this.currentPage, this.pageSize);
  }

  onAddEdit() {
    this.router.navigateByUrl('loan-add');
  }

  onRowClick(row: any, action: string): void {
    if (!row.id) {
      return;
    }

    row.action = action;
    const data = {
      id: row.id,
      action: row.action,
      generate_id: row.generate_id
    };
    
    this.signalService.triggerAction(row);
    this.router.navigate(['/loan-add'], { state: { data: data } });
  }

  filterTable(): void {
    const page = this.paginator?.pageIndex || 0;
    const limit = this.paginator?.pageSize || this.pageSize;
  
    const payload = {
      page: page + 1, // API expects 1-based index
      limit,
      filter: this.searchQuery,
    };
  
    this.dataService.getLoanWithFilter(payload).subscribe({
      next: (response: any) => {
        if (response.data?.length > 0) {
          this.dataSource.data = response.data;
          this.totalCount = response.total || response.totalCount;
          this.currentPage = page;
          this.pageSize = limit;
        } else {
          this.snackbar.open('No Data Found', 'Close', { duration: 2000 });
          this.dataSource.data = [];
          this.totalCount = 0;
          this.currentPage = 0;
        }
      },
      error: (error) => {
        this.snackbar.open('Error filtering data', 'Close', { duration: 2000 });
      }
    });
  }

  onDelete(row: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: 'Are you sure you want to delete this user?' },
      width: '400px',
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dataService.deleteLoan(row.id).subscribe(
          () => {
            this.snackbar.open('User deleted successfully', 'Close', { duration: 2000 });
            this.fetchData(this.currentPage, this.pageSize);
          },
          (error: any) => {
            this.snackbar.open('Error deleting user', 'Close', { duration: 2000 });
          }
        );
      }
    });
  }
}