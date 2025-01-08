import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCard } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';  
import { MatPaginator,MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { DataService } from '../data.service';

@Component({
  selector: 'app-generic-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatTableModule, MatIconModule, MatCheckboxModule,MatPaginatorModule,MatSelectModule],
  templateUrl: './generic-modal.component.html',
  styleUrls: ['./generic-modal.component.scss']
})
export class GenericModalComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);
  searchControl = new FormControl('');
  displayedColumns: string[] = ['select', ...this.data.columns.map((col: any) => col.key)];
  selectedRow: any;
  searchFields = [
    { key: 'name', label: 'Name' },
    { key: 'ic', label: 'IC' },
  ];

  selectedKey: string | null = null;
  title: any;

  constructor(
    private dialogRef: MatDialogRef<GenericModalComponent>,
    private dataService:DataService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dataSource.data = data.items;
    this.title = data.title;
    console.log(this.title,'title');
    this.displayedColumns = ['select', ...data.columns.map((col: any) => col.key)];
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    // this.paginator.page.subscribe(() => {
    //   this.fetchData(this.paginator.pageIndex, this.paginator.pageSize);
    // });
  }

   filterData() {
    const searchKey = this.selectedKey;
    const searchValue = this.searchControl.value;

    if (searchKey && searchValue) {
      const filterParams = { [searchKey]: searchValue };

      // Call your API with filterParams
      console.log('Filtering data with:', filterParams);

      if(this.title == "Agent Search"){
      this.dataService.findAgentAndLeads(searchValue).subscribe((response) => {
        this.dataSource.data = response;
        this.searchControl.reset();
        this.searchControl.reset();
      });
    }
    if(this.title=="Customer Search"){
      this.dataService.getCustomerSearch(searchValue).subscribe((response) => {
        console.log(response);
        this.dataSource.data = response;
        this.searchControl.reset();
        this.searchControl.reset();
      });
    }
    } else {
      console.warn('Please select a field and enter a value to search.');
    }
  }

  selectRow(row: any) {
    this.dialogRef.close(row);
  }

  onClose() {
    this.dialogRef.close();
  }

  onRowSelect(row: any) {
    if (this.selectedRow === row) {
      this.selectedRow = null;  // Deselect the row if it's already selected
    } else {
      this.selectedRow = row;  // Select the new row
    }
  }

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
}
