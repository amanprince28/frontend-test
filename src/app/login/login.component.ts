import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading: boolean = false; // Spinner Control

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dataService: DataService,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true; // Start Spinner
      const credentials = this.loginForm.value;

      this.dataService.login(credentials).subscribe({
        next: (resp) => {
          this.isLoading = false; // Stop Spinner
          if (resp.access_token) {
            localStorage.setItem('user-details', JSON.stringify(resp));
            this.snackBar.open('✅ Login Successful', 'Close', { duration: 3000, panelClass: 'success-snackbar' });
            this.router.navigateByUrl('/listing');
          } else {
            this.snackBar.open(resp.message || 'Invalid Credentials', 'Close', { duration: 3000, panelClass: 'error-snackbar' });
          }
        },
        error: (err) => {
          this.isLoading = false; // Stop Spinner
          if (err.status === 401) {
            this.snackBar.open(err.error.message || 'Invalid Credentials', 'Close', { duration: 3000, panelClass: 'error-snackbar' });
          } else {
            this.snackBar.open('Login Failed. Please try again.', 'Close', { duration: 3000, panelClass: 'error-snackbar' });
          }
        },
      });
    } else {
      this.snackBar.open('⚠️ Please fill all required fields correctly.', 'Close', { duration: 3000 });
    }
  }
}
