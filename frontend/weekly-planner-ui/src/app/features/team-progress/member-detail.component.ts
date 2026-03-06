import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AppStateService } from '../../core/services/app-state.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
    selector: 'app-member-detail',
    standalone: true,
    imports: [CommonModule, HeaderComponent],
    template: `
    <app-header backLabel="Team Progress" backRoute="/team-progress" [showSwitch]="true" [showHome]="false"></app-header>
    <div class="pw af">
      <div *ngIf="loading()" class="sw"><div class="sp"></div></div>

      <ng-container *ngIf="!loading()">
        <!-- Member header -->
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
          <div class="av" style="width:52px;height:52px;font-size:22px;line-height:52px;text-align:center;border-radius:50%;background:var(--surface2);font-weight:700">
            {{ member()?.name?.[0] || '?' }}
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--primary);margin-bottom:4px">Member Plan</div>
            <h2 style="font-size:24px;font-weight:700;margin:0">{{ member()?.name || 'Member' }}</h2>
            <span [class]="member()?.role?.toLowerCase()==='lead'?'badge b-lead':'badge b-mem'" style="margin-top:4px">{{ member()?.role }}</span>
          </div>
        </div>

        <!-- Summary stats -->
        <div class="g3" style="margin-bottom:24px">
          <div class="sc2"><div class="sv sv-p">{{ pct() }}%</div><div class="sl">Completion</div></div>
          <div class="sc2"><div class="sv sv-s">{{ totalDone() }}h</div><div class="sl">Done</div></div>
          <div class="sc2"><div class="sv sv-w">{{ totalPlanned() }}h</div><div class="sl">Planned</div></div>
        </div>

        <!-- Progress bar -->
        <div class="card" style="margin-bottom:24px">
          <div class="stitle">Overall Progress</div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:6px">
            <span>0h</span><span>{{ totalDone() }}h / {{ totalPlanned() }}h</span><span>{{ totalPlanned() }}h</span>
          </div>
          <div class="pb pb-lg"><div class="pf" [class]="pct()>=80?'f-s':pct()>=40?'f-p':'f-w'" [style.width.%]="pct()"></div></div>
        </div>

        <!-- Tasks by category -->
        <div *ngFor="let cat of catGroups()" style="margin-bottom:16px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span [class]="'badge b-'+ck(cat.name)">{{ cat.name }}</span>
            <span style="font-size:12px;color:var(--muted)">{{ cat.done }}h / {{ cat.planned }}h</span>
          </div>
          <div class="card">
            <div *ngFor="let t of cat.tasks; let last=last"
              style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;font-size:13px"
              [style.border-bottom]="!last ? '1px solid rgba(255,255,255,.06)' : 'none'">
              <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
                <span [class]="sBadge(t.status)">{{ t.status||'not started' }}</span>
                <span style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:var(--fg)">{{ t.backlogItemTitle||'Task #'+t.backlogItemId }}</span>
              </div>
              <span style="font-family:'DM Mono',monospace;white-space:nowrap;flex-shrink:0;margin-left:8px;color:var(--muted)">{{ t.completedHours||0 }}/{{ t.plannedHours }}h</span>
            </div>
          </div>
        </div>

        <div *ngIf="tasks().length===0" class="inf">No tasks planned for this member in the current week.</div>
      </ng-container>
    </div>
  `
})
export class MemberDetailComponent implements OnInit {
    Math = Math;
    private route = inject(ActivatedRoute);
    private api = inject(ApiService);
    state = inject(AppStateService);

    loading = signal(false);
    tasks = signal<any[]>([]);
    memberId = signal<number>(0);

    member = computed(() => this.state.members().find((m: any) => m.id === this.memberId()) || null);

    totalPlanned = computed(() => this.tasks().reduce((s: number, t: any) => s + (t.plannedHours || 0), 0));
    totalDone = computed(() => this.tasks().reduce((s: number, t: any) => s + (t.completedHours || 0), 0));
    pct = computed(() => this.totalPlanned() > 0 ? Math.min(100, Math.round((this.totalDone() / this.totalPlanned()) * 100)) : 0);

    catGroups = computed(() => {
        const ts = this.tasks();
        const catNames: string[] = [...new Set(ts.map((t: any) => t.categoryName || 'Uncategorised'))];
        return catNames.map(n => {
            const ct = ts.filter((t: any) => (t.categoryName || 'Uncategorised') === n);
            const pl = ct.reduce((s: number, t: any) => s + (t.plannedHours || 0), 0);
            const dn = ct.reduce((s: number, t: any) => s + (t.completedHours || 0), 0);
            return { name: n, tasks: ct, planned: pl, done: dn };
        });
    });

    ck(n: string) {
        if (n?.toLowerCase().includes('client')) return 'client';
        if (n?.toLowerCase().includes('tech')) return 'tech';
        if (n?.toLowerCase().includes('r&d') || n?.toLowerCase().includes('rnd')) return 'rnd';
        return 'client';
    }
    sBadge(s: string) {
        const x = (s || '').toLowerCase();
        if (x === 'done') return 'badge b-done';
        if (x === 'blocked') return 'badge b-block';
        if (x === 'in-progress') return 'badge b-prog';
        return 'badge b-ns';
    }

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('memberId'));
        this.memberId.set(id);
        this.loading.set(true);
        if (this.state.members().length === 0) {
            this.api.getTeamMembers().subscribe((m: any[]) => this.state.members.set(m));
        }
        this.api.getPlanTasksByMember(id).subscribe({
            next: (t: any[]) => { this.tasks.set(t); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }
}
