import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AppStateService } from '../../core/services/app-state.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({ selector: 'app-review-freeze', standalone: true, imports: [CommonModule, HeaderComponent], templateUrl: './review-freeze.component.html' })
export class ReviewFreezeComponent implements OnInit {
  router = inject(Router); state = inject(AppStateService);
  private api = inject(ApiService); private toast = inject(ToastService); private confirm = inject(ConfirmDialogService);
  loading = signal(false); freezing = signal(false);
  tasks = signal<any[]>([]); allocs = signal<any[]>([]);

  members = computed(() => {
    const ms = this.state.members(); const ts = this.tasks();
    return ms.map((m: any) => {
      const mt = ts.filter((t: any) => t.teamMemberId === m.id);
      return { ...m, tasks: mt, totalHours: mt.reduce((s: number, t: any) => s + (t.plannedHours || 0), 0) };
    });
  });

  catRows = computed(() => {
    const ts = this.tasks(); const al = this.allocs();
    const total = ts.reduce((s: number, t: any) => s + (t.plannedHours || 0), 0);
    return al.map((a: any) => {
      const pl = ts.filter((t: any) => t.categoryId === a.categoryId).reduce((s: number, t: any) => s + (t.plannedHours || 0), 0);
      const bud = Math.round((a.percentage / 100) * total);
      return { name: a.categoryName || ('Cat ' + a.categoryId), planned: pl, budget: bud, pct: a.percentage, over: pl > bud };
    });
  });

  issues = computed(() => {
    const iss: string[] = [];
    this.members().forEach((m: any) => {
      if (m.tasks.length === 0) iss.push(m.name + ' has no items planned.');
    });
    return iss;
  });

  ck(n: string) { if (n?.toLowerCase().includes('client')) return 'b-cli'; if (n?.toLowerCase().includes('tech')) return 'b-tech'; return 'b-rnd'; }

  ngOnInit() {
    this.loading.set(true);
    const week = this.state.activeWeek();
    this.api.getPlanTasks().subscribe((ts: any[]) => {
      this.tasks.set(ts);
      if (week) {
        this.api.getCategoryAllocation(week.id).subscribe({ next: (al: any[]) => { this.allocs.set(al); this.loading.set(false); }, error: () => this.loading.set(false) });
      } else { this.loading.set(false); }
    });
    if (this.state.members().length === 0) this.api.getTeamMembers().subscribe((m: any[]) => this.state.members.set(m));
  }

  async freeze() {
    const ok = await this.confirm.confirm('Freeze the plan? No more changes after this.', 'Freeze Plan');
    if (!ok) return;
    const week = this.state.activeWeek(); if (!week) return;
    this.freezing.set(true);
    this.api.finalizeWeeklyPlan(week.id).subscribe({
      next: (u: any) => { this.state.weeks.update((ws: any[]) => ws.map((w: any) => w.id === u.id ? u : w)); this.toast.success('Plan frozen! ❄️'); this.router.navigate(['/dashboard']); },
      error: () => this.freezing.set(false)
    });
  }

  async cancel() {
    const ok = await this.confirm.confirm('Cancel planning? All tasks will be lost.', 'Cancel');
    if (!ok) return;
    this.state.weeks.update((ws: any[]) => ws.filter((w: any) => w.isFrozen));
    this.toast.info('Planning cancelled.'); this.router.navigate(['/dashboard']);
  }
}
