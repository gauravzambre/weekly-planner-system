import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AppStateService } from '../../core/services/app-state.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({ selector: 'app-plan-my-work', standalone: true, imports: [CommonModule, FormsModule, HeaderComponent], templateUrl: './plan-my-work.component.html' })
export class PlanMyWorkComponent implements OnInit {
  Math = Math; state = inject(AppStateService);
  private api = inject(ApiService); private toast = inject(ToastService); private confirm = inject(ConfirmDialogService);
  loading = signal(false); showPicker = signal(false); pickItem = signal<any>(null); commitHours = 4; isReady = signal(false);
  allTasks = signal<any[]>([]);

  myTasks = computed(() => {
    const mid = this.state.currentUser()?.teamMemberId;
    return this.allTasks().filter((t: any) => t.teamMemberId === mid || String(t.userId) === String(this.state.currentUser()?.id));
  });
  planned = computed(() => this.myTasks().reduce((s: number, t: any) => s + (t.plannedHours || 0), 0));
  left = computed(() => 30 - this.planned());
  avail = computed(() => { const taken = new Set(this.myTasks().map((t: any) => t.backlogItemId)); return this.state.backlog().filter((b: any) => (b.status||'').toLowerCase()==='available' && !taken.has(b.id)); });
  pct() { return Math.min(100, Math.round((this.planned() / 30) * 100)); }

  ngOnInit() {
    this.loading.set(true);
    this.api.getBacklog().subscribe((b: any[]) => {
      this.state.backlog.set(b);
      this.api.getPlanTasks().subscribe({ next: (t: any[]) => { this.allTasks.set(t); this.loading.set(false); }, error: () => this.loading.set(false) });
    });
  }

  openPicker() { this.showPicker.set(true); this.pickItem.set(null); }
  selItem(item: any) { this.pickItem.set(item); this.commitHours = Math.min(item.estimatedHours || 4, this.left()); }

  addToPlan() {
    const item = this.pickItem(); if (!item || this.commitHours < 1 || this.commitHours > this.left()) return;
    const week = this.state.activeWeek(); if (!week) { this.toast.error('No active week.'); return; }
    this.api.createPlanTask({ weeklyPlanId: week.id, backlogItemId: item.id, teamMemberId: this.state.currentUser()?.teamMemberId, plannedHours: this.commitHours, userId: this.state.currentUser()?.id })
      .subscribe({ next: (t: any) => {
        this.allTasks.update((a: any[]) => [...a, { ...t, backlogItemTitle: item.title, categoryName: item.categoryName, categoryId: item.categoryId }]);
        this.pickItem.set(null); this.showPicker.set(false);
        this.toast.success(item.title + ' added!');
      }});
  }

  async removeTask(task: any) {
    const ok = await this.confirm.confirm('Remove "' + (task.backlogItemTitle || 'this task') + '"?');
    if (!ok) return;
    this.api.deletePlanTask(task.id).subscribe({ next: () => { this.allTasks.update((a: any[]) => a.filter((x: any) => x.id !== task.id)); this.toast.info('Removed.'); }});
  }

  toggleReady() { this.isReady.update(v => !v); this.toast.success(this.isReady() ? 'You\'re marked as ready!' : 'Unmarked.'); }
  ck(n: string) { if (n?.toLowerCase().includes('client')) return 'client'; if (n?.toLowerCase().includes('tech')) return 'tech'; return 'rnd'; }
  cColor(n: string) { const k=this.ck(n); return k==='client'?'var(--client)':k==='tech'?'var(--tech)':'var(--rnd)'; }
}
