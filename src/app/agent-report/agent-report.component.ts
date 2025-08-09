import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { DataService } from '../data.service';

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
    MatTableModule
  ],
  templateUrl: './agent-report.component.html',
  styleUrls: ['./agent-report.component.scss']
})
export class AgentReportComponent {
  agents = ['Agent A', 'Agent B', 'Agent C'];

  filterForm: FormGroup;
  displayedColumns: string[] = [
   'agentName', 'month', 'currentIn', 'currentOut', 'balance', 'expenses', 'finalBalance',
    'sumIn', 'sumOut', 'sumExpenses', 'sumBalance'
  ];
  
  dataSource: any[] = [];

  constructor(private fb: FormBuilder,private dataService:DataService) {
    this.filterForm = this.fb.group({
      agentNames: [[]],
      fromDate: [null],
      toDate: [null]
    });
  }

  onSearch() {
    const { agentNames, fromDate, toDate } = this.filterForm.value;

    const payload = {
      agents: agentNames,
      fromDate,
      toDate
    };

    this.dataService.getAgentReports(payload).subscribe((data:any)=>{
      this.dataSource = [];

      agentNames.forEach((agent:any) => {
        const agentData = data.filter((r:any) => r.agentName === agent);
        agentData.forEach((item:any) => this.dataSource.push({ ...item, agentName: agent }));
      });
    },
    (err) => {
      console.error('Failed to fetch report data', err);
    }
  );
  }
}
