import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { getErrorMessage } from '../../utils/error-message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  mode: 'login' | 'register' = 'login';
  loading = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    name: [''],
    email: ['demo@stock.app', [Validators.required, Validators.email]],
    password: ['Demo@123', [Validators.required, Validators.minLength(6)]],
  });

  switchMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.error = '';
    if (mode === 'register') {
      this.form.controls.name.setValidators([Validators.required]);
    } else {
      this.form.controls.name.clearValidators();
    }
    this.form.controls.name.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    const { name, email, password } = this.form.getRawValue();
    const request$ =
      this.mode === 'login'
        ? this.auth.login(email, password)
        : this.auth.register(name, email, password);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.error = getErrorMessage(err, 'Authentication failed');
        this.loading = false;
      },
    });
  }
}
