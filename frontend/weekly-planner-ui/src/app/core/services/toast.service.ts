import { Injectable, signal } from '@angular/core';
export interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }
@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  show(message: string, type: 'success' | 'error' | 'info' = 'success') {
    const id = Math.random().toString(36).slice(2);
    this.toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.dismiss(id), 3500);
  }
  dismiss(id: string) { this.toasts.update(t => t.filter(x => x.id !== id)); }
  success(m: string) { this.show(m, 'success'); }
  error(m: string) { this.show(m, 'error'); }
  info(m: string) { this.show(m, 'info'); }
}
