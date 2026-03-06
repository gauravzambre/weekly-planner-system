import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AppStateService } from '../../core/services/app-state.service';
import { ToastService } from '../../core/services/toast.service';

@Component({ selector: 'app-team-setup', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './team-setup.component.html' })
export class TeamSetupComponent implements OnInit {
  private api = inject(ApiService); state = inject(AppStateService);
  private toast = inject(ToastService); router = inject(Router);
  newName = ''; newRole = 'Member'; errMsg = signal(''); loading = signal(false);
  hasLead = computed(() => this.state.members().some((m: any) => m.role?.toLowerCase() === 'lead'));
  canGo = computed(() => this.state.members().length > 0 && this.hasLead());

  ngOnInit() {
    this.loading.set(true);
    this.api.getTeamMembers().subscribe({ next: (d: any[]) => { this.state.members.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  add() {
    const n = this.newName.trim();
    if (!n) { this.errMsg.set('Name required.'); return; }
    if (this.state.members().some((m: any) => m.name.toLowerCase() === n.toLowerCase())) { this.errMsg.set('Name already taken.'); return; }
    this.errMsg.set(''); this.loading.set(true);
    this.api.createTeamMember({ name: n, role: this.newRole }).subscribe({
      next: (m: any) => { this.state.members.update((a: any[]) => [...a, m]); this.newName = ''; this.loading.set(false); this.toast.success(m.name + ' added!'); },
      error: () => this.loading.set(false)
    });
  }

  setLead(member: any) {
    const prevLead = this.state.members().find((m: any) => m.role === 'Lead');
    this.state.members.update((a: any[]) => a.map((m: any) => ({ ...m, role: m.id === member.id ? 'Lead' : 'Member' })));

    if (prevLead && prevLead.id !== member.id) {
      this.api.updateTeamMember(prevLead.id, { ...prevLead, role: 'Member', teamMemberId: prevLead.id }).subscribe();
    }
    this.api.updateTeamMember(member.id, { ...member, role: 'Lead', teamMemberId: member.id }).subscribe();

    this.toast.success(member.name + ' is now Team Lead.');
  }

  proceed() { if (this.canGo()) this.router.navigate(['/home']); }
}
