import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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
import { MatSnackBar } from '@angular/material/snack-bar';

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
    MatSelectModule,
  ],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  paymentForm!: FormGroup;
  installmentForm!: FormGroup;
  paymentStatus: any;
  status: any;
  installmentData: any[] = [];
  paymentData: any[] = [];
  loanDetailsForm!: FormGroup;
  selectedIndex: number | null = null;
  paymentType: any;
  selectedPaymentIndex: number | null = null;
  enablePaymentInsert: boolean | false = false;
  enableInsatllmentInsert: boolean | false = false;
  dataSourceAgent2:any
  dataSourceAgent1:any
  ngOnInit(): void {
    this.loanDetailsForm = new FormGroup({
      principalAmount: new FormControl(''),
      customerName: new FormControl(''),
      agentName: new FormControl(''),
      leadName: new FormControl(''),
    });

    this.installmentForm = new FormGroup({
      installment_date: new FormControl(null),
      due_amount: new FormControl(null),
      accepted_amount: new FormControl(),
      status: new FormControl(null),
    });

    this.paymentForm = new FormGroup({
      paymentType: new FormControl(null),
      installmentId: new FormControl(null),
      paymentDate: new FormControl(),
      paymentAmount: new FormControl(null),
      balance: new FormControl(),
      bankAgentAccount: new FormControl(null),
    });
    this.paymentStatus = ['Paid', 'Unpaid', 'Contra', 'Void', 'Late', 'Delete'];
    this.paymentType = ['In', 'Out'];
    this.enablePaymentInsert =false
    this.enableInsatllmentInsert=false;
  }
  searchQuery: string = '';
  // Data for Installment Listing Table

  displayedInstallmentColumns: string[] = [
    'installment_date',
    'due_amount',
    'accepted_amount',
    'status',
    'actions',
  ];
  displayedPaymentColumns: string[] = [
    'paymentType',
    'installmentId',
    'paymentDate',
    'paymentAmount',
    'balance',
    'bankAgentAccount',
    'actions',
  ];
  displayedColumns: string[] = ['paymentId', 'paymentType', 'paymentDate', 'sharedAmount'];

  loanSharingData: any[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private dataService: DataService,
    private snackbar: MatSnackBar
  ) {}

  filterTable(): void {
    const searchValue = this.searchQuery;
    console.log(searchValue, 'Search Value');
    this.dataService.getLoanById(searchValue).subscribe((response: any) => {
      console.log(response);

      if (response && response.installment) {
        this.loanDetailsForm.patchValue({
          principalAmount: response.principal_amount || '',
          customerName: response.customer.name || '',
          agentName: response.user.name || '',
          leadName: response.leadName || '',
        });

        this.installmentData = response.installment.sort((a: any, b: any) => {
          return (
            new Date(a.installment_date).getTime() -
            new Date(b.installment_date).getTime()
          );
        });
        this.paymentData = response.installment
        .filter((data: any) => data?.status?.toLowerCase() === 'paid') // Ensure status exists
        .map((payment: any) => {
          const { id, ...rest } = payment; // Remove `id`
          return rest;
        })// Remove `id` while keeping the rest
      }
    });
  }

  saveInstallmentListing() {
    this.dataService
      .updateInstallment(this.searchQuery, this.installmentData)
      .subscribe((data) => {
        console.log(data);
        this.snackbar.open('insatllment updated');
      });
  }

  onAddPayment() {
    if (this.paymentForm.invalid) return;

    const data = this.paymentForm.value;

    // data.due_amount = String(data.due_amount);
    // data.accepted_amount = String(data.accepted_amount);
    if (this.selectedPaymentIndex !== null) {
      // Update the existing record
      this.paymentData[this.selectedPaymentIndex] = {
        ...this.paymentData[this.selectedPaymentIndex],
        ...data,
      };
      this.paymentData = [...this.paymentData]; // Trigger UI update
      this.selectedPaymentIndex = null;
    } else {
      // Add new record
      this.paymentData = [...this.paymentData, { ...data }];
    }

    this.paymentForm.reset(); // Reset form after submission
    //this.paymentData = [...this.paymentData, { ...data }];
    this.cdr.detectChanges();
  }

  savePaymentListing() {
    this.dataService.addPayment(this.paymentData).subscribe((data) => {
      console.log(data);
      this.snackbar.open('added payment');
    });
  }

  addLoanSharingData(data: any) {
    this.loanSharingData = [...this.loanSharingData, { ...data }];
    this.cdr.detectChanges();
  }

  onEdit(record: any, index: number) {
    this.enableInsatllmentInsert=true;
    this.selectedIndex = index; // Store the index
    this.installmentForm.patchValue({
      installment_date: new Date(record.installment_date),
      due_amount: record.due_amount,
      accepted_amount: record.accepted_amount, // Correct the field name
      status: record.status,
    });
  }

  onPaymentEdit(record: any, index: any) {
    this.enablePaymentInsert = true;
    this.selectedPaymentIndex = index; // Store the index
    this.paymentForm.patchValue({
      paymentType: '',
      installmentId: record.generate_id,
      paymentDate: record.installment_date,
      paymentAmount: record.accepted_amount,
      balance: '',
      bankAgentAccount: '',
    });
  }

  onAddInstallment() {
    if (this.installmentForm.invalid) return;

    const data = this.installmentForm.value;
    data.due_amount = String(data.due_amount);
    data.accepted_amount = String(data.accepted_amount);
    if (this.selectedIndex !== null) {
      // Update the existing record
      this.installmentData[this.selectedIndex] = {
        ...this.installmentData[this.selectedIndex],
        ...data,
      };
      this.installmentData = [...this.installmentData]; // Trigger UI update
      this.selectedIndex = null;
    } else {
      // Add new record
      this.installmentData = [...this.installmentData, { ...data }];
    }

    this.installmentForm.reset(); // Reset form after submission
    this.enablePaymentInsert = false;
  }

  onDelete(i: any) {}
}
