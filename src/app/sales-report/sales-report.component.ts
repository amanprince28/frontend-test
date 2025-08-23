import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    ReactiveFormsModule,
    MatPaginatorModule,
  ],
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.scss'],
})
export class SalesReportComponent {
  agentControl = new FormControl([]);
  fromDateControl = new FormControl();
  toDateControl = new FormControl();

  agentList = ['Agent A', 'Agent B', 'Agent C'];

  totalCount = 0;
  pageSize = 10;
  currentPage = 0;

  firstHeaderRow = [
    'agent',
    'newCustomer',
    'totalLoanCount',
    'totalCustomer',
    'totalNewCustomerGroup',
    'totalOldCustomerGroup',
    'estProfitTotal',
    'actualProfitTotal',
  ];

  secondHeaderRow = [
    'agent',
    'newCustomer',
    'totalLoanCount',
    'totalCustomer',
    'newTotalCustomerCount',
    'newTotalLoanCount',
    'newTotalIN',
    'newTotalOUT',
    'newEstimateProfit',
    'newActualProfit',
    'oldTotalCustomerCount',
    'oldTotalLoanCount',
    'oldTotalIN',
    'oldTotalOUT',
    'oldEstimateProfit',
    'oldActualProfit',
    'estProfitTotal',
    'actualProfitTotal',
  ];

  allColumns = this.secondHeaderRow;

  dataSource: any[] = [];

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    // Call your API/data fetch method here
  }

  onSearch(): void {
    // Sample data for testing
    this.dataSource = [
      {
        agent: 'John Doe',
        newCustomer: 12,
        totalLoanCount: 24,
        totalCustomer: 18,
        newTotalCustomerCount: 8,
        newTotalLoanCount: 14,
        newTotalIN: 4000,
        newTotalOUT: 3000,
        newEstimateProfit: 1000,
        newActualProfit: 800,
        oldTotalCustomerCount: 10,
        oldTotalLoanCount: 10,
        oldTotalIN: 5000,
        oldTotalOUT: 2500,
        oldEstimateProfit: 2000,
        oldActualProfit: 1500,
        estProfitTotal: 3000,
        actualProfitTotal: 2300,
      },
    ];
  }
}
