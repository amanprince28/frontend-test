import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { SignalService } from '../signal.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../data.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-customer-check',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatPaginatorModule,
    MatTableModule,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './customer-check.component.html',
  styleUrl: './customer-check.component.scss',
})

export class CustomerCheckComponent {
  displayedColumns: string[] = [
    'name',
    'ic',
    'agent',
    'ongoing',
    'completed',
    'badDebt',
    'badDebtCompleted',
    'lastPaymentDate',
    'nextPaymentDate',
  ];

  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);
  searchForm!: FormGroup;
  searchQuery: any;
  signalData = signal({});
  search = new FormControl();

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private signalService: SignalService,
    private dataService: DataService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
  //  this.fetchData();
  }
  

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    // this.paginator.page.subscribe(() => {
    //   this.fetchData(this.paginator.pageIndex, this.paginator.pageSize);
    // });
  }


  // For filtering the table
  filterTable(): void {
    const searchValue = this.searchQuery;
  
    this.dataService.getLoanStatusByPassport(searchValue).subscribe((response: any[]) => {
      if (response.length > 0) {
        const processedData = this.processLoanData(response);
        this.dataSource.data = processedData;
      } else {
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.snackbar.open('No Data Found', 'Close', { duration: 2000 });
      }
    });
  }

  processLoanData(data: any[]): any[] {
    const transformed: any[] = [];
  
    data.forEach((customer) => {
      const groupedBySupervisor: { [key: string]: any } = {};
  
      customer.loans.forEach((loan: any) => {
        const key = loan.supervisor_id;
  
        if (!groupedBySupervisor[key]) {
          groupedBySupervisor[key] = {
            name: customer.customerDetails.name,
            ic: customer.customerDetails.ic,
            agent: loan.supervisor_name,
            ongoing: 0,
            completed: 0,
            badDebt: 0,
            badDebtCompleted: 0,
            lastPaymentDate: customer.last_installment_date,
            nextPaymentDate: customer.upcoming_installment_date,
          };
        }
  
        switch (loan.status) {
          case 'Normal':
            groupedBySupervisor[key].ongoing += loan.loan_count;
            break;
          case 'Completed':
            groupedBySupervisor[key].completed += loan.loan_count;
            break;
          case 'Bad Debt':
            groupedBySupervisor[key].badDebt += loan.loan_count;
            break;
          case 'Bad Debt Completed':
            groupedBySupervisor[key].badDebtCompleted += loan.loan_count;
            break;
        }
      });
  
      Object.values(groupedBySupervisor).forEach((entry) => {
        transformed.push(entry);
      });
    });
  console.log(transformed,'trabs');
    return transformed;
  }



}
