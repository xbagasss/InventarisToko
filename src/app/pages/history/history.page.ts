import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, arrowUpCircle, arrowDownCircle, informationCircle, search } from 'ionicons/icons';
import { DataService, StockHistory } from '../../services/data.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonCard, IonCardContent, CommonModule, FormsModule]
})
export class HistoryPage implements OnInit {
  public dataService = inject(DataService);
  logs: StockHistory[] = [];
  filteredLogs: StockHistory[] = [];
  searchQuery = '';

  constructor() {
    addIcons({ timeOutline, arrowUpCircle, arrowDownCircle, informationCircle, search });
  }

  ngOnInit() {
    this.dataService.history$.subscribe(res => {
      this.logs = res;
      this.applyHistoryFilter();
    });
  }

  applyHistoryFilter() {
    this.filteredLogs = this.logs.filter(log => 
      log.productName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getIconName(quantityChange: number): string {
    if (quantityChange > 0) return 'arrow-up-circle';
    if (quantityChange < 0) return 'arrow-down-circle';
    return 'information-circle';
  }

  getIconColor(quantityChange: number): string {
    if (quantityChange > 0) return 'success';
    if (quantityChange < 0) return 'danger';
    return 'medium';
  }
}
