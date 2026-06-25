import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, lockClosedOutline, logoBuffer } from 'ionicons/icons';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule]
})
export class ForgotPasswordPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastController = inject(ToastController);

  username = '';
  newPassword = '';
  confirmPassword = '';

  constructor() {
    addIcons({ personOutline, lockClosedOutline, logoBuffer });
  }

  async onResetPassword() {
    if (!this.username || !this.newPassword) {
      this.showToast('Semua kolom harus diisi!', 'danger');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showToast('Password baru tidak cocok!', 'danger');
      return;
    }

    const success = this.authService.resetPassword(this.username, this.newPassword);
    
    if (success) {
      this.showToast('Password berhasil diubah!', 'success');
      this.router.navigate(['/login']);
    } else {
      this.showToast('Username tidak ditemukan!', 'danger');
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
