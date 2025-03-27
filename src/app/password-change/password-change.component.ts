import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
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
export class PasswordChangeComponent implements OnInit {
  private dataService = inject(DataService);
  private snackBar = inject(MatSnackBar);

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
  userDetails: any;

  constructor() {}

  ngOnInit(): void {
    this.userDetails = localStorage.getItem('user-details');
    this.userDetails = JSON.parse(this.userDetails);
  }

  passwordMatchValidator(form: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
  
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordsMismatch: true };
    }
  
    return null;
  }

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
        this.snackBar.open(response.message, 'Close', { duration: 2000 });
        this.resetForm(); // Use the resetForm method instead of direct reset
      },
      (error) => {
        this.snackBar.open(error.error.message || 'Failed to change password', 'Close', {
          duration: 3000,
        });
        console.error('Error:', error);
      }
    );
  }

  // New method to properly reset the form
  private resetForm(): void {
    this.passwordForm.reset();
    Object.keys(this.passwordForm.controls).forEach(key => {
      this.passwordForm.get(key)?.setErrors(null);
      this.passwordForm.get(key)?.markAsUntouched();
      this.passwordForm.get(key)?.markAsPristine();
    });
  }
}