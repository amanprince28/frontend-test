import {
  Component,
  OnInit,
  signal,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { SignalService } from '../signal.service';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../common/custom-date-adapter';
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
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
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
    'loanDate',
    'nextPaymentdate',
    'actions',
  ];

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  totalCount = 0;
  pageSize = 10;
  currentPage = 0;
  isLoading = false;
  searchQuery: string = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;

  userDetails: any;
  userRole: string = '';
  agentName2: boolean = false;

  constructor(
    private router: Router,
    private signalService: SignalService,
    private dataService: DataService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const user = localStorage.getItem('user-details');
    this.userDetails = user ? JSON.parse(user) : null;
    this.userRole = this.userDetails?.role || '';
    this.fetchData(this.currentPage, this.pageSize);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.sortData = (data: any[], sort: MatSort) =>
      this.sortLoans(data, sort);
  }

  // Sorts the loans shown on the current page by Loan ID, created date or next payment date.
  private sortLoans(data: any[], sort: Sort): any[] {
    if (!sort.active || sort.direction === '') return data;

    const dir = sort.direction === 'asc' ? 1 : -1;
    const toTime = (value: any) => (value ? new Date(value).getTime() : NaN);

    return [...data].sort((a, b) => {
      if (sort.active === 'loanId') {
        // numeric: true so "L10" comes after "L9"
        return (
          String(a.generate_id ?? '').localeCompare(
            String(b.generate_id ?? ''),
            undefined,
            { numeric: true, sensitivity: 'base' }
          ) * dir
        );
      }

      const field = sort.active === 'loanDate' ? 'loan_date' : 'nextPaymentDate';
      const timeA = toTime(a[field]);
      const timeB = toTime(b[field]);

      // Loans without a date always go to the bottom
      if (isNaN(timeA) && isNaN(timeB)) return 0;
      if (isNaN(timeA)) return 1;
      if (isNaN(timeB)) return -1;
      return (timeA - timeB) * dir;
    });
  }

  // yyyy-MM-dd in local time (toISOString would shift the day in +08:00).
  // Returns '' for a missing or half-typed date so it is never sent.
  private toApiDate(date: Date | null): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  fetchData(pageIndex: number, pageSize: number, showNoDataMessage = false): void {
    this.isLoading = true;

    const payload = {
      page: pageIndex + 1, // backend expects 1-based
      limit: pageSize,
      filter: (this.searchQuery || '').trim(),
      fromDate: this.toApiDate(this.fromDate),
      toDate: this.toApiDate(this.toDate),
    };

    // Use the date-range API only when a loan date is picked
    const request$ =
      payload.fromDate || payload.toDate
        ? this.dataService.getLoanByLoanDate(payload)
        : this.dataService.getLoanWithFilter(payload);

    request$.subscribe({
      next: (res: any) => {
        res.data = res.data || [];
        if (showNoDataMessage && res.data.length === 0) {
          this.snackbar.open('No Data Found', 'Close', { duration: 2000 });
        }

        res.data.sort((a: any, b: any) => {
          return new Date(b.loan_date).getTime() - new Date(a.loan_date).getTime();
        });

        this.dataSource.data = res.data || [];
        this.totalCount = res.total || res.totalCount || 0;
        this.pageSize = pageSize;
        this.currentPage = pageIndex;
        
        const hasUser2 = this.dataSource.data.some(
          (item: any) => item.user_2 !== null
        );
        this.updateAgentNameTwoColumn(hasUser2);

        this.isLoading = false;
      },
      error: (err) => {
        const message = err?.error?.message || 'Error fetching data';
        this.snackbar.open(message, 'Close', { duration: 2000 });
        this.isLoading = false;
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.fetchData(event.pageIndex, event.pageSize);
  }

  updateAgentNameTwoColumn(hasUser2: boolean): void {
    const exists = this.displayedColumns.includes('agentNametwo');
    const agentNameIndex = this.displayedColumns.indexOf('agentName');

    if (hasUser2 && !exists) {
      this.displayedColumns.splice(agentNameIndex + 1, 0, 'agentNametwo');
    } else if (!hasUser2 && exists) {
      this.displayedColumns = this.displayedColumns.filter(
        (col) => col !== 'agentNametwo'
      );
    }
  }

  onAddEdit(): void {
    this.router.navigateByUrl('loan-add');
  }

  onRowClick(row: any, action: string): void {
    if (!row.id) return;

    row.action = action;
    const data = {
      id: row.id,
      action: row.action,
      generate_id: row.generate_id,
    };
    this.signalService.triggerAction(row);
    this.router.navigate(['/loan-add'], { state: { data } });
  }

  // Search text and loan date filters always start again from the first page
  filterTable(): void {
    if (this.fromDate && this.toDate && this.fromDate > this.toDate) {
      this.snackbar.open('From date cannot be after To date', 'Close', { duration: 2000 });
      return;
    }
    this.fetchData(0, this.paginator?.pageSize || this.pageSize, true);
  }

  // Refresh the table as soon as a loan date is picked or cleared
  onLoanDateChange(): void {
    this.filterTable();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.fromDate = null;
    this.toDate = null;
    this.fetchData(0, this.paginator?.pageSize || this.pageSize);
  }

  onDelete(row: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: 'Are you sure you want to delete this user?' },
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.dataService.deleteLoan(row.id).subscribe({
          next: () => {
            this.snackbar.open('User deleted successfully', 'Close', {
              duration: 2000,
            });
            this.fetchData(this.currentPage, this.pageSize);
          },
          error: () => {
            this.snackbar.open('Error deleting user', 'Close', {
              duration: 2000,
            });
          },
        });
      }
    });
  }
}
