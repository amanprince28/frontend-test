import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { LoanCheckService } from './loan-check.service';
import { DataService } from '../data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectChange } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';

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
    MatChipsModule
  ],
  templateUrl: './loan-check.component.html',
  styleUrls: ['./loan-check.component.scss'],
})
export class LoanCheckComponent implements OnInit {
  form!: FormGroup;
  // agents: any
  dataSource: any[] = [];
  agents = signal<{ id: string; name: string }[]>([]);
  selectedAgentIds = signal<string[]>([]);
  selectAllValue = 'select_all';

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
    private snackBar: MatSnackBar
  ) {}

  private fb = inject(FormBuilder);
  private service = inject(LoanCheckService);

  ngOnInit(): void {
    const today = new Date();
    this.form = this.fb.group({
      agents: [[]],
      dateFrom: [today],
      dateTo: [today]
    });

    this.loadAgents();
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
      error: (error) => console.error('Error loading agents:', error)
    });
  }

  onSearch(): void {
    const { agents, dateFrom, dateTo } = this.form.value;
    const selectedAgentIds = agents.map((id: string) => id);

    this.dataService
      .getLoanCheck(selectedAgentIds, dateFrom, dateTo)
      .subscribe((res) => {
        if (!res || res.length === 0) {
          this.dataSource = [];
          this.snackBar.open(
            'No data found for given range. Please select other dates.',
            'Close',
            {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
            }
          );
        } else {
          this.dataSource = res;
        }
      });
  }

  getRowClass(row: any): string {
    const today = new Date();
    const dueDate = row.dueDate ? new Date(row.dueDate) : null;

    if (!dueDate) return 'normal'; // No due date means treat as normal

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

  getAgentNameById(id: string): string {
    const agent = this.agents().find(agent => agent.id === id);
    return agent ? agent.name : 'Unknown';
  }

  toggleSelectAll(event: Event): void {
    event.stopPropagation();

    const allIds = this.agents().map(agent => agent.id);

    if (this.isAllSelected()) {
      this.form.get('agents')?.setValue([]);
      this.selectedAgentIds.set([]);
    } else {
      this.form.get('agents')?.setValue(allIds);
      this.selectedAgentIds.set(allIds);
    }
  }

  onAgentSelectionChange(event: MatSelectChange): void {
    const selected = event.value.filter((v: string) => v !== this.selectAllValue);
    this.selectedAgentIds.set(selected);
    this.form.get('agents')?.setValue(selected); // remove select_all
  }

  onSelectOpened(): void {
    // Optionally re-sync signal to form
    const formValue = this.form.get('agents')?.value || [];
    this.selectedAgentIds.set(formValue);
  }

}
