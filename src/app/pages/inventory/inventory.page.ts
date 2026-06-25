import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonModal, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search, cubeOutline, imageOutline, remove, add, closeCircle, linkOutline, checkmarkCircleOutline, downloadOutline, barcodeOutline, cloudUploadOutline, documentTextOutline } from 'ionicons/icons';
import { DataService, Product } from '../../services/data.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonModal, CommonModule, FormsModule]
})
export class InventoryPage implements OnInit {
  public dataService = inject(DataService);
  private alertController = inject(AlertController);

  constructor() {
    addIcons({ search, cubeOutline, imageOutline, remove, add, closeCircle, linkOutline, checkmarkCircleOutline, downloadOutline, barcodeOutline, cloudUploadOutline, documentTextOutline });
  }

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories = this.dataService.categories;

  searchQuery = '';
  selectedCategory = 'All';

  // Modal State
  isModalOpen = false;
  editingProduct: Product | null = null;
  formData: any = {
    name: '',
    category: 'Smartphone & Aksesoris',
    price: null,
    stock: null,
    notes: '',
    image: ''
  };

  ngOnInit() {
    this.dataService.products$.subscribe(res => {
      this.products = res;
      this.applyFilter();
    });
  }

  applyFilter() {
    this.filteredProducts = this.products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchCat = this.selectedCategory === 'All' || p.category === this.selectedCategory;
      return matchSearch && matchCat;
    });
  }

  stockColor(stock: number): string {
    if (stock >= 20) return 'success';
    if (stock >= 10) return 'warning';
    return 'danger';
  }

  stockStatus(stock: number) {
    if (stock >= 20) return { label: 'Aman', class: 'status-safe' };
    if (stock >= 10) return { label: 'Terbatas', class: 'status-low' };
    if (stock > 0) return { label: 'Kritis', class: 'status-critical' };
    return { label: 'Habis', class: 'status-empty' };
  }

  quickUpdateStock(product: Product, change: number) {
    this.dataService.updateStock(product.id, change);
  }

  deleteProduct(id: string) {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      this.dataService.deleteProduct(id);
    }
  }

  openModal(product?: Product) {
    if (product) {
      this.editingProduct = product;
      this.formData = {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        notes: product.notes || '',
        image: product.image || ''
      };
    } else {
      this.editingProduct = null;
      this.formData = { 
        name: '', 
        category: 'Smartphone & Aksesoris', 
        price: null, 
        stock: null, 
        notes: '', 
        image: '' 
      };
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveProduct() {
    if (!this.formData.name || (this.formData.price !== null && this.formData.price < 0) || (this.formData.stock !== null && this.formData.stock < 0)) return;

    if (this.editingProduct) {
      this.dataService.updateProduct(this.editingProduct.id, this.formData);
    } else {
      this.dataService.addProduct(this.formData);
    }
    this.closeModal();
  }

  exportToCSV() {
    const headers = ['ID', 'Nama', 'Kategori', 'Harga', 'Stok', 'Terakhir Diupdate'];
    const rows = this.products.map(p => [
      p.id,
      p.name,
      p.category,
      p.price,
      p.stock,
      p.lastUpdated
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Stok_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToPDF() {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString();

    doc.setFontSize(18);
    doc.text('Laporan Stok InventarisToko', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Tanggal Cetak: ${dateStr}`, 14, 30);

    const headers = [['ID', 'Nama Barang', 'Kategori', 'Harga', 'Stok']];
    const data = this.products.map(p => [
      p.id,
      p.name,
      p.category,
      `Rp ${p.price.toLocaleString('id-ID')}`,
      p.stock.toString()
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 36,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`Laporan_Stok_${dateStr}.pdf`);
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

