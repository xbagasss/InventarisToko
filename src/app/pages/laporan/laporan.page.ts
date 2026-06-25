import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { documentTextOutline, sendOutline, personCircleOutline, sparklesOutline } from 'ionicons/icons';
import { DataService, Product, StockHistory } from '../../services/data.service';

@Component({
  selector: 'app-laporan',
  templateUrl: './laporan.page.html',
  styleUrls: ['./laporan.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonSpinner, CommonModule, FormsModule]
})
export class LaporanPage implements OnInit {
  private dataService = inject(DataService);
  
  messages: { sender: 'user' | 'ai', text: string }[] = [];
  userInput: string = '';
  isTyping = false;
  
  products: Product[] = [];
  history: StockHistory[] = [];

  constructor() {
    addIcons({ documentTextOutline, sendOutline, personCircleOutline, sparklesOutline });
  }

  ngOnInit() {
    this.dataService.products$.subscribe(res => this.products = res);
    this.dataService.history$.subscribe(res => this.history = res);
    
    // Initial welcome message
    this.messages.push({
      sender: 'ai',
      text: `Halo! Saya adalah **Inventory AI Assistant** Anda. \n\nSaya bisa membuatkan Anda:\n- Laporan Stok Saat Ini\n- Laporan Mutasi Barang\n- Laporan Barang Hampir Habis\n- Laporan Nilai Persediaan\n\nKetik jenis laporan yang Anda butuhkan di bawah ini!`
    });
  }

  sendMessage() {
    if (!this.userInput.trim()) return;
    
    const userText = this.userInput.trim();
    this.messages.push({ sender: 'user', text: userText });
    this.userInput = '';
    this.isTyping = true;
    
    setTimeout(() => {
      this.generateAIResponse(userText.toLowerCase());
      this.isTyping = false;
    }, 1500);
  }
  
  generateAIResponse(query: string) {
    let responseText = '';
    
    if (query.includes('saat ini') || query.includes('semua stok') || query.includes('stok saat ini')) {
      responseText = this.buildCurrentStockReport();
    } else if (query.includes('hampir habis') || query.includes('kritis') || query.includes('sedikit')) {
      responseText = this.buildLowStockReport();
    } else if (query.includes('nilai') || query.includes('valuasi') || query.includes('modal') || query.includes('persediaan')) {
      responseText = this.buildValuationReport();
    } else if (query.includes('masuk') || query.includes('keluar') || query.includes('mutasi') || query.includes('pergerakan')) {
      responseText = this.buildMovementReport();
    } else {
      responseText = "Maaf, saya belum paham format laporan tersebut. \n\nCoba ketik:\n- 'Buatkan laporan stok saat ini'\n- 'Tampilkan barang hampir habis'\n- 'Berapa nilai total persediaan saya?'";
    }
    
    this.messages.push({ sender: 'ai', text: responseText });
  }
  
  buildCurrentStockReport(): string {
    if (this.products.length === 0) return "Saat ini Anda belum memiliki barang di inventaris.";
    let res = "**Laporan Stok Saat Ini:**\n\n";
    this.products.forEach(p => {
      res += `- ${p.name}: **${p.stock} item**\n`;
    });
    return res;
  }
  
  buildLowStockReport(): string {
    const low = this.products.filter(p => p.stock < 10);
    if (low.length === 0) return "Kabar baik! Tidak ada barang dengan stok kritis (di bawah 10) saat ini.";
    let res = "**Laporan Barang Hampir Habis:**\n\n";
    low.forEach(p => {
      res += `- ${p.name}: tersisa **${p.stock}**\n`;
    });
    res += "\n*Insight:* Segera lakukan pemesanan ulang (restock) untuk barang-barang di atas agar operasional tidak terganggu.";
    return res;
  }
  
  buildValuationReport(): string {
    if (this.products.length === 0) return "Tidak ada nilai persediaan karena stok kosong.";
    const total = this.products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    let res = "**Laporan Nilai Persediaan (Valuation):**\n\n";
    res += `Total estimasi nilai inventaris Anda adalah **Rp ${total.toLocaleString('id-ID')}**.\n\n`;
    
    if (this.products.length > 0) {
      const highest = [...this.products].sort((a,b) => (b.price*b.stock) - (a.price*a.stock))[0];
      res += `*Insight:* Aset terbesar Anda tertanam pada **${highest.name}** senilai Rp ${(highest.price*highest.stock).toLocaleString('id-ID')}.`;
    }
    return res;
  }
  
  buildMovementReport(): string {
    if (this.history.length === 0) return "Belum ada riwayat mutasi/pergerakan stok.";
    const recent = this.history.slice(0, 5);
    let res = "**Laporan Mutasi Terakhir (5 Aktivitas Terkini):**\n\n";
    recent.forEach(h => {
      const isOut = h.quantityChange < 0;
      const typeStr = isOut ? "🔴 Keluar" : "🟢 Masuk";
      res += `- ${h.productName}: ${typeStr} (${Math.abs(h.quantityChange)} item)\n`;
    });
    return res;
  }
  
  formatText(text: string) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
  }
}
