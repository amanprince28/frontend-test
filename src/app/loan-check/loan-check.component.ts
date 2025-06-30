import { Component, OnInit, inject } from '@angular/core';
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
    MatButtonModule
  ],
  templateUrl: './loan-check.component.html',
  styleUrls: ['./loan-check.component.scss']
})
export class LoanCheckComponent implements OnInit {
  form!: FormGroup;
  agents: any
  dataSource: any[] = [];

  displayedColumns: string[] = [
    'agent',
    'customerName',
    'customerIC',
    'dueDate',
    'dueAmount',
    'remark'
  ];

  constructor(private dataService:DataService){}

  private fb = inject(FormBuilder);
  private service = inject(LoanCheckService);

  ngOnInit(): void {
    const today = new Date();
    this.loadAgents();
    this.form = this.fb.group({
      agents: [[]],
      dateFrom: [today],
      dateTo: [today]
    });

  }

   loadAgents(): void {
    
    const payload = { page: 1, limit: 100 };
    this.dataService.getUser(payload).subscribe({
      next: (response) => {
        const filteredAgents = response.data
          .filter((user: any) => user.role === 'AGENT' || user.role === 'LEAD')
          .map((agent: any) => ({ id: agent.id, name: agent.name }));
        this.agents=filteredAgents;
        
      },
      error: (error) => {
        console.error('Error loading agents:', error);
        
      }
    });
  }

  onSearch(): void {
    const { agents, dateFrom, dateTo } = this.form.value;
    this.dataService.getLoanCheck(agents, dateFrom, dateTo).subscribe((res) => {
      
      this.dataSource = res;
    });
  }

  getRowClass(row: any): string {
    const today = new Date();
    const dueDate = new Date(row.dueDate);
    const isDue = dueDate <= today && row.status !== 'PAID';

    if (isDue && row.remark) return 'dark-red';
    if (isDue) return 'pink-red';
    return 'normal';
  }
}
