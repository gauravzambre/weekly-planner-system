import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AppStateService } from '../../core/services/app-state.service';
import { ToastService } from '../../core/services/toast.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({ selector: 'app-update-progress', standalone: true, imports: [CommonModule, FormsModule, HeaderComponent], templateUrl: './update-progress.component.html' })
export class UpdateProgressComponent implements OnInit {
  Math = Math; state = inject(AppStateService);
  private api = inject(ApiService); private toast = inject(ToastService);
  loading = signal(false); saving = signal(false); editId = signal(0); editHours = 0; editStatus = 'in-progress';
  rawTasks = signal<any[]>([]);

  myTasks = computed(() => {
    const mid = this.state.currentUser()?.teamMemberId;
    return this.rawTasks().filter((t: any) => t.teamMemberId === mid || String(t.userId) === String(this.state.currentUser()?.id));
  });
  totalDone = computed(() => this.myTasks().reduce((s: number, t: any) => s + (t.completedHours||0), 0));
  pct = computed(() => { const p = this.myTasks().reduce((s: number, t: any) => s + (t.plannedHours||0), 0); return p > 0 ? Math.min(100, Math.round((this.totalDone()/p)*100)) : 0; });
  allDone = computed(() => this.myTasks().length > 0 && this.myTasks().every((t: any) => t.status === 'done'));

  ck(n: string) { if(n?.toLowerCase().includes('client')) return 'client'; if(n?.toLowerCase().includes('tech')) return 'tech'; return 'rnd'; }
  sBadge(s: string) { const x=(s||'').toLowerCase(); if(x==='done') return 'badge b-done'; if(x==='blocked') return 'badge b-block'; if(x==='in-progress') return 'badge b-prog'; return 'badge b-ns'; }

  ngOnInit() {
    this.loading.set(true);
    this.api.getPlanTasks().subscribe({ next: (t: any[]) => { this.rawTasks.set(t); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  openEdit(t: any) { this.editId.set(t.id); this.editHours = t.completedHours || 0; this.editStatus = t.status || 'in-progress'; }

  saveProgress(task: any) {
    this.saving.set(true);
    this.api.updatePlanTaskProgress(task.id, { completedHours: +this.editHours, status: this.editStatus }).subscribe({
      next: (u: any) => { this.rawTasks.update((ts: any[]) => ts.map((t: any) => t.id===u.id ? {...t,...u} : t)); this.editId.set(0); this.saving.set(false); this.toast.success('Progress saved!'); },
      error: () => this.saving.set(false)
    });
  }
}
