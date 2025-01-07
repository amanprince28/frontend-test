import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@Component({
  selector: 'app-user-details',
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
    MatCardTitle,MatSlideToggleModule
  ],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
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
  superVisorList: any[]=[];
  userDetails: any;
  userRole: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signalService: SignalService,
    private dataService: DataService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Initialize form controls
    this.userDetails = localStorage.getItem('user-details');
    this.userDetails = JSON.parse(this.userDetails)
    this.userRole = this.userDetails?.role ?? '';
    this.userForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      role: new FormControl('', Validators.required),
      supervisor: new FormControl(''), // Supervisor dropdown control
      status: new FormControl(true) // Initialize status as true (active by default)
    });

    this.role = [
      { value: 'ADMIN', viewValue: 'ADMIN' },
      { value: 'LEAD', viewValue: 'LEAD' },
      { value: 'AGENT', viewValue: 'AGENT' },
    ];

    this.fetchSupervisors();

    // Initialize edit mode and load existing data if necessary
    this.route.params.subscribe((params) => {
      this.customerId = params['id'];
      if (this.customerId) {
        this.loadUserData(this.customerId);
        if (params['action'] === 'edit') {
          this.isEditMode = true;
        }
        if (params['action'] === 'view') {
          this.userForm.disable();
        }
      } else {
        this.isEditMode = false;
      }
    });

    // Subscribe to role changes to show the supervisor dropdown if needed
    this.userForm.get('role')?.valueChanges.subscribe((role) => {
      this.selectedRole = role;
      if (role === 'AGENT') {
        this.fetchSupervisors(); // Fetch supervisors when Agent or Lead is selected
        this.superVisorList = this.customerList.filter((el) => el.role === 'LEAD');
      }
      if(role === 'LEAD'){
        this.fetchSupervisors(); // Fetch supervisors when Agent or Lead is selected
        this.superVisorList = this.customerList.filter((el) => el.role === 'ADMIN');
      } else {
        this.customerList = []; // Clear the supervisor list if not Agent or Lead
      }
    });
  }

  loadUserData(id: string) {
    // Fetch the user data based on the ID
    this.dataService.getUserById(id).subscribe((data) => {
      this.signalData = data;
      this.selectedRole = this.signalData?.role;

      this.userForm.patchValue({
        name: this.signalData?.name,
        email: this.signalData?.email,
        password: this.signalData?.password,
        role: this.signalData?.role,
        status: this.signalData?.status // Bind the status properly
      });

      if (
        this.signalData?.role === 'AGENT' ||
        this.signalData?.role === 'LEAD'
      ) {
        this.userForm.patchValue({
          supervisor: this.signalData?.supervisor, // Assuming supervisor ID is stored in supervisorId field
        });
      } else {
        // If role is not AGENT or LEAD, clear the supervisor field
        this.userForm.patchValue({
          supervisor: null,
        });
      }
    });
  }

  fetchSupervisors(page: number = 0, limit: number = 5) {
    const payload = { page, limit };
    this.dataService.getUser(payload).subscribe((customers) => {
      // Filter and map only customers whose id does not match the supervisorId
      this.customerList = customers
        .map((customer: any) => ({
          id: customer.id,
          value: customer.id,
          viewValue: customer.name,
          role:customer.role
        }));

      console.log(this.customerList, 'filtered customer list');
    });
  }

  onCustomerSubmit() {
    // Prepare submission data
    const submissionData: any = {
      name: this.userForm.get('name')?.value,
      email: this.userForm.get('email')?.value,
      password: this.userForm.get('password')?.value,
      role: this.userForm.get('role')?.value,
      status: this.userForm.get('status')?.value, // Ensure status is part of submission
    };

    // Add supervisor only if role is AGENT or LEAD
    if (
      this.userForm.get('role')?.value === 'AGENT' ||
      this.userForm.get('role')?.value === 'LEAD'
    ) {
      submissionData.supervisor = this.userForm.get('supervisor')?.value;
    }

    // Check if form is invalid and mark all fields as touched
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    // Submit the data
    if (this.isEditMode) {
      // If editing an existing user, exclude password and add ID
      submissionData.id = this.customerId;
      delete submissionData.password;
      this.dataService.updateUser(submissionData).subscribe((response) => {
        this.router.navigate(['/users']);
      });
    } else {
      // If adding a new user, submit data
      this.dataService.addUser(submissionData).subscribe((response) => {
        this.router.navigate(['/users']);
      });
    }
  }

  onCustomerCancel() {
    this.userForm.reset();
    this.router.navigate(['/users']);
  }
}
