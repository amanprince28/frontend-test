import { Component, OnInit, signal, ViewChild } from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';

import {MatButtonModule} from '@angular/material/button';
import { Router } from '@angular/router';
import { SignalService } from '../signal.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../data.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';



@Component({
  selector: 'app-users-listing',
  standalone: true,
  imports: [CommonModule, MatTabsModule, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatSelectModule, MatOptionModule,MatPaginatorModule,MatTableModule, MatCard, MatCardContent, MatCardTitle,MatIconModule,MatDatepickerModule,MatNativeDateModule],
  providers: [DataService], 
  templateUrl: './users-listing.component.html',
  styleUrl: './users-listing.component.scss'
})
export class UsersListingComponent implements OnInit{
  displayedColumns: string[] = ['customerId','name' ,'email', 'role','status','actions'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);
  searchForm!: FormGroup;
  searchQuery:any;
  signalData = signal({});
  search = new FormControl();
  userDetails: any ;
  userRole: any;

  constructor(private dialog: MatDialog,private router: Router, private signalService: SignalService, private dataService: DataService,
    private snackbar:MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userDetails = localStorage.getItem('user-details');
    this.userDetails = JSON.parse(this.userDetails)
    this.userRole = this.userDetails?.role ?? '';
    this.fetchData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.paginator.page.subscribe(() => {
      this.fetchData(this.paginator.pageIndex, this.paginator.pageSize);
    });
  }

  fetchData(page: number = 0, limit: number = 5): void {
    const payload = { page, limit};
    this.dataService.getUser(payload).subscribe((response: any) => {
      console.log(response);
      this.dataSource.data = response;
    });
  }

  onRowClick(row: any,action:string): void {
    if (!row.id) {
      return;
    }
    row.action = action;
    this.dataService.getUserById(row.id).subscribe((response: any) => {
      this.signalService.triggerAction(response);
      this.router.navigate(['/users-details', row]);
    });
  }

  // For filtering the table
  filterTable(): void {
    const searchValue = this.searchQuery
    console.log(searchValue, 'Search Value');
    this.dataService.findAgentAndLeads(searchValue).subscribe((response: any) => {
      console.log(response);
      if(response.length>0){
      this.dataSource.data = response; 
      this.paginator.length = response.totalCount; 
      }else{
        this.snackbar.open('No Data Found', 'Close', { duration: 2000 });
      }
    });
  }

  onAddClick(): void {
    this.router.navigate(['/users-details']);
  }

  onDelete(row: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: 'Are you sure you want to delete this user?' },
      width: '400px',
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Call the delete API
        this.dataService.deleteUser(row.id).subscribe(
          () => {
            this.snackbar.open('User deleted successfully', 'Close', { duration: 2000 });
            this.fetchData(); // Reload data after deletion
          },
          (error: any) => {
            this.snackbar.open('Error deleting user', 'Close', { duration: 2000 });
          }
        );
      }
    });
}
}
