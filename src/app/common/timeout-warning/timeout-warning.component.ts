// timeout-warning.component.ts
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-timeout-warning',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Session Timeout Warning</h2>
    <mat-dialog-content>
      <p>Your session will expire in 30 seconds due to inactivity.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="extendSession()">Continue Session</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      padding: 16px 24px;
    }
  `]
})
export class TimeoutWarningComponent {
  constructor(private dialogRef: MatDialogRef<TimeoutWarningComponent>) {}

  extendSession() {
    this.dialogRef.close('extend');
  }
}