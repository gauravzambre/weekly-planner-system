import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AppStateService } from '../../core/services/app-state.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
    selector: 'app-category-detail',
    standalone: true,
    imports: [CommonModule, HeaderComponent],
    template: `
    <app-header backLabel="Team Progress" backRoute="/team-progress" [showSwitch]="true" [showHome]="false"></app-header>
    <div class="pw af">
      <div style="margin-bottom:24px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--primary);margin-bottom:8px">Category Drill-down</div>
        <h2 style="font-size:24px;font-weight:700">{{ categoryName() }}</h2>
      </div>

      <div *ngIf="loading()" class="sw"><div class="sp"></div></div>

      <ng-container *ngIf="!loading()">
        <!-- Summary stats -->
        <div class="g3" style="margin-bottom:24px">
          <div class="sc2"><div class="sv sv-p">{{ totalPct() }}%</div><div class="sl">Completion</div></div>
          <div class="sc2"><div class="sv sv-s">{{ totalDone() }}h</div><div class="sl">Done</div></div>
          <div class="sc2"><div class="sv sv-w">{{ totalPlanned() }}h</div><div class="sl">Planned</div></div>
        </div>

        <!-- Progress bar -->
        <div class="card" style="margin-bottom:24px">
          <div class="stitle">Overall Progress</div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:6px">
            <span>0h</span><span>{{ totalDone() }}h / {{ totalPlanned() }}h</span><span>{{ totalPlanned() }}h</span>
          </div>
          <div class="pb pb-lg"><div class="pf" [class]="'f-'+ck(categoryName())" [style.width.%]="totalPct()"></div></div>
        </div>

        <!-- Members breakdown -->
        <div class="stitle">Team Members in this Category</div>
        <div *ngFor="let m of memberRows()" class="card" style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="av av-s">{{ m.name[0] }}</div>
              <span style="font-weight:600;font-size:14px">{{ m.name }}</span>
            </div>
            <span style="font-family:'DM Mono',monospace;font-size:14px;color:var(--muted)">{{ m.pct }}%</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:6px">
            <span>{{ m.done }}h done</span><span>{{ m.planned }}h planned</span>
          </div>
          <div class="pb"><div class="pf" [class]="m.pct>=80?'f-s':m.pct>=40?'f-p':'f-w'" [style.width.%]="m.pct"></div></div>
          <!-- Tasks in this category for this member -->
          <div *ngIf="m.tasks.length>0" style="margin-top:12px">
            <div *ngFor="let t of m.tasks" style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:12px">
              <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
                <span [class]="sBadge(t.status)">{{ t.status||'not started' }}</span>
                <span style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:var(--muted)">{{ t.backlogItemTitle||'Task #'+t.backlogItemId }}</span>
              </div>
              <span style="font-family:'DM Mono',monospace;white-space:nowrap;flex-shrink:0;margin-left:8px;color:var(--muted)">{{ t.completedHours||0 }}/{{ t.plannedHours }}h</span>
            </div>
          </div>
        </div>

        <div *ngIf="memberRows().length===0" class="inf">No tasks found for this category.</div>
      </ng-container>
    </div>
  `
})
export class CategoryDetailComponent implements OnInit {
    Math = Math;
    private route = inject(ActivatedRoute);
    private api = inject(ApiService);
    state = inject(AppStateService);

    loading = signal(false);
    tasks = signal<any[]>([]);
    categoryName = signal('');

    memberRows = computed(() => {
        const ts = this.tasks();
        const ms = this.state.members();
        const catTasks = ts.filter((t: any) =>
            (t.categoryName || '').toLowerCase() === this.categoryName().toLowerCase()
        );
        // Group by member
        const memberIds = [...new Set(catTasks.map((t: any) => t.teamMemberId))];
        return memberIds.map(mid => {
            const member = ms.find((m: any) => m.id === mid) || { name: `Member #${mid}` };
            const mt = catTasks.filter((t: any) => t.teamMemberId === mid);
            const planned = mt.reduce((s: number, t: any) => s + (t.plannedHours || 0), 0);
            const done = mt.reduce((s: number, t: any) => s + (t.completedHours || 0), 0);
            const pct = planned > 0 ? Math.min(100, Math.round((done / planned) * 100)) : 0;
            return { ...member, tasks: mt, planned, done, pct };
        });
    });

    totalPlanned = computed(() => this.memberRows().reduce((s: number, m: any) => s + m.planned, 0));
    totalDone = computed(() => this.memberRows().reduce((s: number, m: any) => s + m.done, 0));
    totalPct = computed(() => this.totalPlanned() > 0 ? Math.min(100, Math.round((this.totalDone() / this.totalPlanned()) * 100)) : 0);

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

    ngOnInit() {
        this.categoryName.set(this.route.snapshot.paramMap.get('category') || '');
        this.loading.set(true);
        if (this.state.members().length === 0) {
            this.api.getTeamMembers().subscribe((m: any[]) => this.state.members.set(m));
        }
        this.api.getPlanTasks().subscribe({
            next: (t: any[]) => { this.tasks.set(t); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }
}
