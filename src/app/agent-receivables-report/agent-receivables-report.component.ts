import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from '../data.service';
import { AppDateAdapter, APP_DATE_FORMATS } from '../common/custom-date-adapter';

interface Option {
  id: string;
  name: string;
  ic?: string;
}

@Component({
  selector: 'app-agent-receivables-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatPaginatorModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
  ],
  templateUrl: './agent-receivables-report.component.html',
  styleUrls: ['./agent-receivables-report.component.scss'],
})
export class AgentReceivablesReportComponent implements OnInit {
  // The server only returns agents this user may see (agent: self, lead: own team, admin: all)
  agents = signal<Option[]>([]);
  customers = signal<Option[]>([]);
  isLoading = signal<boolean>(false);
  selectAllValue = 'select_all';
  filterForm: FormGroup;

  displayedColumns: string[] = [
    'loanId',
    'agentName',
    'loanDate',
    'customerName',
    'customerIC',
    'amountGiven',
    'payableAmount',
    'amountReceived',
    'amountToReceive',
  ];

  searched = false;
  dataSource: any[] = [];
  paginatedDataSource: any[] = [];
  totals = { loanCount: 0, amountGiven: 0, payableAmount: 0, amountReceived: 0, amountToReceive: 0 };
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  currentPage = 0;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private snackbar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      agentId: [null],
      customerIds: [{ value: [], disabled: true }],
      fromDate: [null],
      toDate: [null],
      loanIdFrom: [''],
      loanIdTo: [''],
    });
  }

  ngOnInit(): void {
    this.dataService.getReceivableAgents().subscribe({
      next: (agents) => {
        this.agents.set(agents || []);
        // An agent only sees themself, so pick them straight away
        if (this.agents().length === 1) {
          this.filterForm.get('agentId')?.setValue(this.agents()[0].id);
          this.onAgentChange(this.agents()[0].id);
        }
      },
      error: (err) => this.showError(err, 'Failed to load agents'),
    });
  }

  onAgentChange(agentId: string): void {
    const customerControl = this.filterForm.get('customerIds');
    customerControl?.setValue([]);
    this.customers.set([]);

    if (!agentId) {
      customerControl?.disable();
      return;
    }

    customerControl?.enable();
    this.dataService.getReceivableCustomers(agentId).subscribe({
      next: (customers) => this.customers.set(customers || []),
      error: (err) => this.showError(err, 'Failed to load customers'),
    });
  }

  toggleSelectAllCustomers(event: Event): void {
    event.stopPropagation();
    const control = this.filterForm.get('customerIds');
    if (this.isAllCustomersSelected()) {
      control?.setValue([]);
    } else {
      control?.setValue(this.customers().map((c) => c.id));
    }
  }

  isAllCustomersSelected(): boolean {
    const selected = this.selectedCustomerIds();
    return this.customers().length > 0 && selected.length === this.customers().length;
  }

  // Selected customer ids without the "Select All" helper option
  private selectedCustomerIds(): string[] {
    const value: string[] = this.filterForm.get('customerIds')?.value || [];
    return value.filter((v) => v !== this.selectAllValue);
  }

  selectedCustomerNames(): string[] {
    const ids = this.selectedCustomerIds();
    return this.customers()
      .filter((c) => ids.includes(c.id))
      .map((c) => c.name);
  }

  onSearch(): void {
    const { agentId, fromDate, toDate, loanIdFrom, loanIdTo } = this.filterForm.value;

    if (!agentId) {
      this.snackbar.open('Please select an agent', 'Close', { duration: 2000 });
      return;
    }
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      this.snackbar.open('From date cannot be after To date', 'Close', { duration: 2000 });
      return;
    }

    const payload = {
      agentId,
      customerIds: this.selectedCustomerIds(),
      fromDate: this.toApiDate(fromDate),
      toDate: this.toApiDate(toDate),
      loanIdFrom: (loanIdFrom || '').trim(),
      loanIdTo: (loanIdTo || '').trim(),
    };

    this.isLoading.set(true);
    this.dataService.getAgentReceivables(payload).subscribe({
      next: (res: any) => {
        this.dataSource = res?.rows || [];
        this.totals = res?.totals || { loanCount: 0, amountGiven: 0, payableAmount: 0, amountReceived: 0, amountToReceive: 0 };
        this.currentPage = 0;
        this.updatePaginatedData();
        this.searched = true;
        this.isLoading.set(false);
      },
      error: (err) => {
        this.showError(err, 'Failed to fetch report data');
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    const start = this.currentPage * this.pageSize;
    this.paginatedDataSource = this.dataSource.slice(start, start + this.pageSize);
  }

  // yyyy-MM-dd in local time; '' when empty or half-typed
  private toApiDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  private showError(err: any, fallback: string): void {
    const message = err?.error?.message || fallback;
    this.snackbar.open(message, 'Close', { duration: 2500 });
  }
}
