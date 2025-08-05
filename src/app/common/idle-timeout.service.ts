// src/app/services/idle-timeout.service.ts
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TimeoutWarningComponent } from './timeout-warning/timeout-warning.component';

@Injectable({
  providedIn: 'root'
})
export class IdleTimeoutService {
  private idleTimer: any;
  private warningTimer: any;
  private readonly TIMEOUT_MINUTES = 2; // 2 minutes timeout
  private readonly WARNING_MINUTES = 0.5; // 30 seconds warning

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private dialog: MatDialog
  ) {}

  initIdleTimeout() {
    this.resetTimers();
    
    // Listen for user activity events
    const events = ['mousemove', 'keypress', 'scroll', 'click', 'touchstart', 'mousedown'];
    events.forEach(event => {
      window.addEventListener(event, () => this.resetTimers(), true);
    });
  }

  private resetTimers() {
    // Clear existing timers
    clearTimeout(this.idleTimer);
    clearTimeout(this.warningTimer);
    
    // Set warning timer (30 seconds before logout)
    this.warningTimer = setTimeout(() => {
      this.showTimeoutWarning();
    }, (this.TIMEOUT_MINUTES - this.WARNING_MINUTES) * 60 * 1000);

    // Set logout timer (2 minutes)
    this.idleTimer = setTimeout(() => {
      this.logout();
    }, this.TIMEOUT_MINUTES * 60 * 1000);
  }

  private showTimeoutWarning() {
    const dialogRef = this.dialog.open(TimeoutWarningComponent, {
      width: '350px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'extend') {
        this.resetTimers();
      }
    });
  }

  logout() {
    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Navigate to login
    this.ngZone.run(() => {
      this.router.navigate(['/login']);
    });
  }

  clearTimers() {
    clearTimeout(this.idleTimer);
    clearTimeout(this.warningTimer);
  }
}