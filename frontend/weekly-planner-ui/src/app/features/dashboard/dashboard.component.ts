import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AppStateService } from '../../core/services/app-state.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({ selector: 'app-dashboard', standalone: true, imports: [CommonModule, HeaderComponent], templateUrl: './dashboard.component.html' })
export class DashboardComponent implements OnInit {
  state = inject(AppStateService); router = inject(Router);
  private api = inject(ApiService); private toast = inject(ToastService);
  private confirm = inject(ConfirmDialogService);
  activeWeek = this.state.activeWeek;

  ngOnInit() { this.api.getWeeklyPlans().subscribe({ next: (d: any[]) => this.state.weeks.set(d), error: () => { } }); }

  async cancelWeek() {
    const ok = await this.confirm.confirm('Cancel this week\'s planning?', 'Cancel Planning');
    if (!ok) return;
    this.state.weeks.update((ws: any[]) => ws.filter((w: any) => w.isFrozen));
    this.toast.info('Planning cancelled.');
  }

  async finishWeek() {
    const week = this.activeWeek();
    if (!week) return;
    const ok = await this.confirm.confirm('Mark this week as complete? This cannot be undone.', 'Finish Week');
    if (!ok) return;
    this.api.finalizeWeeklyPlan(week.id).subscribe({
      next: () => {
        this.state.weeks.update((ws: any[]) => ws.map((w: any) => w.id === week.id ? { ...w, isFinished: true, isFrozen: true } : w));
        this.toast.success('Week completed! Great work everyone 🎉');
      },
      error: () => this.toast.error('Failed to finalize week. Please try again.')
    });
  }
}
