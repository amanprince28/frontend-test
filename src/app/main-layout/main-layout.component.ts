import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu'; 
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';

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
  @ViewChild('drawer') drawer!: MatDrawer;
  isDrawerOpen = true;
  userDetails: any
  userName: any;
  checkUsers: any;



  constructor(private router:Router,private dataService:DataService){}


  ngOnInit(): void {
    this.userDetails = localStorage.getItem('user-details');
    this.userDetails = JSON.parse(this.userDetails)
    this.userName = this.userDetails?.name ?? '';    
    this.showUsers();
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }


  checkScreenSize() {
    const isSmallScreen = window.innerWidth < 960;
    this.isDrawerOpen = !isSmallScreen;
  }

  toggleDrawer() {
    this.drawer.toggle();
  }

  closeDrawerOnMobile() {
    if (window.innerWidth < 960) {
      this.drawer.close();
    }
  }

  canViewReporting(): boolean {
    return this.userDetails?.role === 'SUPER_ADMIN' || this.userDetails?.role === 'ADMIN';
  }

  showUsers(): void {
    this.checkUsers = ['AGENT', 'LEAD','ADMIN'].includes(this.userDetails?.role || '');
    
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }


  logout() {
    this.dataService.logout().subscribe({
      next: (res) => {
        console.log(res.message);
        localStorage.removeItem('user-details'); // clear token/session storage
        this.router.navigate(['/login']); // redirect to login page
      },
      error: (err) => {
        console.error('Logout failed:', err);
        // still clear local storage just in case
        localStorage.removeItem('user-details');
        this.router.navigate(['/login']);
      },
    });
  }

  changePassword(){
    this.router.navigate(['/change-password']);
  }

}
