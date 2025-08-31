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
import { DataService } from '../data.service';

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
  ],
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.scss']
})
export class SalesReportComponent implements OnInit {
  agents = signal<{ id: string; name: string }[]>([]);
  filterForm: FormGroup;
  selectedAgentIds = signal<string[]>([]);
  selectAllValue = 'select_all';

  // Pagination
  pageIndex = 0;
  pageSize = 5;
  paginatedData: LoanReportData[] = [];

  // Array instead of single object
  reportData: LoanReportData[] = [
    {
      agentName: 'John Doe',
      newCustomer: 15,
      totalLoanCount: 120,
      totalCustomer: 85,
      totalNewCustomer: {
        customerCount: 15,
        totalLoan: 25,
        totalIn: 50000,
        totalOut: 45000,
        estimateProfit: 6000,
        actualProfit: 5500,
      },
      totalOldCustomer: {
        customerCount: 70,
        totalLoan: 95,
        totalIn: 250000,
        totalOut: 220000,
        estimateProfit: 32000,
        actualProfit: 30000,
      },
    },
    {
      agentName: 'Jane Smith',
      newCustomer: 10,
      totalLoanCount: 80,
      totalCustomer: 60,
      totalNewCustomer: {
        customerCount: 10,
        totalLoan: 20,
        totalIn: 40000,
        totalOut: 35000,
        estimateProfit: 5000,
        actualProfit: 4800,
      },
      totalOldCustomer: {
        customerCount: 50,
        totalLoan: 60,
        totalIn: 180000,
        totalOut: 160000,
        estimateProfit: 25000,
        actualProfit: 24000,
      },
    },
    // add more mock rows if needed
  ];

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

    const payload = {
      agents: agents,
      fromDate,
      toDate,
    };

    this.dataService.getAgentReports(payload).subscribe(
      (data: any[]) => {
        console.log(data,'api data');
    
    
        
      },
      (err) => {
        console.error('Failed to fetch report data', err);
      }
    );
    
  }
}
