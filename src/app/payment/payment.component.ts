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
  dataSourceAgent2: any;
  dataSourceAgent1: any;
  paymentDataFromAPI: any;
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
    this.enablePaymentInsert = false;
    this.enableInsatllmentInsert = false;
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
  displayedColumns: string[] = [
    'paymentId',
    'paymentType',
    'paymentDate',
    'sharedAmount',
  ];

  loanSharingData: any[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private dataService: DataService,
    private snackbar: MatSnackBar
  ) {}

  async filterTable(): Promise<void> {
    try {
      const searchValue = this.searchQuery;
      console.log(searchValue, 'Search Value');

      const response = await this.dataService
        .getLoanById(searchValue)
        .toPromise();
      console.log(response);

      if (response && response.installment) {
        this.loanDetailsForm.patchValue({
          principalAmount: response.principal_amount || '',
          customerName: response.customer?.name || '',
          agentName: response.user?.name || '',
          leadName: response.leadName || '',
        });

        this.installmentData = response.installment.sort((a: any, b: any) => {
          return (
            new Date(a.installment_date).getTime() -
            new Date(b.installment_date).getTime()
          );
        });

        this.paymentData = response.installment.filter(
          (data: any) => data?.status?.toLowerCase() === 'paid'
        );

        // Fetch Payment Data Correctly
        try {
          const data = await this.getPaymentListing(response.id);

          if (data && Array.isArray(data) && data.length > 0) {
            const paymenListing = data.map((el: any) => ({
              paymentType: el.type,
              balance: el.balance,
              paymentDate: el.payment_date,
              paymentAmount: el.amount,
              accepted_amount: el.amount,
              bankAgentAccount: el.account_details,
              installmentId: el.installment_id,
              installment_date: el.payment_date,
              generate_id: el.installment && el.installment.generate_id ? el.installment.generate_id : '',
              loan_id: response.id , 
            }));
            this.paymentData = [...this.paymentData, ...paymenListing];
            //this.paymentData = this.paymentData.filter(item => item.id == item.installment_id);
            console.log(JSON.stringify(this.paymentData, null, 2));
            const idSet = new Set(this.paymentData.map((item) => item.id).filter(Boolean));

            // Step 2: Filter out objects where `id` exists in `installmentId`
            const filteredData = this.paymentData.filter(
              (item) => !("id" in item && idSet.has(item.id) && this.paymentData.some(d => d.installmentId === item.id))
            );
             this.paymentData=filteredData;
          } else {
            console.warn('No payment data found');
            this.paymentData = [];
          }

          console.log(this.paymentData, 'pya');
        } catch (error) {
          console.error('Error fetching payment listing:', error);
        }

        console.log(this.paymentData, 'pya');
      }
    } catch (error) {
      console.error('Error fetching loan details:', error);
    }
  }

  async getPaymentListing(loanId: any): Promise<any> {
    try {
      const data = await this.dataService
        .getPaymentByLoanId(loanId)
        .toPromise();
      return data;
    } catch (error) {
      console.error('Error fetching payment listing:', error);
      throw error;
    }
  }

  saveInstallmentListing() {
    this.dataService
      .updateInstallment(this.searchQuery, this.installmentData)
      .subscribe((data) => {
        console.log(data);
        this.filterTable();
        this.snackbar.open('Installment updated', '', {
          duration: 2000,
        });
      });
  }

  onAddPayment() {
    if (this.paymentForm.invalid) return;

    const data = this.paymentForm.value;
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
    let payload: any[] = []; // Initialize the array properly
    console.log(this.paymentData, 'payment data');

    if (!this.paymentData || !Array.isArray(this.paymentData)) {
      console.error('paymentData is undefined or not an array');
      return;
    }

    this.paymentData.forEach((el: any) => {
      const temp = {
        type: el.paymentType,
        payment_date: el.paymentDate || '', // Ensure a valid value
        balance: String(el.balance), // Default to 0 if undefined
        receiving_date: new Date(), // Consider formatting if needed
        status: el.status || 'Pending', // Default status
        account_details: el.bankAgentAccount || '', // Ensure a valid value
        amount: String(el.paymentAmount), // Default to 0 if undefined
        loan_id: el.loan_id || null, // Ensure a valid value
        installment_id: el.id || null, // Ensure a valid value
      };
      payload.push(temp);
    });

    this.dataService.addPayment(payload).subscribe({
      next: (data) => {
        console.log('Response:', data);
        this.snackbar.open('Payment added successfully' ,'Close', {
          duration: 3000,
        });
      },
      error: (err) => {
        console.error('Error adding payment:', err);
        this.snackbar.open('Failed to add payment', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  addLoanSharingData(data: any) {
    this.loanSharingData = [...this.loanSharingData, { ...data }];
    this.cdr.detectChanges();
  }

  onEdit(record: any, index: number) {
    this.enableInsatllmentInsert = true;
    this.selectedIndex = index; // Store the index
    this.installmentForm.patchValue({
      installment_date: new Date(record.installment_date),
      due_amount: record.due_amount,
      accepted_amount: record.accepted_amount, // Correct the field name
      status: record.status,
    });
  }

  onPaymentEdit(record: any, index: any) {
    console.log(record, 'record');
    this.enablePaymentInsert = true;
    this.selectedPaymentIndex = index; // Store the index
    this.paymentForm.patchValue({
      paymentType: record.paymentType,
      installmentId: record.generate_id,
      paymentDate: record.installment_date,
      paymentAmount: record.accepted_amount,
      balance: record.balance,
      bankAgentAccount: record.bankAgentAccount,
      installment_id: record.id,
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
