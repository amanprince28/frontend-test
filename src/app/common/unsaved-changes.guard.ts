// unsaved-changes.guard.ts
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { Observable, race } from 'rxjs';
import { map, take, finalize } from 'rxjs/operators';
import { UnsavedChangesSnackbarComponent } from './unsaved‑changes-snackbar.component'

export interface CanComponentDeactivate {
  hasUnsavedChanges: () => boolean | Observable<boolean>;
}

@Injectable({ providedIn: 'root' })
export class UnsavedChangesGuard implements CanDeactivate<CanComponentDeactivate> {

  private snackBarRef: MatSnackBarRef<UnsavedChangesSnackbarComponent> | null = null;

  constructor(private snackBar: MatSnackBar) {}

  canDeactivate(component: CanComponentDeactivate): Observable<boolean> | boolean {

    /* 1. nothing to save → allow immediately */
    const hasChanges = component.hasUnsavedChanges?.();
    if (!hasChanges) { return true; }

    /* 2. a snackbar is already open → block navigation */
    if (this.snackBarRef) { return false; }

    /* 3. open the custom snackbar */
    this.snackBarRef = this.snackBar.openFromComponent(
      UnsavedChangesSnackbarComponent,
      {
        duration: 0,                    // stay up until user decides
        panelClass: 'unsaved-changes-snackbar'
      }
    );

    /* 4. translate the user’s choice into true / false */
    const decision$ = race(
      // “Yes” → onAction()
      this.snackBarRef.onAction().pipe(map(() => true)),
      // “No”  → afterDismissed()
      this.snackBarRef.afterDismissed().pipe(map(() => false))
    ).pipe(
      take(1),
      finalize(() => { this.snackBarRef = null; })   // clean up reference
    );

    return decision$;
  }
}
