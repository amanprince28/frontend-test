import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, MatTabsModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatSelectModule, MatOptionModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  isEditMode: boolean = false;
  details: any = {};
  form!: FormGroup;
  customerForm!:FormGroup;
  customerRelationshipForm!:FormGroup;
  customerEmployemntForm!:FormGroup
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];

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
      gender: new FormControl('male', Validators.required), // Default value
      marital_status: new FormControl('single', Validators.required), // Default value
      no_of_child: new FormControl(0, Validators.required), // Default value
      mobile_no: new FormControl('', Validators.required),
      tel_code: new FormControl('+1', Validators.required), // Default value
      tel_no: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      car_plate: new FormControl('', Validators.required),
      relationship:new FormControl('', Validators.required),
      same_as_permanent: new FormControl(false),
      perm_address_line1: new FormControl('', Validators.required),
      perm_country: new FormControl('', Validators.required),
      perm_state: new FormControl('', Validators.required),
      perm_city: new FormControl('', Validators.required),
      perm_postal_code: new FormControl('', Validators.required),
      corr_address_line1: new FormControl('', Validators.required),
      corr_country: new FormControl('', Validators.required),
      corr_state: new FormControl('', Validators.required),
      corr_city: new FormControl('', Validators.required),
    })

      // Customer Relationship
      this.customerRelationshipForm=new FormGroup({
      relationship_name: new FormControl('', Validators.required),
      relationship_ic: new FormControl('', Validators.required),
      relationship_mobile_no: new FormControl('', Validators.required),
      relationship_passport: new FormControl('', Validators.required),
      relationship_gender: new FormControl('male', Validators.required), // Default value
      relationship: new FormControl('', Validators.required),
      perm_address_line1: new FormControl('', Validators.required),
      // perm_address_line2: new FormControl('', Validators.required),
      perm_postal_code: new FormControl('', Validators.required),
      perm_country: new FormControl('', Validators.required),
      perm_state: new FormControl('', Validators.required),
      perm_city: new FormControl('', Validators.required),
      same_as_permanent: new FormControl(false),
      corr_address_line1: new FormControl('', Validators.required),
      // corr_address_line2: new FormControl('', Validators.required),
      corr_country: new FormControl('', Validators.required),
      corr_state: new FormControl('', Validators.required),
      corr_city: new FormControl('', Validators.required),
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
    this.customerForm.get('same_as_permanent')?.valueChanges.subscribe(value => {
      if (value) {
        this.copyPermanentToCorrespondence();
      } else {
        this.clearCorrespondenceAddress();
      }
    });

    this.customerRelationshipForm.get('same_as_permanent')?.valueChanges.subscribe(value => {
      if (value) {
        this.copyPermanentToCorrespondence();
      } else {
        this.clearCorrespondenceAddress();
      }
    });

    // Initialize edit mode and load existing data if necessary
    this.route.params.subscribe(params => {
      const signalData: any = this.signalService.signalData$();
      const id = params;
      if (params && Object.keys(params).length > 0) {
        this.isEditMode = true;
        if (signalData && signalData.customer_address && signalData.customer_address.length > 0) {
          this.onCountryChange(signalData.customer_address[0].country_id);
        }
      } else {
        this.isEditMode = false;
      }
    });

    this.fetchCountries();
  }

  ngAfterViewInit() {
    const signalData: any = this.signalService.signalData$();
    if (this.isEditMode && signalData && signalData.customer_address && signalData.customer_address.length > 0) {
      this.customerForm.patchValue({
        name: signalData?.name,
        ic: signalData?.ic,
        passport: signalData?.passport,
        gender: signalData?.gender,
        marital_status: signalData?.marital_status,
        no_of_child: signalData?.no_of_child,
        mobile_no: signalData?.mobile_no,
        tel_code: signalData?.tel_code,
        tel_no: signalData?.tel_no,
        email: signalData?.email,
        car_plate: signalData?.car_plate,
        permanent_address_lines: signalData?.customer_address[0]?.address_lines,
        permanent_country: signalData?.customer_address[0]?.country_id,
        permanent_state: signalData?.customer_address[0]?.state_id,
        permanent_city: signalData?.customer_address[0]?.city_id,
      })
      this.customerRelationshipForm.patchValue({
        relationship_name:signalData?.customer_relation[0]?.name,
        relationship_ic:signalData?.customer_relation[0]?.ic,
        relationship_mobile_no:signalData?.customer_relation[0]?.gender,
        relationship_passport:signalData?.customer_relation[0]?.passport,
        relationship_gender:signalData?.customer_relation[0]?.relationship,
        relationship:signalData?.customer_relation[0]?.mobile_no,

        cus_rel_postal_code:signalData?.customer_relation[0]?.address[0]?.postal_code,
        perm_address_line1:signalData?.customer_relation[0]?.address[0]?.address_lines,
        perm_city:signalData?.customer_relation[0]?.address[0]?.city_id,
        perm_state:signalData?.customer_relation[0]?.address[0]?.state_id,
        perm_country:signalData?.customer_relation[0]?.address[0]?.country_id,
      })
  this.customerEmployemntForm.patchValue({
        annual_income:signalData?.company[0]?.annual_income,
        department:signalData?.company[0]?.department,
        employee_no:signalData?.company[0]?.employee_no,
        employee_type:signalData?.company[0]?.employee_type,
        income_date:signalData?.company[0]?.income_date,
        income_type:signalData?.company[0]?.income_type,
        employment_name:signalData?.company[0]?.name,
        occupation_category:signalData?.company[0]?.occupation_category,
        position:signalData?.company[0]?.position,
        remark:signalData?.company[0]?.remark,
        comp_tel_code:signalData?.company[0]?.tel_code,
        comp_tel_no:signalData?.company[0]?.tel_no,
      });
      this.cdRef.detectChanges();
    }
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
    console.log('onCountryChange ', event)
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
          const signalData: any = this.signalService.signalData$();
          this.onStateChange(signalData.customer_address[0].state_id);
        }
      }
    });
  }

  onStateChange(stateId: string): void {
    console.log('onStateChange ', stateId)
    const selectedState = this.states.find(state => state.id === stateId);
    console.log('selectedState', selectedState)
    if (selectedState) {
      this.cities = selectedState.cities || [];
      if (!this.isEditMode) {
        this.customerForm.get('permanent_city')?.reset();
      }
    }
  }

  // Method to copy permanent address to correspondence address
  copyPermanentToCorrespondence(): void {
    this.customerForm.patchValue({
      correspondence_address_lines: this.customerForm.get('permanent_address_lines')?.value,
      correspondence_country: this.customerForm.get('permanent_country')?.value,
      correspondence_state: this.customerForm.get('permanent_state')?.value,
      correspondence_city: this.customerForm.get('permanent_city')?.value
    });
  }

  // Method to clear correspondence address fields
  clearCorrespondenceAddress(): void {
    this.customerForm.patchValue({
      correspondence_address_lines: '',
      correspondence_country: '',
      correspondence_state: '',
      correspondence_city: ''
    });
  }

  onCustomerSubmit() {
    const submissionData: any = {
      name: this.customerForm.get('name')?.value,
      ic: this.customerForm.get('ic')?.value,
      passport: this.customerForm.get('passport')?.value,
      gender: this.customerForm.get('gender')?.value,
      marital_status: this.customerForm.get('marital_status')?.value,
      no_of_child: this.customerForm.get('no_of_child')?.value,
      mobile_no: this.customerEmployemntForm.get('mobile_no')?.value,
      address_lines: this.customerForm.get('perm_address_lines1')?.value,
      country_id: this.customerForm.get('perm_country')?.value,
      state_id: this.customerForm.get('perm_state')?.value,
      city_id: this.customerForm.get('perm_city')?.value,
      tel_code: this.customerForm.get('tel_code')?.value,
      tel_no: this.customerForm.get('tel_no')?.value,
      email: this.customerForm.get('email')?.value,
    //  car_plate: this.form.get('car_plate')?.value,
      customer_address: [{
        permanent: {
          address_lines: this.customerForm.get('perm_address_lines1')?.value,
          country_id: this.customerForm.get('perm_country')?.value,
          state_id: this.customerForm.get('perm_state')?.value,
          city_id: this.customerForm.get('perma_city')?.value
        },
        correspondence: {
          address_lines: this.customerForm.get('corr_address_lines1')?.value,
          country_id: this.customerForm.get('corr_country')?.value,
          state_id: this.customerForm.get('corr_state')?.value,
          city_id: this.customerForm.get('corr_city')?.value
        }
      }]
    };

    if (this.isEditMode) {
      submissionData.id = this.details.id;
    }

    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    console.log(submissionData)
    // this.dataService.addCustomer(submissionData).subscribe(response => {
    //   this.router.navigate(['/']);
    // });
  }

  onEmploymentSubmit(){
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
      submissionData.id = this.details.id;
    }

    if (this.customerEmployemntForm.invalid) {
      this.customerEmployemntForm.markAllAsTouched();
      return;
    }

    console.log(submissionData)
    // this.dataService.addCustomer(submissionData).subscribe(response => {
    //   this.router.navigate(['/']);
    // });
  }

  onCustomerRelationshipSubmit(){
      const submissionData: any = {
      name: this.customerRelationshipForm.get('relationship_name')?.value,
      ic: this.customerRelationshipForm.get('relationship_ic')?.value,
      passport: this.customerRelationshipForm.get('relationship_passport')?.value,
      gender: this.customerRelationshipForm.get('relationship_gender')?.value,
      mobile_no: this.customerRelationshipForm.get('perm_country')?.value,
      relationship: this.customerRelationshipForm.get('relationship')?.value,
      address: [{
          address_lines: this.customerRelationshipForm.get('perm_address_lines1')?.value,
          country_id: this.customerRelationshipForm.get('perm_country')?.value,
          state_id: this.customerRelationshipForm.get('perm_state')?.value,
          city_id: this.customerRelationshipForm.get('perma_city')?.value
      }]
    };

    if (this.isEditMode) {
      submissionData.id = this.details.id;
    }

    if (this.customerRelationshipForm.invalid) {
      this.customerRelationshipForm.markAllAsTouched();
      return;
    }

    console.log(submissionData)
    // this.dataService.addCustomer(submissionData).subscribe(response => {
    //   this.router.navigate(['/']);
    // });
  }
}
