import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AppStateService } from '../../core/services/app-state.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
    selector: 'app-backlog-item-detail',
    standalone: true,
    imports: [CommonModule, HeaderComponent],
    template: `
    <app-header backLabel="Backlog" backRoute="/backlog" [showSwitch]="true" [showHome]="false"></app-header>
    <div class="pw af">
      <div *ngIf="loading()" class="sw"><div class="sp"></div></div>

      <ng-container *ngIf="!loading() && item()">
        <!-- Item header -->
        <div style="margin-bottom:24px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--primary);margin-bottom:8px">Backlog Item</div>
          <h2 style="font-size:22px;font-weight:700;margin-bottom:8px">{{ item().title }}</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <span [class]="'badge b-'+ck(item().categoryName)">{{ item().categoryName || 'Uncategorised' }}</span>
            <span *ngIf="item().isArchived" class="badge b-block">Archived</span>
            <span *ngIf="!item().isArchived" class="badge b-done">Active</span>
          </div>
        </div>

        <!-- Description -->
        <div *ngIf="item().description" class="card" style="margin-bottom:20px">
          <div class="stitle">Description</div>
          <p style="color:var(--muted);font-size:14px;line-height:1.6;margin:0">{{ item().description }}</p>
        </div>

        <!-- Metadata -->
        <div class="g2" style="margin-bottom:24px">
          <div class="sc2">
            <div class="sv" style="font-size:18px;color:var(--fg)">{{ item().estimatedHours || '—' }}h</div>
            <div class="sl">Estimated Hours</div>
          </div>
          <div class="sc2">
            <div class="sv" style="font-size:16px;color:var(--fg)">{{ item().priority || '—' }}</div>
            <div class="sl">Priority</div>
          </div>
        </div>

        <!-- Planning history -->
        <div class="stitle" style="margin-bottom:12px">Planning History</div>
        <div *ngIf="history().length === 0" class="inf">This item hasn't been planned in any week yet.</div>
        <div *ngFor="let h of history()" class="card" style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <div>
              <div style="font-weight:600;font-size:14px">Week of {{ h.weekStart | date:'mediumDate' }}</div>
              <div style="font-size:12px;color:var(--muted);margin-top:2px">{{ h.memberName }}</div>
            </div>
            <span [class]="sBadge(h.status)">{{ h.status || 'not started' }}</span>
          </div>
          <div style="display:flex;gap:16px;font-size:12px;color:var(--muted)">
            <span>Planned: {{ h.plannedHours }}h</span>
            <span>Actual: {{ h.completedHours || 0 }}h</span>
          </div>
          <div class="pb" style="margin-top:8px">
            <div class="pf" [class]="sBg(h.status)" [style.width.%]="h.plannedHours>0 ? Math.min(100,Math.round(((h.completedHours||0)/h.plannedHours)*100)) : 0"></div>
          </div>
        </div>
      </ng-container>

      <div *ngIf="!loading() && !item()" class="wrn">Item not found.</div>
    </div>
  `
})
export class BacklogItemDetailComponent implements OnInit {
    Math = Math;
    private route = inject(ActivatedRoute);
    private api = inject(ApiService);
    state = inject(AppStateService);

    loading = signal(false);
    item = signal<any>(null);
    history = signal<any[]>([]);

    ck(n: string) {
        if (n?.toLowerCase().includes('client')) return 'client';
        if (n?.toLowerCase().includes('tech')) return 'tech';
        return 'rnd';
    }
    sBadge(s: string) {
        const x = (s || '').toLowerCase();
        if (x === 'done') return 'badge b-done';
        if (x === 'blocked') return 'badge b-block';
        if (x === 'in-progress') return 'badge b-prog';
        return 'badge b-ns';
    }
    sBg(s: string) {
        const x = (s || '').toLowerCase();
        if (x === 'done') return 'f-s';
        if (x === 'blocked') return 'f-w';
        if (x === 'in-progress') return 'f-p';
        return 'f-p';
    }

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.loading.set(true);

        // Load backlog item details and all plan tasks for this item
        this.api.getBacklog().subscribe({
            next: (items: any[]) => {
                const found = items.find((i: any) => i.id === id);
                this.item.set(found || null);
            },
            error: () => { }
        });

        this.api.getPlanTasks().subscribe({
            next: (tasks: any[]) => {
                const members = this.state.members();
                const weeks = this.state.weeks();
                const related = tasks
                    .filter((t: any) => t.backlogItemId === id)
                    .map((t: any) => {
                        const member = members.find((m: any) => m.id === t.teamMemberId);
                        const week = weeks.find((w: any) => w.id === t.weeklyPlanId);
                        return {
                            ...t,
                            memberName: member?.name || `Member #${t.teamMemberId}`,
                            weekStart: week?.startDate || null
                        };
                    })
                    .sort((a: any, b: any) => (b.weekStart || '').localeCompare(a.weekStart || ''));
                this.history.set(related);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }
}
