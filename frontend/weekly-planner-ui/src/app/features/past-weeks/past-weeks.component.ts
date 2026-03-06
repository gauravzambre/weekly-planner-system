import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AppStateService } from '../../core/services/app-state.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({ selector: 'app-past-weeks', standalone: true, imports: [CommonModule, HeaderComponent], templateUrl: './past-weeks.component.html' })
export class PastWeeksComponent implements OnInit {
  router = inject(Router); state = inject(AppStateService); private api = inject(ApiService);
  loading = signal(false); tasks = signal<any[]>([]);

  weeks = computed(() => {
    const ts = this.tasks();
    return this.state.pastWeeks().map((w: any) => {
      const wt = ts.filter((t: any) => t.weeklyPlanId === w.id);
      const pl = wt.reduce((s: number, t: any) => s + (t.plannedHours||0), 0);
      const dn = wt.reduce((s: number, t: any) => s + (t.completedHours||0), 0);
      const pct = pl > 0 ? Math.min(100, Math.round((dn/pl)*100)) : 0;
      return { ...w, tasks: wt, planned: pl, done: dn, pct };
    });
  });

  ngOnInit() {
    this.loading.set(true);
    this.api.getWeeklyPlans().subscribe((ws: any[]) => {
      this.state.weeks.set(ws);
      this.api.getPlanTasks().subscribe({ next: (t: any[]) => { this.tasks.set(t); this.loading.set(false); }, error: () => this.loading.set(false) });
    });
  }
}
