import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCard } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';  

@Component({
  selector: 'app-generic-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatTableModule, MatIconModule, MatCheckboxModule],
  templateUrl: './generic-modal.component.html',
  styleUrls: ['./generic-modal.component.scss']
})
export class GenericModalComponent {
  searchControl = new FormControl('');
  filteredData: any[] = [];
  displayedColumns: string[] = ['select', ...this.data.columns.map((col: any) => col.key)];
  selectedRow: any;

  constructor(
    private dialogRef: MatDialogRef<GenericModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.filteredData = data.items;
    this.displayedColumns = ['select', ...data.columns.map((col: any) => col.key)];
  }

  filterData() {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    this.filteredData = this.data.items.filter((item: any) =>
      Object.values(item).some(val => 
        typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' ? 
        val.toString().toLowerCase().includes(searchTerm) : false
      )
    );
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
