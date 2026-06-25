import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, lockClosedOutline, logInOutline, logoBuffer } from 'ionicons/icons';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule]
})
export class LoginPage {
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private router = inject(Router);
  private toastController = inject(ToastController);

  username = '';
  password = '';

  constructor() {
    addIcons({ personOutline, lockClosedOutline, logInOutline, logoBuffer });
  }

  async onLogin() {
    if (this.authService.login(this.username, this.password)) {
      this.dataService.reloadForCurrentUser();
      this.router.navigate(['/tabs/dashboard']);
    } else {
      const toast = await this.toastController.create({
        message: 'Username atau Password salah!',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
