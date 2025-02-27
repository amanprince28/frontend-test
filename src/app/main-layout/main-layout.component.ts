import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, MatButtonModule, MatIconModule, MatToolbarModule,RouterLink,MatMenuModule,CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'] // Make sure the CSS file is created if needed
})
export class MainLayoutComponent implements OnInit {
  title = 'Loan ';
  showFiller = false;
  userDetails: any
  userName: any;
  checkUsers: any;


  constructor(private router:Router){}


  ngOnInit(): void {
    this.userDetails = localStorage.getItem('user-details');
    this.userDetails = JSON.parse(this.userDetails)
    this.userName = this.userDetails?.name ?? '';    
    this.showUsers();
  }

  showUsers(): void {
    this.checkUsers = ['AGENT', 'LEAD','ADMIN'].includes(this.userDetails?.role || '');
    console.log(this.checkUsers,'ss');
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  logout() {
    localStorage.removeItem('user-details');
    this.router.navigate(['/login']);
  }

  changePassword(){
    this.router.navigate(['/change-password']);
  }

}
