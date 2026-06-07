import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  AppDateAdapter,
  APP_DATE_FORMATS,
} from '../../common/custom-date-adapter';
import { format } from 'date-fns';
import { GlobalPositionStrategy } from '@angular/cdk/overlay';
import { debounceTime, distinctUntilChanged, skip, Subscription, tap } from 'rxjs';

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
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
  ],
})
export class LoanAddEditComponent implements OnInit,OnDestroy {
  isEditMode: boolean = false;
  agentDetailsForm!: FormGroup;
  customerDetailsForm!: FormGroup;
  loanDetailsForm!: FormGroup;
  formValid: boolean = false;
  secondAgent: boolean = false;
  isSaving: boolean = false;
  readonly: boolean = true;
  action: 'add' | 'edit' | 'view' = 'add';
  loan_id_header: string | null = null;
  isViewMode: boolean = false;
  isCalculatingGoodwill = false;
  private goodwillSubscription: Subscription | undefined;


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
    { status: 'Partially Paid' },
    { status: 'Void' },
  ];
  customerId: any;

  userData: any;
  customerData: any;
  loan_id: any;
  userDetails: any;
  userRole: any;
  passedData: any;
  cantSave: boolean = false;
  loanResponse: any;
  isInitialLoad: boolean = true;

  constructor(
    private router: Router,
    private dataService: DataService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.passedData =
      this.router.getCurrentNavigation()?.extras.state?.['data'];
  }

  ngOnInit() {
    this.initializeForms();
    this.setupGoodwillListener();
    this.userDetails = localStorage.getItem('user-details');
    this.userDetails = JSON.parse(this.userDetails);
    this.userRole = this.userDetails?.role ?? '';
    
    // Only enable estimated_profit for edit mode if user has permission
    if (this.userRole === 'SUPER_ADMIN' || this.userDetails?.email === 'Jessica@cs') {
      // Will be handled based on mode in loadAllData
    } else {
      this.loanDetailsForm.get('estimated_profit')?.disable();
    }
    
    this.fetchUserData();
    this.fetchCustomer();

    this.route.params.subscribe(async (params) => {
      if (this.passedData && (this.passedData['action'] === 'edit' || this.passedData['action'] === 'view')) {
        this.action = this.passedData['action'];
        this.isViewMode = this.passedData['action'] === 'view';
        this.loan_id_header = this.passedData['generate_id'];
        
        const loanData = await this.dataService
          .getLoanById(this.passedData['generate_id'])
          .toPromise();

        this.loanResponse = loanData;
        this.isEditMode = this.passedData['action'] === 'edit';
        
        // Disable all forms in view mode
        if (this.isViewMode || this.passedData['status'] === 'Void') {
          this.agentDetailsForm.disable();
          this.customerDetailsForm.disable();
          this.loanDetailsForm.disable();
        }
        
        this.loadAllData(loanData);
        
        // Set flag to indicate initial load is complete
        setTimeout(() => {
          this.isInitialLoad = false;
        }, 100);
      } else {
        this.isEditMode = false;
        this.isViewMode = false;
      }
    });

    // Only subscribe to value changes if not in view mode
    if (!this.isViewMode) {
      this.setupValueChangeListeners();
    }
  }

  setupValueChangeListeners() {
    // Setup all value change listeners only for add/edit modes
    this.loanDetailsForm
      .get('deposit_amount')
      ?.valueChanges.pipe(
        skip(1),
        debounceTime(2000)
      )
      .subscribe((value) => {
        this.updateAmountGiven();
      });

    this.loanDetailsForm.get('interest')
      ?.valueChanges.pipe(
        skip(1),
        debounceTime(2000)
      )
      .subscribe((value) => {
        this.updateInterestAndPaymentPerTerm();
      });

    this.loanDetailsForm.get('principal_amount')
      ?.valueChanges.pipe(
        skip(1),
        debounceTime(2000)
      )
      .subscribe(() => {
        this.updateAmountGiven();
        this.updateInterestAndPaymentPerTerm();
      });

    this.loanDetailsForm.get('application_fee')
      ?.valueChanges.pipe(
        skip(1),
        debounceTime(2000)
      )
      .subscribe(() => {
        this.updateAmountGiven();
      });

    this.loanDetailsForm.get('repayment_term')
      ?.valueChanges.pipe(
      
        debounceTime(2000)
      )
      .subscribe(() => {
        this.updateInterestAndPaymentPerTerm();
      });

    this.loanDetailsForm
      .get('status')
      ?.valueChanges.subscribe((statusValue) => {
        if (statusValue === 'Void') {
          this.updateEstimateActualProfit();
        }
      });
    
  }

  setupGoodwillListener() {
    // Unsubscribe previous subscription if exists
    if (this.goodwillSubscription) {
      this.goodwillSubscription.unsubscribe();
    }
  
    const goodwillControl = this.loanDetailsForm.get('goodwill');
    
    if (goodwillControl) {
      this.goodwillSubscription = goodwillControl.valueChanges.pipe(
        skip(1), // Skip the initial form value emission
        tap(() => {
          // Disable button immediately when user starts typing
          this.isCalculatingGoodwill = true;
        }),
        debounceTime(1000),
        distinctUntilChanged()
      ).subscribe((value) => {
        // Only proceed if there's an actual value change
        if (value !== undefined && value !== null) {
          this.updateEstimatedProfit(this.loanResponse);
        } else {
          // If no valid value, reset the flag
          this.isCalculatingGoodwill = false;
        }
      });
    }
  }

  updateEstimateActualProfit() {
    // Only update if not in view mode
    if (!this.isViewMode) {
      this.loanDetailsForm.get('estimated_profit')?.setValue(0);
      this.loanDetailsForm.get('actual_profit')?.setValue(0);
    }
  }

  fetchUserData(page: number = 1, limit: number = 5): void {
    const payload = { page, limit };
    this.dataService.getUser(payload).subscribe((response: any) => {
      this.userData = response.data.filter(
        (el: any) => el?.role === 'AGENT' || el?.role === 'LEAD'
      );
    });
  }

  fetchCustomer(page: number = 1, limit: number = 5): void {
    const payload = { page, limit };
    this.dataService.getCustomer(payload).subscribe((response: any) => {
      this.customerData = response.data;
    });
  }

  updateEstimatedProfit(loanResponse: any) {
    try {
      if (this.isViewMode) {
        return;
      }
  
      const estimated_profit = loanResponse.principal_amount - loanResponse.deposit_amount - loanResponse.amount_given;
      const goodwill = this.loanDetailsForm.get('goodwill')?.value;
      
      const value = Number(estimated_profit) - Number(goodwill);
      console.log(goodwill, value, 'goodwill');
  
      this.loanDetailsForm.get('estimated_profit')?.setValue(value, { emitEvent: false });
  
      if (Number(estimated_profit) < Number(goodwill)) {
        this.cantSave = true;
      }
      
      if (this.loanDetailsForm.get('status')?.value === 'Void') {
        this.loanDetailsForm.get('actualProfit')?.setValue(0, { emitEvent: false });
      }
    } catch (error) {
      console.error('Error calculating goodwill:', error);
    } finally {
      // Always reset the flag after calculation is complete
      setTimeout(() => {
        this.isCalculatingGoodwill = false;
      }, 100); // Small delay to ensure UI updates properly
    }
  }

  ngOnDestroy() {
    if (this.goodwillSubscription) {
      this.goodwillSubscription.unsubscribe();
    }
  }

  updateAmountGiven() {
    // Don't calculate in view mode
    if (this.isViewMode) return;

    const principal_amount = this.loanDetailsForm.get('principal_amount')?.value;
    const deposit_amount = this.loanDetailsForm.get('deposit_amount')?.value;
    const application_fee = this.loanDetailsForm.get('application_fee')?.value;

    if (
      principal_amount == null ||
      deposit_amount == null ||
      application_fee == null
    ) {
      this.loanDetailsForm.get('amount_given')?.setValue(null);
    } else {
      const amount_given = principal_amount - deposit_amount - application_fee;
      this.loanDetailsForm.get('amount_given')?.setValue(amount_given);

      const estimatedProfit = principal_amount - deposit_amount - amount_given;
      this.loanDetailsForm.get('estimated_profit')?.setValue(estimatedProfit);
      
      // Don't update estimated profit here - it will be updated separately
      // to avoid conflicts with goodwill calculation
    }
  }


  updateInterestAndPaymentPerTerm() {
    // Don't calculate in view mode
    if (this.isViewMode) return;
  
    const principal_amount = Number(this.loanDetailsForm.get('principal_amount')?.value) || 0;
    const deposit_amount = Number(this.loanDetailsForm.get('deposit_amount')?.value) || 0;
    const repayment_terms = Number(this.loanDetailsForm.get('repayment_term')?.value) || 0;
    const interest = Number(this.loanDetailsForm.get('interest')?.value) || 0;
  
    // Calculate interest amount (always calculate, even with 0 values)
    const interest_amount = principal_amount * (interest / 100) * repayment_terms;
    this.loanDetailsForm.get('interest_amount')?.setValue(interest_amount);
  
    // Calculate payment per term - FIXED: Handle repayment_terms = 0 gracefully
    let payment_per_term = null;
    
    if (repayment_terms !== 0) {
      console.log('cal')
      // Only calculate if repayment_terms is not 0
      if (repayment_terms > 0) {
        console.log('cal2')
        payment_per_term = (principal_amount - deposit_amount) / repayment_terms;
        // Round to 2 decimal places to avoid floating point issues
        payment_per_term = Math.round(payment_per_term * 100) / 100;
      }
      // If repayment_terms is negative or 0, payment_per_term remains null
    }
    
    // Only set value if calculation was performed
    if (payment_per_term !== null) {
      this.loanDetailsForm.get('payment_per_term')?.setValue(payment_per_term);
    } else {
      this.loanDetailsForm.get('payment_per_term')?.setValue(null);
    }
  }

  initializeForms() {
    this.agentDetailsForm = new FormGroup({
      agentName: new FormControl('', Validators.required),
      agentId: new FormControl('', Validators.required),
      agentLead: new FormControl('', Validators.required),
      agentName1: new FormControl(''),
      agentId1: new FormControl(''),
    });

    this.customerDetailsForm = new FormGroup({
      customerId: new FormControl('', Validators.required),
      customerName: new FormControl('', Validators.required),
      mobile: new FormControl('', Validators.required),
      customerAddress: new FormControl('', Validators.required),
      customerIc: new FormControl(''),
    });

    this.loanDetailsForm = new FormGroup({
      repayment_date: new FormControl(new Date(), Validators.required),
      date_period: new FormControl('', Validators.required),
      unit_of_date: new FormControl('', Validators.required),
      principal_amount: new FormControl('', Validators.required),
      deposit_amount: new FormControl('', Validators.required),
      application_fee: new FormControl('', Validators.required),
      interest: new FormControl(''),
      amount_given: new FormControl({ value: '', disabled: true }),
      payment_per_term: new FormControl({ value: '', disabled: true }),
      loan_remark: new FormControl(''),
      interest_amount: new FormControl({ value: '', disabled: true }),
      status: new FormControl(''),
      goodwill: new FormControl(''),
      loan_date: new FormControl('', Validators.required),
      repayment_term: new FormControl('', Validators.required),
      actual_profit: new FormControl({ value: '', disabled: true }),
      estimated_profit: new FormControl({ value: 0, disabled: true }),
    });
  }

  loadAllData(row: any) {
    this.loan_id = row.id;
    this.isViewMode = this.passedData['action'] === 'view';

    // Disable forms based on status or view mode
    if (row.id && (row.status === 'Void' || this.isViewMode)) {
      this.agentDetailsForm.disable();
      this.customerDetailsForm.disable();
      this.loanDetailsForm.disable();
    }

    // Calculate actual profit for display (both view and edit modes)
    const totalAcceptedAmount = row.payment
      ?.filter((item: any) => item.type === 'In')
      .reduce((sum: number, item: any) => {
        const amount = Number(item.amount) || 0;
        return sum + amount;
      }, 0) || 0;
    
    let actualProfit = Number(totalAcceptedAmount) - (Number(row.amount_given) || 0);
    
    // For Void status, set actual profit to 0
    if (row.status === 'Void') {
      actualProfit = 0;
    }

    // Patch agent details
    this.agentDetailsForm.patchValue({
      agentId: row.user?.id || '',
      agentName: row.user?.name?.toUpperCase() || '',
      agentLead: row.agentLead || '',
    });
    
    if (row.user_2) {
      this.secondAgent = true;
      this.agentDetailsForm.patchValue({
        agentId1: row.user_2.id,
        agentName1: row.user_2.name?.toUpperCase() || '',
      });
    }

    // Patch customer details
    this.customerDetailsForm.patchValue({
      customerId: row.customer?.id || '',
      customerName: row.customer?.name || '',
      mobile: row.customer?.mobile_no || '',
      customerAddress: row.customerAddress || '',
      customerIc: row.customer?.ic || '',
    });

    // Patch loan details
    this.loanDetailsForm.patchValue({
      repayment_date: row.repayment_date ? new Date(row.repayment_date) : new Date(),
      date_period: row.date_period || '',
      principal_amount: row.principal_amount || '',
      deposit_amount: row.deposit_amount || '',
      application_fee: row.application_fee || '',
      interest: row.interest || '',
      loan_remark: row.loan_remark || '',
      interest_amount: row.interest_amount || '',
      amount_given: row.amount_given || '',
      payment_per_term: row.payment_per_term || '',
      unit_of_date: row.unit_of_date || '',
      repayment_term: row.repayment_term || '',
      status: row.status || '',
      actual_profit: actualProfit,
      loan_date: row.loan_date ? new Date(row.loan_date) : new Date(),
      goodwill: row.goodwill || '',
    });

    // Handle estimated_profit differently for view vs edit modes
    if (this.isViewMode) {
      // In view mode, use the stored estimated_profit value
      this.loanDetailsForm.get('estimated_profit')?.setValue(row.estimated_profit || 0);
    } else {
      // In edit mode, enable/disable based on user role
      if (this.userRole === 'SUPER_ADMIN' || this.userDetails?.email === 'Jessica@cs') {
        this.loanDetailsForm.get('estimated_profit')?.enable();
      } else {
        this.loanDetailsForm.get('estimated_profit')?.disable();
      }
      
      // For edit mode, calculate estimated profit if not provided
      if (!row.estimated_profit && row.estimated_profit !== 0) {
        const principal = row.principal_amount || 0;
        const deposit = row.deposit_amount || 0;
        const amountGiven = row.amount_given || 0;
        const goodwill = row.goodwill || 0;
        
        let estimatedProfit = principal - deposit - amountGiven - goodwill;
        this.loanDetailsForm.get('estimated_profit')?.setValue(estimatedProfit);
      } else {
        // Use the stored value
        this.loanDetailsForm.get('estimated_profit')?.setValue(row.estimated_profit);
      }
    }
  }

  saveLoan() {
    if (!this.loanDetailsForm.valid) {
      this.snackBar.open('Please fill all required fields.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
      return;
    }
    
    if (this.cantSave) {
      this.snackBar.open('Unable to Save - Goodwill cannot exceed estimated profit.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    this.isSaving = true;

    const loanDetails = this.loanDetailsForm.getRawValue();

    const formatDate = (date: any): string => {
      return date ? format(new Date(date), 'yyyy-MM-dd') : '';
    };

    const loanData: any = {
      ...loanDetails,
      supervisor: this.agentDetailsForm.get('agentId')?.value,
      customer_id: this.customerDetailsForm.get('customerId')?.value,
      payment_per_term: loanDetails.payment_per_term?.toString() || '',
      amount_given: loanDetails.amount_given?.toString() || '',
      interest_amount: loanDetails.interest_amount?.toString() || '',
      estimated_profit: loanDetails.estimated_profit?.toString() || '',
      actual_profit: loanDetails.actual_profit?.toString() || '',
      repayment_date: formatDate(loanDetails.repayment_date),
      goodwill: loanDetails.goodwill?.toString() || '',
      loan_date: formatDate(loanDetails.loan_date),
    };

    const agentId1 = this.agentDetailsForm.get('agentId1')?.value;
    if (agentId1) {
      loanData.supervisor_2 = agentId1;
    }

    if (this.isEditMode) {
      loanData.id = this.loan_id;
    }

    const saveOperation = this.isEditMode
      ? this.dataService.updateLoan(this.loan_id, loanData)
      : this.dataService.addLoan(loanData);

    saveOperation.subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open(
          `Loan ${this.isEditMode ? 'updated' : 'created'} successfully!`,
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.router.navigate(['/loan']);
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Error saving loan:', err);
        this.snackBar.open('Failed to save loan. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  cancel() {
    this.agentDetailsForm.reset();
    this.customerDetailsForm.reset();
    this.loanDetailsForm.reset();
    this.router.navigate(['/loan']);
  }

  openAgentSearch(optionalParam?: string) {
    // Don't allow search in view mode
    if (this.isViewMode) return;
    
    this.secondAgent = optionalParam === 'two';
    this.openModal(
      'Agent Search',
      'Search by Agent ID',
      this.userData,
      [
        { key: 'name', header: 'Name' },
        { key: 'role', header: 'Role' },
        { key: 'status', header: 'Status' },
      ],
      'agent'
    );
  }

  openCustomerSearch() {
    // Don't allow search in view mode
    if (this.isViewMode) return;
    
    this.openModal(
      'Customer Search',
      'Search by Customer Name',
      this.customerData,
      [
        { key: 'name', header: 'Name' },
        { key: 'ic', header: 'IC' },
      ],
      'customer'
    );
  }

  openModal(
    title: string,
    searchPlaceholder: string,
    items: any[],
    columns: any[],
    type: 'agent' | 'customer'
  ) {
    const dialogRef = this.dialog.open(GenericModalComponent, {
      width: '70%',
      height: '70%',
      data: { title, searchPlaceholder, items, columns, type },
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (title === 'Customer Search') {
          this.customerDetailsForm.patchValue({
            customerId: result.id,
            customerName: result.name,
            mobile: result.mobile_no,
            customerAddress: result.customerAddress,
            customerIc: result.ic,
          });
        } else {
          if (this.secondAgent) {
            this.agentDetailsForm.patchValue({
              agentId1: result.id,
              agentName1: result.name,
            });
          } else {
            this.agentDetailsForm.patchValue({
              agentId: result.id,
              agentName: result.name,
              email: result.email,
              role: result.role,
            });
          }
        }
      }
    });
  }
}
