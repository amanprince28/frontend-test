import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { DataService } from '../data.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTabsModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {


  ngOnInit(): void {
    
  }
  searchQuery: string = '';

  // Data for Installment Listing Table
  installmentData: any[] = [];
  displayedInstallmentColumns: string[] = [
    'installmentDate',
    'dueAmount',
    'expectedAmount',
    'status',
    'actions'
  ];
  loanSharingData: any[] = [];
  paymentData: any[] = [];
  displayedPaymentColumns: string[] = [
    'paymentType',
    'installmentId',
    'paymentDate',
    'paymentAmount',
    'balance',
    'bankAgentAccount',
    'actions'
  ];

  constructor(private cdr: ChangeDetectorRef,
    private dataService:DataService
  ) {}

  filterTable(): void {
    const searchValue = this.searchQuery
    console.log(searchValue, 'Search Value');
    this.dataService.findAgentAndLeads(searchValue).subscribe((response: any) => {
      console.log(response);
      // if(response.length>0){
      // this.dataSource.data = response; 
      // this.paginator.length = response.totalCount; 
      // }else{
      //   this.snackbar.open('No Data Found', 'Close', { duration: 2000 });
      // }
    });
  }

  savePaymentListing(){

  }

  addInstallmentData(data: any) {
    this.installmentData = [...this.installmentData, { ...data }];
    this.cdr.detectChanges();
  }

  addPaymentData(data: any) {
    this.paymentData = [...this.paymentData, { ...data }];
    this.cdr.detectChanges();
  }

  addLoanSharingData(data: any) {
    this.loanSharingData = [...this.loanSharingData, { ...data }];
    this.cdr.detectChanges();
  }

  onEdit(record:any,i:any){

  }
  onDelete(record:any,i:any){

  }
}
