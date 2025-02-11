import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatSelectModule } from '@angular/material/select';

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
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  paymentForm!: FormGroup;
  installmentForm!: FormGroup;
  paymentStatus:any;
  status:any;
  installmentData:any
  loanDetailsForm!: FormGroup;
  ngOnInit(): void {

    this.loanDetailsForm = new FormGroup({
      principalAmount: new FormControl(''),
      customerName: new FormControl(''),
      agentName: new FormControl(''),
      leadName: new FormControl(''),
    });

    this.installmentForm = new FormGroup({
      installmentDate: new FormControl(null ),
      dueAmount: new FormControl(null ),
      expectedAmount: new FormControl(),
      status: new FormControl(null),
    })

    this.paymentForm = new FormGroup({
      paymentType: new FormControl(null ),
      installmentId: new FormControl(null ),
      paymentDate: new FormControl(),
      paymentAmount: new FormControl(null),
      balance: new FormControl(),
      bankAgentAccount: new FormControl(null),
    })
    this.paymentStatus=['Paid', 'Unpaid', 'Contra', 'Void', 'Late', 'Delete'];
  }
  searchQuery: string = '';
  // Data for Installment Listing Table
  
  displayedInstallmentColumns: string[] = [
    'installmentDate',
    'dueAmount',
    'expectedAmount',
    'status',
    'actions'
  ];
  displayedPaymentColumns: string[] = [
    'paymentType',
    'installmentId',
    'paymentDate',
    'paymentAmount',
    'balance',
    'bankAgentAccount',
    'actions'
  ];
  loanSharingData: any[] = [];
  
  // Dummy data for payments table
   paymentData = [
    {
      paymentType: 'Credit Card',
      installmentId: 1,
      paymentDate: '2025-02-02',
      paymentAmount: 500,
      balance: 500,
      bankAgentAccount: 'Bank of America',
      actions: 'View/Edit/Delete'
    },
    {
      paymentType: 'Bank Transfer',
      installmentId: 2,
      paymentDate: '2025-03-05',
      paymentAmount: 1200,
      balance: 0,
      bankAgentAccount: 'Chase Bank',
      actions: 'View/Edit/Delete'
    },
    {
      paymentType: 'Cash',
      installmentId: 3,
      paymentDate: '2025-04-03',
      paymentAmount: 1500,
      balance: 0,
      bankAgentAccount: 'N/A',
      actions: 'View/Edit/Delete'
    }
  ];
 

  constructor(private cdr: ChangeDetectorRef,
    private dataService:DataService
  ) {}

  filterTable(): void {
    const searchValue = this.searchQuery
    console.log(searchValue, 'Search Value');
    this.dataService.getLoanById(searchValue).subscribe((response: any) => {
      console.log(response);
      if(response && response.installment){

        this.loanDetailsForm.patchValue({
          principalAmount: response.principal_amount || '',
          customerName: response.customer.name || '',
          agentName: response.agentName || '',
          leadName: response.leadName || '',
        });

      this.installmentData = response.installment
      }
      // if(response.length>0){
      // this.dataSource.data = response; 
      // this.paginator.length = response.totalCount; 
      // }else{
      //   this.snackbar.open('No Data Found', 'Close', { duration: 2000 });
      // }
    });
  }

  saveInstallmentListing(){

  }

  onAddInstallment() {
   // this.installmentData = [...this.installmentData, { ...data }];
    this.cdr.detectChanges();
  }

  onAddPayment() {
    //this.paymentData = [...this.paymentData, { ...data }];
    this.cdr.detectChanges();
  }

  savePaymentListing(){}

  addLoanSharingData(data: any) {
    this.loanSharingData = [...this.loanSharingData, { ...data }];
    this.cdr.detectChanges();
  }

  onEdit(record:any,i:any){
    console.log(record);
    this.installmentForm.patchValue({
      installmentDate:new Date(record.installmentDate)
    });
  }
  onDelete(i:any){

  }
}
