import { Injectable, signal } from '@angular/core';
export interface ConfirmCfg { title: string; message: string; resolve: (v: boolean) => void; }
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  cfg = signal<ConfirmCfg | null>(null);
  confirm(message: string, title = 'Are you sure?'): Promise<boolean> {
    return new Promise(r => this.cfg.set({ title, message, resolve: r }));
  }
  respond(v: boolean) { this.cfg()?.resolve(v); this.cfg.set(null); }
}
