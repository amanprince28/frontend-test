// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { IdleTimeoutService } from './common/idle-timeout.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    MatSidenavModule, 
    MatButtonModule, 
    MatIconModule,
    MatToolbarModule, 
    RouterLink
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private idleTimeoutService: IdleTimeoutService) {}

  ngOnInit() {
    this.idleTimeoutService.initIdleTimeout();
  }
}