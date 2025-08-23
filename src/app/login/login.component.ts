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
import { MatIconModule } from '@angular/material/icon';

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
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  hide = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // onSubmit(): void {
  //   if (this.loginForm.valid) {
  //     this.isLoading = true;
  //     const credentials = this.loginForm.value;

  //     this.dataService.login(credentials).subscribe({
  //       next: (resp) => {
  //         this.isLoading = false;
  //         if (resp.access_token) {
  //           localStorage.setItem('user-details', JSON.stringify(resp));
  //           this.snackBar.open('✅ Login Successful', 'Close', {
  //             duration: 3000,
  //             panelClass: 'success-snackbar'
  //           });
  //           this.router.navigateByUrl('/listing');
  //         } else {
  //           this.snackBar.open(resp.message || 'Invalid Credentials', 'Close', {
  //             duration: 3000,
  //             panelClass: 'error-snackbar'
  //           });
  //         }
  //       },
  //       error: (err) => {
  //         this.isLoading = false;
  //         if (err.status === 401 || err.status === 400) {
  //           this.snackBar.open(err.error.message || 'Invalid Credentials', 'Close', {
  //             duration: 3000,
  //             panelClass: 'error-snackbar'
  //           });
  //         } else {
  //           this.snackBar.open('Login Failed. Please try again.', 'Close', {
  //             duration: 3000,
  //             panelClass: 'error-snackbar'
  //           });
  //         }
  //       }
  //     });
  //   } else {
  //     this.snackBar.open('⚠️ Please fill all required fields correctly.', 'Close', {
  //       duration: 3000
  //     });
  //   }
  // }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const credentials = this.loginForm.value;
  
      this.dataService.login(credentials).subscribe({
        next: (resp) => {
          this.isLoading = false;
  
          // ✅ check for sessionInfo instead of access_token
          if (resp.sessionInfo && resp.sessionInfo.sessionId) {
            // Save both user + session info to localStorage
            localStorage.setItem('user-details', JSON.stringify(resp.user));
            localStorage.setItem('session-info', JSON.stringify(resp.sessionInfo));
  
            this.snackBar.open('✅ Login Successful', 'Close', {
              duration: 3000,
              panelClass: 'success-snackbar'
            });
  
            this.router.navigateByUrl('/listing');
          } else {
            this.snackBar.open(resp.message || 'Invalid Credentials', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 401 || err.status === 400) {
            this.snackBar.open(err.error.message || 'Invalid Credentials', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          } else {
            this.snackBar.open('Login Failed. Please try again.', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        }
      });
    } else {
      this.snackBar.open('⚠️ Please fill all required fields correctly.', 'Close', {
        duration: 3000
      });
    }
  }
  

  togglePasswordVisibility(event: MouseEvent): void {
    event.preventDefault(); // Just for safety
    this.hide = !this.hide;
  }
}
