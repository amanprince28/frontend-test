import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators,AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from '../data.service';


@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.scss']
})
export class PasswordChangeComponent {
  private dataService = inject(DataService);
  private snackBar = inject(MatSnackBar);

  // Define the form
  passwordForm: FormGroup = new FormGroup(
    {
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator }
  );

  constructor() {}

  // Custom validator to check if passwords match
  passwordMatchValidator(form: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
  
    // Check if the passwords match
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordsMismatch: true };
    }
  
    return null; // Return null if passwords match
  }

  // Submit the password change form
  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.snackBar.open('Please fill in all fields correctly.', 'Close', {
        duration: 2000,
      });
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;

    
    this.dataService.changePassword(currentPassword, newPassword).subscribe(
      (response) => {
        this.snackBar.open('Password changed successfully!', 'Close', {
          duration: 2000,
        });
        this.passwordForm.reset(); // Reset the form
      },
      (error) => {
        this.snackBar.open('Error changing password. Please try again.', 'Close', {
          duration: 2000,
        });
      }
    );
  }
}
