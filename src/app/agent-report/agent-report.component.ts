import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { DataService } from '../data.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';

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
  ],
  templateUrl: './agent-report.component.html',
  styleUrls: ['./agent-report.component.scss'],
})
export class AgentReportComponent implements OnInit {
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

  ngOnInit(): void {
    this.loadAgents();
  }

  dataSource: any[] = [];

  constructor(private fb: FormBuilder, private dataService: DataService) {
    this.filterForm = this.fb.group({
      agents: [[]],
      fromDate: [null],
      toDate: [null],
    });
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
      },
      (err) => {
        console.error('Failed to fetch report data', err);
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
        // this.snackBar.open('Failed to load agents', 'Close', {
        //   duration: 2000,
        // });
      },
    });
  }
}
