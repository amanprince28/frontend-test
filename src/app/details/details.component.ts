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
    this.form = new FormGroup({
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
      address_lines: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),

      // Customer Relationship
      relationship_name: new FormControl('', Validators.required),
      relationship_ic: new FormControl('', Validators.required),
      relationship_mobile_no: new FormControl('', Validators.required),
      relationship_passport: new FormControl('', Validators.required),
      relationship_gender: new FormControl('male', Validators.required), // Default value
      relationship: new FormControl('', Validators.required),
      perm_address_line1: new FormControl('', Validators.required),
      perm_address_line2: new FormControl('', Validators.required),
      perm_country: new FormControl('', Validators.required),
      perm_state: new FormControl('', Validators.required),
      perm_city: new FormControl('', Validators.required),
      same_as_permanent: new FormControl(false),
      corr_address_line1: new FormControl('', Validators.required),
      corr_address_line2: new FormControl('', Validators.required),
      corr_country: new FormControl('', Validators.required),
      corr_state: new FormControl('', Validators.required),
      corr_city: new FormControl('', Validators.required),

      // Employment Details
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
    this.form.get('same_as_permanent')?.valueChanges.subscribe(value => {
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
      this.form.patchValue({
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
        permanent_city: signalData?.customer_address[0]?.city_id
      });
      this.cdRef.detectChanges();
    }
  }

  fetchCountries(): void {
    this.dataService.getCountry(this.form.get('country')?.value, this.form.get('state')?.value).subscribe(data => {
      this.countries = data;
    });
  }

  onCountryChange(event: any) {
    this.dataService.getCountry(event, null).subscribe((response: any) => {
      if (response && response.length > 0) {
        const country = response[0];
        this.states = country.states || [];
        this.cities = [];
        if (!this.isEditMode) {
          this.form.get('permanent_state')?.reset();
          this.form.get('permanent_city')?.reset();
        } else {
          const signalData: any = this.signalService.signalData$();
          this.onStateChange(signalData.customer_address[0].state_id);
        }
      }
    });
  }

  onStateChange(stateId: string): void {
    const selectedState = this.states.find(state => state.id === stateId);
    if (selectedState) {
      this.cities = selectedState.cities || [];
      if (!this.isEditMode) {
        this.form.get('permanent_city')?.reset();
      }
    }
  }

  // Method to copy permanent address to correspondence address
  copyPermanentToCorrespondence(): void {
    this.form.patchValue({
      correspondence_address_lines: this.form.get('permanent_address_lines')?.value,
      correspondence_country: this.form.get('permanent_country')?.value,
      correspondence_state: this.form.get('permanent_state')?.value,
      correspondence_city: this.form.get('permanent_city')?.value
    });
  }

  // Method to clear correspondence address fields
  clearCorrespondenceAddress(): void {
    this.form.patchValue({
      correspondence_address_lines: '',
      correspondence_country: '',
      correspondence_state: '',
      correspondence_city: ''
    });
  }

  onSubmit() {
    const submissionData: any = {
      name: this.form.get('name')?.value,
      ic: this.form.get('ic')?.value,
      passport: this.form.get('passport')?.value,
      gender: this.form.get('gender')?.value,
      marital_status: this.form.get('marital_status')?.value,
      no_of_child: this.form.get('no_of_child')?.value,
      mobile_no: this.form.get('mobile_no')?.value,
      address_lines: this.form.get('address_lines')?.value,
      country_id: this.form.get('country')?.value,
      state_id: this.form.get('state')?.value,
      city_id: this.form.get('city')?.value,
      tel_code: this.form.get('tel_code')?.value,
      tel_no: this.form.get('tel_no')?.value,
      email: this.form.get('email')?.value,
      car_plate: this.form.get('car_plate')?.value,
      customer_address: {
        permanent: {
          address_lines: this.form.get('permanent_address_lines')?.value,
          country_id: this.form.get('permanent_country')?.value,
          state_id: this.form.get('permanent_state')?.value,
          city_id: this.form.get('permanent_city')?.value
        },
        correspondence: {
          address_lines: this.form.get('correspondence_address_lines')?.value,
          country_id: this.form.get('correspondence_country')?.value,
          state_id: this.form.get('correspondence_state')?.value,
          city_id: this.form.get('correspondence_city')?.value
        }
      }
    };

    if (this.isEditMode) {
      submissionData.id = this.details.id;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dataService.addCustomer(submissionData).subscribe(response => {
      this.router.navigate(['/']);
    });
  }
}
