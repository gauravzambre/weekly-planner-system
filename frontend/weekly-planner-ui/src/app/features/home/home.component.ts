import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AppStateService } from '../../core/services/app-state.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({ selector: 'app-home', standalone: true, imports: [CommonModule, HeaderComponent], templateUrl: './home.component.html' })
export class HomeComponent implements OnInit {
  private api = inject(ApiService); state = inject(AppStateService);
  private toast = inject(ToastService); private confirm = inject(ConfirmDialogService);
  router = inject(Router); loading = signal(false);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.getTeamMembers().subscribe({ next: (d: any[]) => { this.state.members.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  pick(m: any) {
    this.state.setCurrentUser({ id: String(m.id), name: m.name, role: m.role, teamMemberId: m.id });
    this.router.navigate(['/dashboard']);
  }

  seed() { this.loading.set(true); this.api.seed().subscribe({ next: () => { this.toast.success('Sample data seeded!'); this.load(); }, error: () => this.loading.set(false) }); }

  export() {
    this.api.exportData().subscribe({
      next: (d: any) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }));
        a.download = 'wpt-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
        this.toast.success('Exported!');
      }
    });
  }

  triggerImport(el: HTMLInputElement) { el.value = ''; el.click(); }

  importFile(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;

    this.loading.set(true);
    this.api.importData(f).subscribe({
      next: () => { this.toast.success('Imported!'); this.load(); },
      error: () => { this.toast.error('Import failed.'); this.loading.set(false); }
    });
  }

  async resetApp() {
    const ok = await this.confirm.confirm('This erases ALL server data!', 'Reset App?');
    if (!ok) return;
    this.loading.set(true);
    this.api.reset().subscribe({ next: () => { this.state.clearCurrentUser(); this.state.members.set([]); this.toast.success('App reset!'); this.router.navigate(['/setup']); }, error: () => this.loading.set(false) });
  }
}
