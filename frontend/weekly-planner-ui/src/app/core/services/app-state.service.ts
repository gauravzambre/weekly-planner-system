import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  members = signal<any[]>([]);
  backlog = signal<any[]>([]);
  weeks = signal<any[]>([]);
  categories = signal<any[]>([]);
  currentUser = signal<any>(null);

  activeWeek = computed(() => this.weeks().find((w: any) => !w.isFrozen) ?? null);
  pastWeeks = computed(() => this.weeks().filter((w: any) => w.isFrozen).sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
  isLead = computed(() => { const u = this.currentUser(); return u && u.role && u.role.toLowerCase() === 'lead'; });

  setCurrentUser(u: any) { this.currentUser.set(u); if (u) sessionStorage.setItem('wpt_u', JSON.stringify(u)); else sessionStorage.removeItem('wpt_u'); }
  loadCurrentUser() { const s = sessionStorage.getItem('wpt_u'); if (s) { try { this.currentUser.set(JSON.parse(s)); } catch {} } }
  clearCurrentUser() { this.currentUser.set(null); sessionStorage.removeItem('wpt_u'); }
}
