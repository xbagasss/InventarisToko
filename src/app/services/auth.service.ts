import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.checkToken());
  public isLoggedIn$ = this.loggedIn.asObservable();

  constructor() {
    this.initializeUsers();
  }

  private initializeUsers() {
    const users = localStorage.getItem('users');
    if (!users) {
      // Default behavior
      const defaultUsers = [{ username: 'admin', password: 'admin' }];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  }

  getUsers(): any[] {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }

  private checkToken(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  login(user: string, pass: string): boolean {
    const users = this.getUsers();
    const foundUser = users.find(u => u.username === user && u.password === pass);

    if (foundUser) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', user);
      this.loggedIn.next(true);
      return true;
    }
    return false;
  }

  register(user: string, pass: string): boolean {
    const users = this.getUsers();
    const exists = users.find(u => u.username === user);
    if (exists) {
      return false; // User already exists
    }
    users.push({ username: user, password: pass });
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  }

  resetPassword(user: string, newPass: string): boolean {
    const users = this.getUsers();
    const index = users.findIndex(u => u.username === user);
    if (index !== -1) {
      users[index].password = newPass;
      localStorage.setItem('users', JSON.stringify(users));
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    this.loggedIn.next(false);
  }

  isAuthenticated(): boolean {
    return this.loggedIn.value;
  }

  getCurrentUser(): string {
    return localStorage.getItem('currentUser') || 'admin';
  }
}
