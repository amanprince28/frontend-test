// unsaved-changes-snackbar.component.ts
import { Component } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-unsaved-changes-snackbar',
  template: `
    <span class="message">
      You have unsaved changes. Are you sure you want to leave?
    </span>

    <span class="btn-group">
      <!-- ✅ YES → green -->
      <button
        mat-raised-button
        class="yes-btn"
        (click)="leave()">
        Yes
      </button>

      <!-- ❌ NO → red -->
      <button
        mat-raised-button
        color="warn"
        (click)="stay()">
        No
      </button>
    </span>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      width: 100%;
    }

    .message   { flex: 1 1 auto; }

    .btn-group { flex: 0 0 auto; display: flex; gap: .5rem; }

    /* Green “Yes” button — override theme if necessary */
    .yes-btn {
      background-color: #4caf50 !important;  /* Material Green‑500 */
      color: #fff !important;
    }
  `]
})
export class UnsavedChangesSnackbarComponent {

  constructor(private sbRef: MatSnackBarRef<UnsavedChangesSnackbarComponent>) {}

  /** “Yes” → fire onAction() so the guard returns true */
  leave(): void {
    this.sbRef.dismissWithAction();
  }

  /** “No” → just dismiss, guard will return false */
  stay(): void {
    this.sbRef.dismiss();
  }
}
