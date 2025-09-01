import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { DataService,AgentSalesReportRequest } from '../data.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


export interface LoanReportData {
  agentName: string;
  newCustomer: number;
  totalLoanCount: number;
  totalCustomer: number;
  totalNewCustomer: {
    customerCount: number;
    totalLoan: number;
    totalIn: number;
    totalOut: number;
    estimateProfit: number;
    actualProfit: number;
  };
  totalOldCustomer: {
    customerCount: number;
    totalLoan: number;
    totalIn: number;
    totalOut: number;
    estimateProfit: number;
    actualProfit: number;
  };
}

@Component({
  selector: 'app-sales-report',
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
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.scss']
})
export class SalesReportComponent implements OnInit {
  agents = signal<{ id: string; name: string }[]>([]);
  filterForm: FormGroup;
  selectedAgentIds = signal<string[]>([]);
  selectAllValue = 'select_all';
  loading = false;

  // Pagination
  pageIndex = 0;
  pageSize = 5;
  paginatedData: LoanReportData[] = [];
  reportData:LoanReportData[]=[];
  // Array instead of single object


  constructor(private dataService: DataService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      agents: [[]],
      fromDate: [null],
      toDate: [null],
    });
  }

  ngOnInit(): void {
    this.loadAgents();
    this.updatePaginatedData();
  }

  updatePaginatedData() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.reportData.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }

  getAgentNameById(id: string): string {
    const agent = this.agents().find((agent) => agent.id === id);
    return agent ? agent.name : 'Unknown';
  }

  onAgentSelectionChange(event: MatSelectChange): void {
    const selected = event.value.filter((v: string) => v !== this.selectAllValue);
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
      },
    });
  }

  onSelectOpened(): void {
    const formValue = this.filterForm.get('agents')?.value || [];
    this.selectedAgentIds.set(formValue);
  }

  onSearch() {
    const { agents, fromDate, toDate } = this.filterForm.value;
  
    const payload: AgentSalesReportRequest = {
      agents,
      fromDate,
      toDate,
    };
    this.loading = true; // start spinner
    this.dataService.getAgentPerformance(payload).subscribe(
      (data: any[]) => {
        // Transform API response to LoanReportData[]
        this.reportData = data.map((item: any) => ({
          agentName: item.agent || 'Unknown',
          newCustomer: item.newCustomerCount || 0,
          totalLoanCount: item.totalLoanCount || 0,
          totalCustomer: item.totalCustomerCount || 0,
          totalNewCustomer: {
            customerCount: item.totalNewCustomer?.customerCount || 0,
            totalLoan: item.totalNewCustomer?.totalLoan || 0,
            totalIn: item.totalNewCustomer?.totalIn || 0,
            totalOut: item.totalNewCustomer?.totalOut || 0,
            estimateProfit: item.totalNewCustomer?.estimateProfit || 0,
            actualProfit: item.totalNewCustomer?.actualProfit || 0,
          },
          totalOldCustomer: {
            customerCount: item.totalOldCustomer?.customerCount || 0,
            totalLoan: item.totalOldCustomer?.totalLoan || 0,
            totalIn: item.totalOldCustomer?.totalIn || 0,
            totalOut: item.totalOldCustomer?.totalOut || 0,
            estimateProfit: item.totalOldCustomer?.estimateProfit || 0,
            actualProfit: item.totalOldCustomer?.actualProfit || 0,
          },
        }));
  
        // Refresh paginator
        this.pageIndex = 0;
        this.updatePaginatedData();
        this.loading = false; // stop spinner
        console.log('Mapped report data:', this.reportData);
      },
      (err) => {
        console.error('Failed to fetch report data', err);
        this.loading = false; // stop spinner
      }
    );
  }
  
}
