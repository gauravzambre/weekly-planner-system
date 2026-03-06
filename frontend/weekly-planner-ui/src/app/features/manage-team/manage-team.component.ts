import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AppStateService } from '../../core/services/app-state.service';
import { ToastService } from '../../core/services/toast.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({ selector: 'app-manage-team', standalone: true, imports: [CommonModule, FormsModule, HeaderComponent], templateUrl: './manage-team.component.html' })
export class ManageTeamComponent implements OnInit {
  private api = inject(ApiService); state = inject(AppStateService); private toast = inject(ToastService);
  loading = signal(false); saving = signal(false);
  newName = ''; newRole = 'Member'; addErr = signal('');
  editId = signal(0); editName = '';

  ngOnInit() {
    this.loading.set(true);
    this.api.getTeamMembers().subscribe({ next: (d: any[]) => { this.state.members.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  rb(r: string) { return r?.toLowerCase() === 'lead' ? 'badge b-lead' : 'badge b-mem'; }

  add() {
    const n = this.newName.trim();
    if (!n) { this.addErr.set('Name required.'); return; }
    if (this.state.members().some((m: any) => m.name.toLowerCase() === n.toLowerCase())) { this.addErr.set('Name exists.'); return; }
    this.addErr.set(''); this.saving.set(true);
    this.api.createTeamMember({ name: n, role: this.newRole }).subscribe({
      next: (m: any) => { this.state.members.update((a: any[]) => [...a, m]); this.newName = ''; this.saving.set(false); this.toast.success(m.name + ' added!'); },
      error: () => this.saving.set(false)
    });
  }

  startEdit(m: any) { this.editId.set(m.id); this.editName = m.name; }
  cancelEdit() { this.editId.set(0); }
  saveEdit(m: any) {
    if (!this.editName.trim()) return;
    this.state.members.update((a: any[]) => a.map((x: any) => x.id === m.id ? { ...x, name: this.editName.trim() } : x));
    this.editId.set(0); this.toast.success('Name updated!');
  }
  makeLead(m: any) {
    this.state.members.update((a: any[]) => a.map((x: any) => ({ ...x, role: x.id === m.id ? 'Lead' : 'Member' })));
    this.toast.success(m.name + ' is now Team Lead.');
  }
}
