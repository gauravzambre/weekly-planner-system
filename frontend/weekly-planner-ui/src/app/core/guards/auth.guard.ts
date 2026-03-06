import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStateService } from '../services/app-state.service';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = () => {
  const s = inject(AppStateService); const r = inject(Router);
  s.loadCurrentUser();
  if (s.currentUser()) return true;
  r.navigate(['/home']); return false;
};

export const leadGuard: CanActivateFn = () => {
  const s = inject(AppStateService); const r = inject(Router); const t = inject(ToastService);
  s.loadCurrentUser();
  if (s.isLead()) return true;
  t.error('Only Team Leads can access this page.'); r.navigate(['/dashboard']); return false;
};

export const weekOpenGuard: CanActivateFn = () => {
  const s = inject(AppStateService); const r = inject(Router); const t = inject(ToastService);
  if (s.activeWeek()) return true;
  t.info('No active planning week. Start one first.'); r.navigate(['/dashboard']); return false;
};
