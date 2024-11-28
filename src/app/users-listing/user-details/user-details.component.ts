import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SignalService } from '../../signal.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { DataService } from '../../data.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, MatTabsModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatSelectModule, MatOptionModule, MatPaginatorModule, MatTableModule, MatCard, MatCardContent, MatCardTitle],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  isEditMode: boolean = false;
  details: any = {};
  form!: FormGroup;
  userForm!: FormGroup;
  signalData: any;
  customerId!: string;
  role: any[] = [];
  customerList: any[] = []; // List of customers for supervisor dropdown
  selectedRole: string = ''; // Track the selected role
  selectedSupervisor: string = ''; // Track the selected supervisor
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signalService: SignalService,
    private dataService: DataService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Initialize form controls
    this.userForm = new FormGroup({
      // Customer Information
      name: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      role: new FormControl('', [Validators.required,]),
      supervisor: new FormControl(''), // Supervisor dropdown control
    });

    this.role = [
      { value: 'ADMIN', viewValue: 'ADMIN' },
      { value: 'LEAD', viewValue: 'LEAD' },
      { value: 'AGENT', viewValue: 'AGENT' }
    ];

    this.fetchSupervisors();

    // Initialize edit mode and load existing data if necessary
    this.route.params.subscribe(params => {
      this.customerId = params['id'];
      if (this.customerId) {
        this.loadUserData(this.customerId);
        if (params['action'] === 'edit') {this.isEditMode = true;}
        if (params['action'] === 'view') {
          this.userForm.disable();
        }
      } else {
        this.isEditMode = false;
      }
    });

    // Subscribe to role changes to show the supervisor dropdown if needed
    this.userForm.get('role')?.valueChanges.subscribe(role => {
      this.selectedRole = role;
      if (role === 'AGENT' || role === 'LEAD') {
        this.fetchSupervisors(); // Fetch supervisors when Agent or Lead is selected
      } else {
        this.customerList = []; // Clear the supervisor list if not Agent or Lead
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadUserData(id: string) {
    console.log('Loading user data...');
    
    // Fetch the user data based on the ID
    this.dataService.getUserById(id).subscribe(data => {
      this.signalData = data;
      console.log('Fetched user data:', this.signalData);
      
      // Set selectedRole based on the loaded data
      this.selectedRole = this.signalData?.role;
  
      // Patch the user form with the loaded data
      this.userForm.patchValue({
        name: this.signalData?.name,
        password: this.signalData?.password,
        email: this.signalData?.email,
        role: this.signalData?.role,
      });
  
      // If role is AGENT or LEAD, patch supervisor field
      if (this.signalData?.role === 'AGENT' || this.signalData?.role === 'LEAD') {
        this.userForm.patchValue({
          supervisor: this.signalData?.supervisorId, // Assuming supervisor ID is stored in supervisorId field
        });
      } else {
        // If role is not AGENT or LEAD, clear the supervisor field
        this.userForm.patchValue({
          supervisor: null
        });
      }
    });
  }
  

  fetchSupervisors(page: number = 0, limit: number = 5) {
    const payload = { page, limit };
    this.dataService.getUser(payload).subscribe(customers => {
      this.customerList = customers.map((customer: any) => ({
        id: customer.id,
        value: customer.id,
        viewValue: customer.name
      }));
      console.log(this.customerList, 'list');
    });
  }
  
  onCustomerSubmit() {
    console.log('Form submission...');
    const submissionData: any = {
      name: this.userForm.get('name')?.value,
      password: this.userForm.get('password')?.value,
      email: this.userForm.get('email')?.value,
      role: this.userForm.get('role')?.value,
      supervisor: this.userForm.get('supervisor')?.value, // Include supervisor
    };

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    console.log('Submission data:', submissionData);
    if (this.isEditMode) {
      submissionData.id = this.customerId;
      delete submissionData.password;
      this.dataService.updateUser(submissionData).subscribe(response => {
        this.router.navigate(['/users']);
      });
    }else{
    this.dataService.addUser(submissionData).subscribe(response => {
      this.router.navigate(['/users']);
    });
  }
  }

  onCustomerCancel() {
    this.userForm.reset();
    this.router.navigate(['/users']);
  }
}
