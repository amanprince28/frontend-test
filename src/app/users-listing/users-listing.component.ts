import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { SignalService } from '../signal.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../data.service';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-users-listing',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatPaginatorModule,
    MatTableModule,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [DataService],
  templateUrl: './users-listing.component.html',
  styleUrl: './users-listing.component.scss',
})
export class UsersListingComponent implements OnInit {
  displayedColumns: string[] = [
    'customerId',
    'name',
    'email',
    'role',
    'status',
    'actions',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);
  searchForm!: FormGroup;
  signalData = signal({});
  search = new FormControl();
  userDetails: any;
  userRole: any;
  totalCount = 0;
  pageSize = 10;
  currentPage = 0;
  isLoading = false;
  searchQuery: string = '';

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private signalService: SignalService,
    private dataService: DataService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userDetails = localStorage.getItem('user-details');
    this.userDetails = JSON.parse(this.userDetails);
    this.userRole = this.userDetails?.role ?? '';
    this.fetchData(this.currentPage, this.pageSize);
  }

  // ngAfterViewInit(): void {
  //   this.dataSource.paginator = this.paginator;
  //   this.paginator.page.subscribe((event) => {
  //     this.pageSize = event.pageSize;
  //     this.currentPage = event.pageIndex;
  //     this.fetchData(this.currentPage + 1, this.pageSize); // API usually expects page to start at 1
  //   });
  // }

  fetchData(pageIndex: number, pageSize: number): void {
    this.isLoading = true;

    const payload = {
      page: pageIndex + 1, // backend expects 1-based
      limit: pageSize,
      filter: this.searchQuery || undefined,
    };

    this.dataService.getUser(payload).subscribe({
      next: (response: any) => {
        // const sortedData = [...response.data].sort((a, b) => {
        //   if (a.status === b.status) {
        //     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        //   }
        //   return a.status === false ? -1 : 1;
        // });

        this.dataSource.data = response.data;

        this.totalCount = response.total || response.totalCount || 0;
        this.pageSize = pageSize;
        this.currentPage = pageIndex;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching data', err);
        this.snackbar.open('Failed to load data', 'Close', { duration: 2000 });
        this.isLoading = false;
      },
    });
  }

  onRowClick(row: any, action: string): void {
    if (!row.id) {
      return;
    }
    row.action = action;
    this.dataService.getUserById(row.id).subscribe((response: any) => {
      this.signalService.triggerAction(response);
      this.router.navigate(['/users-details', row]);
    });
  }

  filterTable(): void {
    const page = this.paginator?.pageIndex || 0;
    const limit = this.paginator?.pageSize || this.pageSize;

    const payload = {
      page: page + 1, // API expects 1-based index
      limit,
      filter: this.searchQuery,
    };

    this.dataService
      .findAgentAndLeads(this.searchQuery)
      .subscribe((response: any) => {
        if (response.data.length > 0) {
          this.dataSource.data = response.data;
          this.totalCount = response.total;
          this.currentPage = page;
          this.pageSize = limit;
        } else {
          this.snackbar.open('No Data Found', 'Close', { duration: 2000 });
          this.dataSource.data = [];
          this.paginator.length = 0;
        }
      });
  }

  onAddClick(): void {
    this.router.navigate(['/users-details']);
  }

  onDelete(row: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: 'Are you sure you want to delete this user?' },
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dataService.deleteUser(row.id).subscribe(
          () => {
            this.snackbar.open('User deleted successfully', 'Close', {
              duration: 2000,
            });
            this.fetchData(this.currentPage, this.pageSize);
          },
          (error: any) => {
            this.snackbar.open('Error deleting user', 'Close', {
              duration: 2000,
            });
          }
        );
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.fetchData(event.pageIndex, event.pageSize);
  }

}
