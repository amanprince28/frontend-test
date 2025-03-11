import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-details',
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
    MatCardTitle,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent {
  isEditMode: boolean = false;
  details: any = {};
  form!: FormGroup;
  customerForm!: FormGroup;
  customerAddressForm!: FormGroup;
  customerRelationshipForm!: FormGroup;
  customerEmployemntForm!: FormGroup;
  bankingForm!: FormGroup;
  bankRecords: any[] = [];
  documentsForm!: FormGroup;
  remarksForm!: FormGroup;
  uploadedFiles: any[] = [];
  remarksTable: any[] = [];
  displayedColumns: string[] = [
    'fileName',
    'fileDescription',
    'fileSize',
    'fileType',
    'actions',
  ];
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  signalData: any;
  customerFullData: any;
  customerId!: string;
  displayedColumnsForRelationshipForm: string[] = [
    'name',
    'ic',
    'mobile',
    'relationship',
    'actions',
  ];
  displayedColumnsBank: string[] = [
    'bankName',
    'accountNo',
    'bankHolder',
    'bankCard',
    'pinNo',
    'remarks',
    'actions',
  ];
  displayedColumnsRemark: string[] = [
    'remarks',
    'createdAt',
    'createdBy',
    'actions',
  ];
  race: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);
  bankEditIndex: number = 0;
  isBankEditMode: boolean = false;
  isCustRelationEditMode: boolean = false;
  isCustRelationEditIndex: number = 0;
  selectedFiles: any[] = [];
  fileEditIndex: number = 0;
  fileEditStatus: boolean = false;
  isRemarkEditMode: boolean = false;
  remarkEditIndex: number = 0;
  isView: boolean = false;
  bankDataSource = new MatTableDataSource<any>([]);
  remarkDataSource = new MatTableDataSource<any>([]);

  dataSourceEmployment = new MatTableDataSource<any>([]);
  customerRelationshipId: any;
  selectedFile: any;
  uploadedDocumentSource = new MatTableDataSource<any>([]);
  formDataValues: any;
  createdBy: any;
  userDetailsFromStorage: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signalService: SignalService,
    private dataService: DataService,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.bankingForm = new FormGroup({
      bankName: new FormControl(),
      accountNo: new FormControl(),
      bankHolder: new FormControl(),
      bankCard: new FormControl(),
      pinNo: new FormControl(),
      remark: new FormControl(),
    });
  }

  ngOnInit() {
    // Initialize form controls
    this.userDetailsFromStorage = localStorage.getItem('user-details');
    this.userDetailsFromStorage = JSON.parse(this.userDetailsFromStorage);
    this.createdBy = this.userDetailsFromStorage?.name ?? '';
    this.race = ['Chinese', 'Malay', 'Indian', 'Other'];
    this.customerForm = new FormGroup(
      {
        // Customer Information
        name: new FormControl(null, Validators.required),
        ic: new FormControl(null, Validators.required),
        passport: new FormControl(null),
        race: new FormControl(null, Validators.required),
        gender: new FormControl('male', Validators.required), // Default value
        marital_status: new FormControl('single', Validators.required), // Default value
        no_of_child: new FormControl(0, Validators.required), // Default value
        mobile_no: new FormControl(null, Validators.required),
        //tel_code: new FormControl('+1', Validators.required), // Default value
        tel_no: new FormControl(null, Validators.required),
        // email: new FormControl(null, [Validators.required, Validators.email]),
        car_plate: new FormControl(null),
        // relationship: new FormControl(null, Validators.required),
        //tel_no: new FormControl('', Validators.required),
        fblink: new FormControl(''),
        //car_plate: new FormControl(''),
        status: new FormControl('', Validators.required),
      },
      { validators: this.eitherFieldRequiredValidator }
    );
    // Customer Address
    this.customerAddressForm = new FormGroup({
      cus_same_as_permanent: new FormControl(false),
      perm_address_line: new FormControl(null, Validators.required),
      perm_country: new FormControl(null, Validators.required),
      perm_state: new FormControl(null, Validators.required),
      perm_city: new FormControl(null, Validators.required),
      perm_postal_code: new FormControl(null, Validators.required),
      corr_postal_code: new FormControl(null, Validators.required),
      corr_address_line: new FormControl(null, Validators.required),
      corr_country: new FormControl(null, Validators.required),
      corr_state: new FormControl(null, Validators.required),
      corr_city: new FormControl(null, Validators.required),
      // cus_mobile :new FormControl(null, Validators.required),
      // cus_tel_no:new FormControl(null, Validators.required),
    });

    // Customer Relationship
    this.customerRelationshipForm = new FormGroup({
      relationship_name: new FormControl(),
      relationship_ic: new FormControl(),
      relationship_mobile_no: new FormControl(),
      relationship: new FormControl(),
    });
    // Employment Details

    this.customerEmployemntForm = new FormGroup({
      annual_income: new FormControl(), // Default value
      business_type: new FormControl(),
      department: new FormControl(),
      employee_no: new FormControl(),
      income_date: new FormControl(),
      //income_type: new FormControl('', ),
      occupation_category: new FormControl(),
      position: new FormControl(),
      employment_remarks: new FormControl(),
      //telecode: new FormControl('', ),
      telephone_no: new FormControl(),
      //employee_type: new FormControl(''), // Default value
    });
    // Banking Form
    this.remarksForm = new FormGroup({
      createdBy: new FormControl(''),
      remark: new FormControl(null),
    });
    // dcoument form
    this.documentsForm = new FormGroup({
      fileName: new FormControl(),
      fileDescription: new FormControl(),
      fileSize: new FormControl(),
      fileUpload: new FormControl(),
      fileType: new FormControl(),
    });

    // Watch for changes in the 'same_as_permanent' checkbox
    this.customerAddressForm
      .get('cus_same_as_permanent')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.copyPermanentToCorrespondence('customerAddressForm');
        } else {
          this.clearCorrespondenceAddress('customerAddressForm');
        }
      });

    this.customerRelationshipForm
      .get('same_as_permanent')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.copyPermanentToCorrespondence('customerRelationshipForm');
        } else {
          this.clearCorrespondenceAddress('customerRelationshipForm');
        }
      });

    // Initialize edit mode and load existing data if necessary
    this.route.params.subscribe((params) => {
      console.log(params, 'params');
      this.customerId = params['id'];
      if (this.customerId && params) {
        this.loadCustomerData(this.customerId);

        //this.loadCustomerRaltionshipData(this.customerId);
        //this.loadEmployementData(this.customerId);
        if (params['action'] === 'edit') {
          this.isEditMode = true;
          this.isView = false;
        } else {
          this.isView = true;
          this.customerForm.disable();
          this.customerAddressForm.disable();
          this.customerEmployemntForm.disable();
          this.customerRelationshipForm.disable();
          this.bankingForm.disable();
          this.remarksForm.disable();
          this.documentsForm.disable();
        }
      } else {
        this.isEditMode = false;
      }
    });

    this.fetchCountries();
  }

  getDocument(customerId: any) {
    this.dataService.getDocumentById(customerId).subscribe((res) => {
      if (res.length > 0) {
        res.forEach((el: any) => {
          const temp = {
            fileName: el.name,
            fileDescription: el.description,
            fileSize: el.size,
            fileType: el.type,
          };
          this.uploadedFiles.push(temp);
        });
        console.log(this.uploadedFiles, 'uploadedFiles');
        this.uploadedDocumentSource.data = this.uploadedFiles;
      }
      console.log(res);
    });
  }

  onCustomerRelationSave() {
    // Create the customer_relation object
    const customer_relation = {
      name: this.customerRelationshipForm.get('relationship_name')?.value,
      ic: this.customerRelationshipForm.get('relationship_ic')?.value,
      //passport: this.customerRelationshipForm.get('relationship_passport')?.value,
      //gender: this.customerRelationshipForm.get('relationship_gender')?.value,
      mobile_no: this.customerRelationshipForm.get('relationship_mobile_no')
        ?.value,
      relationship: this.customerRelationshipForm.get('relationship')?.value,
      customer_address: [
        {
          address_lines:
            this.customerRelationshipForm.get('perm_address_line')?.value,
          country_id: this.customerRelationshipForm.get('perm_country')?.value,
          state_id: this.customerRelationshipForm.get('perm_state')?.value,
          city_id: this.customerRelationshipForm.get('perm_city')?.value,
        },
        {
          address_lines:
            this.customerRelationshipForm.get('corr_address_line')?.value,
          country_id: this.customerRelationshipForm.get('corr_country')?.value,
          state_id: this.customerRelationshipForm.get('corr_state')?.value,
          city_id: this.customerRelationshipForm.get('corr_city')?.value,
        },
      ],
    };
    if (this.isCustRelationEditMode) {
      // Update the record in edit mode
      this.dataSource.data[this.isCustRelationEditIndex] = customer_relation;
      this.isCustRelationEditMode = false; // Reset edit mode
    } else {
      // Add a new record in insert mode
      this.dataSource.data.push(customer_relation);
    }

    // Update the data source for the table
    this.dataSource.data = [...this.dataSource.data];

    // Reset the form
    this.customerRelationshipForm.reset();
  }

  onRowDelete(record: any) {
    const index = this.dataSource.data.indexOf(record);
    if (index >= 0) {
      this.dataSource.data.splice(index, 1);
      this.dataSource.data = [...this.dataSource.data]; // Update the data source
    }
  }

  eitherFieldRequiredValidator(
    form: AbstractControl
  ): { [key: string]: boolean } | null {
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

  numericOnly(event: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
  }

  onRowClick(row: any) {
    // console.log(record,this.bankRecords,'ssrecord');
    this.isCustRelationEditMode = true;
    this.isCustRelationEditIndex = this.dataSource.data.indexOf(row); // Store the index of the record being edited

    // Patch the values into the form
    // this.customerRelationshipForm.patchValue(row);
    this.customerRelationshipId = row.id;
    this.customerRelationshipForm.patchValue({
      relationship_name: row?.name || null,
      relationship_ic: row?.ic || null,
      relationship_mobile_no: row?.mobile_no || null,
      //relationship_passport: row?.passport || null,
      //relationship_gender: row?.gender || null,
      relationship: row?.relationship || null,
      perm_postal_code: row?.customer_address[0]?.postal_code || null,
      corr_rel_postal_code: row?.customer_address[0]?.postal_code || null,
      perm_address_line: row?.customer_address[0]?.address_lines || null,
      perm_city: row?.customer_address[0]?.city_id || null,
      perm_state: row?.customer_address[0]?.state_id || null,
      perm_country: row?.customer_address[0]?.country_id || null,
    });
  }

  onRemarksSubmit(): void {
    if (this.remarksForm.valid) {
      const remarksRecord = this.remarksForm.value;
      remarksRecord['createdBy'] = this.createdBy;
      remarksRecord['createdAt'] = new Date()
        .toLocaleDateString('en-GB')
        .replace(/\//g, '-');

      if (this.isRemarkEditMode) {
        // Update the record in edit mode
        this.remarkDataSource.data[this.bankEditIndex] = remarksRecord;
        this.isRemarkEditMode = false; // Reset edit mode
      } else {
        // Add a new record in insert mode
        this.remarkDataSource.data.push(remarksRecord);
      }
      // Update the data source for the table
      this.remarkDataSource.data = this.remarkDataSource.data;

      // Reset the form
      this.remarksForm.reset();
    }
  }

  onRemarksEdit(record: any, index: number): void {
    // Set the form to edit mode
    this.isRemarkEditMode = true;
    this.remarkEditIndex = index; // Store the index of the record being edited
    // Patch the values into the form
    this.remarksForm.patchValue(record);
  }
  onRemarksDelete(record: any, index: number): void {
    // Remove the record from the array
    // const index = this.bankDataSource.data.indexOf(record);
    if (index >= 0) {
      this.remarkDataSource.data.splice(index, 1);
      this.remarkDataSource.data = [...this.remarkDataSource.data]; // Update the data source
    }
  }

  onBankingSubmit(): void {
    if (this.bankingForm.valid) {
      const bankRecord = this.bankingForm.value;

      if (this.isBankEditMode) {
        // Update the record in edit mode
        this.bankDataSource.data[this.bankEditIndex] = bankRecord;
        this.isBankEditMode = false; // Reset edit mode
      } else {
        // Add a new record in insert mode
        this.bankDataSource.data.push(bankRecord);
      }

      // Update the data source for the table
      this.bankDataSource.data = this.bankDataSource.data;

      // Reset the form
      this.bankingForm.reset();
    }
  }

  masterCancel() {
    this.router.navigate(['/listing']);
  }

  onFileEdit(record: any, index: number): void {
    this.fileEditIndex = index;
    this.fileEditStatus = true;

    this.selectedFiles = [
      new File([record.fileData], record.fileName, { type: record.fileType }),
    ];

    this.documentsForm.patchValue({
      fileDescription: record.fileDescription || '',
    });
  }

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      this.selectedFiles = Array.from(files);
    }
  }

  addDocumentRecord(): void {
    if (this.documentsForm.valid && this.selectedFiles.length > 0) {
      const formData = new FormData();

      if (this.fileEditStatus) {
        // Update existing file
        const updatedFile = {
          fileName: this.selectedFiles[0].name,
          fileDescription:
            this.documentsForm.value.fileDescription || 'No description',
          fileSize: this.selectedFiles[0].size,
          fileType: this.selectedFiles[0].type,
          fileData: this.selectedFiles[0],
        };

        this.uploadedFiles[this.fileEditIndex] = updatedFile;
        this.uploadedDocumentSource.data = [...this.uploadedFiles];

        // Append file and description to FormData
        formData.append('file', this.selectedFiles[0]);
        formData.append(
          'fileDescription',
          this.documentsForm.value.fileDescription
        );

        // Reset edit mode
        this.fileEditStatus = false;
        this.fileEditIndex = -1;
      } else {
        // Add new files
        this.selectedFiles.forEach((file) => {
          const newFile = {
            fileName: file.name,
            fileDescription:
              this.documentsForm.value.fileDescription || 'No description',
            fileSize: file.size,
            fileType: file.type,
            fileData: file,
          };
          this.uploadedFiles.push(newFile);

          // Append each file and description to FormData
          formData.append('file', file);
          formData.append(
            'fileDescription',
            this.documentsForm.value.fileDescription
          );
        });
        console.log(formData, 'sss');
        this.uploadedDocumentSource.data = [...this.uploadedFiles];
      }

      // Send FormData to backend
      this.formDataValues = formData;

      this.selectedFiles.length = 0;
      this.clearUploadForm();
    }
  }

  clearUploadForm() {
    this.fileEditStatus = false;
    this.selectedFiles[0] = null;
    this.documentsForm.reset();
  }

  loadCustomerData(id: string) {
    this.dataService.getCustomerById(this.customerId).subscribe((data) => {
      this.signalData = data;
      this.customerFullData = data;
      this.dataSource.data = this.signalData?.relations;
      this.bankDataSource.data = this.signalData?.bank_details;
      this.remarkDataSource.data = this.signalData?.remarks;
      this.dataSource.data = this.signalData?.relations;
      if (
        this.signalData &&
        this.signalData.customer_address &&
        this.signalData.customer_address.length > 0
      ) {
        const customerCorrAddress =
          this.signalData?.customer_address?.length > 1
            ? this.signalData.customer_address[1]
            : [];
        const customerPermanentAddress = this.signalData.customer_address.find(
          (address: any) => address.is_permanent
        );
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
          status: data.status,
          race: data.race,
        });
        this.customerAddressForm.patchValue({
          same_as_permanent: customerPermanentAddress?.is_permanent,
          perm_postal_code: customerPermanentAddress?.postal_code,
          perm_address_line: customerPermanentAddress?.address_lines,
          perm_country: customerPermanentAddress?.country_id,
          perm_state: customerPermanentAddress?.state_id,
          perm_city: customerPermanentAddress?.city_id,

          corr_postal_code: customerCorrAddress?.postal_code,
          corr_address_line: customerCorrAddress?.address_lines,
          corr_country: customerCorrAddress?.country_id,
          corr_state: customerCorrAddress?.state_id,
          corr_city: customerCorrAddress?.city_id,
        });

        this.customerEmployemntForm.patchValue({
          annual_income: this.signalData?.employment?.annual_income,
          department: this.signalData?.employment?.department,
          business_type: this.signalData?.employment?.business_type,
          employee_no: this.signalData?.employment?.employee_no,
          //employee_type: signalData?.employment?.employee_type,
          income_date: this.signalData?.employment?.income_date,
          //income_type: signalData?.employment?.income_type,
          occupation_category: this.signalData?.employment?.occupation_category,
          position: this.signalData?.employment?.position,
          employment_remarks: this.signalData?.employment?.employment_remarks,
          //telecode: signalData?.employment?.tel_code,
          telephone_no: this.signalData?.employment?.telephone_no,
        });

        this.onCountryChange(
          customerPermanentAddress.country_id ||
            this.signalData.customer_address[0].country_id
        );
      } else {
        this.isEditMode = false;
      }
    });
    this.getDocument(this.customerId);
  }

  // loadCustomerRaltionshipData(id:string) {
  //   this.dataService.getCustomerById(this.customerId).subscribe(data => {
  //     const signalData = data;
  //     this.dataSource.data = signalData.customer_relation;
  //     // console.log(this.dataSource.data,'ss');
  //     if (this.signalData && this.signalData.customer_address && this.signalData.customer_address.length > 0) {
  //       const customerPermanentAddress = this.signalData.customer_address.find((address: any) => address.is_permanent);

  //       this.onCountryChange(customerPermanentAddress.country_id || this.signalData.customer_address[0].country_id);
  //     } else {
  //       this.isEditMode = false;
  //     }
  //   });
  // }

  // loadEmployementData(id: string) {
  //   this.dataService.getCustomerById(this.customerId).subscribe((data) => {
  //     const signalData = data;
  //     this.dataSource.data = signalData?.relations;
  //     this.bankDataSource.data = signalData?.bank_details;
  //     if (
  //       this.signalData &&
  //       this.signalData.customer_address &&
  //       this.signalData.customer_address.length > 0
  //     ) {
  //       const customerPermanentAddress = this.signalData.customer_address.find(
  //         (address: any) => address.is_permanent
  //       );

  //       this.customerEmployemntForm.patchValue({
  //         annual_income: signalData?.employment?.annual_income,
  //         department: signalData?.employment?.department,
  //         business_type: signalData?.employment?.business_type,
  //         employee_no: signalData?.employment?.employee_no,
  //         //employee_type: signalData?.employment?.employee_type,
  //         income_date: signalData?.employment?.income_date,
  //         //income_type: signalData?.employment?.income_type,
  //         occupation_category: signalData?.employment?.occupation_category,
  //         position: signalData?.employment?.position,
  //         employment_remarks: signalData?.employment?.employment_remarks,
  //         //telecode: signalData?.employment?.tel_code,
  //         telephone_no: signalData?.employment?.telephone_no,
  //       });
  //       console.log(this.customerEmployemntForm, 'ssform');
  //       this.onCountryChange(
  //         customerPermanentAddress.country_id ||
  //           this.signalData.customer_address[0].country_id
  //       );
  //     } else {
  //       this.isEditMode = false;
  //     }
  //   });
  // }

  fetchCountries(): void {
    this.dataService
      .getCountry(
        this.customerForm.get('perm_country')?.value,
        this.customerForm.get('perm_state')?.value
      )
      .subscribe((data) => {
        this.countries = data;
      });
    this.dataService
      .getCountry(
        this.customerRelationshipForm.get('perm_country')?.value,
        this.customerRelationshipForm.get('perm_state')?.value
      )
      .subscribe((data) => {
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
          const customerPermanentAddress =
            this.signalData.customer_address.find(
              (address: any) => address.is_permanent
            );
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
    const selectedState = this.states.find((state) => state.id === stateId);
    // console.log('selectedState', selectedState)
    if (selectedState) {
      this.cities = selectedState.cities || [];
      if (!this.isEditMode) {
        this.customerForm.get('permanent_city')?.reset();
      }
    }
  }

  // Method to copy permanent address to correspondence address
  copyPermanentToCorrespondence(formName: any): void {
    if (formName === 'customerAddressForm') {
      this.customerAddressForm.patchValue({
        corr_address_line:
          this.customerAddressForm.get('perm_address_line')?.value,
        corr_country: this.customerAddressForm.get('perm_country')?.value,
        corr_state: this.customerAddressForm.get('perm_state')?.value,
        corr_city: this.customerAddressForm.get('perm_city')?.value,
        corr_postal_code:
          this.customerAddressForm.get('perm_postal_code')?.value,
      });
    }
    if (formName === 'customerRelationshipForm') {
      this.customerRelationshipForm.patchValue({
        corr_address_line:
          this.customerRelationshipForm.get('perm_address_line')?.value,
        corr_country: this.customerRelationshipForm.get('perm_country')?.value,
        corr_state: this.customerRelationshipForm.get('perm_state')?.value,
        corr_city: this.customerRelationshipForm.get('perm_city')?.value,
        corr_rel_postal_code:
          this.customerRelationshipForm.get('perm_postal_code')?.value,
      });
    }
  }

  // Method to clear correspondence address fields
  clearCorrespondenceAddress(formName: any): void {
    if (formName === 'customerAddressForm') {
      this.customerAddressForm.patchValue({
        corr_address_line: null,
        corr_country: null,
        corr_state: null,
        corr_city: null,
        corr_postal_code: null,
      });
    }
    if (formName === 'customerRelationshipForm') {
      this.customerRelationshipForm.patchValue({
        corr_address_line: null,
        corr_country: null,
        corr_state: null,
        corr_city: null,
      });
    }
  }

  onBankEdit(record: any, index: number): void {
    // Set the form to edit mode
    this.isBankEditMode = true;
    this.bankEditIndex = this.bankDataSource.data.indexOf(record); // Store the index of the record being edited
    // Patch the values into the form
    this.bankingForm.patchValue(record);
  }
  onBankDelete(record: any, index: number): void {
    // Remove the record from the array
    // const index = this.bankDataSource.data.indexOf(record);
    if (index >= 0) {
      this.bankDataSource.data.splice(index, 1);
      this.bankDataSource.data = [...this.bankDataSource.data]; // Update the data source
    }
  }
  onFileDelete(record: any, index: number) {
    this.uploadedDocumentSource.data.splice(index, 1);
    this.uploadedFiles.splice(index, 1);
    this.uploadedDocumentSource.data = [...this.uploadedDocumentSource.data];
    this.uploadedFiles = [...this.uploadedFiles];
  }

  async onMasterSubmit() {
    if (this.customerForm.invalid) {
      this.snackBar.open('Please fill all mandatory fields', 'Close', {
        duration: 3000, // Duration in milliseconds
        horizontalPosition: 'center', // Position: 'start', 'center', 'end', 'left', 'right'
        verticalPosition: 'bottom', // Position: 'top', 'bottom'
      });
      return;
    }
    const submissionData: any = {
      name: this.customerForm.get('name')?.value,
      ic: this.customerForm.get('ic')?.value,
      passport: this.customerForm.get('passport')?.value,
      gender: this.customerForm.get('gender')?.value,
      marital_status: this.customerForm.get('marital_status')?.value,
      no_of_child: this.customerForm.get('no_of_child')?.value,
      mobile_no: this.customerForm.get('mobile_no')?.value,
      tel_no: this.customerForm.get('tel_no')?.value,
      // email: this.customerForm.get('email')?.value,
      car_plate: this.customerForm.get('car_plate')?.value,
      status: this.customerForm.get('status')?.value,
      race:this.customerForm.get('race')?.value,
      customer_address: [
        {
          address_lines:
            this.customerAddressForm.get('perm_address_line')?.value,
          postal_code: this.customerAddressForm.get('perm_postal_code')?.value,
          is_permanent:
            !!this.customerAddressForm.get('perm_address_line')?.value,
          country_id: this.customerAddressForm.get('perm_country')?.value,
          state_id: this.customerAddressForm.get('perm_state')?.value,
          city_id: this.customerAddressForm.get('perm_city')?.value,
        },
        ...(this.customerAddressForm.get('corr_address_line')?.value
          ? [
              {
                address_lines:
                  this.customerAddressForm.get('corr_address_line')?.value,
                postal_code:
                  this.customerAddressForm.get('corr_postal_code')?.value,
                country_id: this.customerAddressForm.get('corr_country')?.value,
                state_id: this.customerAddressForm.get('corr_state')?.value,
                city_id: this.customerAddressForm.get('corr_city')?.value,
              },
            ]
          : []),
      ].filter((address) => !!address.address_lines), // Remove empty objects
    };

    // Add employmentData only if there are values in the form
    if (
      Object.values(this.customerEmployemntForm.value).some(
        (value) => value !== null && value !== undefined && value !== ''
      )
    ) {
      console.log(this.customerEmployemntForm, 'valuesss');
      submissionData.employment = {
        annual_income: this.customerEmployemntForm.get('annual_income')?.value,
        business_type: this.customerEmployemntForm.get('business_type')?.value,
        department: this.customerEmployemntForm.get('department')?.value,
        employee_no: this.customerEmployemntForm.get('employee_no')?.value,
        income_date: this.customerEmployemntForm.get('income_date')?.value,
        //income_type: this.customerEmployemntForm.get('income_type')?.value,
        // employment_name: this.customerEmployemntForm.get('employment_name')?.value,
        occupation_category: this.customerEmployemntForm.get(
          'occupation_category'
        )?.value,
        position: this.customerEmployemntForm.get('position')?.value,
        employment_remarks:
          this.customerEmployemntForm.get('employment_remarks')?.value,
        //tel_code: this.customerEmployemntForm.get('telecode')?.value,
        //employee_type: this.customerEmployemntForm.get('employee_type')?.value,
        telephone_no: this.customerEmployemntForm.get('telephone_no')?.value,
      };
    }

    // Add customerRelationshipData only if there are values in the form
    if (this.dataSource.data.length > 0) {
      submissionData.relations = this.dataSource.data;
    }
    if (this.bankDataSource.data && this.bankDataSource.data.length > 0) {
      submissionData.bank_details = this.bankDataSource.data;
    }
    if (this.remarkDataSource.data && this.remarkDataSource.data.length > 0) {
      submissionData.remarks = this.remarkDataSource.data;
    }

    if (this.isEditMode) {
      submissionData.id = this.customerId;
    }

    console.log(submissionData, 'master submit');
    if (this.signalData == null) {
      this.dataService.addCustomer(submissionData).subscribe(
        (response) => {
          // Success callback
          this.snackBar.open('Record Saved', 'Close', {
            duration: 3000, // Duration in milliseconds
            horizontalPosition: 'center', // Position: 'start', 'center', 'end', 'left', 'right'
            verticalPosition: 'bottom', // Position: 'top', 'bottom'
          });
          this.router.navigate(['/listing']);
        },
        (error) => {
          // Error callback
          if (
            error.status === 400 &&
            error.error.message === 'IC already exist'
          ) {
            // Handle the specific error case
            this.snackBar.open(
              'IC already exists. Please use a different IC.',
              'Close',
              {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
              }
            );
          } else {
            // Handle other errors
            this.snackBar.open(
              'An error occurred. Please try again.',
              'Close',
              {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
              }
            );
          }
        }
      );
    } else {
      this.dataService
        .updateCustomer(this.customerId, submissionData)
        .subscribe(
          (response) => {
            this.snackBar.open('Record Updated', 'Close', {
              duration: 3000, // Duration in milliseconds
              horizontalPosition: 'center', // Position: 'start', 'center', 'end', 'left', 'right'
              verticalPosition: 'bottom', // Position: 'top', 'bottom'
            });
            this.router.navigate(['/listing']);
          },
          (error) => {
            console.error('Error updating customer:', error);
            // Handle error (e.g., show an error message)
          }
        );
    }
    if (this.uploadedFiles && this.uploadedFiles.length > 0) {
      const data = { id: this.customerId, filesData: this.uploadedFiles };
      console.log(data, this.formDataValues, 'data');
      await this.dataService.uploadFiles(data).subscribe((response) => {
        this.snackBar.open('Record Updated', 'Close', {
          duration: 3000, // Duration in milliseconds
          horizontalPosition: 'center', // Position: 'start', 'center', 'end', 'left', 'right'
          verticalPosition: 'bottom', // Position: 'top', 'bottom'
        });
        this.router.navigate(['/listing']);
      });
    }
  }
}
