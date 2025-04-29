import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
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
  encapsulation: ViewEncapsulation.None
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
  readonly=true;
  ngOnInit(): void {
    this.loanDetailsForm = new FormGroup({
      principalAmount: new FormControl(''),
      customerName: new FormControl(''),
      agentName: new FormControl(''),
      leadName: new FormControl(''),
      payableAmount: new FormControl(''),
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
    
    'paymentType',
    'paymentDate',
    'sharedAmount',
  ];

  loanSharingData: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private dataService: DataService,
    private snackbar: MatSnackBar
  ) {}

  async filterTable(): Promise<void> {
    try {
      const searchValue = this.searchQuery;
      const response = await this.dataService
        .getLoanById(searchValue)
        .toPromise();

      if (response && response.installment) {
        this.loanDetailsForm.patchValue({
          principalAmount: response.principal_amount || '',
          customerName: response.customer?.name || '',
          agentName: response.user?.name || '',
          leadName: response.getLeadUser?.name || '',
          payableAmount:Number(response.principal_amount)-Number(response.deposit_amount)
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
        // try {
        //   this.paymentDataFromAPI = response.id
        //   let data = await this.getPaymentListing(response.id);
        //   data = data.sort((a:any, b:any) => {
        //     return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        //   });    
        //   if (data && Array.isArray(data) && data.length > 0) {
        //     const paymenListing = data.map((el: any) => ({
        //       paymentType: el.type,
        //       balance: el.balance,
        //       paymentDate: el.payment_date,
        //       paymentAmount: el.accepted_amount,
        //       accepted_amount: el.amount,
        //       due_amount:el.due_amount,
        //       bankAgentAccount: el.account_details,
        //       installmentId: el.installment_id,
        //       installment_date: el.payment_date,
        //       generate_id:
        //         el.installment && el.installment.generate_id
        //           ? el.installment.generate_id
        //           : '',
        //       loan_id: response.id,
        //     }));
        //     this.paymentData = [...this.paymentData, ...paymenListing];
        //     //this.paymentData = this.paymentData.filter(item => item.id == item.installment_id);
           
        //     const idSet = new Set(
        //       this.paymentData.map((item) => item.id).filter(Boolean)
        //     );

        //     // Step 2: Filter out objects where `id` exists in `installmentId`
        //     const filteredData = this.paymentData.filter(
        //       (item) =>
        //         !(
        //           'id' in item &&
        //           idSet.has(item.id) &&
        //           this.paymentData.some((d) => d.installmentId === item.id)
        //         )
        //     );
        //     this.paymentData = filteredData;

        //     if (response && response.user_2) {
              
              
        //       const data = { ...response, paymentdata: this.paymentData }; // Corrected assignment
              
        //       this.loanSharingData = this.transformInstallments(data);
              
        //       this.dataSourceAgent1 = this.loanSharingData.user1.payments;
        //       this.dataSourceAgent2 = this.loanSharingData.user2.payments;
        //   }

        //   } else {
        //     console.warn('No payment data found');
        //     this.paymentData = [];
        //   }
        // } catch (error) {
        //   this.snackbar.open('Error fetching payment listing', 'Close', { duration: 2000 });
        //   // console.error('Error fetching payment listing:', error);
        // }
        try {
          this.paymentDataFromAPI = response.id;
          let data = await this.getPaymentListing(response.id);
          
          data = data.sort((a: any, b: any) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });

          
        
          if (data && Array.isArray(data) && data.length > 0) {
            const paymentListing = data.map((el: any) => ({
              paymentType: el.type,
              balance: el.balance,
              paymentDate: el.payment_date,
              paymentAmount: el.amount,
              accepted_amount: el.amount,
              due_amount: el.amount,
              bankAgentAccount: el.account_details,
              installmentId: el.installment_id,
              installment_date: el.payment_date,
              generate_id: el.installment?.generate_id || '',
              loan_id: response.id,
            }));
            
            
            // Step 1: Find the 'out' object
            const outPayment = paymentListing.find((el: any) => el.paymentType?.toLowerCase() === 'out');
        
            if (outPayment) {
              let runningBalance = Number(outPayment.balance);
        
              // Step 2: Calculate new balance for each payment row
              const updatedPaymentListing = this.paymentData.map((el: any, index: number, arr: any[]) => {
                if (index === 0) {
                  // For the first item
                  el.balance = runningBalance - Number(el.due_amount || 0);
                } else {
                  // Add previous due_amount to current due_amount, then subtract from runningBalance
                  const prevDueAmount = Number(arr[index - 1]?.balance || 0);
                  const currDueAmount = Number(el.due_amount || 0);
              
                  el.balance = prevDueAmount - currDueAmount;
              
                  // Update running balance for next iteration
                  runningBalance = el.balance;
                }
                return el;
              });
              
              //this.paymentData = this.paymentData.filter(item => item.id == item.installment_id);
              // Add to existing this.paymentData
              this.paymentData = [ ...updatedPaymentListing,...paymentListing];

              
        
              // Optional filtering if you still want to filter duplicates based on id and installmentId
              const idSet = new Set(this.paymentData.map((item) => item.id).filter(Boolean));
        
              const filteredData = this.paymentData.filter(
                (item) =>
                  !(
                    'id' in item &&
                    idSet.has(item.id) &&
                    this.paymentData.some((d) => d.installmentId === item.id)
                  )
              );
        
              this.paymentData = filteredData;

              
        
              if (response && response.user_2) {
                const finalData = { ...response, paymentdata: this.paymentData };
                this.loanSharingData = this.transformInstallments(finalData);
        
                this.dataSourceAgent1 = this.loanSharingData.user1.payments;
                this.dataSourceAgent2 = this.loanSharingData.user2.payments;
              }
            } else {
              console.warn('No OUT payment found to calculate balance.');
            }
          } else {
            console.warn('No payment data found');
            this.paymentData = [];
          }
        } catch (error) {
          this.snackbar.open('Error fetching payment listing', 'Close', { duration: 2000 });
        }
        
      }else {
          this.snackbar.open('No Data Found', 'Close', { duration: 2000 });
        }
    } catch (error) {
      this.snackbar.open('Error fetching loan details:', 'Close', { duration: 2000 });
     // console.error('Error fetching loan details:', error);
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
    this.installmentData = this.installmentData.map((el: any) => {
      const { loan_id,balance, ...rest } = el; // destructure and remove loan_id
      return {
        ...rest,
        due_amount: typeof el.due_amount === 'number' ? String(el.due_amount) : el.due_amount,
        accepted_amount: typeof el.accepted_amount === 'number' ? String(el.accepted_amount) : el.accepted_amount,
      };
    });
    
    
    this.dataService
      .updateInstallment(this.searchQuery, this.installmentData)
      .subscribe((data) => {
        this.filterTable();
        //this.getPaymentListing(this.searchQuery)
        this.snackbar.open('Installment updated', '', { duration: 2000 });
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
  
    if (!this.paymentData || !Array.isArray(this.paymentData)) {
      console.error('paymentData is undefined or not an array');
      return;
    }
  
    this.paymentData.forEach((el: any) => {
      if (el.paymentType !== 'Out') {
        const temp = {
          type: el.paymentType,
          payment_date: el.paymentDate || '', 
          balance: String(el.balance ?? 0), // Safe fallback
          receiving_date: new Date(),
          status: el.status || 'Pending',
          account_details: el.bankAgentAccount || '',
          amount: String(el.paymentAmount ?? 0),
          loan_id: el.loan_id || null,
          installment_id: el.id || null,
        };
  
        // Check: skip adding if 'type', 'payment_date' or 'amount' is null, undefined or empty
        if (
          temp.type && temp.payment_date && temp.amount &&
          temp.type.trim() !== '' && temp.payment_date.trim() !== '' && temp.amount.trim() !== ''
        ) {
          payload.push(temp);
        }
      }
    });
  
    console.log(payload, 'payload');
  
    if (payload.length === 0) {
      console.warn('No valid payments to save.');
      this.snackbar.open('No valid payments to save.', 'Close', {
        duration: 3000,
      });
      return;
    }
  
    this.dataService.addPayment(payload).subscribe({
      next: (data) => {
        this.snackbar.open('Payment added successfully', 'Close', {
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
  
    this.enablePaymentInsert = true;
    this.selectedPaymentIndex = index; // Store the index
    this.paymentForm.patchValue({
      paymentType: record.paymentType,
      installmentId: record.generate_id,
      paymentDate: record.installment_date,
      paymentAmount: record.due_amount,
      balance: record.balance,
      bankAgentAccount: record.bankAgentAccount,
      installment_id: record.id,
    });
  }

  onAddInstallment() {
    if (this.installmentForm.invalid) return;
  
    const data = this.installmentForm.value;
    data.due_amount = Number(data.due_amount); // Ensure numeric value
  
    if (this.selectedIndex !== null) {
      // Update existing record
      this.installmentData[this.selectedIndex] = {
        ...this.installmentData[this.selectedIndex],
        ...data,
      };
    } else {
      // Add new record
      this.installmentData.push({ ...data });
    }
  
    // Update accepted_amount only up to the modified index
    this.updateAcceptedAmounts(this.selectedIndex !== null ? this.selectedIndex : this.installmentData.length - 1);
  
    this.selectedIndex = null;
    this.installmentForm.reset(); // Reset form after submission
    this.enablePaymentInsert = false;
  
    // 🔥 Force UI update
    this.installmentData = [...this.installmentData];
  }
  
  // Function to update accepted_amount only for the modified and previous entries
  updateAcceptedAmounts(index: number) {
    let updatedData = [...this.installmentData]; // Create a new reference to ensure UI updates
  
    if (index === 0) {
      updatedData[0].accepted_amount = Number(updatedData[0].due_amount);
    } else {
      for (let i = 0; i <= index; i++) {
        if (i === 0) {
          updatedData[i].accepted_amount = Number(updatedData[i].due_amount);
        } else {
          updatedData[i].accepted_amount = Number(updatedData[i - 1].accepted_amount) + Number(updatedData[i].due_amount);
        }
      }
    }
  
    this.installmentData = updatedData; // Assign new array reference to trigger UI change
  }
  
  
  transformInstallments(data: any) {
    
    if (!data || !data.installment || !data.user || !data.user_2) {
      throw new Error('Invalid input data');
    }

    const user1Payments = [];
    const user2Payments = [];

    for (const installment of data.paymentdata) {
      if (installment.accepted_amount) {
        const sharedAmount = installment.accepted_amount / 2;

        // Format the date to dd-mm-yyyy
        const formattedDate = new Date(installment.installment_date)
          .toLocaleDateString('en-GB')
          .split('/')
          .join('-');

        user1Payments.push({
          paymentId: installment.generate_id,
          paymentType: installment.paymentType,
          paymentDate: formattedDate,
          sharedAmount: sharedAmount,
        });

        user2Payments.push({
          paymentId: installment.generate_id,
          paymentType: installment.paymentType,
          paymentDate: formattedDate,
          sharedAmount: sharedAmount,
        });
      }
    }

    return {
      user1: {
        name: data.user.name,
        payments: user1Payments,
      },
      user2: {
        name: data.user_2.name,
        payments: user2Payments,
      },
    };
  }

  onDelete(i: any) {}
}
