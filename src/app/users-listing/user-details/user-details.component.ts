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
  imports: [CommonModule, MatTabsModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatSelectModule, MatOptionModule,MatPaginatorModule,MatTableModule, MatCard, MatCardContent, MatCardTitle],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailsComponent {
  isEditMode: boolean = false;
  details: any = {};
  form!: FormGroup;
  userForm!: FormGroup;
  customerRelationshipForm!: FormGroup;
  customerEmployemntForm!: FormGroup
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  signalData: any;
  customerId!: string;
  role:any[]=[];
  // displayedColumnsForRelationshipForm: string[] = ['name', 'ic', 'passport','address_lines'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);
  dataSourceEmployment = new MatTableDataSource<any>([]);
  customerRelationshipId: any;

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
    })
    this.role = [
      { value: 'ADMIN', viewValue: 'ADMIN' },
      { value: 'LEAD', viewValue: 'LEAD' },
      { value: 'AGENT', viewValue: 'AGENT' }
    ];

    // Customer Relationship

    // Initialize edit mode and load existing data if necessary
    this.route.params.subscribe(params => {
      this.customerId = params['id'];
      if (this.customerId) {
        this.loadUserData(this.customerId);
        if(params['action']==='edit')
        this.isEditMode = true;
        if(params['action']==='view'){
          this.userForm.disable();
        }
      } else {
        this.isEditMode = false;
      }
    });

  }

  ngAfterViewInit(): void { 
    this.dataSource.paginator = this.paginator;
  }

  loadUserData(id: string) {
    console.log('eit')
    this.dataService.getUserById(this.customerId).subscribe(data => {
      this.signalData = data;
      console.log('eit',)
      // if (this.signalData && this.signalData.customer_address && this.signalData.customer_address.length > 0) {
      //   const customerPermanentAddress = this.signalData.customer_address.find((address: any) => address.is_permanent);

        this.userForm.patchValue({
          name: this.signalData?.name,
          password: this.signalData?.password,
          email: this.signalData?.email,
          role: this.signalData?.role,
        })

       
      // } else {
      //   this.isEditMode = false;
      // }
    });
  }

  onCustomerSubmit() {
    console.log('onCustomerSubmit')
    const submissionData: any = {
      //name: this.userForm.get('name')?.value,
      password: this.userForm.get('password')?.value,
      email: this.userForm.get('email')?.value,
      username:this.userForm.get('email')?.value,
      role: this.userForm.get('role')?.value,
    };

    if (this.isEditMode) {
      submissionData.id = this.customerId;
    }

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    console.log(submissionData)
    this.dataService.addUser(submissionData).subscribe(response => {
      this.router.navigate(['/users']);
    });
  }
  onCustomerCancel(){
    this.userForm.reset();
    this.router.navigate(['/users']);
  }
}
