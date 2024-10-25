import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SignalService } from '../signal.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { DataService } from '../data.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, MatTabsModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatSelectModule, MatOptionModule,MatPaginatorModule,MatTableModule, MatCard, MatCardContent, MatCardTitle],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent {
  isEditMode: boolean = false;
  details: any = {};
  form!: FormGroup;
  customerForm!: FormGroup;
  customerAddressForm!: FormGroup;
  customerRelationshipForm!: FormGroup;
  customerEmployemntForm!: FormGroup
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  signalData: any;
  customerFullData: any;
  customerId!: string;
  displayedColumnsForRelationshipForm: string[] = ['name', 'ic', 'passport','address_lines'];
  
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
    this.customerForm = new FormGroup({
      // Customer Information
      name: new FormControl('', Validators.required),
      ic: new FormControl('', Validators.required),
      passport: new FormControl('', Validators.required),
      race: new FormControl('', Validators.required),
      gender: new FormControl('male', Validators.required), // Default value
      marital_status: new FormControl('single', Validators.required), // Default value
      no_of_child: new FormControl(0, Validators.required), // Default value
      mobile_no: new FormControl('', Validators.required),
      tel_code: new FormControl('+1', Validators.required), // Default value
      tel_no: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      car_plate: new FormControl('', Validators.required),
      relationship: new FormControl('', Validators.required),
     
    })
    // Customer Address
    this.customerAddressForm = new FormGroup({
      cus_same_as_permanent: new FormControl(false),
      perm_address_line: new FormControl('', Validators.required),
      perm_country: new FormControl('', Validators.required),
      perm_state: new FormControl('', Validators.required),
      perm_city: new FormControl('', Validators.required),
      perm_postal_code: new FormControl('', Validators.required),
      corr_postal_code: new FormControl('', Validators.required),
      corr_address_line: new FormControl('', Validators.required),
      corr_country: new FormControl('', Validators.required),
      corr_state: new FormControl('', Validators.required),
      corr_city: new FormControl('', Validators.required),
      cus_mobile :new FormControl('', Validators.required),
      cus_tel_no:new FormControl('', Validators.required),
      staying_since:new FormControl('', Validators.required),
    });


    // Customer Relationship
    this.customerRelationshipForm = new FormGroup({
      
      relationship_name: new FormControl('', Validators.required),
      relationship_ic: new FormControl('', Validators.required),
      relationship_mobile_no: new FormControl('', Validators.required),
      relationship_passport: new FormControl('', Validators.required),
      relationship_gender: new FormControl('male', Validators.required), // Default value
      relationship: new FormControl('', Validators.required),
      same_as_permanent: new FormControl(false),
      perm_address_line: new FormControl('', Validators.required),
      perm_postal_code: new FormControl('', Validators.required),
      perm_country: new FormControl('', Validators.required),
      perm_state: new FormControl('', Validators.required),
      perm_city: new FormControl('', Validators.required),
      corr_address_line: new FormControl(''),
      corr_country: new FormControl(''),
      corr_state: new FormControl(''),
      corr_city: new FormControl(''),
      corr_rel_postal_code : new FormControl('')
    });
    // Employment Details

    this.customerEmployemntForm = new FormGroup({
      annual_income: new FormControl(0, Validators.required), // Default value
      business_type: new FormControl('', Validators.required),
      department: new FormControl('', Validators.required),
      employee_no: new FormControl('', Validators.required),
      income_date: new FormControl('', Validators.required),
      income_type: new FormControl('', Validators.required),
      employment_name: new FormControl('', Validators.required),
      occupation_category: new FormControl('', Validators.required),

      position: new FormControl('', Validators.required),
      employment_remarks: new FormControl('', Validators.required),
      telecode: new FormControl('', Validators.required),
      telephone_no: new FormControl('', Validators.required),
      employee_type: new FormControl('full_time'), // Default value
    });

    // Watch for changes in the 'same_as_permanent' checkbox
    this.customerAddressForm.get('cus_same_as_permanent')?.valueChanges.subscribe(value => {
      if (value) {
        this.copyPermanentToCorrespondence('customerAddressForm');
      } else {
        this.clearCorrespondenceAddress('customerAddressForm');
      }
    });

    this.customerRelationshipForm.get('same_as_permanent')?.valueChanges.subscribe(value => {
      if (value) {
        this.copyPermanentToCorrespondence('customerRelationshipForm');
      } else {
        this.clearCorrespondenceAddress('customerRelationshipForm');
      }
    });

    // Initialize edit mode and load existing data if necessary
    this.route.params.subscribe(params => {
      this.customerId = params['id'];
      if (this.customerId) {
        this.loadCustomerData(this.customerId);
        this.loadCustomerRaltionshipData(this.customerId);
        this.loadEmployementData(this.customerId);
        this.isEditMode = true;
      } else {
        this.isEditMode = false;
      }
    });

    this.fetchCountries();
  }

  ngAfterViewInit(): void { 
    this.dataSource.paginator = this.paginator;
  }
  onRowClick(row:any){
    this.customerRelationshipId = row.id;
    this.customerRelationshipForm.patchValue({
      relationship_name: row?.name || '',
      relationship_ic: row?.ic || '',
      relationship_mobile_no: row?.mobile_no || '',
      relationship_passport: row?.passport || '',
      relationship_gender: row?.gender || '',  
      relationship: row?.relationship || '',  
      perm_postal_code: row?.address[0]?.postal_code || '',
      corr_rel_postal_code: row?.address[0]?.postal_code || '',
      perm_address_line: row?.address[0]?.address_lines || '',
      perm_city: row?.address[0]?.city_id || '',
      perm_state: row?.address[0]?.state_id || '',
      perm_country: row?.address[0]?.country_id || ''
    });
  }

  loadCustomerData(id: string) {
    console.log('--- loadCustomerData id --- ', id)
    this.dataService.getCustomerById(this.customerId).subscribe(data => {
      this.signalData = data;
      this.customerFullData = data;
      console.log('--- loadCustomerData --- ', this.signalData)
      if (this.signalData && this.signalData.customer_address && this.signalData.customer_address.length > 0) {
        const customerPermanentAddress = this.signalData.customer_address.find((address: any) => address.is_permanent);
        console.log('--- customerPermanentAddress --- ', customerPermanentAddress)
        this.customerForm.patchValue({
          name: data.name,
          ic: data.ic,
          passport: data.passport,
          gender: data.gender,
          marital_status: data.marital_status,
          no_of_child: data.no_of_child,
          mobile_no: data.mobile_no,
          tel_code: data.tel_code,
          tel_no: data.tel_no,
          email: data.email,
          car_plate: data.car_plate,
        })
        this.customerAddressForm.patchValue({
          same_as_permanent: customerPermanentAddress?.is_permanent,
          perm_postal_code: customerPermanentAddress?.postal_code,
          perm_address_line: customerPermanentAddress?.address_lines,
          perm_country: customerPermanentAddress?.country_id,
          perm_state: customerPermanentAddress?.state_id,
          perm_city: customerPermanentAddress?.city_id,
        });

        this.onCountryChange(customerPermanentAddress.country_id || this.signalData.customer_address[0].country_id);
      } else {
        this.isEditMode = false;
      }
    });
  }

  loadCustomerRaltionshipData(id:string) {
    this.dataService.getCustomerById(this.customerId).subscribe(data => {
      const signalData = data;
      this.dataSource.data = signalData.customer_relation;
      // console.log(this.dataSource.data,'ss');
      if (this.signalData && this.signalData.customer_address && this.signalData.customer_address.length > 0) {
        const customerPermanentAddress = this.signalData.customer_address.find((address: any) => address.is_permanent);

        this.onCountryChange(customerPermanentAddress.country_id || this.signalData.customer_address[0].country_id);
      } else {
        this.isEditMode = false;
      }
    });
  }

  loadEmployementData(id:string){
    this.dataService.getCustomerById(this.customerId).subscribe(data => {
      const signalData = data;
      if (this.signalData && this.signalData.customer_address && this.signalData.customer_address.length > 0) {
        const customerPermanentAddress = this.signalData.customer_address.find((address: any) => address.is_permanent);

        this.customerEmployemntForm.patchValue({
          annual_income: signalData?.company[0]?.annual_income,
          department: signalData?.company[0]?.department,
          employee_no: signalData?.company[0]?.employee_no,
          employee_type: signalData?.company[0]?.employee_type,
          income_date: signalData?.company[0]?.income_date,
          income_type: signalData?.company[0]?.income_type,
          employment_name: signalData?.company[0]?.name,
          occupation_category: signalData?.company[0]?.occupation_category,
          position: signalData?.company[0]?.position,
          remark: signalData?.company[0]?.remark,
          comp_tel_code: signalData?.company[0]?.tel_code,
          comp_tel_no: signalData?.company[0]?.tel_no,
        });

        this.onCountryChange(customerPermanentAddress.country_id || this.signalData.customer_address[0].country_id);
      } else {
        this.isEditMode = false;
      }
    });
  }

  fetchCountries(): void {
    this.dataService.getCountry(this.customerForm.get('perm_country')?.value, this.customerForm.get('perm_state')?.value).subscribe(data => {
      this.countries = data;
    });
    this.dataService.getCountry(this.customerRelationshipForm.get('perm_country')?.value, this.customerRelationshipForm.get('perm_state')?.value).subscribe(data => {
      this.countries = data;
    });
  }

  onCountryChange(event: any) {
    // console.log('onCountryChange ', event)
    this.dataService.getCountry(event, null).subscribe((response: any) => {
      if (response && response.length > 0) {
        const country = response[0];
        this.states = country.states || [];
        this.cities = [];
        if (!this.isEditMode) {
          this.customerForm.get('permanent_state')?.reset();
          this.customerForm.get('permanent_city')?.reset();
          this.customerRelationshipForm.get('permanent_state')?.reset();
          this.customerRelationshipForm.get('permanent_city')?.reset();
        } else {
          const customerPermanentAddress = this.signalData.customer_address.find((address: any) => address.is_permanent);
          if (customerPermanentAddress) {
            this.onStateChange(customerPermanentAddress.state_id);
          } else {
            this.onStateChange(this.signalData.customer_address[0].state_id);
          }
        }
      }
    });
  }

  onStateChange(stateId: string): void {
    // console.log('onStateChange ', stateId)
    const selectedState = this.states.find(state => state.id === stateId);
    // console.log('selectedState', selectedState)
    if (selectedState) {
      this.cities = selectedState.cities || [];
      if (!this.isEditMode) {
        this.customerForm.get('permanent_city')?.reset();
      }
    }
  }

  // Method to copy permanent address to correspondence address
  copyPermanentToCorrespondence(formName:any): void {
    if(formName ==='customerAddressForm'){
    this.customerAddressForm.patchValue({
      corr_address_line: this.customerAddressForm.get('perm_address_line')?.value,
      corr_country: this.customerAddressForm.get('perm_country')?.value,
      corr_state: this.customerAddressForm.get('perm_state')?.value,
      corr_city: this.customerAddressForm.get('perm_city')?.value,
      corr_postal_code:this.customerAddressForm.get('perm_postal_code')?.value,
    })}
    if(formName==='customerRelationshipForm'){
      this.customerRelationshipForm.patchValue({
        corr_address_line: this.customerRelationshipForm.get('perm_address_line')?.value,
        corr_country: this.customerRelationshipForm.get('perm_country')?.value,
        corr_state: this.customerRelationshipForm.get('perm_state')?.value,
        corr_city: this.customerRelationshipForm.get('perm_city')?.value,
        corr_rel_postal_code: this.customerRelationshipForm.get('perm_postal_code')?.value
      })}
  }

  // Method to clear correspondence address fields
  clearCorrespondenceAddress(formName:any): void {
    if(formName ==='customerAddressForm'){
    this.customerAddressForm.patchValue({
      corr_address_line: '',
      corr_country: '',
      corr_state: '',
      corr_city: '',
      corr_postal_code:''
    });
  }
  if(formName ==='customerRelationshipForm'){
    this.customerRelationshipForm.patchValue({
      corr_address_line: '',
      corr_country: '',
      corr_state: '',
      corr_city: ''
    });
  }
  }

  onCustomerSubmit() {
    console.log('onCustomerSubmit')
    const submissionData: any = {
      name: this.customerForm.get('name')?.value,
      ic: this.customerForm.get('ic')?.value,
      passport: this.customerForm.get('passport')?.value,
      gender: this.customerForm.get('gender')?.value,
      marital_status: this.customerForm.get('marital_status')?.value,
      no_of_child: this.customerForm.get('no_of_child')?.value,
      mobile_no: this.customerForm.get('mobile_no')?.value,
      tel_no: this.customerForm.get('tel_no')?.value,
      email: this.customerForm.get('email')?.value,
      car_plate: this.customerForm.get('car_plate')?.value,
      customer_address: [{
        permanent: {
          address_lines: this.customerAddressForm.get('perm_address_line')?.value,
          country_id: this.customerAddressForm.get('perm_country')?.value,
          state_id: this.customerAddressForm.get('perm_state')?.value,
          city_id: this.customerAddressForm.get('perm_city')?.value,
          cus_mobile:this.customerAddressForm.get('cus_mobile')?.value,
          cus_telephone:this.customerAddressForm.get('cus_tel_no')?.value
        },
        correspondence: {
          address_lines: this.customerAddressForm.get('corr_address_line')?.value,
          country_id: this.customerAddressForm.get('corr_country')?.value,
          state_id: this.customerAddressForm.get('corr_state')?.value,
          city_id: this.customerAddressForm.get('corr_city')?.value
        }
      }]
    };

    console.log(submissionData,'submisson data');

    if (this.isEditMode) {
      submissionData.id = this.customerId;
    }

    // if (this.customerForm.invalid) {
    //   this.customerForm.markAllAsTouched();
    //   return;
    // }

    console.log(submissionData)
    this.dataService.addCustomer(submissionData).subscribe(response => {
      // this.router.navigate(['/']);
    });
  }

  onEmploymentSubmit() {
    const submissionData: any = {
      annual_income: this.customerEmployemntForm.get('annual_income')?.value,
      business_type: this.customerEmployemntForm.get('business_type')?.value,
      department: this.customerEmployemntForm.get('department')?.value,
      employee_no: this.customerEmployemntForm.get('employee_no')?.value,
      income_date: this.customerEmployemntForm.get('income_date')?.value,
      income_type: this.customerEmployemntForm.get('income_type')?.value,
      employment_name: this.customerEmployemntForm.get('employment_name')?.value,
      occupation_category: this.customerEmployemntForm.get('occupation_category')?.value,
      position: this.customerEmployemntForm.get('position')?.value,
      employment_remarks: this.customerEmployemntForm.get('employment_remarks')?.value,
      telecode: this.customerEmployemntForm.get('telecode')?.value,
      employee_type: this.customerEmployemntForm.get('employee_type')?.value,
      telephone_no: this.customerEmployemntForm.get('telephone_no')?.value,
    };

    if (this.isEditMode) {
      submissionData.id = this.customerId;
    }

    // if (this.customerEmployemntForm.invalid) {
    //   this.customerEmployemntForm.markAllAsTouched();
    //   return;
    // }

    console.log(submissionData)
    this.dataService.addCustomer(submissionData).subscribe(response => {
      //this.router.navigate(['/']);
    });
  }

  onCustomerRelationshipSubmit() {
    console.log('onCustomerRelationshipSubmit', this.customerRelationshipId)
    const submissionData: any = {
      name: this.customerRelationshipForm.get('relationship_name')?.value,
      ic: this.customerRelationshipForm.get('relationship_ic')?.value,
      passport: this.customerRelationshipForm.get('relationship_passport')?.value,
      gender: this.customerRelationshipForm.get('relationship_gender')?.value,
      mobile_no: this.customerRelationshipForm.get('perm_country')?.value,
      relationship: this.customerRelationshipForm.get('relationship')?.value,
      address: [{
        permanent:{
        address_lines: this.customerRelationshipForm.get('perm_address_line')?.value,
        country_id: this.customerRelationshipForm.get('perm_country')?.value,
        state_id: this.customerRelationshipForm.get('perm_state')?.value,
        city_id: this.customerRelationshipForm.get('perm_city')?.value
      },
      correspondence: {
        address_lines: this.customerRelationshipForm.get('corr_address_line')?.value,
        country_id: this.customerRelationshipForm.get('corr_country')?.value,
        state_id: this.customerRelationshipForm.get('corr_state')?.value,
        city_id: this.customerRelationshipForm.get('corr_city')?.value
      }
    },
    ]
    };

    if (this.isEditMode) {
      submissionData.id = this.customerId;
    }

    // if (this.customerRelationshipForm.invalid) {
    //   this.customerRelationshipForm.markAllAsTouched();
    //   return;
    // }

    console.log(submissionData)
    this.dataService.addCustomer(submissionData).subscribe(response => {
      //this.router.navigate(['/']);
    });
  }

}
