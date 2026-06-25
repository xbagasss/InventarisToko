import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonList, IonItem, IonThumbnail, IonLabel, IonBadge, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notifications, wallet, cube, warning, close, shieldCheckmark, arrowForwardOutline, pieChart, logOutOutline } from 'ionicons/icons';
import { DataService, Product } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonIcon, IonModal, IonHeader, IonToolbar, 
    IonTitle, IonButtons, IonButton, IonList, IonItem, 
    IonThumbnail, IonLabel, IonBadge, CommonModule
  ]
})
export class DashboardPage implements OnInit, AfterViewInit {
  @ViewChild('catChart') catChartCanvas!: ElementRef;
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private alertController = inject(AlertController);
  private router = inject(Router);
  private chart: any;

  username = '';
  totalProducts = 0;
  totalStockValue = 0;
  lowStockCount = 0;
  lowStockItems: Product[] = [];
  isNotifModalOpen = false;

  constructor() {
    addIcons({ notifications, wallet, cube, warning, close, shieldCheckmark, arrowForwardOutline, pieChart, logOutOutline });
  }

  ngOnInit() {
    this.username = this.authService.getCurrentUser();
    this.dataService.products$.subscribe((products: Product[]) => {
      this.totalProducts = products.length;
      this.totalStockValue = products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);
      this.lowStockItems = products.filter(p => p.stock < 10);
      this.lowStockCount = this.lowStockItems.length;
      
      if (this.chart) {
        this.updateChartData(products);
      }
    });
  }

  ngAfterViewInit() {
    this.createChart();
  }

  async handleLogout() {
    const alert = await this.alertController.create({
      header: 'Konfirmasi Keluar',
      message: 'Apakah Anda yakin ingin keluar dari sistem?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Keluar',
          cssClass: 'danger-text',
          handler: () => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      ]
    });

    await alert.present();
  }

  createChart() {
    const products = this.dataService.getProductsValue();
    const catData = this.processChartData(products);

    this.chart = new Chart(this.catChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: catData.labels,
        datasets: [{
          data: catData.values,
          backgroundColor: ['#2563EB', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#64748B'],
          borderWidth: 0
        }]
      },
      options: {
        cutout: '70%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 14,
              font: { size: 11, weight: 'bold' }
            }
          }
        }
      }
    });
  }

  updateChartData(products: Product[]) {
    const catData = this.processChartData(products);
    this.chart.data.labels = catData.labels;
    this.chart.data.datasets[0].data = catData.values;
    this.chart.update();
  }

  processChartData(products: Product[]) {
    const counts: any = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return {
      labels: Object.keys(counts),
      values: Object.values(counts)
    };
  }

  setNotifModal(isOpen: boolean) {
    this.isNotifModalOpen = isOpen;
  }
}
