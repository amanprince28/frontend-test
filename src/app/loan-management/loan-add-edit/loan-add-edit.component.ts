import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatCard,
  MatCardContent,
  MatCardModule,
  MatCardTitle,
} from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatOptionModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../data.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { GenericModalComponent } from '../../generic-modal/generic-modal.component';

@Component({
  selector: 'app-loan-add',
  templateUrl: './loan-add-edit.component.html',
  styleUrls: ['./loan-add-edit.component.scss'],
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
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class LoanAddEditComponent implements OnInit {
  isEditMode: boolean = false;
  agentDetailsForm!: FormGroup;
  customerDetailsForm!: FormGroup;
  loanDetailsForm!: FormGroup;
  formValid: boolean = false;
  secondAgent :boolean = false;

  dateUnit = [
    { id: 1, unit: 'Day' },
    { id: 2, unit: 'Week' },
    { id: 3, unit: 'Month' },
    { id: 4, unit: 'Year' },
  ];
  loanStatus = [
    { status: 'Completed' },
    { status: 'Normal' },
    { status: 'Bad Debt' },
    { status: 'Bad Debt Completed' },
  ];
  customerId: any;

  userData: any;
  customerData: any;
  loan_id: any;
  userDetails: any;
  userRole: any;

  constructor(
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.initializeForms();
    this.userDetails = localStorage.getItem('user-details');
    this.userDetails = JSON.parse(this.userDetails);
    this.userRole = this.userDetails?.role ?? '';
    this.fetchUserData();
    this.fetchCustomer();

    this.route.params.subscribe(async (params) => {
      if (params['action'] === 'edit' || params['action'] === 'view') {
        const loanData = await this.dataService.getLoanById(params['generate_id']).toPromise()
        this.loadAllData(loanData);
       
        this.isEditMode = params['action'] === 'edit';
        if (params['action'] === 'view') {
          this.agentDetailsForm.disable();
          this.customerDetailsForm.disable();
          this.loanDetailsForm.disable();
        }
      } else {
        this.isEditMode = false;
      }
    });

    this.loanDetailsForm
    .get('deposit_amount')
    ?.valueChanges.subscribe((value) => {
      // Get the current values from the form controls
      const principal_amount =
        this.loanDetailsForm.get('principal_amount')?.value;
      const deposit_amount = this.loanDetailsForm.get('deposit_amount')?.value;
      const application_fee =
        this.loanDetailsForm.get('application_fee')?.value;
  

        // Check if any of the values is null or undefined
        if (
          principal_amount == null ||
          deposit_amount == null ||
          application_fee == null 
        ) {
          // If any value is null or undefined, reset amount_given to null
          this.loanDetailsForm.get('amount_given')?.setValue(null);
        } else {
          // Calculate amount_given if all values are defined
          const amount_given =
            principal_amount - deposit_amount;
          this.loanDetailsForm.get('amount_given')?.setValue(amount_given);
        }
      });

      this.loanDetailsForm.get('interest')?.valueChanges.subscribe((value) => {
        // Get the current values from the form controls
        const principal_amount =
          this.loanDetailsForm.get('principal_amount')?.value;
        const deposit_amount = this.loanDetailsForm.get('deposit_amount')?.value;
        const repayment_terms = this.loanDetailsForm.get('repayment_term')?.value;
        const interest = this.loanDetailsForm.get('interest')?.value;
      
        // Check if any of the required values is null or undefined
        if (
          principal_amount == null ||
          deposit_amount == null ||
          repayment_terms == null ||
          interest == null
        ) {
          // If any value is null or undefined, reset the calculated fields
          this.loanDetailsForm.get('interest_amount')?.setValue(null);
          this.loanDetailsForm.get('payment_per_term')?.setValue(null);
        } else {
          // Calculate interest_amount and payment_per_term if all values are defined
          const interest_amount =
            principal_amount * (interest / 100) * repayment_terms;
          this.loanDetailsForm.get('interest_amount')?.setValue(interest_amount);
      
          const payment_per_term =
            (principal_amount + interest_amount) / repayment_terms;
          this.loanDetailsForm.get('payment_per_term')?.setValue(payment_per_term);
        }
      });

    // Add a valueChanges listener for principalAmount, depositAmount, and applicationFee to ensure calculations are updated when they change
    this.loanDetailsForm.get('principal_amount')?.valueChanges.subscribe(() => {
      // Recalculate amount_given if principal_amount changes
      this.updateAmountGiven();
    });
    
    this.loanDetailsForm.get('deposit_amount')?.valueChanges.subscribe(() => {
      // Recalculate amount_given if deposit_amount changes
      this.updateAmountGiven();
    });
    
    this.loanDetailsForm.get('application_fee')?.valueChanges.subscribe(() => {
      // Recalculate amount_given if application_fee changes
      this.updateAmountGiven();
    });
    
    this.loanDetailsForm.get('interest')?.valueChanges.subscribe(() => {
      // Recalculate interest_amount and payment_per_term if interest changes
      this.updateInterestAndPaymentPerTerm();
    });
    
    this.loanDetailsForm.get('repayment_term')?.valueChanges.subscribe(() => {
      // Recalculate interest_amount and payment_per_term if repayment_terms changes
      this.updateInterestAndPaymentPerTerm();
    });
  }

  fetchUserData(page: number = 0, limit: number = 5): void {
    const payload = { page, limit };
    this.dataService.getUser(payload).subscribe((response: any) => {
      console.log(response);
      this.userData = response.filter((el: any) => el?.role === 'AGENT');
    });
  }

  fetchCustomer(page: number = 0, limit: number = 5): void {
    const payload = { page, limit };
    this.dataService.getCustomer(payload).subscribe((response: any) => {
      console.log(response);
      this.customerData = response.data;
    });
  }

  updateAmountGiven() {
    const principal_amount = this.loanDetailsForm.get('principal_amount')?.value;
    const deposit_amount = this.loanDetailsForm.get('deposit_amount')?.value;
    const application_fee = this.loanDetailsForm.get('application_fee')?.value;
  
    if (
      principal_amount == null ||
      deposit_amount == null ||
      application_fee == null 
    ) {
      // Reset amount_given if any value is null or undefined
      this.loanDetailsForm.get('amount_given')?.setValue(null);
    } else {
      // Calculate amount_given if all values are valid
      const amount_given =
        principal_amount - deposit_amount;
      this.loanDetailsForm.get('amount_given')?.setValue(amount_given);
    }
  }
  
  updateInterestAndPaymentPerTerm() {
    const principal_amount = this.loanDetailsForm.get('principal_amount')?.value;
    const deposit_amount = this.loanDetailsForm.get('deposit_amount')?.value;
    const repayment_terms = this.loanDetailsForm.get('repayment_term')?.value;
    const interest = this.loanDetailsForm.get('interest')?.value;
  
    if (
      principal_amount == null ||
      deposit_amount == null ||
      repayment_terms == null ||
      interest == null
    ) {
      // Reset interest_amount and payment_per_term if any value is null or undefined
      this.loanDetailsForm.get('interest_amount')?.setValue(null);
      this.loanDetailsForm.get('payment_per_term')?.setValue(null);
    } else {
      // Calculate interest_amount and payment_per_term if all values are valid
      const interest_amount = principal_amount * (interest / 100) * repayment_terms;
      this.loanDetailsForm.get('interest_amount')?.setValue(interest_amount);
  
      const payment_per_term = (principal_amount + interest_amount) / repayment_terms;
      this.loanDetailsForm.get('payment_per_term')?.setValue(payment_per_term);
    }
  }
  

  initializeForms() {
    this.agentDetailsForm = new FormGroup({
      agentName: new FormControl('', Validators.required),
      agentId: new FormControl('', Validators.required),
      agentLead: new FormControl('', Validators.required),
      agentName1: new FormControl('',),
      agentId1: new FormControl('',),
    });

    this.customerDetailsForm = new FormGroup({
      customerId: new FormControl('', Validators.required),
      customerName: new FormControl('', Validators.required),
      mobile: new FormControl('', Validators.required),
      customerAddress: new FormControl('', Validators.required),
      customerIc : new FormControl(''),
    });

    this.loanDetailsForm = new FormGroup({
      repayment_date: new FormControl(new Date(), Validators.required),
      date_period: new FormControl('', Validators.required),
      unit_of_date: new FormControl('', Validators.required),
      principal_amount: new FormControl('', Validators.required),
      deposit_amount: new FormControl('', Validators.required),
      application_fee: new FormControl('', Validators.required),
      interest: new FormControl('', Validators.required),
      amount_given: new FormControl({ value: '', disabled: true }),
      payment_per_term: new FormControl({ value: '', disabled: true }),
      loan_remark: new FormControl(''),
      interest_amount: new FormControl({ value: '', disabled: true }),
      status: new FormControl(''),
      repayment_term: new FormControl(''),
    });
  }
  loadAllData(row: any) {
    this.loan_id = row.id;
  
    this.agentDetailsForm.patchValue({
      agentId: row.supervisor,
      agentName: row.user.name,
      agentLead: row.agentLead,
    });

    this.customerDetailsForm.patchValue({
      customerId: row.customer.id,
      customerName: row.customer.name,
      mobile: row.customer.mobile_no,
      customerAddress: row.customerAddress,
      customerIc : row.customer.ic
    });

    this.loanDetailsForm.patchValue({
      repayment_date: row.repayment_date,
      date_period: row.date_period,
      principal_amount: row.principal_amount,
      deposit_amount: row.deposit_amount,
      application_fee: row.application_fee,
      interest: row.interest,
      loan_remark: row.loan_remark,
      interest_amount: row.interest_amount,
      amount_given: row.amount_given,
      payment_per_term: row.payment_per_term,
      unit_of_date: row.unit_of_date,
      repayment_term: row.repayment_term,
      status:row.status
    });
  }

  saveLoan() {
    const loanData = {
      supervisor: this.agentDetailsForm.get('agentId')?.value,
      customer_id: this.customerDetailsForm.get('customerId')?.value,
      payment_per_term:this.loanDetailsForm.getRawValue().payment_per_term,
      amount_given:this.loanDetailsForm.getRawValue().amount_given,
      interest_amount:this.loanDetailsForm.getRawValue().interest_amount,
      ...this.loanDetailsForm.value,
    };
    const agentId1 = this.agentDetailsForm.get('agentId1')?.value;
    if (agentId1) {
      loanData.supervisor_2 = agentId1;
    }
    if (this.isEditMode) {
      loanData.id = this.loan_id;
    }
    console.log(loanData, 'loan data');
    if(this.isEditMode){
      this.dataService.updateLoan(this.loan_id,loanData).subscribe((response) => {
        this.router.navigate(['/loan']);
      });
    }else{
    this.dataService.addLoan(loanData).subscribe((response) => {
      this.router.navigate(['/loan']);
    });
  }
  }

  cancel() {
    this.agentDetailsForm.reset();
    this.customerDetailsForm.reset();
    this.loanDetailsForm.reset();
    this.router.navigate(['/loan']); // Navigate back to loan list or another appropriate page
  }

  openAgentSearch(optionalParam?: string) {
    console.log(optionalParam);
    this.secondAgent = optionalParam === 'two';
    this.openModal('Agent Search', 'Search by Agent ID', this.userData, [
        { key: 'name', header: 'Name' },
        { key: 'role', header: 'Role' },
        { key: 'status', header: 'Status' }
    ]);
}

  openCustomerSearch() {
    this.openModal(
      'Customer Search',
      'Search by Customer Name',
      this.customerData,
      [
        { key: 'name', header: 'Name' },
        { key: 'ic', header: 'IC' },
      ]
    );
  }

  openModal(
    title: string,
    searchPlaceholder: string,
    items: any[],
    columns: any[]
  ) {
    const dialogRef = this.dialog.open(GenericModalComponent, {
      width: '70%',
      data: { title, searchPlaceholder, items, columns },
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
          console.log('Selected:', result);
          if (title === 'Customer Search') {
              this.customerDetailsForm.patchValue({
                  customerId: result.id,
                  customerName: result.name,
                  mobile: result.mobile_no,
                  customerAddress: result.customerAddress,
                  customerIc: result.ic
              });
          } else {
              if (this.secondAgent) {
                  this.agentDetailsForm.patchValue({
                      agentId1: result.id,
                      agentName1: result.name
                  });
              } else {
                  this.agentDetailsForm.patchValue({
                      agentId: result.id,
                      agentName: result.name,
                      email: result.email,
                      role: result.role
                  });
              }
          }
      }
  });
  }
}
