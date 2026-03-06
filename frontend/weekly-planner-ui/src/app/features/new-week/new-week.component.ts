import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AppStateService } from '../../core/services/app-state.service';
import { ToastService } from '../../core/services/toast.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({ selector: 'app-new-week', standalone: true, imports: [CommonModule, FormsModule, HeaderComponent], templateUrl: './new-week.component.html' })
export class NewWeekComponent implements OnInit {
  router = inject(Router); private api = inject(ApiService); state = inject(AppStateService); private toast = inject(ToastService);
  cats = signal<any[]>([]); selMembers = signal<number[]>([]); allocs: { [id: number]: number } = {}; startDate = ''; saving = signal(false);
  allocSum = computed(() => Object.values(this.allocs).reduce((s, v) => s + (+v || 0), 0));
  isTuesday = computed(() => { if (!this.startDate) return false; const d = new Date(this.startDate + 'T12:00:00'); return d.getDay() === 2; });
  overAllocated = computed(() => this.allocSum() > 100);
  canSubmit = computed(() => !!this.startDate && this.isTuesday() && this.selMembers().length > 0 && this.allocSum() === 100);

  ngOnInit() {
    if (this.state.members().length === 0) {
      this.api.getTeamMembers().subscribe((m: any[]) => { this.state.members.set(m); this.selMembers.set(m.map((x: any) => x.id)); });
    } else { this.selMembers.set(this.state.members().map((m: any) => m.id)); }
    this.api.getCategories().subscribe((c: any[]) => {
      this.cats.set(c);
      const eq = Math.floor(100 / c.length);
      c.forEach((cat: any, i: number) => { this.allocs[cat.id] = i === c.length - 1 ? 100 - eq * (c.length - 1) : eq; });
    });
  }

  toggleMember(id: number) { this.selMembers.update((a: number[]) => a.includes(id) ? a.filter((x: number) => x !== id) : [...a, id]); }
  ga(id: number) { return this.allocs[id] || 0; }
  sa(id: number, v: any) { this.allocs[id] = +v || 0; }
  cc(n: string) { if (n?.toLowerCase().includes('client')) return 'var(--client)'; if (n?.toLowerCase().includes('tech')) return 'var(--tech)'; return 'var(--rnd)'; }

  submit() {
    if (!this.canSubmit()) return;
    this.saving.set(true);
    this.api.createWeeklyPlan({ startDate: this.startDate }).subscribe({
      next: (plan: any) => {
        this.state.weeks.update((w: any[]) => [...w, plan]);
        this.cats().forEach((c: any) => this.api.createCategoryAllocation({ weeklyPlanId: plan.id, categoryId: c.id, percentage: this.ga(c.id) }).subscribe());
        this.toast.success('Planning is open!'); this.saving.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => this.saving.set(false)
    });
  }
}
