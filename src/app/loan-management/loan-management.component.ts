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

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  totalCount = 0;
  pageSize = 10;
  currentPage = 0;
  isLoading = false;
  searchQuery: string = '';

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

  fetchData(pageIndex: number, pageSize: number): void {
    this.isLoading = true;

    const payload = {
      page: pageIndex + 1, // backend expects 1-based
      limit: pageSize,
      filter: this.searchQuery || undefined,
    };

    this.dataService.getLoan(payload).subscribe({
      next: (res: any) => {
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
      error: () => {
        this.snackbar.open('Error fetching data', 'Close', { duration: 2000 });
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
      },
    });
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
