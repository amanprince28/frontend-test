import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AbstractControl, FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, MatTabsModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatSelectModule, MatOptionModule,MatPaginatorModule,MatTableModule, MatCard, MatCardContent, MatCardTitle,MatSnackBarModule],
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
  bankingForm!: FormGroup;
  bankRecords: FormArray;
  documentsForm!:FormGroup;
  uploadedFiles:any[] = [];
  displayedColumns: string[] = ['fileName', 'fileDescription','fileSize','fileType','actions'];
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  signalData: any;
  customerFullData: any;
  customerId!: string;
  displayedColumnsForRelationshipForm: string[] = ['name', 'ic', 'passport','address_lines','actions'];
  displayedColumnsBank: string[] = ['bankName', 'accountNo', 'bankHolder', 'bankCard', 'pinNo', 'actions'];

  race:any[]=[];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource=new MatTableDataSource<any>([]);;
  bankDataSource: any[] = [];

  dataSourceEmployment = new MatTableDataSource<any>([]);
  customerRelationshipId: any;
  selectedFile: any;
  uploadedDocuments: any[]=[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signalService: SignalService,
    private dataService: DataService,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { 
    this.bankingForm = new FormGroup({
      bankName: new FormControl('', ),
      accountNo: new FormControl('', ),
      bankHolder: new FormControl('',),
      bankCard: new FormControl('', ),
      pinNo: new FormControl('',),
      remark: new FormControl('')
    });

    this.bankRecords = new FormArray<FormGroup>([]);
  }

  ngOnInit() {
    // Initialize form controls
    
    this.race = [
      'Chinese',
      'Malay',
      'Indian'
    ];
    this.customerForm = new FormGroup({
      // Customer Information
      name: new FormControl('', Validators.required),
      ic: new FormControl(''),
      passport: new FormControl(''),
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
     
    }, { validators: this.eitherFieldRequiredValidator } )
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
      // cus_mobile :new FormControl('', Validators.required),
      // cus_tel_no:new FormControl('', Validators.required),
      staying_since:new FormControl('', Validators.required),
    });


    // Customer Relationship
    this.customerRelationshipForm = new FormGroup({
      
      relationship_name: new FormControl(''),
      relationship_ic: new FormControl('',),
      relationship_mobile_no: new FormControl(''),
      relationship_passport: new FormControl(''),
      relationship_gender: new FormControl('',), // Default value
      relationship: new FormControl('',),
      same_as_permanent: new FormControl(),
      perm_address_line: new FormControl('', ),
      perm_postal_code: new FormControl('',),
      perm_country: new FormControl('',),
      perm_state: new FormControl('',),
      perm_city: new FormControl('', ),
      corr_address_line: new FormControl(''),
      corr_country: new FormControl(''),
      corr_state: new FormControl(''),
      corr_city: new FormControl(''),
      corr_rel_postal_code : new FormControl('')
    });
    // Employment Details

    this.customerEmployemntForm = new FormGroup({
      annual_income: new FormControl(''), // Default value
      business_type: new FormControl('', ),
      department: new FormControl('', ),
      employee_no: new FormControl('', ),
      income_date: new FormControl('', ),
      income_type: new FormControl('', ),
      occupation_category: new FormControl('', ),
      position: new FormControl('', ),
      employment_remarks: new FormControl('', ),
      telecode: new FormControl('', ),
      telephone_no: new FormControl(''),
      employee_type: new FormControl(''), // Default value
    });
    // Banking Form
  
    // dcoument form
    this.documentsForm= new FormGroup({
      fileName : new FormControl(''),
      fileDescription: new FormControl(''),
      fileSize:new FormControl(''),
      fileUpload: new FormControl(''),
      fileType: new FormControl('')
    })

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
      console.log(params,'params');
      this.customerId = params['id'];
      if (this.customerId && params) {
        this.loadCustomerData(this.customerId);
        this.loadCustomerRaltionshipData(this.customerId);
        this.loadEmployementData(this.customerId);
        if(params['action']==='edit'){
          this.isEditMode = true;
        }else{
          this.customerForm.disable();
          this.customerAddressForm.disable();
          this.customerEmployemntForm.disable();
          this.customerRelationshipForm.disable();
        }
        
      } else {
        this.isEditMode = false;
      }
    });

    this.fetchCountries();
  }

  onCustomerRelationSave() {
    // Create the customer_relation object
    const customer_relation = {
      name: this.customerRelationshipForm.get('relationship_name')?.value,
      ic: this.customerRelationshipForm.get('relationship_ic')?.value,
      passport: this.customerRelationshipForm.get('relationship_passport')?.value,
      gender: this.customerRelationshipForm.get('relationship_gender')?.value,
      mobile_no: this.customerRelationshipForm.get('relationship_mobile_no')?.value,
      relationship: this.customerRelationshipForm.get('relationship')?.value,
      customer_address: [
        {
          address_lines: this.customerRelationshipForm.get('perm_address_line')?.value,
          country_id: this.customerRelationshipForm.get('perm_country')?.value,
          state_id: this.customerRelationshipForm.get('perm_state')?.value,
          city_id: this.customerRelationshipForm.get('perm_city')?.value,
        },
        {
          address_lines: this.customerRelationshipForm.get('corr_address_line')?.value,
          country_id: this.customerRelationshipForm.get('corr_country')?.value,
          state_id: this.customerRelationshipForm.get('corr_state')?.value,
          city_id: this.customerRelationshipForm.get('corr_city')?.value,
        },
      ],
    };
  
    // Update the dataSource's underlying data
    const currentData = this.dataSource.data; // Get the current data
    currentData.push(customer_relation); // Add the new customer relation
    this.dataSource.data = [...currentData]; // Refresh the data in the table
  
    // Reset the form
    this.customerRelationshipForm.reset();
  }

  onRowDelete(record:any){

  }
  
  

  eitherFieldRequiredValidator(form: AbstractControl): { [key: string]: boolean } | null {
    const ic = form.get('ic')?.value;
    const passport = form.get('passport')?.value;
    if (!ic && !passport) {
      return { eitherFieldRequired: true }; // Error if both are empty
    }
    return null; // Valid if either field has a value
  }

  ngAfterViewInit(): void { 
    this.dataSource.paginator = this.paginator;
    

  }

  numericOnly(event:any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
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
      perm_postal_code: row?.customer_address[0]?.postal_code || '',
      corr_rel_postal_code: row?.customer_address[0]?.postal_code || '',
      perm_address_line: row?.customer_address[0]?.address_lines || '',
      perm_city: row?.customer_address[0]?.city_id || '',
      perm_state: row?.customer_address[0]?.state_id || '',
      perm_country: row?.customer_address[0]?.country_id || ''
    });
  }

  onBankingSubmit(): void {
    if (this.bankingForm.valid) {
      const bankRecord = this.bankingForm.value;

      this.bankRecords.push(new FormGroup({
        bankName: new FormControl(bankRecord.bankName),
        accountNo: new FormControl(bankRecord.accountNo),
        bankHolder: new FormControl(bankRecord.bankHolder),
        bankCard: new FormControl(bankRecord.bankCard),
        pinNo: new FormControl(bankRecord.pinNo),
        remark: new FormControl(bankRecord.remark)
      }));
      
      this.bankingForm.reset();
      this.bankDataSource = [...this.bankRecords.controls as FormGroup[]];
    }
  }

  masterCancel(){
    this.router.navigate(['/listing']);
  }
  
  onFileEdit(record:any){
    console.log(record)
  }

  onDocumentSubmit(){

  }

  get bankRecordsArray(): FormGroup[] {
    return this.bankRecords.controls as FormGroup[];
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      this.documentsForm.patchValue({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileDescription: this.documentsForm.value.fileDescription
      });
    }
  }

  addDocumentRecord(): void {
    if (this.documentsForm.valid && this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('fileName', this.documentsForm.value.fileName);
      formData.append('fileDescription', this.documentsForm.value.fileDescription);
      formData.append('fileSize', this.documentsForm.value.fileSize);
      formData.append('fileType', this.documentsForm.value.fileType);

      this.uploadedDocuments.push(formData)
      // Simulate upload or send to backend
      //this.uploadFile(formData);

      // Add file to the table
      this.uploadedFiles.push({
        fileName: this.documentsForm.value.fileName,
        fileDescription: this.documentsForm.value.fileDescription,
        fileSize: this.documentsForm.value.fileSize,
        fileType: this.documentsForm.value.fileType
      });

      this.documentsForm.reset(); // Clear the form
      this.selectedFile = null; // Reset selected file
    }
  }

  clearForm(){

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
          annual_income: signalData?.employment?.annual_income,
          department: signalData?.employment?.department,
          business_type: signalData?.employment?.business_type,
          employee_no: signalData?.employment?.employee_no,
          employee_type: signalData?.employment?.employee_type,
          income_date: signalData?.employment?.income_date,
          income_type: signalData?.employment?.income_type,
          occupation_category: signalData?.employment?.occupation_category,
          position: signalData?.employment?.position,
          remark: signalData?.employment?.employment_remarks,
          comp_tel_code: signalData?.employment?.tel_code,
          comp_tel_no: signalData?.employment?.telephone_no,
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

  onBankEdit(data:any){
    console.log(data)
  }

  onBankDelete(data:any){

  }

  onMasterSubmit(){
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
      customer_address: [
        {
          address_lines: this.customerAddressForm.get('perm_address_line')?.value,
          postal_code: this.customerAddressForm.get('perm_postal_code')?.value,
          is_permanent: !!this.customerAddressForm.get('perm_address_line')?.value,
          country_id: this.customerAddressForm.get('perm_country')?.value,
          state_id: this.customerAddressForm.get('perm_state')?.value,
          city_id: this.customerAddressForm.get('perm_city')?.value,
        },
        {
          address_lines: this.customerAddressForm.get('corr_address_line')?.value,
          postal_code: this.customerAddressForm.get('corr_postal_code')?.value,
          country_id: this.customerAddressForm.get('corr_country')?.value,
          state_id: this.customerAddressForm.get('corr_state')?.value,
          city_id: this.customerAddressForm.get('corr_city')?.value,
        }
      ]
    };
    
    // Add employmentData only if there are values in the form
    if (Object.values(this.customerEmployemntForm.value).some(value => value !== null && value !==undefined && value !== "")) {
      console.log(this.customerEmployemntForm,'valuesss');
      submissionData.employment = {
        annual_income: this.customerEmployemntForm.get('annual_income')?.value,
        business_type: this.customerEmployemntForm.get('business_type')?.value,
        department: this.customerEmployemntForm.get('department')?.value,
        employee_no: this.customerEmployemntForm.get('employee_no')?.value,
        income_date: this.customerEmployemntForm.get('income_date')?.value,
        income_type: this.customerEmployemntForm.get('income_type')?.value,
        // employment_name: this.customerEmployemntForm.get('employment_name')?.value,
        occupation_category: this.customerEmployemntForm.get('occupation_category')?.value,
        position: this.customerEmployemntForm.get('position')?.value,
        employment_remarks: this.customerEmployemntForm.get('employment_remarks')?.value,
        tel_code: this.customerEmployemntForm.get('telecode')?.value,
        employee_type: this.customerEmployemntForm.get('employee_type')?.value,
        telephone_no: this.customerEmployemntForm.get('telephone_no')?.value,
      };
    }
    
    // Add customerRelationshipData only if there are values in the form
    if (Object.values(this.customerRelationshipForm.value).some(value => value !== null && value !== "")) {
      console.log(this.customerRelationshipForm,'valuesss 111')
      submissionData.relations = [{
        name: this.customerRelationshipForm.get('relationship_name')?.value,
        ic: this.customerRelationshipForm.get('relationship_ic')?.value,
        passport: this.customerRelationshipForm.get('relationship_passport')?.value,
        gender: this.customerRelationshipForm.get('relationship_gender')?.value,
        mobile_no: this.customerRelationshipForm.get('perm_country')?.value,
        relationship: this.customerRelationshipForm.get('relationship')?.value,
        customer_address: [
             {
              address_lines: this.customerRelationshipForm.get('perm_address_line')?.value,
              country_id: this.customerRelationshipForm.get('perm_country')?.value,
              state_id: this.customerRelationshipForm.get('perm_state')?.value,
              city_id: this.customerRelationshipForm.get('perm_city')?.value,
            },
            {
              address_lines: this.customerRelationshipForm.get('corr_address_line')?.value,
              country_id: this.customerRelationshipForm.get('corr_country')?.value,
              state_id: this.customerRelationshipForm.get('corr_state')?.value,
              city_id: this.customerRelationshipForm.get('corr_city')?.value,
            }
        ]
      }];
    }
    if (this.bankRecords && this.bankRecords.length > 0) {
        submissionData.bankDetails = this.bankRecords.value;
    }
    // if(this.uploadedFiles && this.uploadedFiles.length >0){
    //   submissionData.dcoument = this.uploadedDocuments
    // }
    
    if (this.isEditMode) {
      submissionData.id = this.customerId;
    }

    console.log(submissionData,'master submit');
    this.dataService.addCustomer(submissionData).subscribe(response => {
      this.snackBar.open('Record Saved', 'Close', {
        duration: 3000, // Duration in milliseconds
        horizontalPosition: 'center', // Position: 'start', 'center', 'end', 'left', 'right'
        verticalPosition: 'bottom', // Position: 'top', 'bottom'
      });
      this.router.navigate(['/listing']);
    });
  }

}
