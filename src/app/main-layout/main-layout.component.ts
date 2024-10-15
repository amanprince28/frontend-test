import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu'; 

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, MatButtonModule, MatIconModule, MatToolbarModule,RouterLink,MatMenuModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'] // Make sure the CSS file is created if needed
})
export class MainLayoutComponent {
  title = 'frontend-test';
  showFiller = false;

  constructor(private router:Router){}


  goToSettings() {
    this.router.navigate(['/settings']);
  }

  logout() {
    this.router.navigate(['/']);
  }

}
