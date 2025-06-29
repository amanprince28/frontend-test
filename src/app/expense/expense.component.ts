import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DataService } from '../data.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-expense-module',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss'],
})
export class ExpenseComponent implements OnInit {
  agents = signal<{ id: string; name: string }[]>([]);
  selectedAgentIds = signal<string[]>([]);
  selectedYear = signal<string | null>(null);
  availableYears = signal<string[]>([]);
  isLoading = signal<boolean>(false);

  isDataLoaded = computed(() =>
    this.selectedAgentIds().length > 0 &&
    !!this.selectedYear() &&
    this.expenses().length > 0
  );

  months = [
    { label: 'Jan', key: 'jan' },
    { label: 'Feb', key: 'feb' },
    { label: 'Mar', key: 'mar' },
    { label: 'Apr', key: 'apr' },
    { label: 'May', key: 'may' },
    { label: 'Jun', key: 'jun' },
    { label: 'Jul', key: 'jul' },
    { label: 'Aug', key: 'aug' },
    { label: 'Sep', key: 'sep' },
    { label: 'Oct', key: 'oct' },
    { label: 'Nov', key: 'nov' },
    { label: 'Dec', key: 'dec' }
  ];
  

  tableColumns = signal<string[]>(['agent', ...this.months.map(m => m.key)]);
  expenses = signal<any[]>([]);

  constructor(private dataService: DataService,private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadAgents();
    this.loadAvailableYears();
  }

  getAgentNameById(id: string): string {
    const agent = this.agents().find(agent => agent.id === id);
    return agent ? agent.name : 'Unknown';
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

  private loadAvailableYears(): void {
    this.availableYears.set(['2024', '2025']);
  }

  loadExpensesData(): void {
    const agentIds = this.selectedAgentIds();
    const year = this.selectedYear();

    if (agentIds.length === 0 || !year) {
      this.expenses.set([]);
      return;
    }

    this.isLoading.set(true);
    this.dataService.getExpenses(agentIds, year).subscribe({
      next: (response) => {
        const responseData = response.data;
        const agentMap = new Map(this.agents().map(a => [a.id, a.name]));
        
        const completeData = agentIds.map((id) => {
          const name = agentMap.get(id) || 'Unknown';
          // Find the entry for this agent in the response data
          const existingEntry = responseData.find((entry: any) => entry.user_id === id);
          console.log(existingEntry,'ess');
          if (existingEntry) {
            // If data exists for this agent, return it as-is without adding zero months
            return { 
              agentId: id, 
              agent: name, 
              ...existingEntry 
            };
          } else {
            // Only for agents with no data, create a new entry with all months set to 0
            const newEntry: any = { agentId: id, agent: name };
            this.months.forEach(month => newEntry[month.key] = 0);
            return newEntry;
          }
        });

        this.expenses.set(completeData);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading expenses:', error);
        this.isLoading.set(false);
      }
    });
  }

  onAgentsChange(agentIds: string[]): void {
    const filtered = agentIds.filter(id => id !== 'select_all');
    this.selectedAgentIds.set(filtered);
    this.loadExpensesData();
  }

  onYearChange(year: string): void {
    this.selectedYear.set(year);
    this.loadExpensesData();
  }

  updateExpense(agentId: string, month: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const newValue = value === '' ? 0 : Number(value);
    const updatedExpenses = this.expenses().map((exp) => {
      if (exp.agentId === agentId) {
        return { ...exp, [month]: newValue };
      }
      return exp;
    });
    this.expenses.set(updatedExpenses);
  }

  saveExpenses(): void {
    if (this.expenses().length === 0 || !this.selectedYear()) return;
  
    this.isLoading.set(true);
  
    const payload = this.expenses().map(({ agentId, agent, ...rest }) => {
      const expenseData: any = {
        user_id: agentId,
        year: this.selectedYear()
      };
      
      // Only include months that exist in the data
      this.months.forEach(month => {
        if (rest[month.key] !== undefined) {
          expenseData[month.key] = String(rest[month.key] ?? 0);
        }
      });
      
      return expenseData;
    });
    
    console.log(payload, 'Saving payload');
    
    this.dataService.saveExpenses(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.snackBar.open('Expenses saved successfully!', 'Close', {
          duration: 3000,
          panelClass: 'snackbar-success',
        });
      },
      error: (error) => {
        console.error('Error saving expenses:', error);
        this.isLoading.set(false);
        this.snackBar.open('Failed to save expenses', 'Close', {
          duration: 3000,
          panelClass: 'snackbar-error',
        });
      }
    });
  }
  
  isAllSelected(): boolean {
    return (
      this.agents().length > 0 &&
      this.selectedAgentIds().length === this.agents().length
    );
  }
  
  toggleSelectAll(): void {
    const allIds = this.agents().map(agent => agent.id);
    if (this.isAllSelected()) {
      this.selectedAgentIds.set([]);
    } else {
      this.selectedAgentIds.set(allIds);
    }
    this.loadExpensesData(); // Trigger reload
  }
  
}
