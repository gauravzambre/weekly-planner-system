import { Routes } from '@angular/router';
import { authGuard, leadGuard, weekOpenGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'setup', pathMatch: 'full' },
  { path: 'setup', loadComponent: () => import('./features/team-setup/team-setup.component').then(m => m.TeamSetupComponent) },
  { path: 'home', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'backlog', canActivate: [authGuard], loadComponent: () => import('./features/manage-backlog/manage-backlog.component').then(m => m.ManageBacklogComponent) },
  { path: 'backlog/new', canActivate: [authGuard], loadComponent: () => import('./features/manage-backlog/backlog-item-form/backlog-item-form.component').then(m => m.BacklogItemFormComponent) },
  { path: 'backlog/edit/:id', canActivate: [authGuard], loadComponent: () => import('./features/manage-backlog/backlog-item-form/backlog-item-form.component').then(m => m.BacklogItemFormComponent) },
  { path: 'team', canActivate: [authGuard, leadGuard], loadComponent: () => import('./features/manage-team/manage-team.component').then(m => m.ManageTeamComponent) },
  { path: 'new-week', canActivate: [authGuard, leadGuard], loadComponent: () => import('./features/new-week/new-week.component').then(m => m.NewWeekComponent) },
  { path: 'plan', canActivate: [authGuard, weekOpenGuard], loadComponent: () => import('./features/plan-my-work/plan-my-work.component').then(m => m.PlanMyWorkComponent) },
  { path: 'freeze', canActivate: [authGuard, leadGuard, weekOpenGuard], loadComponent: () => import('./features/review-freeze/review-freeze.component').then(m => m.ReviewFreezeComponent) },
  { path: 'progress', canActivate: [authGuard], loadComponent: () => import('./features/update-progress/update-progress.component').then(m => m.UpdateProgressComponent) },
  { path: 'team-progress', canActivate: [authGuard], loadComponent: () => import('./features/team-progress/team-progress.component').then(m => m.TeamProgressComponent) },
  { path: 'past-weeks', canActivate: [authGuard], loadComponent: () => import('./features/past-weeks/past-weeks.component').then(m => m.PastWeeksComponent) },
  { path: 'past-weeks/:id', canActivate: [authGuard], loadComponent: () => import('./features/past-weeks/past-week-detail/past-week-detail.component').then(m => m.PastWeekDetailComponent) },
  { path: 'team-progress/category/:category', canActivate: [authGuard], loadComponent: () => import('./features/team-progress/category-detail.component').then(m => m.CategoryDetailComponent) },
  { path: 'team-progress/member/:memberId', canActivate: [authGuard], loadComponent: () => import('./features/team-progress/member-detail.component').then(m => m.MemberDetailComponent) },
  { path: 'item/:id', canActivate: [authGuard], loadComponent: () => import('./features/backlog-item-detail/backlog-item-detail.component').then(m => m.BacklogItemDetailComponent) },
  { path: '**', redirectTo: 'setup' }
];
