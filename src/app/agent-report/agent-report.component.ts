import { Component, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { DataService } from '../data.service';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { AppDateAdapter, APP_DATE_FORMATS } from '../common/custom-date-adapter';

@Component({
  selector: 'app-agent-report',
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
  templateUrl: './agent-report.component.html',
  styleUrls: ['./agent-report.component.scss'],
})
export class AgentReportComponent implements OnInit, AfterViewInit {
  agents = signal<{ id: string; name: string }[]>([]);
  selectedAgentIds = signal<string[]>([]);
  selectAllValue = 'select_all';

  filterForm: FormGroup;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = [
    'agentName',
    'month',
    'currentIn',
    'currentOut',
    'balance',
    'expenses',
    'finalBalance',
    'sumIn',
    'sumOut',
    'sumExpenses',
    'sumBalance',
  ];
  
  userDetails: any;
  userRole: any;
  isLoading = signal<boolean>(false);
  
  // Pagination properties
  dataSource: any[] = [];
  paginatedDataSource: any[] = [];
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  currentPage: number = 0;

  ngOnInit(): void {
    const user = localStorage.getItem('user-details');
    this.userDetails = user ? JSON.parse(user) : null;
    this.userRole = this.userDetails?.role || '';

    if (this.userRole === 'AGENT') {
      const filteredAgents = [{ id: this.userDetails.id, name: this.userDetails.name }];
      this.agents.set(filteredAgents);
      console.log(filteredAgents, 'filere');
    }
    if (this.userRole === 'LEAD') {
      this.agentbyLead();
    }
    if (this.userRole === 'ADMIN' || this.userRole === 'SUPER_ADMIN') {
      this.loadAgents();
    }
  }

  ngAfterViewInit(): void {
    // Initialize paginator after view is ready
    if (this.paginator) {
      this.updatePaginatedData();
    }
  }

  constructor(private fb: FormBuilder, private dataService: DataService) {
    this.filterForm = this.fb.group({
      agents: [[]],
      fromDate: [null],
      toDate: [null],
    });
  }

  private agentbyLead(): void {
    this.dataService.getAgentsByLeads([this.userDetails.id]).subscribe((res: any) => {
      const combinedList = [
        ...(res.agents || []),
        ...(res.leads || [])
      ].map((item: any) => ({
        id: item.id,
        name: item.name
      }));
      
      this.agents.set(combinedList);
    });
  }

  private loadAgents(): void {
    this.isLoading.set(true);
    const payload = { page: 1, limit: 100 };
    this.dataService.getUser(payload).subscribe({
      next: (response) => {
        const filteredAgents = response.data
          .filter((user: any) => user.role === 'AGENT' || user.role === 'LEAD')
          .map((agent: any) => ({ id: agent.id, name: agent.name }));
        this.agents.set(filteredAgents);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading agents:', error);
        this.isLoading.set(false);
      }
    });
  }

  onSearch() {
    const { agents, fromDate, toDate } = this.filterForm.value;

    const payload = {
      agents: agents,
      fromDate,
      toDate,
    };

    this.isLoading.set(true);
    
    this.dataService.getAgentReports(payload).subscribe(
      (data: any[]) => {
        this.dataSource = [];
    
        data.forEach((agent: any) => {
          agent.monthlyBreakdown.forEach((month: any) => {
            this.dataSource.push({
              agentId: agent.agentId,
              agentName: agent.agentName,
              month: month.month,
              currentIn: month.totalPaymentIn,
              currentOut: month.totalPaymentOut,
              balance: month.balance,
              expenses: month.expense,
              finalBalance: month.finalBalance,
              sumIn: month.summaryPrevious.totalPaymentIn,
              sumOut: month.summaryPrevious.totalPaymentOut,
              sumExpenses: month.summaryPrevious.totalExpenses,
              sumBalance: month.summaryPrevious.balance
            });
          });
        });
        
        // Reset to first page when new data comes in
        this.currentPage = 0;
        this.updatePaginatedData();
        this.isLoading.set(false);
      },
      (err) => {
        console.error('Failed to fetch report data', err);
        this.isLoading.set(false);
      }
    );
  }

  onSelectOpened(): void {
    const formValue = this.filterForm.get('agents')?.value || [];
    this.selectedAgentIds.set(formValue);
  }

  getAgentNameById(id: string): string {
    const agent = this.agents().find((agent) => agent.id === id);
    return agent ? agent.name : 'Unknown';
  }

  onAgentSelectionChange(event: MatSelectChange): void {
    const selected = event.value.filter(
      (v: string) => v !== this.selectAllValue
    );
    this.selectedAgentIds.set(selected);
    this.filterForm.get('agents')?.setValue(selected);
  }

  toggleSelectAll(event: Event): void {
    event.stopPropagation();
    const allIds = this.agents().map((agent) => agent.id);

    if (this.isAllSelected()) {
      this.filterForm.get('agents')?.setValue([]);
      this.selectedAgentIds.set([]);
    } else {
      this.filterForm.get('agents')?.setValue(allIds);
      this.selectedAgentIds.set(allIds);
    }
  }

  isAllSelected(): boolean {
    return (
      this.agents().length > 0 &&
      this.filterForm.get('agents')?.value?.length === this.agents().length
    );
  }

  // Pagination methods
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }

  updatePaginatedData(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedDataSource = this.dataSource.slice(startIndex, endIndex);
  }
}