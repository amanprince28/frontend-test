import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';  
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { DataService } from '../data.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { add } from 'date-fns';
import { Router } from '@angular/router';

@Component({
  selector: 'app-generic-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, 
            MatButtonModule, MatTableModule, MatIconModule, MatCheckboxModule, MatPaginatorModule, 
            MatSelectModule,MatProgressSpinnerModule],
  templateUrl: './generic-modal.component.html',
  styleUrls: ['./generic-modal.component.scss']
})
export class GenericModalComponent implements OnInit{
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);
  resultsLength = 0;
  isLoading = false;
  searchControl = new FormControl('');
  displayedColumns: string[] = [];
  selectedRow: any;
  searchFields = [
    { key: 'name', label: 'Name' },
    { key: 'ic', label: 'IC' },
  ];
  addCustomer:boolean=false;
  searchQuery: string = '';

  selectedKey: string | null = null;
  title: any;

  totalCount = 0;
  pageSize = 10;
  currentPage = 0;

  constructor(
    private dialogRef: MatDialogRef<GenericModalComponent>,
    private dataService: DataService,
    private router:Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title;
    this.displayedColumns = ['select', ...data.columns.map((col: any) => col.key)];
  }

  ngOnInit(): void {
    this.fetchData(this.currentPage, this.pageSize);
  }

  onPageChange(event: PageEvent): void {
      this.fetchData(event.pageIndex, event.pageSize);
    }

  fetchData(pageIndex: number, pageSize: number): void {
    this.isLoading = true;

    const payload = {
      page: pageIndex + 1, // backend expects 1-based
      limit: pageSize,
      filter: this.searchQuery || undefined,
    };
  
    if (this.data.type === 'agent') {
      this.dataService.getActiveUser(payload).subscribe({
        next: (response: any) => {
          const filtered = response.data.filter((el: any) => el.role === 'AGENT' || el.role === 'LEAD');
          
          this.dataSource.data = filtered
          this.totalCount = response.total || response.totalCount || 0;
          this.pageSize = pageSize;
          this.currentPage = pageIndex;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    } else if (this.data.type === 'customer') {
      this.dataService.getCustomer(payload).subscribe({
        next: (response: any) => {
          this.dataSource.data = response.data || [];
          this.totalCount = response.total || response.totalCount || 0;
          this.pageSize = pageSize;
          this.currentPage = pageIndex;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }
  
  filterTable() {
    const searchValue = this.searchQuery;

    if (searchValue) {
      this.isLoading = true;
      
      if (this.title == "Agent Search") {
        this.dataService.findAgentAndLeads(searchValue).subscribe({
          next: (response) => {
            if (response.data.length > 0) {
              const filtered = response.data.filter((el: any) => el.role === 'AGENT' || el.role === 'LEAD');
              this.dataSource.data = filtered;
              this.resultsLength = filtered.length;
              this.paginator.firstPage();
            }
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
      }
      if (this.title == "Customer Search") {
        this.dataService.getCustomerSearch(searchValue).subscribe({
          next: (response) => {
            this.dataSource.data = response;
            this.resultsLength = response.length;
            if(this.resultsLength ==0){
              this.addCustomer = true
            }
            console.log(this.addCustomer,'ss');
            this.paginator.firstPage();
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
      }
    } else {
      console.warn('Please select a field and enter a value to search.');
      this.fetchData(this.currentPage, this.pageSize);
    }
  }

  // Method to select a row and close the dialog
  selectRow(row: any) {
    this.dialogRef.close(row);
  }

  // Method to handle row selection via checkbox
  onRowSelect(row: any) {
    if (this.selectedRow === row) {
      this.selectedRow = null;  // Deselect if already selected
    } else {
      this.selectedRow = row;  // Select the new row
    }
  }

  // Method to check if a row is selected
  isSelected(row: any): boolean {
    return this.selectedRow === row;
  }

  onConfirm() {
    if (this.selectedRow) {
      this.dialogRef.close(this.selectedRow);  // Return the selected row
    } else {
      this.dialogRef.close(null);  // No row selected, return null
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  redirectCustomer(){
    this.dialogRef.close(null);
    this.router.navigateByUrl("/details")
  }
}