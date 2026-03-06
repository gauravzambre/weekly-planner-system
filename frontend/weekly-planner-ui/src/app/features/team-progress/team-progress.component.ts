import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AppStateService } from '../../core/services/app-state.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({ selector: 'app-team-progress', standalone: true, imports: [CommonModule, HeaderComponent], templateUrl: './team-progress.component.html' })
export class TeamProgressComponent implements OnInit {
  Math = Math; state = inject(AppStateService); router = inject(Router); private api = inject(ApiService);
  loading = signal(false); tasks = signal<any[]>([]);

  members = computed(() => {
    const ms = this.state.members(); const ts = this.tasks();
    return ms.map((m: any) => {
      const mt = ts.filter((t: any) => t.teamMemberId === m.id);
      const planned = mt.reduce((s: number, t: any) => s + (t.plannedHours || 0), 0);
      const done = mt.reduce((s: number, t: any) => s + (t.completedHours || 0), 0);
      const pct = planned > 0 ? Math.min(100, Math.round((done / planned) * 100)) : 0;
      return { ...m, tasks: mt, planned, done, pct };
    });
  });

  totalPlanned = computed(() => this.tasks().reduce((s: number, t: any) => s + (t.plannedHours || 0), 0));
  totalDone = computed(() => this.tasks().reduce((s: number, t: any) => s + (t.completedHours || 0), 0));
  teamPct = computed(() => this.totalPlanned() > 0 ? Math.min(100, Math.round((this.totalDone() / this.totalPlanned()) * 100)) : 0);

  cats = computed(() => {
    const ts = this.tasks(); const names = [...new Set(ts.map((t: any) => t.categoryName || '').filter(Boolean))];
    return names.map((n: string) => {
      const ct = ts.filter((t: any) => t.categoryName === n);
      const pl = ct.reduce((s: number, t: any) => s + (t.plannedHours || 0), 0);
      const dn = ct.reduce((s: number, t: any) => s + (t.completedHours || 0), 0);
      return { name: n, planned: pl, done: dn, pct: pl > 0 ? Math.min(100, Math.round((dn / pl) * 100)) : 0 };
    });
  });

  ck(n: string) { if (n?.toLowerCase().includes('client')) return 'client'; if (n?.toLowerCase().includes('tech')) return 'tech'; return 'rnd'; }
  sBadge(s: string) { const x = (s || '').toLowerCase(); if (x === 'done') return 'badge b-done'; if (x === 'blocked') return 'badge b-block'; if (x === 'in-progress') return 'badge b-prog'; return 'badge b-ns'; }

  ngOnInit() {
    this.loading.set(true);
    if (this.state.members().length === 0) this.api.getTeamMembers().subscribe((m: any[]) => this.state.members.set(m));
    this.api.getPlanTasks().subscribe({ next: (t: any[]) => { this.tasks.set(t); this.loading.set(false); }, error: () => this.loading.set(false) });
  }
}
