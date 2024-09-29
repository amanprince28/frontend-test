import { Component, OnInit, signal } from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';

import {MatButtonModule} from '@angular/material/button';
import { Router } from '@angular/router';
import { SignalService } from '../signal.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../data.service';


@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    HttpClientModule // Ensure HttpClientModule is imported here
  ],
  providers: [DataService], // Ensure DataService is provided here
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.css']
})
export class ListingComponent implements OnInit {
  displayedColumns: string[] = ['name'];
  dataSource = new MatTableDataSource<any>([]);
  searchForm = new FormGroup({
    search: new FormControl(''),
  });
  signalData = signal({});
  search = new FormControl();

  constructor(private router: Router, private signalService: SignalService, private dataService: DataService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    const payload = {};
    this.dataService.getElements(payload).subscribe((data: any[]) => {
      console.log(data);
      this.dataSource.data = data;
    });
  }

  onRowClick(row: any): void {
    this.signalService.triggerAction(row);
    this.router.navigate(['/details', row.name]);
  }

  filterTable(): void {
    if (this.searchForm.get('search')?.value) {
      this.dataSource.filter = this.searchForm.get('search')?.value as string;
      return;
    }
    this.dataSource.filter = '';
  }
}
