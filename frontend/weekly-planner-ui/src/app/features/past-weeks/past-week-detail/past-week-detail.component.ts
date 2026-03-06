import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AppStateService } from '../../../core/services/app-state.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({ selector: 'app-past-week-detail', standalone: true, imports: [CommonModule, HeaderComponent], templateUrl: './past-week-detail.component.html' })
export class PastWeekDetailComponent implements OnInit {
  router = inject(Router); private route = inject(ActivatedRoute);
  state = inject(AppStateService); private api = inject(ApiService);
  loading = signal(false); tasks = signal<any[]>([]); week = signal<any>(null);

  planned = computed(() => this.tasks().reduce((s: number, t: any) => s + (t.plannedHours||0), 0));
  done = computed(() => this.tasks().reduce((s: number, t: any) => s + (t.completedHours||0), 0));
  pct = computed(() => this.planned() > 0 ? Math.min(100, Math.round((this.done()/this.planned())*100)) : 0);

  byMember = computed(() => {
    const ms = this.state.members(); const ts = this.tasks();
    const grp: any = {};
    ts.forEach((t: any) => { if (!grp[t.teamMemberId]) grp[t.teamMemberId] = { name: t.teamMemberName || ('Member '+t.teamMemberId), tasks: [] }; grp[t.teamMemberId].tasks.push(t); });
    return Object.values(grp);
  });

  ck(n: string) { if(n?.toLowerCase().includes('client')) return 'client'; if(n?.toLowerCase().includes('tech')) return 'tech'; return 'rnd'; }
  sBadge(s: string) { const x=(s||'').toLowerCase(); if(x==='done') return 'badge b-done'; if(x==='blocked') return 'badge b-block'; if(x==='in-progress') return 'badge b-prog'; return 'badge b-ns'; }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loading.set(true);
    this.week.set(this.state.weeks().find((w: any) => w.id === id));
    if (this.state.members().length === 0) this.api.getTeamMembers().subscribe((m: any[]) => this.state.members.set(m));
    this.api.getPlanTasks().subscribe({ next: (ts: any[]) => { this.tasks.set(ts.filter((t: any) => t.weeklyPlanId === id)); this.loading.set(false); }, error: () => this.loading.set(false) });
    if (!this.week()) this.api.getWeeklyPlan(id).subscribe((w: any) => this.week.set(w));
  }
}
