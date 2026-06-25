import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  notes?: string;
  image?: string;
  lastUpdated: Date;
}

export interface StockHistory {
  id: string;
  productId: string;
  productName: string;
  details: string; 
  quantityChange: number;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  public categories = ['Makanan & Minuman', 'Pakaian & Aksesoris', 'Kesehatan & Kecantikan', 'Perlengkapan Rumah', 'Elektronik & Gadget', 'Lainnya'];

  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  private historySubject = new BehaviorSubject<StockHistory[]>([]);
  public history$ = this.historySubject.asObservable();

  private authService = inject(AuthService);

  constructor() {
    this.loadInitialData();
  }

  public reloadForCurrentUser() {
    this.loadInitialData();
  }

  private loadInitialData() {
    const user = this.authService.getCurrentUser();
    const savedProducts = localStorage.getItem(`inv_products_v2_${user}`);
    const savedHistory = localStorage.getItem(`inv_history_v2_${user}`);

    let loadedProducts: Product[] = [];
    if (savedProducts) {
      loadedProducts = JSON.parse(savedProducts);
      this.productsSubject.next(loadedProducts);
    } else {
      this.productsSubject.next([]);
    }
    
    if (savedHistory) {
      this.historySubject.next(JSON.parse(savedHistory));
    } else {
      this.historySubject.next([]);
    }
  }



  private persistData() {
    const user = this.authService.getCurrentUser();
    localStorage.setItem(`inv_products_v2_${user}`, JSON.stringify(this.productsSubject.getValue()));
    localStorage.setItem(`inv_history_v2_${user}`, JSON.stringify(this.historySubject.getValue()));
  }

  private addLog(productId: string, productName: string, details: string, quantityChange: number) {
    const logs = this.historySubject.getValue();
    const newLog: StockHistory = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2,5)}`,
      productId,
      productName,
      details,
      quantityChange,
      timestamp: new Date()
    };
    logs.unshift(newLog); // Put new at the top
    this.historySubject.next(logs);
  }

  // --- Products CRUD ---
  getProductsValue() {
    return this.productsSubject.getValue();
  }

  addProduct(p: Omit<Product, 'id' | 'lastUpdated'>) {
    const current = this.getProductsValue();
    const newProduct: Product = {
      ...p,
      price: p.price ?? 0,
      stock: p.stock ?? 0,
      id: `prod_${Date.now()}`,
      lastUpdated: new Date()
    };
    current.unshift(newProduct);
    this.productsSubject.next([...current]);
    this.addLog(newProduct.id, newProduct.name, `Barang Baru Ditambahkan`, newProduct.stock);
    this.persistData();
  }

  updateProduct(id: string, updates: Partial<Product>) {
    const current = this.getProductsValue();
    const idx = current.findIndex(p => p.id === id);
    if (idx !== -1) {
      const sanitizedUpdates = {
        ...updates,
        price: updates.price ?? current[idx].price,
        stock: updates.stock ?? current[idx].stock
      };
      current[idx] = { ...current[idx], ...sanitizedUpdates, lastUpdated: new Date() };
      this.productsSubject.next([...current]);
      this.addLog(id, current[idx].name, `Informasi Barang Diupdate`, 0);
      this.persistData();
    }
  }

  deleteProduct(id: string) {
    const current = this.getProductsValue();
    const target = current.find(p => p.id === id);
    if (target) {
      const remaining = current.filter(p => p.id !== id);
      this.productsSubject.next(remaining);
      this.addLog(id, target.name, `Barang Dihapus`, 0);
      this.persistData();
    }
  }

  updateStock(id: string, changeAmount: number) {
    if (changeAmount === 0) return;
    const current = this.getProductsValue();
    const idx = current.findIndex(p => p.id === id);
    if (idx !== -1) {
      const newStock = Math.max(0, current[idx].stock + changeAmount);
      const actualChange = newStock - current[idx].stock; 
      
      if (actualChange !== 0) {
        current[idx].stock = newStock;
        current[idx].lastUpdated = new Date();
        this.productsSubject.next([...current]);
        
        const details = actualChange > 0 ? `Penambahan Stok (+${actualChange})` : `Pengurangan Stok (${actualChange})`;
        this.addLog(id, current[idx].name, details, actualChange);
        this.persistData();
      }
    }
  }
}
