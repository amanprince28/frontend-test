import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from '../data.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-loan-check',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatButtonModule,
    MatChipsModule,
    MatPaginatorModule,
    MatIconModule,
  ],
  templateUrl: './loan-check.component.html',
  styleUrls: ['./loan-check.component.scss'],
})
export class LoanCheckComponent implements OnInit, AfterViewInit {
  form!: FormGroup;
  // dataSource = new MatTableDataSource<any>([]); // Keep only ONE instance
  // @ViewChild(MatPaginator) paginator!: MatPaginator;

  agents = signal<{ id: string; name: string }[]>([]);
  selectedAgentIds = signal<string[]>([]);
  selectAllValue = 'select_all';
  private _destroyed = new Subject<void>();

  loanStatus = [
    { status: 'Completed' },
    { status: 'Normal' },
    { status: 'Bad Debt' },
    { status: 'Bad Debt Completed' },
    { status: 'Partially Paid' },
  ];


  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<any>();
  totalCount = 0;
  pageSize = 10;
  currentPage = 0;

  displayedColumns: string[] = [
    'agent',
    'customerName',
    'customerIC',
    'dueDate',
    'dueAmount',
    'remark',
  ];

  constructor(
    private dataService: DataService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAgents();
    
    // Trigger data load when form changes (optional)
    this.form.valueChanges.pipe(
      takeUntil(this._destroyed),
      debounceTime(300)
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadLoanData();
    });
  }
  
  ngAfterViewInit(): void {
    // Ensure paginator is properly initialized
    this.dataSource.paginator = this.paginator;
    
    // Initial data load
    this.loadLoanData();
    
    // Sync paginator with component state
    if (this.paginator) {
      this.paginator.page
        .pipe(takeUntil(this._destroyed))
        .subscribe((pageEvent: PageEvent) => {
          this.onPageChange(pageEvent);
        });
    }
  }
  
  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  initializeForm(): void {
    const today = new Date();
    this.form = this.fb.group({
      agents: [[]],
      dateFrom: [today],
      dateTo: [today],
      status:[]
    });
  }

  // Update the loadLoanData method to properly handle pagination
  loadLoanData(): void {
    const payload = {
      page: this.currentPage + 1, // Backend expects 1-based index
      limit: this.pageSize,
      agents: this.form.value.agents || [],
      dateFrom: this.form.value.dateFrom,
      dateTo: this.form.value.dateTo,
      status:this.form.value.status
    };
  
    this.dataService
      .getLoanCheck(
        payload.agents,
        payload.dateFrom,
        payload.dateTo,
        payload.page,
        payload.limit
      )
      .pipe(takeUntil(this._destroyed))
      .subscribe({
        next: (response: any) => {
          // Verify response structure
          console.log('API Response:', response);
          
          this.totalCount = response.totalCount || 0;
          this.dataSource.data = response.data || [];
          
          // Force update paginator
          if (this.paginator) {
            setTimeout(() => {
              this.paginator.length = this.totalCount;
              this.paginator.pageSize = this.pageSize;
              this.paginator.pageIndex = this.currentPage;
            });
          }
        },
        error: (err) => {
          console.error('Error loading data:', err);
          this.snackBar.open('Failed to load data', 'Close', { duration: 2000 });
        }
      });
  }

  // Update the onPageChange method
  onPageChange(event: PageEvent): void {
    if (this.pageSize !== event.pageSize) {
      // Reset to first page if page size changed
      this.currentPage = 0;
      this.pageSize = event.pageSize;
    } else {
      this.currentPage = event.pageIndex;
    }
    this.loadLoanData();
  }

  // Update the fetchData method
  fetchData(): void {
    this.currentPage = 0; // Reset to first page on new search
    this.loadLoanData();
  }

  getAgentNameById(id: string): string {
    const agent = this.agents().find((agent) => agent.id === id);
    return agent ? agent.name : 'Unknown';
  }

  getRowClass(row: any): string {
    const today = new Date();
    const dueDate = row.dueDate ? new Date(row.dueDate) : null;

    if (!dueDate) return 'normal';
    const isDue = dueDate <= today;
    if (isDue && row.remark) return 'dark-red';
    if (isDue) return 'pink-red';
    return 'normal';
  }

  isAllSelected(): boolean {
    return (
      this.agents().length > 0 &&
      this.form.get('agents')?.value?.length === this.agents().length
    );
  }

  toggleSelectAll(event: Event): void {
    event.stopPropagation();
    const allIds = this.agents().map((agent) => agent.id);

    if (this.isAllSelected()) {
      this.form.get('agents')?.setValue([]);
      this.selectedAgentIds.set([]);
    } else {
      this.form.get('agents')?.setValue(allIds);
      this.selectedAgentIds.set(allIds);
    }
  }

  onAgentSelectionChange(event: MatSelectChange): void {
    const selected = event.value.filter(
      (v: string) => v !== this.selectAllValue
    );
    this.selectedAgentIds.set(selected);
    this.form.get('agents')?.setValue(selected);
  }

  onSelectOpened(): void {
    const formValue = this.form.get('agents')?.value || [];
    this.selectedAgentIds.set(formValue);
  }

  loadAgents(): void {
    const payload = { page: 1, limit: 100 };
    this.dataService.getUser(payload).subscribe({
      next: (response) => {
        const filteredAgents = response.data
          .filter((user: any) => user.role === 'AGENT' || user.role === 'LEAD')
          .map((agent: any) => ({ id: agent.id, name: agent.name }));
        this.agents.set(filteredAgents);
      },
      error: (error) => {
        console.error('Error loading agents:', error);
        this.snackBar.open('Failed to load agents', 'Close', {
          duration: 2000,
        });
      },
    });
  }
}
