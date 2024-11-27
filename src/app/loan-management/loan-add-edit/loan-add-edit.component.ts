import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCard, MatCardContent, MatCardModule, MatCardTitle } from '@angular/material/card';
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

@Component({
  selector: 'app-loan-add',
  templateUrl: './loan-add-edit.component.html',
  styleUrls: ['./loan-add-edit.component.scss'],
  standalone: true,
  imports: [CommonModule, MatTabsModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatSelectModule, MatOptionModule,MatPaginatorModule,MatTableModule, MatCard, MatCardContent, MatCardTitle,MatIconModule,MatDatepickerModule,MatNativeDateModule],
})
export class LoanAddEditComponent implements OnInit{
  isEditMode: boolean = false;
  agentDetailsForm!: FormGroup;
  customerDetailsForm!: FormGroup;
  loanDetailsForm!: FormGroup;
  formValid: boolean = false;
  agentIddropdown=[{'id':1,'name':'agent 1'},{'id':2,'name':'agent 2'}]
  agentLead=[{'id':1,'name':'Lead 1'},{'id':2,'name':'Lead 2'}]
  dateUnit=[{'id':1,'unit':'Days'},{'id':2,'unit':'Week'},{'id':3,'unit':'Month'},{'id':4,'unit':'Year'}]
  // loanPackage=[{'id':1,'details':'Package 1'},{'id':2,'details':'Package 2'},{'id':3,'details':'Package 3'},{'id':4,'details':'Package 4'}]
  // datePeriod=[{'id':1,'month':' 1'},{'id':2,'month':'2'}]
  customerId: any;
  agentSearchQuery: any;
  customerSearchQuery: string = '';

  constructor(private router:Router,private dataService:DataService,private route: ActivatedRoute,){

  }

  ngOnInit() {
    this.initializeForms();
  }

  initializeForms() {
    this.agentDetailsForm = new FormGroup({
      agentSearchQuery:  new FormControl(null),
      agentName: new FormControl('', Validators.required),
      agentId: new FormControl('', Validators.required),
      agentLead: new FormControl('', Validators.required),
    });

    this.customerDetailsForm = new FormGroup({
      customerSearchQuery: new FormControl(null),
      customerId: new FormControl('', Validators.required),
      customerName: new FormControl('', Validators.required),
      mobile: new FormControl('', Validators.required),
      customerAddress: new FormControl('', Validators.required),
    });

    this.loanDetailsForm = new FormGroup({
      // loanPackage: new FormControl('', Validators.required),
      repaymentDate: new FormControl(new Date()),
      datePeriod: new FormControl('', Validators.required),
      unitofDate: new FormControl('', Validators.required),
      principalAmount: new FormControl('', Validators.required),
      depositAmount: new FormControl('', Validators.required),
      applicationFee: new FormControl('', Validators.required),
      paymentUpfront: new FormControl('', Validators.required),
      interest: new FormControl('', Validators.required),
      loanRemark: new FormControl(''),
    });

    this.route.params.subscribe(params => {
      console.log(params,'parms')
      if (params && params['action']==='edit') {
        this.loadAllData(params);
        this.isEditMode = true;
      }  if (params && params['action']==='view') {
        this.loadAllData(params);
        this.agentDetailsForm.disable()
        this.customerDetailsForm.disable();
        this.loanDetailsForm.disable();
      } 
      else {
        this.isEditMode = false;
      }
    });
  }

  loadAllData(row:any){
    console.log(row,'inside form');
    this.agentDetailsForm.patchValue({
      agentId: row.agentId,
      agentName: row.agentName,
      agentLead: row.agentLead,
    })

    this.customerDetailsForm.patchValue({
      customerId: row.agentId,
      customerName: row.agentName,
      mobile: row.mobile,
      customerAddress:row.customerAddress
    })

    this.loanDetailsForm.patchValue({
      // loanPackage: row.loanPackage,
      repaymentDate: row.repaymentDate,
      datePeriod: row.datePeriod,
      principalAmount:row.principalAmount,
      depositAmount: row.depositAmount,
      applicationFee: row.applicationFee,
      paymentUpfront: row.paymentUpfront,
      interest: row.interest,
      loanRemark: row.loanRemark
    })


  }

  saveLoan() {
    if (this.agentDetailsForm.valid && this.customerDetailsForm.valid && this.loanDetailsForm.valid) {
      const loanData = {
        ...this.agentDetailsForm.value,
        ...this.customerDetailsForm.value,
        ...this.loanDetailsForm.value,
      };

      console.log(loanData,'loan data');

      this.dataService.saveLoan(loanData).subscribe({
        next: (response:any) => {
          // this.snackBar.open('Loan created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/loans']); // Navigate to loan list or another page on success
        },
        error: (error:any) => {
          console.error('Error:', error);
        }
      });
    } else {
      
    }
  }

  cancel() {
    this.agentDetailsForm.reset();
    this.customerDetailsForm.reset();
    this.loanDetailsForm.reset();
    this.router.navigate(['/loan']); // Redirect or simply reset the forms
  }

  validateForm() {
    // Add form validation logic here
    this.formValid = true; // Example
  }


  searchAgentDetails() {
    // Replace mock search with actual API call when available
    const agentPayload = this.agentDetailsForm.get('agentSearchQuery')?.value;
    this.dataService.findAgentAndLeads(agentPayload).subscribe({
      next: (agentData:any) => {
        this.agentDetailsForm.patchValue({
          agentName: agentData.agentName,
          agentId: agentData.agentId,
          agentLead: agentData.agentLead,
        });
      },
      error: (error:any) => {
        console.error('Agent search error:', error);
      },
    });
  }

  searchCustomerDetails() {
    // Replace mock search with actual API call when available
    const customerPayload = this.customerDetailsForm.get('customerSearchQuery')?.value;
    this.dataService.getCustomerById(customerPayload).subscribe({
      next: (customerData:any) => {
        this.customerDetailsForm.patchValue({
          customerId: customerData.customerId,
          customerName: customerData.customerName,
          mobile: customerData.mobile,
          customerAddress: customerData.customerAddress,
        });
      },
      error: (error:any) => {
        console.error('Customer search error:', error);
      },
    });
  }

  private mockAgentSearch(query: string) {
    // Return mock data based on query
    return query ? { agentName: 'John Doe', agentId: 'A123', agentLead: 'L456' } : null;
  }

  private mockCustomerSearch(query: string) {
    // Return mock data based on query
    return query ? { customerId: 'C789', customerName: 'Jane Smith', mobile: '1234567890', customerAddress: '123 Elm Street' } : null;
  }
}
