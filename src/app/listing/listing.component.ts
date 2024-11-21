import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { SignalService } from '../signal.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../data.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    HttpClientModule, // Ensure HttpClientModule is imported here
    MatPaginatorModule
  ],
  providers: [DataService], // Ensure DataService is provided here
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent implements OnInit {
  displayedColumns: string[] = ['name', 'ic', 'passport', 'actions'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>([]);
  searchForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private signalService: SignalService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      search: [''], // Initialize the 'search' field
    });

    this.fetchData(); // Initial data fetch
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.filterTable(); // Refetch data when page changes
    });
  }

  fetchData(page: number = 0, limit: number = 5): void {
    const payload = { page, limit };
    this.dataService.getCustomer(payload).subscribe((response: any) => {
      console.log(response);
      this.dataSource.data = response.data;
    });
  }

  filterTable(): void {
    const searchValue = this.searchForm.value.search;
    console.log(searchValue, 'Search Value');

    const skip = this.paginator.pageIndex * this.paginator.pageSize;
    const take = this.paginator.pageSize;
 
    const payload = {
      search: searchValue || '',
      skip,
      take,
    };

    this.dataService.getCustomer(payload).subscribe((response: any) => {
      console.log(response);
      this.dataSource.data = response.data; // Update table with filtered results
      this.paginator.length = response.totalCount; // Update total record count
    });
  }

  onRowClick(row: any, action: string): void {
    if (!row.id) {
      return;
    }
    row.action = action;
    this.dataService.getCustomerById(row.id).subscribe((response: any) => {
      this.signalService.triggerAction(response);
      this.router.navigate(['/details', row]);
    });
  }

  onAddClick(): void {
    this.router.navigate(['/details']);
  }
}
