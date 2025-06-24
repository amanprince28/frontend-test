import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

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
    MatProgressSpinner
  ],
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss']
})
export class ExpenseComponent {
  agents = signal<string[]>(['Aman', 'Praveen', 'John', 'Jane']);
  selectedAgents = signal<string[]>([]);
  selectedYear = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  tableColumns = signal<string[]>(['agent', ...this.months]);
  expenses = signal<any[]>([]);

  private mockExpensesDatabase: Record<string, Record<string, any>> = {
    'Aman': {
      '2024': { 
        agent: 'Aman', 
        January: 500, February: 100, March: 5000, April: 100, 
        May: 500, June: 100, July: 5000, August: 100, 
        September: '-', October: '-', November: '-', December: '-' 
      },
      '2025': { agent: 'Aman', ...this.generateRandomExpenses('Aman') }
    },
    'Praveen': {
      '2024': { 
        agent: 'Praveen', 
        January: 200, February: 200, March: 200, April: 200, 
        May: 200, June: 200, July: 200, August: 200, 
        September: '-', October: '-', November: '-', December: '-' 
      },
      '2025': { agent: 'Praveen', ...this.generateRandomExpenses('Praveen') }
    },
    'John': {
      '2024': { agent: 'John', ...this.generateRandomExpenses('John') },
      '2025': { agent: 'John', ...this.generateRandomExpenses('John') }
    },
    'Jane': {
      '2024': { agent: 'Jane', ...this.generateRandomExpenses('Jane') },
      '2025': { agent: 'Jane', ...this.generateRandomExpenses('Jane') }
    }
  };

  private generateRandomExpenses(agent: string): Record<string, any> {
    const expenses: Record<string, any> = { agent };
    this.months.forEach(month => {
      expenses[month] = Math.floor(Math.random() * 5000) + 100;
    });
    return expenses;
  }

  loadExpensesData() {
    const agents = this.selectedAgents();
    const year = this.selectedYear();
    
    if (agents.length === 0 || !year) {
      this.expenses.set([]);
      return;
    }

    this.isLoading.set(true);
    
    setTimeout(() => {
      const data = agents.map(agent => {
        return this.mockExpensesDatabase[agent]?.[year] || 
               { agent, ...this.generateEmptyExpenses(agent) };
      });
      this.expenses.set(data);
      this.isLoading.set(false);
    }, 300);
  }

  private generateEmptyExpenses(agent: string): Record<string, string> {
    const emptyData: Record<string, string> = { agent };
    this.months.forEach(month => {
      emptyData[month] = '-';
    });
    return emptyData;
  }

  onAgentsChange(agents: string[]) {
    this.selectedAgents.set(agents);
    this.loadExpensesData();
  }

  onYearChange(year: string) {
    this.selectedYear.set(year);
    this.loadExpensesData();
  }

  updateExpense(agent: string, month: string, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const currentExpenses = this.expenses();
    
    const updatedExpenses = currentExpenses.map(expense => {
      if (expense.agent === agent) {
        return { ...expense, [month]: value === '' ? '-' : Number(value) };
      }
      return expense;
    });
    
    this.expenses.set(updatedExpenses);
  }

  saveExpenses() {
    const agents = this.selectedAgents();
    const year = this.selectedYear();
    const expenses = this.expenses();
    
    if (agents.length === 0 || !year || expenses.length === 0) return;
    
    expenses.forEach(expense => {
      const agent = expense.agent;
      if (!this.mockExpensesDatabase[agent]) {
        this.mockExpensesDatabase[agent] = {};
      }
      this.mockExpensesDatabase[agent][year] = { ...expense };
    });
    console.log(expenses,'ex')
    alert(`Expenses saved for ${agents.join(', ')} (${year})`);
  }

  isDataLoaded = computed(() => 
    this.selectedAgents().length > 0 && !!this.selectedYear() && this.expenses().length > 0
  );
}