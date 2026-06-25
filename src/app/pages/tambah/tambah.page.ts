import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { imageOutline, linkOutline, checkmarkCircleOutline, cloudUploadOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-tambah',
  templateUrl: './tambah.page.html',
  styleUrls: ['./tambah.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, CommonModule, FormsModule]
})
export class TambahPage {
  private dataService = inject(DataService);
  private router = inject(Router);

  constructor() {
    addIcons({ imageOutline, linkOutline, checkmarkCircleOutline, cloudUploadOutline });
  }

  categories = this.dataService.categories;

  formData: any = {
    name: '',
    category: 'Smartphone & Aksesoris',
    price: null,
    stock: null,
    notes: '',
    image: ''
  };

  saveProduct() {
    if (!this.formData.name || (this.formData.price !== null && this.formData.price < 0) || (this.formData.stock !== null && this.formData.stock < 0)) return;

    this.dataService.addProduct(this.formData);

    // Reset form
    this.formData = { 
      name: '', 
      category: 'Smartphone & Aksesoris', 
      price: null, 
      stock: null, 
      notes: '', 
      image: '' 
    };

    // Navigate to dashboard
    this.router.navigate(['/tabs/dashboard']);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.7 quality to save space
          this.formData.image = canvas.toDataURL('image/jpeg', 0.7);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
