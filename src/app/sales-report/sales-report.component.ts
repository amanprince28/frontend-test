import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { DataService,AgentSalesReportRequest } from '../data.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppDateAdapter, APP_DATE_FORMATS } from '../common/custom-date-adapter';


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
   providers: [
        { provide: DateAdapter, useClass: AppDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
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
  userDetails: any;
  userRole: any;
  isLoading = signal<boolean>(false);
  // Array instead of single object


  constructor(private dataService: DataService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      agents: [[]],
      fromDate: [null],
      toDate: [null],
    });
  }

  ngOnInit(): void {
    const user = localStorage.getItem('user-details');
    this.userDetails = user ? JSON.parse(user) : null;
    this.userRole = this.userDetails?.role || '';

    if(this.userRole === 'AGENT') {
      const filteredAgents =[ { id: this.userDetails.id, name: this.userDetails.name }];
        this.agents.set(filteredAgents);
        console.log(filteredAgents,'filere');
    }
    if(this.userRole === 'LEAD') {
      this.agentbyLead();
    }
    if(this.userRole === 'ADMIN' || this.userRole === 'SUPER_ADMIN') {
      this.loadAgents();
    }
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

  private agentbyLead(): void {
    this.dataService.getAgentsByLeads([this.userDetails.id]).subscribe((res:any)=>{
      const combinedList = [
        ...(res.agents || []),
        ...(res.leads || [])
      ].map((item: any) => ({
        id: item.id,
        name: item.name
      }));
      
        this.agents.set(combinedList);
    })
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

  onSelectOpened(): void {
    const formValue = this.filterForm.get('agents')?.value || [];
    this.selectedAgentIds.set(formValue);
  }

  // onSearch() {
  //   const { agents, fromDate, toDate } = this.filterForm.value;
  
  //   const payload: AgentSalesReportRequest = {
  //     agents,
  //     fromDate,
  //     toDate,
  //   };
  //   this.loading = true; // start spinner
  //   this.dataService.getAgentPerformance(payload).subscribe(
  //     (data: any[]) => {
  //       // Transform API response to LoanReportData[]
  //       this.reportData = data.map((item: any) => ({
  //         agentName: item.agentName || 'Unknown',
  //         newCustomer: item.totalNewCustomer || 0,
  //         totalLoanCount: item.totalLoans || 0,
  //         totalCustomer: item.totalCustomers || 0,
  //         totalNewCustomer: {
  //           customerCount: item.customersInRangeStats?.totalCustomerCount || 0,
  //           totalLoan: item.customersInRangeStats?.totalLoans || 0,
  //           totalIn: item.customersInRangeStats?.paymentsIn || 0,
  //           totalOut: item.customersInRangeStats?.paymentsOut || 0,
  //           estimateProfit: item.customersInRangeStats?.estimatedProfit || 0,
  //           actualProfit: item.customersInRangeStats?.actualProfit || 0,
  //         },
  //         totalOldCustomer: {
  //           customerCount: item.customersOutsideRangeStats?.totalCustomerCount || 0,
  //           totalLoan: item.customersOutsideRangeStats?.totalLoans || 0,
  //           totalIn: item.customersOutsideRangeStats?.paymentsIn || 0,
  //           totalOut: item.customersOutsideRangeStats?.paymentsOut || 0,
  //           estimateProfit: item.customersOutsideRangeStats?.estimatedProfit || 0,
  //           actualProfit: item.customersOutsideRangeStats?.actualProfit || 0,
  //         },
  //       }));
  
  //       // Refresh paginator
  //       this.pageIndex = 0;
  //       this.updatePaginatedData();
  //       this.loading = false; // stop spinner
  //       console.log('Mapped report data:', this.reportData);
  //     },
  //     (err) => {
  //       console.error('Failed to fetch report data', err);
  //       this.loading = false; // stop spinner
  //     }
  //   );
  // }

  formatDate(date: Date): string {
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  onSearch() {
    const { agents, fromDate, toDate } = this.filterForm.value;
  
    const payload: AgentSalesReportRequest = {
      agents,
      fromDate: this.formatDate(this.filterForm.value.fromDate),
      toDate: this.formatDate(this.filterForm.value.toDate),
    };
  
    this.loading = true; // start spinner
    this.dataService.getAgentPerformance(payload).subscribe(
      (data: any[]) => {
        // Transform API response to LoanReportData[]
        this.reportData = data.map((item: any) => ({
          agentName: item.agent || 'Unknown',
          newCustomer: item.newUniqueCustomer || 0,
          totalLoanCount: item.totalLoanCount || 0,
          totalCustomer: item.totalCustomer || 0,
          totalNewCustomer: {
            customerCount: item.totalNewCustomer?.totalCustomer || 0,
            totalLoan: item.totalNewCustomer?.totalLoan || 0,
            totalIn: item.totalNewCustomer?.totalIN || 0,
            totalOut: item.totalNewCustomer?.totalOUT || 0,
            estimateProfit: item.totalNewCustomer?.estimateProfit || 0,
            actualProfit: item.totalNewCustomer?.actualProfit || 0,
          },
          totalOldCustomer: {
            customerCount: item.totalOldCustomer?.totalCustomer || 0,
            totalLoan: item.totalOldCustomer?.totalLoan || 0,
            totalIn: item.totalOldCustomer?.totalIN || 0,
            totalOut: item.totalOldCustomer?.totalOUT || 0,
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
