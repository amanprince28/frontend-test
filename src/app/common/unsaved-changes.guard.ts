// unsaved-changes.guard.ts
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

export interface CanComponentDeactivate {
  hasUnsavedChanges: () => boolean | Observable<boolean>;
}

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<CanComponentDeactivate> {
  private snackBarRef: MatSnackBarRef<SimpleSnackBar> | null = null;

  constructor(private snackBar: MatSnackBar) {}

  canDeactivate(component: CanComponentDeactivate): Observable<boolean> | boolean {
    if (!component.hasUnsavedChanges || !component.hasUnsavedChanges()) {
      return true;
    }

    // If there's already a snackbar open, don't open another one
    if (this.snackBarRef) {
      return false;
    }

    const config: MatSnackBarConfig = {
      duration: 0, // No auto-dismiss
      panelClass: 'unsaved-changes-snackbar'
    };

    this.snackBarRef = this.snackBar.open(
      'You have unsaved changes. Are you sure you want to leave?',
      'Leave',
      config
    );

    return this.snackBarRef.onAction().pipe(
      take(1),
      map(() => {
        this.snackBarRef = null;
        return true;
      })
    );
  }
}