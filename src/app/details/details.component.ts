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
  imports: [CommonModule, MatTabsModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {
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
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      ic: new FormControl('', Validators.required),
      passport: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      marital_status: new FormControl('', Validators.required),
      no_of_child: new FormControl('', Validators.required),
      mobile_no: new FormControl('', Validators.required),
      tel_code: new FormControl('', Validators.required),
      tel_no: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      car_plate: new FormControl('', Validators.required),
      address_lines: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required)
    });

    this.route.params.subscribe(params => {
      const signalData: any = this.signalService.signalData$();
      const id = params;
      console.log('id', params);
      console.log('signalData', signalData);
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
        address_lines: signalData?.customer_address[0]?.address_lines,
        country: signalData?.customer_address[0]?.country_id,
        state: signalData?.customer_address[0]?.state_id,
        city: signalData?.customer_address[0]?.city_id
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
    console.log(event);
    this.dataService.getCountry(event, null).subscribe((response: any) => {
      // Assuming response is an array of countries
      if (response && response.length > 0) {
        const country = response[0];
        this.states = country.states || [];
        console.log('States', this.states);
        this.cities = []; // Reset cities when country changes 
        if (!this.isEditMode) {
          this.form.get('state')?.reset();
          this.form.get('city')?.reset();
        } else {
          const signalData: any = this.signalService.signalData$();
          this.onStateChange(signalData.customer_address[0].state_id);
        }
      }
    });
  }

  onStateChange(stateId: string): void {
    console.log(stateId);
    const selectedState = this.states.find(state => state.id === stateId);
    console.log('selectedState', selectedState);
    console.log('this.states', this.states);
    if (selectedState) {
      this.cities = selectedState.cities || [];
      console.log('Cities', this.cities);
      if (!this.isEditMode) {
        this.form.get('city')?.reset();
      }
    }
  }

  addCustomer(): void {

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
      tel_code: this.form.get('tel_code')?.value,
      tel_no: this.form.get('tel_no')?.value,
      email: this.form.get('email')?.value,
      car_plate: this.form.get('car_plate')?.value,
      customer_address: {
        address_lines: this.form.get('address_lines')?.value,
        country_id: this.form.get('country')?.value,
        state_id: this.form.get('state')?.value,
        city_id: this.form.get('city')?.value
      }
    };
    console.log('this.isEditMode', this.isEditMode);
    if (this.isEditMode) {
      // this.dataService.updateCustomer(this.details).subscribe(response => {
      //   this.router.navigate(['/']);
      // });
      submissionData.id = this.details.id;
    } else {
      // this.dataService.addCustomer(this.details).subscribe(response => {
      //   this.router.navigate(['/']);
      // });
    }

    console.log('Form submitted');
    if (this.form.invalid) {
      // Mark all controls as touched to trigger validation messages
      this.form.markAllAsTouched();
      // Log validation errors for debugging
      Object.keys(this.form.controls).forEach(key => {
        const controlErrors = this.form.get(key)?.errors;
        if (controlErrors) {
          console.log(`Control: ${key}, Errors:`, controlErrors);
        }
      });
      console.log('Form is invalid');
      return;
    }
    console.log(submissionData);
    this.dataService.addCustomer(submissionData).subscribe(response => {
      console.log(response);
      this.router.navigate(['/']);
    });
    // console.log(this.form.value)
  }
}
