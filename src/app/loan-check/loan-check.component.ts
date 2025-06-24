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
  agents: string[] = [];
  dataSource: any[] = [];

  displayedColumns: string[] = [
    'agent',
    'customerName',
    'customerIC',
    'dueDate',
    'dueAmount',
    'remark'
  ];

  private fb = inject(FormBuilder);
  private service = inject(LoanCheckService);

  ngOnInit(): void {
    const today = new Date();
    this.form = this.fb.group({
      agents: [[]],
      dateFrom: [today],
      dateTo: [today]
    });

    this.service.getAgents().subscribe((agents) => {
      this.agents = agents;
      this.form.patchValue({ agents }); // default to all
    });
  }

  onSearch(): void {
    const { agents, dateFrom, dateTo } = this.form.value;
    this.service.getInstallments(agents, dateFrom, dateTo).subscribe((res) => {
      
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
