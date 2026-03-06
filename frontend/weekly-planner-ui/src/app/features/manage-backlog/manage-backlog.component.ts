import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AppStateService } from '../../core/services/app-state.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({ selector: 'app-manage-backlog', standalone: true, imports: [CommonModule, FormsModule, HeaderComponent], templateUrl: './manage-backlog.component.html' })
export class ManageBacklogComponent implements OnInit {
  router = inject(Router); private api = inject(ApiService); state = inject(AppStateService);
  private toast = inject(ToastService); private confirm = inject(ConfirmDialogService);
  loading = signal(false); statusFilter = 'available'; selCats = signal<string[]>([]); allCats = signal<string[]>([]);

  filtered = computed(() => {
    let items = this.state.backlog();
    if (this.selCats().length > 0) items = items.filter((i: any) => this.selCats().includes(i.categoryName || ''));
    if (this.statusFilter !== 'all') items = items.filter((i: any) => (i.status || '').toLowerCase() === this.statusFilter);
    return items;
  });

  ngOnInit() {
    this.loading.set(true);
    this.api.getBacklog().subscribe({ next: (d: any[]) => {
      this.state.backlog.set(d);
      this.allCats.set([...new Set(d.map((x: any) => x.categoryName || '').filter(Boolean))]);
      this.loading.set(false);
    }, error: () => this.loading.set(false) });
  }

  toggleCat(c: string) { this.selCats.update((a: string[]) => a.includes(c) ? a.filter((x: string) => x !== c) : [...a, c]); }
  ck(n: string) { if (n?.toLowerCase().includes('client')) return 'client'; if (n?.toLowerCase().includes('tech')) return 'tech'; return 'rnd'; }
  cBadge(n: string) { return 'badge b-' + this.ck(n); }
  cBg(n: string) { const k = this.ck(n); return k==='client'?'rgba(79,124,255,.2)':k==='tech'?'rgba(249,115,22,.2)':'rgba(54,211,153,.15)'; }
  cColor(n: string) { const k = this.ck(n); return k==='client'?'var(--client)':k==='tech'?'var(--tech)':'var(--rnd)'; }
  sBadge(s: string) { const x=(s||'').toLowerCase(); if(x==='available') return 'badge b-avail'; if(x==='completed') return 'badge b-done'; return 'badge b-arch'; }
  stripeClass(n: string) { const k=this.ck(n); return 'card sc-'+k; }
  stripeStyle(n: string) { const k=this.ck(n); return k==='client'?{'border-left':'3px solid var(--client)'}:k==='tech'?{'border-left':'3px solid var(--tech)'}:{'border-left':'3px solid var(--rnd)'}; }

  async archive(item: any) {
    const ok = await this.confirm.confirm('Archive "' + item.title + '"?', 'Archive Item');
    if (!ok) return;
    this.api.updateBacklogItem(item.id, { ...item, status: 'archived' }).subscribe({
      next: () => { this.state.backlog.update((a: any[]) => a.map((b: any) => b.id===item.id ? {...b,status:'archived'} : b)); this.toast.success('Archived.'); }
    });
  }
}
