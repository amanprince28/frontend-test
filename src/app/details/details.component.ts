import { Component } from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SignalService } from '../signal.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { DataService } from '../data.service';
@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, MatTabsModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule,MatButtonModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {
  form!:FormGroup;
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  constructor(private route: ActivatedRoute, private signalService:SignalService, private dataService: DataService) {}

  ngOnInit(){
    this.form = new FormGroup({
      name: new FormControl(),
      ic: new FormControl(),
      passport: new FormControl(),
      race: new FormControl(),
      gender: new FormControl(),
      marital_status: new FormControl(),
      no_of_child: new FormControl(),
      mobile_no: new FormControl(),
      tel_code: new FormControl(),
      tel_no: new FormControl(),
      email: new FormControl(),
      car_plate: new FormControl(),
      address: new FormControl(),
      country: new FormControl(),
      state: new FormControl(),
      city: new FormControl(),
    });

    this.route.params.subscribe(params => {
      const signalData = this.signalService.signalData$();
      const id = params;
      this.form.patchValue(signalData);

      // You can fetch the row data using the id
    });

    this.fetchCountries();
  }

  fetchCountries(): void {
    this.dataService.getCountry(this.form.get('country')?.value, this.form.get('state')?.value).subscribe(data => {
      this.countries = data;
    });
  }
  
  onCountryChange(event: any){
    console.log(event); 
    this.dataService.getCountry(event, null).subscribe((response: any) => {
      // Assuming response is an array of countries
      if (response && response.length > 0) {
          const country = response[0];
          this.states = country.states || [];
          console.log('States', this.states);
          this.cities = []; // Reset cities when country changes
          this.form.get('state')?.reset();
          this.form.get('city')?.reset();
      }
  });
  }
  
  onStateChange(stateId: string): void {
    console.log(stateId);
    console.log(stateId);
    const selectedState = this.states.find(state => state.id === stateId);
    if (selectedState) {
        this.cities = selectedState.cities || [];
        console.log('Cities', this.cities);
        this.form.get('city')?.reset();
    }
  }
  
  onSubmit(){
    console.log(this.form.value)
  }
}
