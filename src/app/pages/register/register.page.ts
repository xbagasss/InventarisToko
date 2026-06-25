import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, lockClosedOutline, logInOutline, logoBuffer, arrowBackOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule]
})
export class RegisterPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastController = inject(ToastController);

  username = '';
  password = '';
  confirmPassword = '';

  constructor() {
    addIcons({ personOutline, lockClosedOutline, logInOutline, logoBuffer, arrowBackOutline });
  }

  async onRegister() {
    if (!this.username || !this.password) {
      this.showToast('Semua kolom harus diisi!', 'danger');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showToast('Password tidak cocok!', 'danger');
      return;
    }

    const success = this.authService.register(this.username, this.password);
    
    if (success) {
      this.showToast('Pendaftaran berhasil! Silakan login.', 'success');
      this.router.navigate(['/login']);
    } else {
      this.showToast('Username sudah digunakan!', 'warning');
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  async showToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }
}
